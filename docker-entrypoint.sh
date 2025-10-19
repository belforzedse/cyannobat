#!/bin/sh
set -e

# Allow overriding the host/port used for readiness checks
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Wait for Postgres to be ready before running migrations
echo "Waiting for PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until nc -z "${POSTGRES_HOST}" "${POSTGRES_PORT}"; do
  sleep 1
done

# Short buffer ensures the server accepts connections
sleep 2
echo "PostgreSQL is ready!"

# Optionally run Payload migrations before starting the app
if [ "${PAYLOAD_RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running Payload migrations..."
  pnpm payload migrate -- --config src/payload.config.ts
else
  echo "Skipping Payload migrations (PAYLOAD_RUN_MIGRATIONS=false)."
fi

# Start the Next.js app
exec pnpm start
