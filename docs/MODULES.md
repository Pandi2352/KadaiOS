# KadaiOS: Modules

## Core modules

Every shop gets these. Phases 1 to 5 follow the roadmap in [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md). The original plan did not assign Dashboard and Reports to a phase, so Phase 4 is a proposal. Advanced analytics follow in Phase 6.

| Module | Simple description | Phase |
| --- | --- | --- |
| Business Setup | Register the shop and choose its business type | 1 |
| Products | Products, variants, units and pricing | 2 |
| Inventory | Stock in, stock out and adjustments, kept as a ledger | 2 |
| Purchases | Supplier purchases and invoices | 2 |
| Suppliers | Supplier details and purchase history | 2 |
| POS Billing | Fast counter billing with discounts, taxes and receipts | 3 |
| Customers | Customer profiles and purchase history | 4 |
| Orders | Online, offline and bulk orders | 4 |
| Expenses | Rent, electricity, transport and other costs | 4 |
| Staff | Employees, roles and permissions | 4 |
| Dashboard | Daily overview of the business | 4 |
| Reports | Sales, profit, stock and expense reports | 4 |

## Business-specific modules

These appear only for the matching business type.

| Module | Business type | Simple description | Phase |
| --- | --- | --- | --- |
| Cutting & Wastage | Meat | Record what is lost in cutting and spoilage | 5 |
| Seasonal Stock | Crackers | Plan and track stock for the festival season | 5 |
| Quotations | Crackers | Prepare price quotes for bulk buyers | 5 |
| Expiry Tracking | Dairy | Track daily stock and items close to expiry | 5 |
| Subscriptions | Dairy | Recurring milk and dairy delivery plans | 5 |
| Daily Deliveries | Dairy | Track what was delivered each day | 5 |

## How each core module adapts

| Module | Meat shop | Crackers shop | Dairy shop |
| --- | --- | --- | --- |
| Products | Chicken, mutton, beef cuts | Brands, varieties, boxes | Milk, curd, butter, paneer |
| Units | Kg, grams | Box, packet | Litre, packet |
| POS Billing | Enter the weight, price is calculated | Quantity, retail or wholesale price | Counter sales, plus monthly subscription bills |
| Inventory | Fresh stock each day | Seasonal stock | Expiry-based stock |
| Customers | Regular buyers | Bulk buyers | Monthly customers |
| Reports | Daily sales | Seasonal sales | Daily delivery |

## After the MVP

**Grocery shop:** barcode billing, product variants, stock alerts, customer credit tracking, supplier purchases, and daily profit and sales reports.
