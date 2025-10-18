#!/bin/sh
set -e

# Wait for postgres to be ready
echo "Waiting for PostgreSQL..."
until nc -z postgres 5432; do
  sleep 1
done

# Wait a bit more to ensure postgres is fully ready
sleep 2

echo "PostgreSQL is ready!"

# Start the Next.js app
exec pnpm start
