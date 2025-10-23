// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { drizzle } from 'drizzle-orm/node-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import pg from 'pg'

import { Media } from './collections/Media'
import { Appointments } from './collections/Appointments'
import { Providers } from './collections/Providers'
import { Services } from './collections/Services'
import { SupportTickets } from './collections/SupportTickets'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const rawConnectionString = process.env.DATABASE_URI?.trim()
const hasConnectionString = Boolean(rawConnectionString && rawConnectionString.length > 0)

if (!hasConnectionString) {
  console.warn(
    'DATABASE_URI environment variable is not defined. Using a placeholder connection string; database operations will fail until it is configured.',
  )
}

const connectionString = hasConnectionString
  ? (rawConnectionString as string)
  : 'postgres://postgres:postgres@localhost:5432/payload-placeholder'
const projectRoot = process.cwd()
const migrationsDir = path.resolve(
  projectRoot,
  process.env.PAYLOAD_DB_MIGRATIONS_DIR || 'src/payload-migrations',
)
const shouldPushSchema =
  process.env.PAYLOAD_DB_PUSH !== undefined
    ? process.env.PAYLOAD_DB_PUSH === 'true'
    : process.env.NODE_ENV !== 'production'

export const payloadPostgresAdapter = postgresAdapter({
  pool: {
    connectionString,
  },
  migrationDir: migrationsDir,
  // Automatically push schema changes based on env configuration
  push: shouldPushSchema,
})

// Create a direct connection for Drizzle ORM usage
const pool = new pg.Pool({
  connectionString,
  max: hasConnectionString ? undefined : 1,
  idleTimeoutMillis: hasConnectionString ? undefined : 1000,
  allowExitOnIdle: !hasConnectionString,
})

export const payloadDrizzle = drizzle(pool)
export const payloadDbPool = pool

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Providers, Services, Appointments, SupportTickets, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: payloadPostgresAdapter,
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
