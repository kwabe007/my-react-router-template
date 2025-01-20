import qs from 'qs'
import { z } from 'zod'
import { data, redirect, type Params } from 'react-router'
import type { Validator } from '@rvf/react-router'
import { parseNumberOrUndefined } from '~/utils'
import { getUser } from '~/session.server'

export async function validateRequestData<T>(request: Request, validator: Validator<T>) {
  const formData = await request.formData()
  return validator.validate(formData)
}

export function getParamOr400(params: Params, key: string): string {
  const result = z.string().safeParse(params[key])
  if (!result.success) {
    throw data({ message: `Missing parameter ${key}` }, { status: 400 })
  }
  return result.data
}

export function getNumberParam400(params: Params, key: string): number {
  const stringParam = getParamOr400(params, key)
  const number = parseNumberOrUndefined(stringParam)
  if (typeof number !== 'number') {
    throw data(
      {
        message: `Invalid parameter ${key}. ${stringParam} can not be read as number`,
      },
      { status: 400 }
    )
  }
  return number
}

export async function parseIntentOr400<const T extends readonly [string, ...string[]]>(
  request: Request,
  intents: T
): Promise<[T[number], Record<string, unknown>]> {
  const qsData = qs.parse(await request.text())
  const intentSchema = z.object({ intent: z.enum(intents) }).passthrough()

  const result = intentSchema.safeParse(qsData)
  if (!result.success) {
    throw data({ message: `Invalid intent: ${result.error.message}` }, { status: 400 })
  }
  const { intent, ...requestData } = result.data
  return [intent as T[number], requestData]
}

export function getOr404<T>(value: T | null | undefined): T {
  if (!value) {
    throw data({ message: 'Not found' }, { status: 404 })
  }
  return value
}

export async function getAdminOrRedirect(request: Request) {
  const user = await getUser(request)

  if (user?.role !== 'admin') {
    throw redirect('/')
  }

  return user
}

export async function getAdminOr403(request: Request) {
  const user = await getUser(request)

  if (user?.role !== 'admin') {
    throw data({ message: 'Forbidden' }, { status: 403 })
  }

  return user
}
