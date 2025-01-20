import { Database } from '@paralect/node-mongo'
import { createIndexIfNotExists } from './database-utils'
import env from '~/env.server'
import { singleton } from '~/singleton'

// Hard-code a unique key, so we can look up the db client when this module gets re-imported. This is necessary in dev
// mode, where the module gets re-imported on hot reloads.
const { db } = singleton('db', initMongoDB)

/**
 * Get the MongoDB client.
 * NOTE: if you change anything in this function during development, remember that this only runs once on server start.
 * A server restart is necessary for changes to take effect.
 */
function initMongoDB() {
  // Connect to main app database
  console.log('Connecting to MongoDB...')
  const db = new Database(env.MONGODB_URI)
  void db.connect()

  void createIndexIfNotExists(db, 'users', 'email', true)
  void createIndexIfNotExists(db, 'passwords', 'userId', true)
  return { db }
}

export { db }
