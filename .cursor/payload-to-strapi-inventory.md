# PayloadCMS to Strapi Migration - Frontend File Inventory

This document catalogs all frontend files that import or use PayloadCMS, organized by responsibility.

## Authentication & User Management

### API Routes
- **`src/app/api/login/route.ts`**
  - Uses: `getPayload`, `payload.login()`, `payload.findByID()`, `payload.auth()`
  - Responsibility: Handles user login, validates credentials, sets auth cookies
  - Strapi equivalent: POST to `/api/auth/local` or `/api/auth/local/register`

- **`src/app/api/signup/route.ts`**
  - Uses: `getPayload`, `payload.find()`, `payload.create()`, `payload.auth()`
  - Responsibility: Creates new user accounts, validates uniqueness
  - Strapi equivalent: POST to `/api/auth/local/register`

- **`src/app/api/account/session/route.ts`**
  - Uses: `getPayload`, `payload.auth()`
  - Responsibility: Validates current session, returns user info
  - Strapi equivalent: GET `/api/users/me` with JWT token

- **`src/lib/api/auth.ts`**
  - Uses: `getPayload`, `payload.auth()`
  - Responsibility: Staff authentication helper, checks if user is staff
  - Strapi equivalent: JWT validation + role check

### Page Components
- **`src/app/(auth)/login/page.tsx`**
  - Uses: `getPayload`, `payload.auth()`
  - Responsibility: Server component that checks auth state before rendering login form
  - Strapi equivalent: Check JWT token, redirect if authenticated

- **`src/app/(auth)/signup/page.tsx`**
  - Uses: `getPayload`, `payload.auth()`
  - Responsibility: Server component that checks auth state before rendering signup form
  - Strapi equivalent: Check JWT token, redirect if authenticated

- **`src/app/(site)/account/page.tsx`**
  - Uses: `getPayload`, `payload.auth()`, `payload.find()`, `@/payload-types`
  - Responsibility: Displays user account info and upcoming appointments
  - Strapi equivalent: Fetch user + appointments via `/api/users/me?populate=appointments`

## Booking & Appointments

### API Routes
- **`src/app/api/book/route.ts`**
  - Uses: `getPayload`, `payload.findByID()`, `payload.create()`, `payloadDrizzle`, `@payload-config`
  - Responsibility: Creates new appointments, validates service availability, checks holds
  - Strapi equivalent: POST to `/api/appointments` with validation

- **`src/app/api/hold/route.ts`**
  - Uses: `getPayload`, `payload.findByID()`, `payloadDrizzle`
  - Responsibility: Manages temporary booking holds (5-minute reservations)
  - Strapi equivalent: Redis-based hold system (no direct Strapi API needed)

- **`src/app/api/availability/route.ts`**
  - Uses: `getPayload`, `payload.findByID()`, `payloadDrizzle`
  - Responsibility: Checks if a specific slot is available
  - Strapi equivalent: Query appointments for time conflicts

- **`src/app/api/availability/calendar/route.ts`**
  - Uses: `getPayload`, `generateAvailability()` from `@/lib/availability/generator`
  - Responsibility: Returns calendar availability for date range
  - Strapi equivalent: Custom endpoint that queries appointments + provider schedules

### Page Components
- **`src/app/(site)/reserve/confirmation/page.tsx`**
  - Uses: `getPayload`, `payload.find()`, `@/payload-types`
  - Responsibility: Displays booking confirmation, fetches appointment by reference
  - Strapi equivalent: GET `/api/appointments?filters[reference][$eq]=...`

### Library Functions
- **`src/lib/availability/generator.ts`**
  - Uses: `Payload` type, `payload.find()`, `payloadDrizzle`, `@/payload-types`
  - Responsibility: Core availability calculation engine - generates available slots from provider schedules, excludes booked appointments
  - Strapi equivalent: Custom function that queries Strapi for providers, services, appointments, and calculates slots

## Staff Dashboard & Management

### API Routes
- **`src/app/api/staff/appointments/route.ts`**
  - Uses: `payload.find()`, `payload.create()`, `Where` type from Payload
  - Responsibility: Lists and creates appointments for staff users
  - Strapi equivalent: GET/POST `/api/appointments` with staff role filtering

- **`src/app/api/staff/appointments/[id]/route.ts`**
  - Uses: `payload.findByID()`, `payload.update()`
  - Responsibility: Updates individual appointments
  - Strapi equivalent: PUT `/api/appointments/:id`

- **`src/app/api/staff/providers/route.ts`**
  - Uses: `payload.find()`, `@/payload-types`
  - Responsibility: Lists all providers
  - Strapi equivalent: GET `/api/providers?populate=*`

- **`src/app/api/staff/providers/[id]/route.ts`**
  - Uses: `payload.findByID()`, `payload.update()`, `@/payload-types`
  - Responsibility: Gets and updates individual provider
  - Strapi equivalent: GET/PUT `/api/providers/:id?populate=*`

- **`src/app/api/staff/calendar/route.ts`**
  - Uses: `payload.find()`, `Where` type
  - Responsibility: Returns appointments for calendar view
  - Strapi equivalent: GET `/api/appointments?filters[...]&populate=*`

- **`src/app/api/staff/users/route.ts`**
  - Uses: `payload.create()`, `PayloadRequest` type
  - Responsibility: Creates staff user accounts
  - Strapi equivalent: POST `/api/users` with role assignment

- **`src/app/api/staff/theme/route.ts`**
  - Uses: `payload.findByID()`, `payload.update()`
  - Responsibility: Updates user theme preferences
  - Strapi equivalent: PUT `/api/users/:id` with theme field

- **`src/app/api/staff/documents/route.ts`**
  - Uses: `payload.findByID()`
  - Responsibility: Manages patient documents
  - Strapi equivalent: GET `/api/documents?filters[patient][$eq]=...`

- **`src/app/api/staff/notes/route.ts`**
  - Uses: `payload.findByID()`, `payload.update()`
  - Responsibility: Manages private notes on patients/appointments
  - Strapi equivalent: PUT `/api/patients/:id` or `/api/appointments/:id`

- **`src/app/api/staff/prescriptions/route.ts`**
  - Uses: `payload.findByID()`, `payload.update()`
  - Responsibility: Creates/updates prescriptions
  - Strapi equivalent: POST/PUT `/api/prescriptions`

### Library Functions
- **`src/lib/staff/server/loadStaffData.ts`**
  - Uses: `getPayload`, `payload.auth()`, `payload.find()`, `@/payload-types`
  - Responsibility: Loads provider, appointments, and user data for staff dashboard
  - Strapi equivalent: Multiple Strapi queries with populate

- **`src/lib/staff/server/analytics.ts`**
  - Uses: `payloadDrizzle` for direct SQL queries
  - Responsibility: Analytics queries (may need custom Strapi endpoints or direct DB access)

- **`src/lib/staff/utils/mapProvider.ts`**
  - Uses: `@/payload-types` (Provider type)
  - Responsibility: Maps Payload provider format to frontend format
  - Strapi equivalent: Map Strapi provider response format

## Contact & Support

### API Routes
- **`src/app/api/contact/route.ts`**
  - Uses: `getPayload`, `payload.create()`
  - Responsibility: Creates contact form submissions (likely SupportTickets collection)
  - Strapi equivalent: POST `/api/support-tickets`

## Utility & Configuration

### API Routes
- **`src/app/api/init-db/route.ts`**
  - Uses: `getPayload`, `payload.find()`
  - Responsibility: Checks if database is initialized (first user check)
  - Strapi equivalent: GET `/api/users?pagination[limit]=1`

- **`src/app/api/payload/route.ts`**
  - Uses: `getPayload`
  - Responsibility: Health check endpoint for Payload
  - Strapi equivalent: GET `/api` or custom health endpoint

### Test Files
- **`src/app/api/hold/route.test.ts`**
  - Uses: Mocks `@payload-config`
  - Responsibility: Tests booking hold functionality
  - Strapi equivalent: Update mocks to use Strapi client

- **`src/app/(site)/reserve/confirmation/page.test.tsx`**
  - Uses: Mocks `getPayload`, `@payload-config`
  - Responsibility: Tests confirmation page
  - Strapi equivalent: Update mocks to use Strapi client

## Type Dependencies

### Type Imports
Multiple files import from `@/payload-types`:
- `Appointment`
- `Provider` / `ProviderDoc`
- `Service`
- `User`

These types are auto-generated by Payload. Strapi equivalent:
- Use Strapi's generated types or create manual TypeScript interfaces
- Strapi types are typically less structured; may need manual mapping

## Direct Database Access

### Files Using `payloadDrizzle`
- **`src/app/api/book/route.ts`** - Checks for existing appointments via SQL
- **`src/app/api/hold/route.ts`** - SQL queries for availability
- **`src/app/api/availability/route.ts`** - SQL queries for availability
- **`src/lib/availability/generator.ts`** - Queries availability windows table directly
- **`src/lib/staff/server/analytics.ts`** - Analytics SQL queries

Strapi equivalent:
- Strapi doesn't expose Drizzle directly
- Use Strapi's query API with filters, or create custom endpoints that use Strapi's internal DB connection
- For complex queries, may need to add custom Strapi controllers with direct DB access

## Payload Admin Panel (To Remove)

### Route Group: `(payload)`
- **`src/app/(payload)/layout.tsx`** - Payload admin layout
- **`src/app/(payload)/admin/[[...segments]]/page.tsx`** - Payload admin pages
- **`src/app/(payload)/admin/[[...segments]]/not-found.tsx`** - Payload 404
- **`src/app/(payload)/api/[...slug]/route.ts`** - Payload REST API
- **`src/app/(payload)/api/graphql/route.ts`** - Payload GraphQL API
- **`src/app/(payload)/api/graphql-playground/route.ts`** - GraphQL playground
- **`src/app/(payload)/admin/importMap.js`** - Auto-generated Payload admin imports

These entire files/directories should be deleted as they're Payload-specific.

## Migration Strategy Summary

1. **Authentication**: Replace `payload.auth()` with JWT validation, `payload.login()` with Strapi `/api/auth/local`
2. **Data Fetching**: Replace `payload.find()`, `payload.findByID()`, `payload.create()`, `payload.update()` with Strapi REST API calls
3. **Types**: Replace `@/payload-types` imports with Strapi response types or manual interfaces
4. **Direct DB Access**: Replace `payloadDrizzle` with Strapi query filters or custom Strapi controllers
5. **Admin Panel**: Delete entire `(payload)` route group
6. **Config**: Remove `@payload-config` imports, replace with Strapi client configuration
