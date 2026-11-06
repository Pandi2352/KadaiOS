# KadaiOS

Software for small local shops to run billing, stock, customers, suppliers, expenses and daily accounts. "Kadai" means shop in Tamil.

One core platform adapts to each trade, starting with meat, crackers and dairy shops.

> **Status: Phase 2 (authentication).** Customers can register and log in on the public site. The admin app and its API need an admin login. Billing and stock are not built, so most module pages are placeholders. See [the phase plan](docs/PHASE_PLAN.md) for exact progress.

## Project structure

This is an npm workspace, so one install at the root covers everything.

```
kadai-os/
├── admin-site/              Shop owner and staff app
├── public-site/             Customer site: register and log in
├── server/                  NestJS API
├── packages/
│   ├── shared/              Code used by all apps: UUIDs, money, quantities, dates, types, theme
│   ├── ui/                  Code both websites share: buttons, form fields, API client, login
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

Then put a secret in `JWT_ACCESS_SECRET` in `server/.env`. This command creates one:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

| File | Variable | Purpose | Default |
| --- | --- | --- | --- |
| `server/.env` | `JWT_ACCESS_SECRET` | Signs access tokens. Required, at least 32 characters | None |
| `server/.env` | `PORT` | API port | `8000` |
| `server/.env` | `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/kadai_os` |
| `server/.env` | `CLIENT_ORIGINS` | Addresses allowed by CORS: `*` for all, or a comma-separated list. Keep `*` only while the websites reach the API through the Vite proxy, because browsers refuse login cookies from another origin with `*` | `*` |
| `server/.env` | `NODE_ENV` | `development`, `production` or `test` | `development` |
| `server/.env` | `AUTH_RATE_LIMIT` | Login and register attempts per minute, per address | `10` |
| `server/.env` | `DEFAULT_ADMIN_*`, `DEFAULT_CUSTOMER_*` | The default users below | See `.env.example` |
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

Restart this command after changing `.env`, the theme or scrollbar CSS in `packages/shared`, or any `package.json`. A running server won't pick those up. If it says a port is in use, an old server is still running, so stop it first.

### Default users

The API creates these when it starts, if they don't exist yet. Restarting never changes an existing user, so editing `.env` later won't change their passwords.

| Log in at | Role | Email | Password |
| --- | --- | --- | --- |
| http://localhost:3000/login | Admin | `admin@kadaios.test` | `Admin@12345` |
| http://localhost:3001/login | Customer | `customer@kadaios.test` | `Customer@12345` |

These are for development only. In production, the API refuses to start with the example admin password, and never creates the test customer.

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
| `npm test` | Run all tests. Needs MongoDB running, and uses temporary `kadai_*_test` databases that it deletes afterwards |

## API

All routes start with `/api/v1`. Interactive docs are at `/api/docs` and the OpenAPI JSON is at `/api/docs-json`. Both are turned off when `NODE_ENV=production`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Public. Check the API and database. Returns 503 if the database is disconnected |
| `POST` | `/shops` | Admin only. Create a shop |
| `GET` | `/shops?page=1&limit=20` | Admin only. List shops, newest first |
| `GET` | `/shops/:id` | Admin only. Get one shop |
| `GET` | `/users/me` | Any logged-in user. Get your own profile |
| `PUT` | `/users/me` | Any logged-in user. Update your own name and phone. Leave out the phone to remove it |
| `PUT` | `/users/me/password` | Any logged-in user. Needs the current password. Logs out other devices and returns a new session |
| `PUT` | `/users/me/email` | Any logged-in user. Needs the current password. Logs out other devices and returns a new session. The new email isn't verified, because the API can't send email yet |
| `POST` | `/auth/customer/register` | Public. Create a customer account and log in. Admins have no equivalent |
| `POST` | `/auth/customer/login`, `/auth/admin/login` | Public. Log in |
| `POST` | `/auth/customer/refresh`, `/auth/admin/refresh` | Public. Get a new access token using the refresh cookie |
| `POST` | `/auth/customer/logout`, `/auth/admin/logout` | Public. Log out |

CORS still allows every origin, so run the API locally only.

To try admin routes in Swagger, call `/auth/admin/login`, copy `accessToken` from the response, then paste it into **Authorize**.

### Protecting routes

Every API route needs a login unless it's marked `@Public()`, so a new route can't be left open by accident.

```ts
@Public() // Anyone.
@Roles() // Any logged-in user. A route with no decorator acts the same, but isn't marked as locked in Swagger.
@Roles('admin') // Logged in, with this role.
```

Add these to a controller or a single route, and use `@CurrentUser()` to get the logged-in user. No login or an invalid token returns 401, and the wrong role returns 403. Deactivating a user blocks them on their next request.

In a website, wrap private pages in `RequireAuth` from `@kadai/ui`. The whole admin app already sits behind it:

```tsx
<RequireAuth loginPath="/login">
  <AppLayout />
</RequireAuth>
```

### How login works

- **Accounts:** customers register on the public site. Admins can't register. The first admin comes from `.env`, and admin invites are planned (Phase 2, item 12). The same email can have a separate customer and admin account.
- **Passwords:** hashed with Argon2id. Login gives the same answer for a wrong password and an unknown email, and login and register are rate limited.
- **Access token:** a JWT that lasts 15 minutes, kept in memory only and sent as `Authorization: Bearer <token>`. It works only for its own role.
- **Refresh token:** a random value that lasts 30 days, in an `httpOnly` cookie that page scripts can't read. Only its hash is stored. Each one is replaced when used.
- **Stolen tokens:** if a replaced token comes back more than 10 seconds later, the whole login ends. Within 10 seconds it's treated as a browser that lost the reply, such as a reload during a refresh.
- **Separate sessions:** admin and customer sessions have separate routes and cookies, so they can't overwrite each other even though `localhost` shares cookies across ports.

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

- **Theme:** the brand colour is `rgb(30, 81, 133)` with white text, and the font is `IBMSans` (IBM Plex Sans). Both are set once in `packages/shared/src/theme.css`. The font files are bundled in the project, so the POS works offline.
- **Icons:** [Phosphor Icons](https://phosphoricons.com) is the only icon package, and a lint rule blocks `lucide-react`. Icons are duotone by default, icons inside `Button` and `IconButton` and small controls such as carets are bold, and the current page's sidebar icon turns solid. Pick a module's icon in `admin-site/src/config/modules.ts`.
- **Popups:** give every menu, dropdown, dialog and toast the `popup-surface` class, a shaded gradient from the theme, and use `IconChip` from `@kadai/ui` for icons in its rows. Popups stand out through colour, not shadows.
- **Scrollbars:** every scrolling area gets the custom scrollbar from `packages/shared/src/scrollbars.css` automatically. Add `scrollbar-stable` to stop content shifting between short and long pages, or `scrollbar-reveal` for a slim bar that appears on hover.
- **Error and missing pages:** use `StatusPage` from `@kadai/ui`.
- **Toasts:** call `showToast` from `useToast()` after an action. The tone defaults to success, and errors stay until closed. Use `useAuthActions()` for login and logout, which show their own messages.

  ```tsx
  showToast('Ponni Dairy added', { title: 'Shop added' });
  showToast('Check your connection.', { title: "Couldn't save", tone: 'error' });
  ```

- **Tooltips:** wrap one element in `Tooltip` from `@kadai/ui`, and never use the `title` attribute. `IconButton` and the admin `Dropdown` already include one.

  ```tsx
  <Tooltip label="Search pages and actions" shortcut="Ctrl K" side="bottom">
    <button type="button">Search</button>
  </Tooltip>
  ```

- **No shadows:** the shared theme removes Tailwind's shadow utilities.
- **One radius:** `rounded-md` is the only radius available.
- **No native `<select>`:** every dropdown uses the common `Select` or `SelectField`.
- **Common fields:** every field takes the same props: `label`, `value`, `onChange(value)`, `onBlur`, `error`, `hint`, `required` and `disabled`. Text fields also take `placeholder`.
- **One focus border:** a focused field shows a single brand-colour border and no outline. An error replaces the hint under the field, so there's one message at a time.
- **Validation:** give `useForm` its `rules` so errors appear before anything is sent. The rules show on blur and on submit, and also set the required mark. The API still checks everything.

| Need | Use | From |
| --- | --- | --- |
| Form fields | `TextField`, `EmailField`, `PhoneField`, `NumberField`, `PasswordField`, `TextareaField`, `SelectField`, `CheckboxField`, `RadioGroupField`, `DateField`, `FileField` | `@kadai/ui` |
| Field extras | `startIcon`, `startText`, `endText`, `clearable`, `showCount`; `NumberField` has `min`, `max`, `step`, `decimals`, `steppers`; `PasswordField` has `showStrength` and warns about Caps Lock | `@kadai/ui` |
| A new kind of field | `FormField`, which adds the label, message and counter; `FieldAction` for a button inside a field | `@kadai/ui` |
| Form state, validation and API errors | `useForm` with `fieldRules` and `FormAlert` | `@kadai/ui` |
| Buttons | `Button`, `IconButton` | `@kadai/ui` |
| Messages after an action | `useToast` | `@kadai/ui` |
| Loading text | `Loader` | `@kadai/ui` |
| Login state and actions | `useAuth`, `LoginForm`, `AuthPage` | `@kadai/ui` |
| Dialogs | `Modal`, `ConfirmDialog` | `admin-site/src/components/ui/` |
| Lists | `Table`, `Pagination` | `admin-site/src/components/ui/` |
| Loading and error screens | `QueryState`, `useApiQuery`, `Notice` | `@kadai/ui` |
| Empty screens | `EmptyState` | `admin-site/src/components/ui/` |
| The logged-in person's profile | `ProfileCard` | `@kadai/ui` |

If the public site needs something from the admin folder, move it to `packages/ui` rather than copying it.

```tsx
const rules = {
  name: fieldRules.text('Shop name', { required: true }),
  businessType: { label: 'Business type', required: true },
  phone: fieldRules.phone(),
};
const { field, handleSubmit, formError, isSubmitting } = useForm({ initialValues, rules, onSubmit });

<form noValidate onSubmit={handleSubmit}>
  <FormAlert message={formError} />
  <TextField {...field('name')} label="Shop name" placeholder="For example, Ponni Dairy" />
  <SelectField {...field('businessType')} label="Business type" options={options} />
  <PhoneField {...field('phone')} />
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

- **API calls:** go through the client each site creates with `createApiClient`, in `admin-site/src/lib/api/client.ts` and `public-site/src/lib/api.ts`. It adds the access token and refreshes it when it expires. Keep one `*Api.ts` file per feature in `src/features/`, and load data with `useApiQuery`.
- **Config-driven navigation:** to add an admin module, update `admin-site/src/config/`. The sidebar, routes, breadcrumbs and search all read from it. List its page in `BUILT_PAGES` in `admin-site/src/routes/router.tsx` once it has a real screen.
- **Small files:** keep one component or responsibility per file, and put shared code in `packages/shared` or the folders above.

## Dependency notes

The project targets Node 20.19 and the latest TypeScript, which some tools don't support yet:

| Package | What's different | Why |
| --- | --- | --- |
| `@nestjs/cli` | Not installed, so create Nest files by hand | Its dependencies need Node 22 |
| `argon2` | Replaced by `@node-rs/argon2`, the same algorithm | It needs a C++ build toolchain on Windows. This one ships ready-made |
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
