# Repository Guidelines

## Project Structure & Module Organization
- Next.js source lives in src/app; (site) renders the public shell and (payload) bundles the Payload admin and server handlers.
- API routes stay under src/app/<route>/route.ts; Payload collections sit in src/collections with generated types in src/payload-types.ts.
- Shared styling lives in styles/; client scripts and setup helpers belong in scripts/.
- Static files (favicons, images, fonts) go in public/; adjust global Payload config through src/payload.config.ts.

## Build, Test, and Development Commands
- pnpm install - install workspace dependencies.
- pnpm dev - run Next.js plus Payload locally on http://localhost:3000 with hot reload.
- pnpm build && pnpm start - create and serve a production build.
- pnpm lint - run ESLint (Next.js core-web-vitals profile); fix or document any warnings before push.
- docker-compose up --build - boot the app alongside Postgres and Redis for full-stack testing.

## Coding Style & Naming Conventions
- TypeScript strict mode is enforced; favor typed functional components and narrow props.
- Follow two-space indentation and single quotes in imports; group JSX props logically (layout first, behaviour second).
- Prefer path aliases (@/*, @payload-config) over deep relative imports; colocate SCSS overrides with (payload) layouts.
- Use ESLint autofix where practical; no automatic formatter is configured, so keep diffs minimal and targeted.

## Testing Guidelines
- No automated suite ships yet; always run pnpm lint, load the public site, and verify /admin authentication before submitting changes.
- When adding tests, colocate *.test.ts beside the module, keep test names descriptive, and document any new scripts in package.json.
- Capture regressions in Payload collections with fixtures or seed scripts under scripts/ when feasible.

## Commit & Pull Request Guidelines
- Write short, imperative commit subjects (mirroring the existing "Initial commit" style) and keep each commit scoped.
- PR descriptions should state intent, list key changes, call out config or environment updates, and attach UI/admin screenshots when relevant.
- Link tracking issues or tickets, confirm pnpm lint status, and note any required migrations or seed steps before requesting review.

## Security & Configuration Tips
- Create a local .env defining PAYLOAD_SECRET and DATABASE_URI; never commit secrets or temporary credentials.
- Ensure ports 3000/5432/6379 are free before running Docker; rotate credentials before sharing review builds and revoke any exposed keys immediately.

## Windows CLI Encoding
- PowerShell defaults to cp1252, which garbles RTL copy. Kick off sessions with `powershell -NoLogo -NoProfile -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8"` so subsequent commands stream UTF-8 text correctly.
- When reading files in scripts, prefer `Get-Content -Encoding UTF8` or `rg --encoding utf8` to avoid mojibake without extra conversion steps.

## Availability API
- `/api/availability/calendar` now builds real slots from Payload data (services, providers, appointments). The generator lives in `src/lib/availability/generator.ts`; update there when adding new scheduling rules.
- Frontend hooks (`useBookingState`) consume that endpoint client-side, so seed Providers/Services in Payload before testing booking flows or the UI will show the empty-state placeholder.

