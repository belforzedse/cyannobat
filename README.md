# Cyannobat Booking Platform

Cyannobat is an appointment booking platform that combines a customer-facing Next.js App Router experience with [Payload CMS](https://payloadcms.com) for content, authentication, and admin tooling. The application exposes real-time availability, booking, and staff management features backed by PostgreSQL and Redis. The Next.js frontend lives in `src/app` while Payload powers the `/admin` interface and API routes served from the same deployment.

## Project structure

- `src/app` – App Router routes for the marketing site, booking flow, authentication, and staff dashboards.
- `src/collections` – Payload collections and globals that define the database schema; generated types reside in `src/payload-types.ts`.
- `src/lib` – Shared business logic (availability generator, auth helpers, utilities).
- `scripts/` – Seed and administrative scripts (for example, `seed-staff.ts`).
- `public/` – Static assets served by Next.js.
- `styles/` – Global Tailwind and custom styling resources.

## Environment configuration

Copy `.env.example` to `.env` and fill in the required values before running any commands:

| Variable | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | Secret used by Payload for JWT and session signing. |
| `DATABASE_URI` | PostgreSQL connection string (`postgresql://user:pass@host:port/db`). |
| `PAYLOAD_DB_PUSH` | Allow Payload to push schema changes automatically in development (set to `false` in production). |
| `PAYLOAD_RUN_MIGRATIONS` | Toggle the automatic `payload migrate` run in containerized environments. |
| `REDIS_URL` / `REDIS_*` | Redis credentials for caching and booking holds. Prefer `REDIS_URL`; fallback host/port fields are used when it is absent. |
| `REDIS_TLS` | Enable TLS when required by your Redis provider. |
| `NEXT_PUBLIC_APP_URL` | Public URL exposed to clients (used when constructing links client-side). |
| `CONTACT_DELIVERY_MODE` | Choose `ticket` (default) to log contact submissions in Payload or `email` to send notifications only. |
| `SUPPORT_TICKETS_COLLECTION` | Optional collection slug used when storing contact requests (`supportTickets` by default). |
| `SUPPORT_EMAIL_TO` | Destination inbox for contact notifications (used for `email` mode or as a fallback). |
| `SUPPORT_EMAIL_FROM` | Sender identity used when dispatching contact notification emails. |

> **Note:** Redis must be reachable before invoking APIs that create booking holds, and `DATABASE_URI` must point to an accessible PostgreSQL instance or the Payload boot process will exit with an error.

## Installing dependencies

```bash
pnpm install
```

## Local development

Start the Next.js + Payload development server (defaults to http://localhost:3000):

```bash
pnpm dev
```

Alternatively, run the full stack with PostgreSQL and Redis via Docker Compose:

```bash
docker-compose up --build
```

Once running, Payload admin is available at `/admin` and the booking experience at `/`.

## Seeding sample users

Populate demo patient, doctor, and receptionist accounts to exercise staff features:

```bash
pnpm seed:staff
```

The script is idempotent—it updates roles on existing emails and prints credentials for quick testing.

## Booking and staff flows

1. Visit `/login` and authenticate with a seeded account.
2. Patients are redirected to `/account` where they can review upcoming bookings and start new appointments via the booking flow.
3. Staff (doctor, receptionist, admin roles) are redirected to `/staff`, which surfaces management tools backed by Payload API routes under `src/app/api/staff/*`.
4. پس از تأیید رزرو، صفحه موفقیت در `/reserve/confirmation?reference=<کد>` جزئیات نوبت آخر کاربر را نشان می‌دهد و لینک بازگشت به حساب را ارائه می‌کند.
5. Availability endpoints (`/api/availability`, `/api/hold`, `/api/book`) require Redis to manage slot holds; sample `curl` flows are provided below for smoke testing.

## Contact form intake

Use the public contact form at `/contact` or call the API directly to notify the support team.

### Endpoint

- **Method:** `POST`
- **Path:** `/api/contact`
- **Body:** JSON payload with the following fields:

  | Field | Type | Notes |
  | --- | --- | --- |
  | `name` | string | Required. Trimmed and limited to 150 characters. |
  | `email` | string | Required. Must be a valid email address (max 320 chars). |
  | `subject` | string | Required. Trimmed, up to 200 characters. |
  | `message` | string | Required. Trimmed, up to 2000 characters. |

- **Responses:**
  - `201 Created` when the request is stored in Payload (default `CONTACT_DELIVERY_MODE=ticket`). The JSON response includes a `ticketId`.
  - `200 OK` when the message is emailed directly or delivered via fallback.
  - `400 Bad Request` when validation fails. The response contains an `errors` array describing individual fields.
  - `500 Internal Server Error` when backend services are unavailable.

Example request:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H 'content-type: application/json' \
  -d '{
    "name": "Sara Karimi",
    "email": "sara@example.com",
    "subject": "مشکل در رزرو",
    "message": "در تکمیل رزرو با خطای 500 مواجه شدم."
  }'
```

### Support staff workflow

- With the default `CONTACT_DELIVERY_MODE=ticket`, submissions are saved in the **Support Tickets** collection inside Payload (`/admin` → Support Tickets). Update the `status` field (`new`, `inProgress`, `resolved`) as you respond to each case.
- When `CONTACT_DELIVERY_MODE=email` is set, or if storing the ticket fails, the system emails `SUPPORT_EMAIL_TO` (using `SUPPORT_EMAIL_FROM` as the sender). Metadata such as IP address, referrer, and user agent are included in both the stored ticket and the email body for auditing.
- All validation feedback is surfaced back to the frontend so the customer sees inline guidance if fields are empty or invalid.

### Booking API smoke tests

```bash
# Confirm a slot is free
curl "http://localhost:3000/api/availability?serviceId=<SERVICE_ID>&slot=2025-01-15T15:00:00.000Z"

# Place a five-minute hold
curl -X POST http://localhost:3000/api/hold \
  -H 'content-type: application/json' \
  -d '{
    "serviceId": "<SERVICE_ID>",
    "slot": "2025-01-15T15:00:00.000Z",
    "customerId": "<USER_ID>",
    "ttlSeconds": 300
  }'

# Complete a booking while the hold is active
curl -X POST http://localhost:3000/api/book \
  -H 'content-type: application/json' \
  -d '{
    "serviceId": "<SERVICE_ID>",
    "slot": "2025-01-15T15:00:00.000Z",
    "clientId": "<USER_ID>",
    "providerId": "<PROVIDER_ID>"
  }'
```

## Database migrations

When running locally (`NODE_ENV=development`), Payload automatically pushes the schema defined in `src/collections/*` to PostgreSQL on startup so the `users`, `appointments`, and other tables are created for you. You can toggle this behaviour explicitly by setting `PAYLOAD_DB_PUSH=true|false` in your `.env`.

For production deployments, generate tracked migrations and apply them during your release pipeline:

```bash
pnpm payload migrate:create -- --name <migration-name>
pnpm payload migrate
```

The generated files live under `src/payload-migrations` and should be committed along with the changes to the collections. The production Docker entrypoint runs `pnpm payload migrate` by default (`PAYLOAD_RUN_MIGRATIONS=true`); set it to `false` only if your deployment pipeline manages migrations separately.

## Troubleshooting

- **Redis connection errors:** Ensure the Redis container or external service is running and that the credentials in `.env` match. When using Docker Compose, confirm port `6379` is not blocked on your host. For managed Redis providers, set `REDIS_TLS=true` and include username/password in `REDIS_URL` if required.
- **Payload fails to start due to missing database:** Verify `DATABASE_URI` is correct and that the database user has permissions to create schemas and tables in development.

## Deployment considerations

- Disable automatic schema pushes (`PAYLOAD_DB_PUSH=false`) once migrations are managed through CI/CD.
- Run `pnpm payload migrate` as part of your release pipeline or container entrypoint (leave `PAYLOAD_RUN_MIGRATIONS=true`).
- Provision Redis and PostgreSQL with production-grade credentials; update `NEXT_PUBLIC_APP_URL` to your deployed hostname so client redirects and absolute links are correct.
- Confirm the environment provides filesystem access for Payload file uploads or configure an external storage adapter.

## Continuous Integration

Pushes and pull requests trigger the `CI` GitHub Actions workflow. The job sets up Node.js and pnpm, caches the pnpm store, installs dependencies with `pnpm install --frozen-lockfile`, and then runs the quality gates below in order:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Run the same commands locally before opening a pull request so the checks pass consistently.

## Further reading

- [Next.js Documentation](https://nextjs.org/docs) – learn about App Router concepts and APIs.
- [Learn Next.js](https://nextjs.org/learn) – interactive tutorials for the framework.
- [Payload CMS Documentation](https://payloadcms.com/docs) – collection configs, authentication, and deployment guides.
