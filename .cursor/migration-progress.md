# PayloadCMS to Strapi Migration Progress

## Completed

### Infrastructure
- ✅ Created `src/lib/strapi/client.ts` - Strapi API client with find, findByID, create, update, delete, login, register, getMe
- ✅ Created `src/lib/strapi/types.ts` - TypeScript types for Strapi content types
- ✅ Created `src/lib/strapi/auth.ts` - Authentication helpers (authenticateStrapiRequest, extractStrapiRoles, userIsStrapiStaff)
- ✅ Created `src/lib/strapi/index.ts` - Barrel export

### Authentication Routes
- ✅ `src/lib/api/auth.ts` - Updated to use Strapi authentication
- ✅ `src/app/api/login/route.ts` - Migrated to Strapi login
- ✅ `src/app/api/account/session/route.ts` - Migrated to Strapi session check

## In Progress

### Authentication Routes
- ⏳ `src/app/api/signup/route.ts` - Needs migration
- ⏳ `src/app/(auth)/login/page.tsx` - Server component auth check
- ⏳ `src/app/(auth)/signup/page.tsx` - Server component auth check

### Account Pages
- ⏳ `src/app/(site)/account/page.tsx` - Uses payload.find() for appointments

### Booking Routes
- ⏳ `src/app/api/book/route.ts` - Complex booking logic with payload.create()
- ⏳ `src/app/api/hold/route.ts` - Uses payload.findByID()
- ⏳ `src/app/api/availability/route.ts` - Uses payload.findByID()
- ⏳ `src/app/api/availability/calendar/route.ts` - Uses generateAvailability()

### Library Functions
- ⏳ `src/lib/availability/generator.ts` - Core availability engine, uses payload.find() extensively
- ⏳ `src/lib/staff/server/loadStaffData.ts` - Staff data loading

### Staff API Routes
- ⏳ All routes in `src/app/api/staff/**` - Multiple routes need migration

### Contact
- ⏳ `src/app/api/contact/route.ts` - Uses payload.create()

## Pending

### Utility Routes
- `src/app/api/init-db/route.ts`
- `src/app/api/payload/route.ts` (should be deleted or replaced)

### Test Files
- `src/app/api/hold/route.test.ts` - Update mocks
- `src/app/(site)/reserve/confirmation/page.test.tsx` - Update mocks

### Page Components
- `src/app/(site)/reserve/confirmation/page.tsx`

### Type Updates
- Update `src/lib/auth.ts` to support Strapi users (or create compatibility layer)
- Update files using `@/payload-types` imports

## Notes

- Strapi uses different relation formats (can be ID, object with id, or populated object)
- Need to handle populate carefully - Strapi uses `populate` query param
- JWT tokens stored in `jwt` cookie (not `payload-token`)
- Direct DB access via `payloadDrizzle` needs custom Strapi endpoints or query filters
