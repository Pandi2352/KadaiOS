# KadaiOS: Product Requirements Document

## 1. Problem

Small shop owners track sales, stock, supplier purchases and customer dues across notebooks and memory. They often cannot say what they earned today, how much stock was wasted, or who owes them money. Most retail software assumes every shop sells fixed-price items by quantity, which does not match:

- A meat shop that sells by weight and loses stock to cutting and wastage.
- A crackers shop that does most of its business in one season, at both retail and wholesale prices.
- A dairy shop that delivers to the same customers every day and bills them monthly.

## 2. Goal

Give a small shop owner one daily-use application that fits how their trade works, on a single configurable platform.

## 3. Users

| Role | What they do |
| --- | --- |
| Owner | Sets up the shop, sees all reports, manages staff and money |
| Manager | Runs daily operations, purchases and stock |
| Cashier | Bills customers at the counter |
| Inventory staff | Records stock in, stock out and adjustments |

Users are not assumed to be comfortable with software. Counter billing is often done under time pressure.

## 4. MVP scope

**In scope:** meat, crackers and dairy business types, plus all core modules in [MODULES.md](./MODULES.md).

**Out of scope for the MVP:**

- Grocery features such as barcode billing and customer credit
- Bakery and other business types
- Offline POS, real-time updates and background queues (Steps 32 to 34 in the [phase plan](./PHASE_PLAN.md))
- Any AI feature (not planned at all)

## 5. Functional requirements

### 5.1 Shop setup and tenancy

- FR-1: An owner can register a shop and choose a business type.
- FR-2: Business type decides the default units, the visible modules and the billing behaviour.
- FR-3: Every shop's data is isolated. A user can never read or change another shop's records.
- FR-4: Each user has a role, and each role has defined permissions.

### 5.2 Products

- FR-5: Staff can create, edit and archive products with variants, units and pricing.
- FR-6: Units follow the business type: kg and grams, box and packet, or litre and packet.
- FR-7: A product can hold both retail and wholesale prices.

### 5.3 Inventory

- FR-8: Every stock change is written as a ledger entry with type, quantity, reason, user and time. Current stock is derived from the ledger, not overwritten.
- FR-9: Staff can record stock in, stock out and adjustments.
- FR-10: The app alerts staff when stock is low.

### 5.4 POS billing

- FR-11: A cashier can build a bill and enter either a weight or a quantity, depending on the product.
- FR-12: The bill calculates price, discounts and taxes automatically.
- FR-13: Completing a bill deducts stock in the same transaction. A bill cannot save without its stock movement, and stock cannot move without its bill.
- FR-14: Supported payment methods are recorded on each bill.
- FR-15: The app produces a printable receipt, including thermal format.

**Example:** with 50 kg of chicken in stock, a 1.5 kg sale leaves 48.5 kg, and the ledger shows the sale that caused it.

### 5.5 Purchases and suppliers

- FR-16: Staff can manage suppliers and record purchases and invoices against them.
- FR-17: Recording a purchase adds stock through the ledger.

### 5.6 Customers and orders

- FR-18: Staff can keep customer profiles with purchase history.
- FR-19: Staff can record online, offline and bulk orders.

### 5.7 Expenses and reports

- FR-20: Staff can record expenses such as rent, electricity and transport.
- FR-21: The dashboard shows the current day's business at a glance.
- FR-22: Reports cover sales, estimated profit, stock and expenses over a chosen period.

### 5.8 Business-specific features

**Meat shop**

- FR-23: Weight-based billing in kg and grams.
- FR-24: Daily fresh stock tracking, with end-of-day remaining stock.
- FR-25: Cutting and wastage records that feed profit reports.

**Crackers shop**

- FR-26: Product, box, brand and variety management.
- FR-27: Seasonal stock management and seasonal sales reports.
- FR-28: Wholesale and retail pricing, bulk orders and quotations.

**Dairy shop**

- FR-29: Daily stock and expiry tracking for milk, curd, butter and paneer.
- FR-30: Recurring customer subscriptions that generate delivery orders.
- FR-31: Daily delivery tracking.
- FR-32: Monthly customer billing from delivered quantities.

## 6. Non-functional requirements

- **Consistency:** billing and stock changes are atomic, using MongoDB transactions. These need a replica set, so local MongoDB must run as a single-node replica set before Phase 9. The README has the setup steps.
- **Auditability:** important business changes record who did what and when.
- **Speed at the counter:** billing must be usable from the keyboard, with no unnecessary steps.
- **Responsive:** the app works on phones, tablets and counter desktops.
- **Accessibility:** all actions work from the keyboard, with visible focus and readable contrast.
- **Identifiers:** all records use UUIDs from the shared helper, never ObjectId.

## 7. Success measures

Targets are proposals to confirm with real shop owners:

- An owner can register and bill their first sale in one sitting without help.
- A cashier can complete a two-item bill in under 30 seconds.
- A shop's reported stock matches its physical count after a full day's use, apart from recorded wastage.
- A pilot shop in each business type keeps using it daily for a month.

## 8. Open questions

1. **Tax:** which GST invoice format and rates are required for each business type?
2. **Payments:** record the method only, or integrate UPI and card providers later?
3. **Language:** does the MVP need Tamil or other local-language UI?
4. **Online orders:** should customers place orders through `public-site`, or do staff enter them? This decides what `public-site` becomes.
5. **Weighing scales:** should billing read directly from a scale, or will weight always be typed?
6. **Multiple branches:** can one owner run several shops in one account?
