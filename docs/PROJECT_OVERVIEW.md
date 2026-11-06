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

The first milestone is a working business application for one shop, one business type and one owner, starting with a meat shop. Meat, crackers and dairy then follow, because together they force a flexible design instead of a generic inventory app:

- **Meat shop:** weight-based inventory
- **Crackers shop:** seasonal inventory
- **Dairy shop:** subscriptions and expiry

Grocery and bakery come later.

## A day in a meat shop

**Morning:** check yesterday's sales, record 50 kg of fresh chicken, record the supplier purchase.

**During business:** a customer buys 1.5 kg of chicken. The cashier enters the weight, the price is calculated, and stock drops from 50 kg to 48.5 kg.

**Evening:** record remaining stock and wastage, add daily expenses, view total sales and estimated profit.

## Repository layout

```
kadai-os/
├── admin-site/              Shop owner and staff app (POS, stock, reports)
├── public-site/             Customer site: register and log in
├── server/                  NestJS API on local MongoDB
├── packages/
│   ├── shared/              Code used by all apps
│   ├── ui/                  Code both websites share
│   └── eslint-config/       Lint rules
├── scripts/                 MongoDB replica set setup
└── docs/                    Project overview, PRD, modules and phase plan
```

## Running locally

MongoDB must be running on `localhost:27017`. From the project root:

```bash
npm install
npm run dev
```

| App | Address |
| --- | --- |
| Admin app | http://localhost:3000 |
| Public site | http://localhost:3001 |
| API | http://localhost:8000/api/v1 |
| API docs | http://localhost:8000/api/docs |

The [README](../README.md) has full setup, commands and the MongoDB replica set steps.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript 7, Tailwind CSS 4, React Router 7 |
| Backend | NestJS 12, TypeScript 7, Mongoose 9, Swagger |
| Database | Local MongoDB 8 |
| Tooling | npm workspaces, Vitest 4, ESLint 10, Prettier 3 |

The target runtime is Node 20.19.4. Packages are on their latest release that supports this Node version, and the README lists the exceptions. Redis, Socket.IO and BullMQ come from the original plan, arrive with Steps 31 to 33, and are not installed yet.

## Engineering rules

### UI

- No shadows anywhere, and `rounded-md` is the only radius. `packages/shared/src/theme.css` removes the other utilities from Tailwind, so `shadow-md` or `rounded-lg` generate no CSS.
- Never use the native `<select>`. Every dropdown uses the common `Select`.
- Every form field shares the same props and shows its own label, hint and error.
- Colours come from the theme tokens. The brand colour is `rgb(30, 81, 133)` with white text.
- The font is `IBMSans` (IBM Plex Sans), bundled in the project so it works offline.

### Data

- Never use MongoDB ObjectId. Every ID comes from `generateUuid()` in `@kadai/shared`, which creates a UUID v7. These sort by creation time, so newest-first queries can sort on `_id`.
- Every schema extends `BaseSchema`. API responses expose `id`, not `_id`.
- Money is stored as whole paise, and quantities as whole grams, millilitres or items, so bills have no rounding errors.
- Reports use the shop's local day and month, not UTC.
- Stock changes are written as ledger entries, never by overwriting a quantity.

### Reuse and file size

- Keep files small, with one component or responsibility per file.
- Shared code lives in one place and is imported everywhere:

| Need | Location |
| --- | --- |
| Code used by more than one app | `packages/shared/` |
| Code both websites use: fields, buttons, API client, login | `packages/ui/` |
| Admin-only UI building blocks | `admin-site/src/components/ui/` |
| Admin hooks and helpers | `admin-site/src/hooks/`, `admin-site/src/lib/` |
| Modules, navigation, quick actions | `admin-site/src/config/` |
| Feature screens and their API calls | `admin-site/src/features/` |
| Server schema, repository, filter, pipes, decorators | `server/src/common/` |

- Sidebar, routes, breadcrumbs and the command palette are all generated from `admin-site/src/config/`. Adding a module there adds it everywhere.

### Accounts

Customers register themselves on the public site. Admins can't register: the first admin comes from `.env`, and other admins join by invitation (planned in Phase 2). Both log in through separate routes and sessions.

### Multi-tenancy

Every business record carries a `shopId` through `TenantSchema`, and is read through `TenantRepository`, which requires one. Products in Phase 5 are the first records to use this.

## Roadmap

[PHASE_PLAN.md](./PHASE_PLAN.md) is the source of truth for the roadmap and progress.

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
- [PHASE_PLAN.md](./PHASE_PLAN.md): phase-wise plan and progress
