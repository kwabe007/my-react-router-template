import { Role, type User } from '~/domains/users/user-schema'

export function isAdmin(user: User | null | undefined) {
  return user?.role === Role.Admin
}
