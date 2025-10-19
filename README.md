This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

Copy the example environment file and adjust the values for your local setup:

```bash
cp .env.example .env
# then edit .env to set secure secrets and connection strings
```

Ensure the credentials match your local PostgreSQL and Redis instances (the defaults assume the Docker Compose services).

- `REDIS_URL` takes precedence when defined and can include authentication (e.g. `redis://user:pass@host:port/db`).
- When `REDIS_URL` is omitted the client falls back to `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`, and `REDIS_DB`.
- Set `REDIS_TLS=true` if your Redis provider requires TLS (left `false` for the local Docker Compose container).

> **Note:** `DATABASE_URI` must point to a reachable PostgreSQL instance before running `pnpm build` or starting the app. The Payload configuration now throws a descriptive error if the variable is missing to avoid creating an invalid connection pool.

## Database migrations

When running locally (`NODE_ENV=development`), Payload automatically pushes the schema defined in `src/collections/*` to PostgreSQL on startup so the `users`, `appointments`, and other tables are created for you. You can toggle this behaviour explicitly by setting `PAYLOAD_DB_PUSH=true|false` in your `.env`.

For production deployments, generate tracked migrations and apply them during your release pipeline:

```bash
pnpm payload migrate:create -- --name <migration-name>
pnpm payload migrate
```

The generated files live under `src/payload-migrations` and should be committed along with the changes to the collections. The production Docker entrypoint runs `pnpm payload migrate` by default (`PAYLOAD_RUN_MIGRATIONS=true`); set it to `false` only if your deployment pipeline manages migrations separately.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Continuous Integration

Pushes and pull requests trigger the `CI` GitHub Actions workflow. The job sets up Node.js and pnpm, caches the pnpm store, installs dependencies with `pnpm install --frozen-lockfile`, and then runs the quality gates below in order:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Run the same commands locally before opening a pull request so the checks pass consistently.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Booking API smoke tests

The custom booking endpoints under `/api/availability`, `/api/hold`, and `/api/book` can be exercised with `curl` once Redis and Payload are running (via `pnpm dev` or Docker Compose). Replace the placeholder IDs before running the commands below.

1. **Confirm a slot is free**

   ```bash
   curl "http://localhost:3000/api/availability?serviceId=<SERVICE_ID>&slot=2025-01-15T15:00:00.000Z"
   ```

   The JSON response should contain `{ "available": true }` and an empty `reasons` array for an unused slot.

2. **Place a five-minute hold**

   ```bash
   curl -X POST http://localhost:3000/api/hold \
     -H 'content-type: application/json' \
     -d '{
       "serviceId": "<SERVICE_ID>",
       "slot": "2025-01-15T15:00:00.000Z",
       "customerId": "<USER_ID>",
       "ttlSeconds": 300
     }'
   ```

   The response includes a `hold` object with the remaining TTL. Running the availability check again should now return `available: false` with the `ON_HOLD` reason present.

3. **Verify hold expiry**

   Wait five minutes (or use a smaller `ttlSeconds` while testing) and call the availability endpoint once more. After expiration the hold is gone and the slot becomes available again.

4. **Complete a booking while the hold is active**

   ```bash
   curl -X POST http://localhost:3000/api/book \
     -H 'content-type: application/json' \
     -d '{
       "serviceId": "<SERVICE_ID>",
       "slot": "2025-01-15T15:00:00.000Z",
       "clientId": "<USER_ID>",
       "providerId": "<PROVIDER_ID>"
     }'
   ```

   A successful response (HTTP 201) includes a summarized `appointment`. Subsequent availability checks report the `ALREADY_BOOKED` reason because the hold is cleared during appointment creation.
