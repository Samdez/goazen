import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from 'env'

const queryClient = postgres(env.POSTGRES_DATABASE_URL, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Max seconds a connection can be idle
  connect_timeout: 10, // Max seconds to wait for a connection
  max_lifetime: 60 * 30, // Max seconds a connection can exist
})

export const db = drizzle(queryClient)
