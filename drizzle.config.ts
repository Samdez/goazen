import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'

dotenv.config({
  path: '.env.local',
})

export default defineConfig({
  out: './migrations',
  schema: './src/app/(app)/api/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_DATABASE_URL!,
    // authToken: process.env.DATABASE_TOKEN,
  },
})
