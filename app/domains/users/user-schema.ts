import { z } from 'zod'

export enum Role {
  Admin = 'admin',
  Member = 'member',
}

export const UserSchema = z.object({
  _id: z.string(),
  email: z.string().email('Invalid email address.'),
  role: z.nativeEnum(Role).default(Role.Member),
})
export type User = z.infer<typeof UserSchema>

export const PasswordSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  hash: z.string(),
})
export type Password = z.infer<typeof PasswordSchema>

export const UserWithPasswordSchema = UserSchema.extend({
  password: PasswordSchema,
})
export type UserWithPassword = z.infer<typeof UserWithPasswordSchema>

export const UserInputSchema = UserSchema.pick({
  email: true,
}).extend({
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
})
export type UserInput = z.infer<typeof UserInputSchema>
