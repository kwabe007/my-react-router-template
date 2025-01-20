import { useMatches } from 'react-router'
import { useMemo } from 'react'
import type { User } from '~/domains/users/user-schema'

const DEFAULT_REDIRECT = '/'

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== 'string') {
    return defaultRedirect
  }
  if (!to.startsWith('/') || to.startsWith('//')) {
    return defaultRedirect
  }
  return to
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(() => matchingRoutes.find((route) => route.id === id), [matchingRoutes, id])
  return route?.data as Record<string, unknown>
}

function isUser(user: unknown): user is User {
  return (
    user != null && typeof user === 'object' && 'email' in user && typeof user.email === 'string'
  )
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData('root')
  if (!data || !isUser(data.user)) {
    return undefined
  }
  return data.user
}

export function useUser(): User {
  const maybeUser = useOptionalUser()
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.'
    )
  }
  return maybeUser
}

/*
 * Parse a number from a string, throwing an error if the string is not a number.
 */
export function parseNumberOrThrow(numberString: string): number {
  const parsed = parseInt(numberString, 10)
  if (isNaN(parsed)) {
    throw new Error(`Could not parse number string: ${numberString}`)
  }
  return parsed
}

/**
 * Parse a number from a string, returning undefined if the string is not a number.
 * @param numberString
 */
export function parseNumberOrUndefined(numberString: string): number | undefined {
  const parsed = parseInt(numberString, 10)
  if (isNaN(parsed)) {
    return undefined
  }
  return parsed
}

/**
 * Generate a random id. Note that it's not cryptographically secure so don't use it for secrets.
 */
export function generateId(): string {
  const length = 24
  let result = ''
  const characters = 'abcdef0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 * Assert that the given value is truthy or throw. This is usually to assert that an object is not null or undefined.
 */
export function getOrThrow<T>(
  value: T | null | undefined,
  message = 'Falsy value where not expected'
): T {
  if (!value) {
    throw new Error(message)
  }
  return value
}
