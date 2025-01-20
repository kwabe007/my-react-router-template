import { createUser, getUserByEmail } from '~/domains/users/user-queries.server'
import { createUserSession, getUserId } from '~/session.server'
import { safeRedirect } from '~/utils'
import { z } from 'zod'
import { Icon } from '@iconify/react'
import { Input } from '~/components/ui/input'
import FieldError from '~/components/FieldError'
import { withZod } from '@rvf/zod'
import type { Route } from './+types/register.ts'
import { Link, redirect, useSearchParams } from 'react-router'
import { useForm, validationError } from '@rvf/react-router'
import { Role } from '~/domains/users/user-schema'
import RVFInput from '~/components/RVFInput'
import { Button } from '~/components/ui/button'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return null
}

const validator = withZod(
  z
    .object({
      email: z.string().email('Invalid email address.'),
      password: z.string().min(1, 'You must enter a password'),
      password2: z.string().min(1, 'You must repeat your password'),
    })
    .refine(({ password, password2 }) => password === password2, {
      message: 'Repeated password does not match',
      path: ['password2'],
    })
)

export const action = async ({ request }: Route.ActionArgs) => {
  const result = await validator.validate(await request.formData())

  if (result.error) {
    // validationError comes from `remix-validated-form`
    return validationError(result.error)
  }

  const { email, password } = result.data
  const redirectTo = safeRedirect(new URL(request.url).searchParams.get('redirectTo'))

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return validationError(
      {
        fieldErrors: {
          email: 'Email address is already in use',
        },
      },
      result.data
    )
  }

  const user = await createUser({ email, password, role: Role.Member })

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user._id,
  })
}

export function MetaFunction() {
  return [{ title: 'Register' }]
}

export default function Join() {
  const [searchParams] = useSearchParams()
  const form = useForm({
    validator,
    defaultValues: {
      email: '',
      password: '',
      password2: '',
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
      <div className="mx-auto w-full max-w-md px-8 mt-[20vh]">
        <form {...form.getFormProps()} className="space-y-4">
          <RVFInput scope={form.scope('email')} placeholder="Email" />
          <FieldError scope={form.scope('email')} />
          <RVFInput scope={form.scope('password')} type="password" placeholder="Password" />
          <FieldError scope={form.scope('password')} />
          <RVFInput scope={form.scope('password2')} type="password" placeholder="Repeat password" />
          <FieldError scope={form.scope('password2')} />
          <Button className="w-full" type="submit">
            Create account
          </Button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: '/login',
                  search: searchParams.toString(),
                }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
