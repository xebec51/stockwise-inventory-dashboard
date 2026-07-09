# StockWise

StockWise is a modern inventory intelligence dashboard for warehouse operations. It combines inventory visibility, supplier coordination, stock movement approvals, restock workflows, analytics, QR labels, and export tooling in a portfolio-grade SaaS admin experience.

## Overview

StockWise is designed for warehouse teams that need more than simple CRUD screens. The product focuses on:

- product and category management
- stock monitoring with computed stock status
- incoming and outgoing transaction approvals
- supplier and restock order workflows
- inventory analytics and reporting
- QR-ready product labels
- exportable product and transaction data
- audit-friendly operational history

## Features

- Next.js App Router dashboard with responsive sidebar and topbar
- Prisma + PostgreSQL domain model for inventory operations
- role-aware authentication with seeded demo accounts
- product and category create, edit, delete workflows
- supplier account and profile management
- pending transaction creation and approval workflow
- restock order lifecycle from pending to received
- linked incoming transactions created on restock receipt
- supplier rating capture after successful receipt
- live dashboard analytics powered by Prisma aggregates
- QR label generation and PNG download for products
- CSV and XLSX export for products and transactions

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma ORM
- PostgreSQL / Neon
- NextAuth credentials authentication
- Zod
- Recharts
- xlsx
- QRCode
- lucide-react

## Roles

- `ADMIN`
  - full dashboard access
  - manage products, categories, suppliers, reports, and activity views
- `MANAGER`
  - create restock orders
  - approve or reject transactions
  - receive restock orders and rate suppliers
  - monitor suppliers, inventory, transactions, and reports
- `STAFF`
  - create stock transactions
  - view product and transaction workspaces
- `SUPPLIER`
  - view assigned restock orders
  - confirm, reject, and mark orders in transit

## ERD Summary

Current Prisma schema models:

- `users`
- `suppliers`
- `categories`
- `products`
- `transactions`
- `transaction_items`
- `restock_orders`
- `restock_order_items`
- `supplier_ratings`
- `activity_logs`

Important business rules already reflected in the app:

- stock status is computed from `currentStock` and `minimumStock`
- pending transactions do not change stock
- transaction approval updates stock and audit fields
- outgoing transactions cannot exceed available stock
- received restock orders create a linked incoming transaction
- supplier ratings are only available after receipt

## Current Modules

- `/dashboard`
- `/dashboard/products`
- `/dashboard/categories`
- `/dashboard/transactions`
- `/dashboard/restock-orders`
- `/dashboard/suppliers`
- `/dashboard/reports`
- `/dashboard/activity-logs`
- `/dashboard/settings`
- `/login`

## Setup

1. Install dependencies.

```bash
npm install
```

2. Configure environment variables.

3. Generate or validate Prisma artifacts as needed.

```bash
npx prisma validate
```

4. Run migrations.

```bash
npx prisma migrate dev --name init_stockwise_schema
```

5. Seed demo data.

```bash
npm run seed
```

6. Start the app.

```bash
npm run dev
```

## Environment Variables

Create a local `.env` file with at least:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

Notes:

- `DATABASE_URL` is required for Prisma reads, migrations, and seed execution.
- `NEXTAUTH_SECRET` is recommended for stable local auth sessions and required for production.

## Prisma Commands

Useful project commands:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate dev --name init_stockwise_schema
npm run seed
```

## Demo Accounts

All seeded demo accounts use the same password:

```text
Password123!
```

Accounts:

- `admin@stockwise.demo`
- `manager@stockwise.demo`
- `staff@stockwise.demo`
- `supplier.alpha@stockwise.demo`
- `supplier.beta@stockwise.demo`

## Export Workflows

- Products can be exported from the products page or reports page.
- Transactions can be exported from the transactions page or reports page.
- Export formats:
  - CSV
  - XLSX

## QR Labels

- Product QR labels are available from the products table.
- Each QR encodes the saved `qrCode` value when present, otherwise the product `sku`.
- Labels can be downloaded as PNG files.

## Authentication Notes

- Authentication uses the existing `users` table with credentials sign-in.
- Dashboard access is protected by middleware.
- Navigation is filtered by role.
- Inactive, pending, and rejected accounts are blocked from active dashboard use.

## Quality Checks

Run these after changes:

```bash
npx prisma validate
npm run lint
npm run build
```

## Screenshots

Add screenshots here later:

- landing page
- login screen
- analytics dashboard
- products workspace
- transactions workflow
- restock workflow

## Roadmap

- richer activity log timeline and filters
- supplier-facing delivery history polish
- settings preferences and account profile management
- searchable/filterable data tables
- report presets and scheduled exports
- deeper analytics visualizations

## Repository Status

Completed phases:

- UI foundation
- Prisma schema
- Prisma utilities
- seed data
- initial database migration
- product and category read views
- product and category management
- supplier management
- transaction approval workflow
- restock order workflow
- inventory analytics dashboard
- QR labels and export reports
- authentication and role-based access
