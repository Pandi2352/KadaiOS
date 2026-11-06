# KadaiOS

Software for small local shops to run billing, stock, customers, suppliers, expenses and daily accounts. "Kadai" means shop in Tamil.

One core platform adapts to each trade, starting with meat, crackers and dairy shops.

> **Status: early development.** The project foundation and app layout are in place. Login, billing and stock are not built yet, so module pages in the admin app are placeholders. See [the phase plan](docs/PHASE_PLAN.md) for exact progress.

## Project structure

```
kadai-os/
├── admin-site/    Shop owner and staff app
├── public-site/   Public website (placeholder page for now)
├── server/        NestJS API
└── docs/          Project documents
```

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript 7, Tailwind CSS 4, React Router 7 |
| Backend | NestJS 12, TypeScript 7, Mongoose 9 |
| Database | MongoDB 8, running locally |

## Getting started

### Requirements

- Node.js 20.19 or newer
- MongoDB running on `localhost:27017`

### 1. Install dependencies

Each app has its own dependencies, so install them separately:

```bash
cd server && npm install
cd ../admin-site && npm install
cd ../public-site && npm install
```

### 2. Create the server environment file

From the project root, copy the example file:

```bash
cp server/.env.example server/.env
```

On Windows Command Prompt, use `copy server\.env.example server\.env`.

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | API port | `8000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/kadai_os` |
| `CLIENT_ORIGINS` | Addresses allowed by CORS: `*` for all, or a comma-separated list | `*` |

### 3. Start the apps

Run each one in its own terminal:

```bash
cd server && npm run dev
cd admin-site && npm run dev
cd public-site && npm run dev
```

| App | Address |
| --- | --- |
| API | http://localhost:8000/api |
| API docs (Swagger) | http://localhost:8000/api/docs |
| Admin app | http://localhost:3000 |
| Public site | http://localhost:3001 |

These ports are fixed. If one is already in use, the admin app or public site stops with an error instead of moving to another port, and so does the API.

To confirm the API can reach MongoDB, open http://localhost:8000/api/health. It should report `"database":"connected"`.

## Scripts

| Command | `server` | `admin-site` and `public-site` |
| --- | --- | --- |
| `npm run dev` | Compile and restart on changes | Start the Vite dev server |
| `npm run build` | Compile to `dist/` | Typecheck and build to `dist/` |
| `npm start` | Run the compiled server | Not available |
| `npm run preview` | Not available | Serve the production build |
| `npm run typecheck` | Typecheck only | Typecheck only |

## API

All routes start with `/api`. Interactive docs are at `/api/docs` and the OpenAPI JSON is at `/api/docs-json`. Both are turned off when `NODE_ENV=production`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check the API and database connection |
| `POST` | `/shops` | Create a shop |
| `GET` | `/shops?page=1&limit=20` | List shops, newest first |
| `GET` | `/shops/:id` | Get one shop |

These routes have no login protection yet and CORS allows every origin, so run the API locally only.

Successful responses and errors use a shared format:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": { "statusCode": 404, "message": "Shop not found" } }
```

## Project rules

- **No shadows:** the theme removes Tailwind's shadow utilities.
- **One radius:** `rounded-md` is the only radius available.
- **UUIDs only:** never use MongoDB ObjectId. Schemas extend `BaseSchema`, which gets IDs from `generateUuid()` in `server/src/common/utils/uuid.util.ts`.
- **Reusable code:** keep files small, and put shared code in `admin-site/src/components/ui/`, `admin-site/src/hooks/`, `admin-site/src/lib/` or `server/src/common/`.
- **Config-driven navigation:** to add an admin module, update `admin-site/src/config/`. The sidebar, routes, breadcrumbs and search all read from it.
- **Documented routes:** add `@ApiTags` to every controller and `@ApiEndpoint` to every route. Add `@ApiProperty` to every DTO field, and extend `BaseResponseDto` for response DTOs. The Swagger compiler plugin isn't used, so nothing is documented automatically.

```ts
@Get(':id')
@ApiEndpoint({ summary: 'Get one shop', response: ShopResponseDto, uuidParam: 'id', notFound: 'Shop' })
```

## Node version notes

The project targets Node 20.19, which affects three dependencies:

- `@nestjs/cli` isn't installed because its dependencies need Node 22, so create Nest files by hand.
- `file-type` is overridden to 21.3.4 in `server/package.json`, because `@nestjs/common` pins a release that needs Node 22.
- `concurrently` stays on version 9 because version 10 needs Node 22.

Separately, `@nestjs/swagger` lists TypeScript 6 as its newest supported version, so `server/package.json` overrides that for TypeScript 7. Only its compiler plugin uses TypeScript, and this project doesn't use the plugin.

## Documents

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Product requirements](docs/PRD.md)
- [Modules](docs/MODULES.md)
- [Phase plan and progress](docs/PHASE_PLAN.md)
