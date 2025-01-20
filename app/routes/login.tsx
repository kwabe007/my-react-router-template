import { createUserSession, getUserId } from '~/session.server'
import { safeRedirect } from '~/utils'
import { verifyLogin } from '~/domains/users/user-queries.server'
import { z } from 'zod'
import { Icon } from '@iconify/react'
import type { Route } from './+types/login.ts'
import { Link, redirect, useSearchParams } from 'react-router'
import { withZod } from '@rvf/zod'
import { useForm, validationError } from '@rvf/react-router'
import FieldError from '~/components/FieldError'
import RVFInput from '~/components/RVFInput'
import { Button } from '~/components/ui/button'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserId(request)
  if (userId) throw redirect('/')
  return null
}

const validator = withZod(
  z.object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(1, 'You must enter a password'),
    remember: z.string().optional(),
  })
)

export const action = async ({ request }: Route.ActionArgs) => {
  const result = await validator.validate(await request.formData())

  if (result.error) {
    return validationError(result.error)
  }

  const { email, password, remember } = result.data
  const redirectTo = safeRedirect(new URL(request.url).searchParams.get('redirectTo'))

  const user = await verifyLogin(email, password)

  if (!user) {
    return validationError({
      fieldErrors: {
        form: 'Wrong email or password',
      },
    })
  }

  return createUserSession({
    redirectTo,
    remember: remember === 'on',
    request,
    userId: user._id,
  })
}

export function MetaFunction() {
  return [{ title: 'Login' }]
}

export default function LoginRoute() {
  const [searchParams] = useSearchParams()
  const form = useForm({
    validator,
    defaultValues: {
      email: '',
      password: '',
      remember: false,
      form: '',
    },
    method: 'post',
  })

  return (
    <div className="relative flex">
      <div className="text-neutral-500 absolute left-12 top-8 flex items-center gap-2">
        <Link
          to={{
            pathname: '/',
            search: searchParams.toString(),
          }}
          className="flex items-center gap-2 font-semibold"
        >
          <Icon icon="material-symbols:arrow-back" className="h-6 w-6" />
          Back to home
        </Link>
      </div>
      <div className="relative mt-[20vh] mx-auto w-full max-w-md px-8">
        <form {...form.getFormProps()} className="space-y-4">
          <RVFInput scope={form.scope('email')} placeholder="Email" />
          <FieldError scope={form.scope('email')} />
          <RVFInput scope={form.scope('password')} type="password" placeholder="Password" />
          <FieldError scope={form.scope('password')} />
          <Button className="w-full" type="submit">
            Log in
          </Button>
          <FieldError scope={form.scope('form')} />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: '/register',
                  search: searchParams.toString(),
                }}
              >
                Register now
              </Link>
              .
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
