# Repository Guidelines

## Project Structure & Module Organization
The Next.js application lives in `src/app`, with `(site)` handling the public site shell and `(payload)` bundling the Payload admin UI and server functions. API routes belong under `src/app/my-route`. Payload collection definitions reside in `src/collections`, and the generated types map to `src/payload-types.ts`. Static assets stay in `public/`. Use `docker-compose.yml` when you need local Postgres and Redis, and adjust global configuration through `src/payload.config.ts`.

## Build, Test & Development Commands
Install dependencies with `pnpm install`. Common workflows:
```bash
pnpm dev                 # run Next.js + Payload in watch mode on :3000
pnpm build && pnpm start # create a production build, then serve it
pnpm lint                # run ESLint (next/core-web-vitals flat config)
docker-compose up --build # boot app + Postgres + Redis stack
```
Always run `pnpm lint` before pushing changes.

## Coding Style & Naming Conventions
TypeScript is enforced (`tsconfig.json` runs strict mode); keep components typed and prefer functional components. Follow the two-space indentation in existing files, favor single quotes in imports, and keep JSX props grouped logically. Path aliases are available via `@/*` and `@payload-config`; prefer them over long relative paths. SCSS customizations for the admin UI belong next to the layout in `(payload)`.

## Testing Guidelines
No automated test suite ships with this repo yet. Before opening a PR, run `pnpm lint`, load `http://localhost:3000` for the public site, and verify the admin at `/admin` can authenticate against your database. When introducing tests, co-locate `*.test.ts` files beside the module they cover and document any new scripts in `package.json`.

## Commit & Pull Request Guidelines
Use short, imperative commit subjects (the log currently follows "Initial commit" style) and keep changes scoped. Each PR should describe the intent, list the key changes, mention any configuration updates, and include screenshots or screencasts for UI or admin updates. Link tracking issues where relevant and confirm the lint check passed. Request review once migrations and environment notes are documented.

## Environment & Security Notes
Create a local `.env` with `PAYLOAD_SECRET` and `DATABASE_URI`; never commit secrets. When running with Docker, ensure your local ports 3000, 5432, and 6379 are free. Rotate credentials before sharing review builds, and revoke any leaked Payload secrets immediately.
