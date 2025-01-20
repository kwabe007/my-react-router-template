/* eslint-disable @typescript-eslint/no-unused-vars -- Don't trigger unused variable error on predefined helper schemas */

import { z } from 'zod'

// Schemas for convenience
const trueFalseSchema = z.enum(['true', 'false']).transform((value) => value === 'true')
const nonEmptyStringSchema = z.string().min(1, 'Cannot be empty')

const schema = z.object({
  SESSION_SECRET: z.string().min(1),
  MONGODB_URI: z.string(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 4))
  process.exit(1)
}

export default parsed.data
