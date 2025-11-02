// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import { payloadCloudPlugin } from '@payloadcms/payload-cloud';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import pg from 'pg';

import { Media } from './collections/Media';
import { Appointments } from './collections/Appointments';
import { Providers } from './collections/Providers';
import { Services } from './collections/Services';
import { SupportTickets } from './collections/SupportTickets';
import { Users } from './collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const rawConnectionString = process.env.DATABASE_URI?.trim();
const hasConnectionString = Boolean(rawConnectionString && rawConnectionString.length > 0);

if (!hasConnectionString) {
  console.warn(
    'DATABASE_URI environment variable is not defined. Skipping PostgreSQL adapter setup; database operations will throw until it is configured.',
  );
}

const connectionString = hasConnectionString ? (rawConnectionString as string) : undefined;
const projectRoot = process.cwd();
const migrationsDir = path.resolve(
  projectRoot,
  process.env.PAYLOAD_DB_MIGRATIONS_DIR || 'src/payload-migrations',
);
const shouldPushSchema =
  process.env.PAYLOAD_DB_PUSH !== undefined
    ? process.env.PAYLOAD_DB_PUSH === 'true'
    : process.env.NODE_ENV !== 'production';

const createMissingDatabaseProxy = <T extends object>(resource: string) =>
  new Proxy({} as T, {
    get: (_, property) => {
      if (property === 'then') {
        return undefined;
      }

      return () => {
        throw new Error(
          `DATABASE_URI environment variable is not defined. Cannot use ${resource} until it is configured.`,
        );
      };
    },
  });

export const payloadPostgresAdapter = hasConnectionString
  ? postgresAdapter({
      pool: {
        connectionString,
      },
      migrationDir: migrationsDir,
      // Automatically push schema changes based on env configuration
      push: shouldPushSchema,
    })
  : createMissingDatabaseProxy<ReturnType<typeof postgresAdapter>>('PostgreSQL adapter');

// Create a direct connection for Drizzle ORM usage when available
const pool = hasConnectionString
  ? new pg.Pool({
      connectionString,
    })
  : createMissingDatabaseProxy<pg.Pool>('PostgreSQL connection pool');

export const payloadDrizzle = hasConnectionString
  ? drizzle(pool)
  : createMissingDatabaseProxy<ReturnType<typeof drizzle>>('Drizzle client');
export const payloadDbPool = pool;

const baseConfig: Parameters<typeof buildConfig>[0] = {
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
};

export default buildConfig(baseConfig);
