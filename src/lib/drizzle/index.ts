import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!

// Create the connection
const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client, { schema })

export * from './schema'
