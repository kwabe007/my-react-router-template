import bcrypt from 'bcryptjs'
import {
  PasswordSchema,
  type User,
  UserSchema,
  UserWithPasswordSchema,
} from '~/domains/users/user-schema'
import { db } from '~/database/node-mongo.server'

export const userService = db.createService<User>('users', {
  schemaValidator: (data: unknown) => UserSchema.parseAsync(data),
})

export const passwordService = db.createService('passwords', {
  schemaValidator: (data: unknown) => PasswordSchema.parseAsync(data),
})

export async function createUser({
  password,
  ...userWithoutPassword
}: Omit<User, '_id'> & { password: string }) {
  console.log('userWithoutPassword', userWithoutPassword)
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await userService.insertOne(userWithoutPassword)
  await passwordService.insertOne({
    userId: user._id,
    hash: hashedPassword,
  })

  return user
}

export async function getUserById(_id: string) {
  return await userService.findOne({ _id })
}

export async function getUsers() {
  return (await userService.find({})).results
}

export async function getUserByEmail(email: string) {
  return await userService.findOne({ email })
}

export async function verifyLogin(email: string, password: string): Promise<User | null> {
  const docs = await userService.aggregate([
    {
      $match: {
        email,
      },
    },
    {
      $lookup: {
        from: 'passwords',
        localField: '_id',
        foreignField: 'userId',
        pipeline: [
          {
            $limit: 1,
          },
        ],
        as: 'password',
      },
    },
    {
      $unwind: {
        path: '$password',
      },
    },
  ])
  const doc = docs[0] ?? null

  const userWithPassword = UserWithPasswordSchema.nullable().parse(doc)

  if (!userWithPassword) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- We do this to omit the password from the user object
  const { password: _, ...userWithoutPassword } = userWithPassword

  return userWithoutPassword
}
