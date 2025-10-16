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
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const connectionString = process.env.DATABASE_URI || ''

export const payloadPostgresAdapter = postgresAdapter({
  pool: {
    connectionString,
  },
})

// Create a direct connection for Drizzle ORM usage
const pool = new pg.Pool({
  connectionString,
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
  collections: [Users, Providers, Services, Appointments, Media],
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
