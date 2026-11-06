# KadaiOS

Software for small local shops to run billing, stock, customers, suppliers, expenses and daily accounts. "Kadai" means shop in Tamil.

One core platform adapts to each trade, starting with meat, crackers and dairy shops.

> **Status: Phase 1 (project foundation).** The admin app layout, common components and API foundation are in place. Business Setup can add and list shops. Login, billing and stock are not built yet, so the other module pages are placeholders. See [the phase plan](docs/PHASE_PLAN.md) for exact progress.

## Project structure

This is an npm workspace, so one install at the root covers everything.

```
kadai-os/
├── admin-site/              Shop owner and staff app
├── public-site/             Public website (placeholder page for now)
├── server/                  NestJS API
├── packages/
│   ├── shared/              Code used by all apps: UUIDs, money, quantities, dates, types, theme
│   └── eslint-config/       Lint rules
├── scripts/                 MongoDB replica set setup
└── docs/                    Project documents
```

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript 7, Tailwind CSS 4, React Router 7 |
| Backend | NestJS 12, TypeScript 7, Mongoose 9, Swagger |
| Database | MongoDB 8, running locally |
| Tooling | Vitest 4, ESLint 10, Prettier 3 |

## Getting started

### Requirements

- Node.js 20.19 or newer
- MongoDB running on `localhost:27017`

### 1. Install

From the project root:

```bash
npm install
```

### 2. Create the environment files

```bash
cp server/.env.example server/.env
cp admin-site/.env.example admin-site/.env
cp public-site/.env.example public-site/.env
```

On Windows Command Prompt, use `copy` and backslashes instead.

| File | Variable | Purpose | Default |
| --- | --- | --- | --- |
| `server/.env` | `PORT` | API port | `8000` |
| `server/.env` | `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/kadai_os` |
| `server/.env` | `CLIENT_ORIGINS` | Addresses allowed by CORS: `*` for all, or a comma-separated list | `*` |
| `server/.env` | `NODE_ENV` | `development`, `production` or `test` | `development` |
| `admin-site/.env`, `public-site/.env` | `VITE_API_URL` | Base address of the API | `/api/v1` |

The API checks its values when it starts, and stops with a clear message if one is wrong.

### 3. Start everything

```bash
npm run dev
```

| App | Address |
| --- | --- |
| Admin app | http://localhost:3000 |
| Public site | http://localhost:3001 |
| API | http://localhost:8000/api/v1 |
| API docs (Swagger) | http://localhost:8000/api/docs |

These ports are fixed. If one is already in use, that app stops with an error instead of moving to another port.

To start one app, use `npm run dev -w kadai-server`, `-w kadai-admin-site` or `-w kadai-public-site`.

### 4. Set up the MongoDB replica set

Transactions need MongoDB running as a replica set. Billing and purchases depend on them, so do this before Phase 9.

The script changes the MongoDB Windows service, which may also hold databases for other projects. They keep working on the same address, but they all restart with the service, so stop anything writing to MongoDB first. Preview the change, then run it from a PowerShell window opened as Administrator:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-mongodb-replica-set.ps1 -DryRun
powershell -ExecutionPolicy Bypass -File scripts\setup-mongodb-replica-set.ps1
```

It backs up `mongod.cfg` first and prints where. To undo, copy that backup over `mongod.cfg` and run `Restart-Service MongoDB`.

To test transactions against a replica set:

```powershell
$env:TEST_REPLICA_URI='mongodb://localhost:27017/kadai_tx_test'; npm run test -w kadai-server
```

## Commands

Run these from the project root.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start all apps and rebuild the shared package on changes |
| `npm run build` | Build everything |
| `npm run typecheck` | Typecheck everything |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Fix what ESLint can fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm test` | Run all tests |

## API

All routes start with `/api/v1`. Interactive docs are at `/api/docs` and the OpenAPI JSON is at `/api/docs-json`. Both are turned off when `NODE_ENV=production`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check the API and database. Returns 503 if the database is disconnected |
| `POST` | `/shops` | Create a shop |
| `GET` | `/shops?page=1&limit=20` | List shops, newest first |
| `GET` | `/shops/:id` | Get one shop |

These routes have no login protection yet and CORS allows every origin, so run the API locally only.

Successful responses and errors use a shared format. `fields` only appears when validation fails:

```json
{ "success": true, "data": {} }
```

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": ["Shop name is required"],
    "fields": { "name": ["Shop name is required"] }
  }
}
```

## Project rules

### UI

- **No shadows:** the shared theme removes Tailwind's shadow utilities.
- **One radius:** `rounded-md` is the only radius available.
- **No native `<select>`:** every dropdown uses the common `Select` or `SelectField`.
- **Common fields:** every field takes the same props: `label`, `value`, `onChange(value)`, `error`, `hint`, `required` and `disabled`.

| Need | Use (in `admin-site/src/components/ui/`) |
| --- | --- |
| Form fields | `form/TextField`, `form/TextareaField`, `form/SelectField`, `form/CheckboxField` |
| A new kind of field | `form/FormField`, which adds the label, hint and error |
| Form state and API errors | `useForm` with `form/FormAlert` |
| Dialogs | `Modal`, `ConfirmDialog` |
| Lists | `Table`, `Pagination` |
| Loading, error and empty screens | `QueryState`, `Loader`, `EmptyState` |
| Messages after an action | `useToast` |
| Buttons | `Button`, `IconButton` |

```tsx
const { field, handleSubmit, formError, isSubmitting } = useForm({ initialValues, onSubmit });

<form noValidate onSubmit={handleSubmit}>
  <FormAlert message={formError} />
  <TextField {...field('name')} label="Shop name" required />
  <SelectField {...field('businessType')} label="Business type" required options={options} />
</form>;
```

### Data

- **UUIDs only:** never use MongoDB ObjectId. IDs come from `generateUuid()` in `@kadai/shared`, and schemas extend `BaseSchema`.
- **Whole numbers for money and quantities:** store paise, grams and millilitres. Use `toPaise`, `lineTotalPaise`, `percentOfPaise` and `toBaseQuantity` from `@kadai/shared`, so bills have no rounding errors.
- **Shop-local dates:** use `shopDayRange` and `shopMonthRange` for reports, because a shop's day doesn't match the UTC day.
- **Shop isolation:** records that belong to a shop extend `TenantSchema`, and are read through `TenantRepository`, which requires a `shopId`.
- **Transactions:** wrap related writes in `TransactionService.run`, and pass the session to each write.

### Code

- **Layers:** controllers stay thin, services hold business logic, and repositories talk to the database.
- **Validation:** build DTOs from `TextField`, `OptionalTextField`, `OptionalPhoneField` and `EnumField` in `server/src/common/decorators/field.decorators.ts`. These also document the field in Swagger and write the error messages forms show.
- **Documented routes:** add `@ApiTags` to every controller and `@ApiEndpoint` to every route.

  ```ts
  @Get(':id')
  @ApiEndpoint({ summary: 'Get one shop', response: ShopResponseDto, uuidParam: 'id', notFound: 'Shop' })
  ```

- **API calls:** go through `admin-site/src/lib/api/client.ts`, with one `*Api.ts` file per feature in `admin-site/src/features/`. Load data with `useApiQuery`.
- **Config-driven navigation:** to add an admin module, update `admin-site/src/config/`. The sidebar, routes, breadcrumbs and search all read from it. List its page in `BUILT_PAGES` in `admin-site/src/routes/router.tsx` once it has a real screen.
- **Small files:** keep one component or responsibility per file, and put shared code in `packages/shared` or the folders above.

## Dependency notes

The project targets Node 20.19 and the latest TypeScript, which some tools don't support yet:

| Package | What's different | Why |
| --- | --- | --- |
| `@nestjs/cli` | Not installed, so create Nest files by hand | Its dependencies need Node 22 |
| `file-type` | Overridden to 21.3.4 in the root `package.json` | `@nestjs/common` pins a release that needs Node 22 |
| `minimatch` | Overridden to 11.0.5 in the root `package.json` | ESLint pulls in a release with a security advisory. Remove the override once ESLint updates |
| `concurrently` | Version 9 | Version 10 needs Node 22 |
| `vitest` | Version 4 | Version 5 needs Node 22 |
| `jsdom` | Version 29 | Version 30 needs Node 22 |
| `typescript` | 6.0.3 at the root, and 7 in each app | ESLint's TypeScript support and `@nestjs/swagger` don't support 7 yet. All code compiles with 7 |

## Documents

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Product requirements](docs/PRD.md)
- [Modules](docs/MODULES.md)
- [Phase plan and progress](docs/PHASE_PLAN.md)
