# KadaiOS: Project Overview

KadaiOS is one software platform that lets a small shop owner run sales, products, stock, customers, suppliers, expenses and daily operations. "Kadai" means shop in Tamil.

It is built for independent retailers such as meat shops, crackers shops, milk shops, grocery stores and bakeries. It is not a corporate management tool, and it uses no AI. A shop owner should be able to use it every day without training.

## The core idea

Build one core platform with configurable business modules, not a separate application for each trade. Each shop picks a business type, and the same core behaves differently:

| Core feature | Meat shop | Crackers shop | Dairy shop |
| --- | --- | --- | --- |
| Products | Meat cuts | Crackers | Milk products |
| Units | Kg, grams | Box, packet | Litre, packet |
| Stock | Fresh stock | Seasonal stock | Expiry-based |
| Billing | Weight-based | Quantity-based | Subscription |
| Customers | Regular buyers | Bulk buyers | Monthly customers |
| Reports | Daily sales | Seasonal sales | Daily delivery |

## MVP scope

The MVP covers three business types, because together they force a flexible design instead of a generic inventory app:

- **Meat shop:** weight-based inventory
- **Crackers shop:** seasonal inventory
- **Dairy shop:** subscriptions and expiry

Grocery (barcode billing, customer credit) comes after the MVP.

## A day in a meat shop

**Morning:** check yesterday's sales, record 50 kg of fresh chicken, record the supplier purchase.

**During business:** a customer buys 1.5 kg of chicken. The cashier enters the weight, the price is calculated, and stock drops from 50 kg to 48.5 kg.

**Evening:** record remaining stock and wastage, add daily expenses, view total sales and estimated profit.

## Repository layout

```
kadai-os/
├── docs/          Project overview, PRD and module list
├── admin-site/    Shop owner and staff app (POS, stock, reports)
├── public-site/   Public website (minimal shell for now)
└── server/        NestJS API on local MongoDB
```

## Running locally

MongoDB must be running on `localhost:27017`. Start each app in its own terminal:

| App | Command | Address |
| --- | --- | --- |
| API | `cd server && npm run dev` | http://localhost:8000/api |
| Admin app | `cd admin-site && npm run dev` | http://localhost:3000 |
| Public site | `cd public-site && npm run dev` | http://localhost:3001 |

Check the API and its database connection at http://localhost:8000/api/health.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript 7, Tailwind CSS 4, React Router 7 |
| Backend | NestJS 12, TypeScript 7 |
| Database | Local MongoDB 8 with Mongoose 9 |

Target runtime is Node 20.19.4. Every package is on its latest release that supports this Node version, with these exceptions:

- **`@types/node`** stays on the 20.x line so its types match the installed Node.
- **`@nestjs/cli`** is not installed. Its dependencies need Node 22 or newer, so the server builds with `tsc` and runs with `node --watch`. Nest files are created by hand instead of with `nest generate`.
- **`file-type`** is overridden to 21.3.4 in `server/package.json`, because `@nestjs/common` pins a release that needs Node 22. Remove the override after moving to Node 22.

Redis, Socket.IO and BullMQ come from the original plan and are deferred to Phase 6. They are not installed yet.

## Engineering rules

### UI

- No shadows anywhere.
- `rounded-md` is the only radius.
- Both rules are enforced in `src/styles/theme.css`, which removes the other shadow and radius utilities from Tailwind. Writing `shadow-md` or `rounded-lg` generates no CSS.
- Colours come from the theme tokens in the same file.

### IDs

- Never use MongoDB ObjectId.
- Every ID comes from `generateUuid()` in `server/src/common/utils/uuid.util.ts`, which creates a UUID v7. These sort by creation time, so newest-first queries can sort on `_id`.
- Every schema extends `BaseSchema`, which sets this up. API responses expose `id`, not `_id`.

### Reuse and file size

- Keep files small, with one component or responsibility per file.
- Shared code lives in one place and is imported everywhere:

| Need | Location |
| --- | --- |
| Admin UI building blocks | `admin-site/src/components/ui/` |
| Admin hooks and helpers | `admin-site/src/hooks/`, `admin-site/src/lib/` |
| Modules, navigation, quick actions | `admin-site/src/config/` |
| Server schema, repository, filter, interceptor, helpers | `server/src/common/` |

- Sidebar, routes, breadcrumbs and the command palette are all generated from `admin-site/src/config/`. Adding a module there adds it everywhere.

### Multi-tenancy

Every business record will carry a `shopId`, and every query will filter by it. This starts with Phase 2 records.

## Roadmap

1. **Core foundation:** authentication, shop registration, business type selection, multi-tenant database design.
2. **Product and inventory:** product CRUD, units, variants, stock ledger, suppliers, purchases.
3. **POS billing:** cart, weight-based billing, discounts, taxes, payment methods, receipts.
4. **Business operations:** customers, expenses, staff, permissions, orders.
5. **Industry-specific features:** meat stock, crackers seasonal inventory, dairy expiry and subscriptions.
6. **Advanced engineering:** offline support, Redis, queues, WebSockets, analytics, audit logs.
7. **Production:** Docker, testing, CI/CD, deployment, monitoring, documentation.

## Advanced engineering challenges

1. **Multi-tenancy:** every shop has isolated data.
2. **Dynamic business configuration:** business types have different units and workflows.
3. **Inventory ledger:** record every stock movement instead of only updating a quantity.
4. **Transaction handling:** billing and stock deduction stay consistent.
5. **RBAC:** owner, manager, cashier and inventory staff.
6. **Offline POS:** bill during internet interruptions and synchronise later.
7. **Subscription engine:** generate recurring customer orders.
8. **Audit history:** track every important business change.
9. **Analytics:** revenue and profit reports with MongoDB aggregation.
10. **Print management:** thermal receipts and invoices.

## Related documents

- [PRD.md](./PRD.md): product requirements
- [MODULES.md](./MODULES.md): module list with simple descriptions
