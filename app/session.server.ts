import { createCookieSessionStorage, data, redirect } from 'react-router'
import { getUserById } from '~/domains/users/user-queries.server'
import { Role } from '~/domains/users/user-schema'
import env from '~/env.server'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

const USER_SESSION_KEY = 'userId'

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  return sessionStorage.getSession(cookie)
}

export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getSession(request)
  return session.get(USER_SESSION_KEY)
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (userId === undefined) return null

  return await getUserById(userId)
}

export async function getUserOrRedirectToLogin(request: Request) {
  const user = await getUser(request)
  if (!user) {
    const pathname = new URL(request.url).pathname
    throw redirect(`/login?redirectTo=${encodeURIComponent(pathname)}`)
  }
  return user
}

export async function getUserOr401(request: Request) {
  const user = await getUser(request)
  if (!user) {
    throw data('Unauthenticated', 401)
  }
  return user
}

export async function requireAdmin(request: Request) {
  const user = await getUserOr401(request)
  if (user.role !== Role.Admin) {
    throw data('Unauthorized', 403)
  }
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request
  userId: string
  remember: boolean
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 30 // 30 days
          : undefined,
      }),
    },
  })
}

export async function logout(request: Request) {
  const session = await getSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}
