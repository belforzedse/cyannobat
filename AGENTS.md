# Repository Guidelines

## Project Structure & Module Organization
Next.js sources live in `src/app`; `(site)` renders the public shell and `(payload)` bundles the admin UI plus server handlers. API routes reside in `src/app/<route>/route.ts`, Payload collections in `src/collections`, and generated types in `src/payload-types.ts`. Shared styling sits in `styles/`, scripts in `scripts/`, static assets in `public/`, and global config in `src/payload.config.ts`.

## Build, Test, and Development Commands
- `pnpm install` - Install workspace dependencies.
- `pnpm dev` - Run Next.js and Payload with hot reload on http://localhost:3000.
- `pnpm build && pnpm start` - Compile and serve the production bundle.
- `pnpm lint` - Run ESLint (core-web-vitals profile); fix or justify warnings.
- `docker-compose up --build` - Launch app, Postgres, and Redis for full-stack testing.

## Coding Style & Naming Conventions
TypeScript strict mode is on; prefer typed functional components with narrow props. Indent with two spaces, keep single quotes in imports, and order JSX props layout before behavior. Use path aliases `@/*` and `@payload-config`; colocate `(payload)` SCSS overrides; apply ESLint autofix when safe and keep diffs tight.

## Testing Guidelines
Automated tests are sparse, so always run `pnpm lint`, load http://localhost:3000, and confirm `/admin` authentication before shipping. Add new tests beside modules as `*.test.ts` with descriptive names. Document any new scripts in `package.json`, and seed data via `pnpm seed:staff` when validating bookings.

## Commit & Pull Request Guidelines
Write short imperative commit subjects (e.g., `Add staff dashboard guard`) and keep each commit focused. PRs should outline intent, key changes, config or env updates, and link issues. Attach relevant UI or admin screenshots, confirm `pnpm lint`, and call out migrations or seeding steps.

## Security & Configuration Tips
Maintain a local `.env` defining `PAYLOAD_SECRET` and `DATABASE_URI`; never commit credentials. Ensure ports 3000/5432/6379 are free before starting Docker, and rotate demo logins before sharing builds. Use `pnpm seed:staff` to refresh staff accounts without duplicates.

## Availability & Auth Notes
`/api/availability/calendar` assembles slots via `src/lib/availability/generator.ts`; update rules there and seed Providers or Services so booking flows populate. Enforce staff access with `userIsStaff` from `src/lib/auth.ts`. `/login` posts to `/api/login`, redirecting staff to `/staff` and patients to `/account`, with logout at `/api/staff/logout`.
