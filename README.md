# StockWise

<p align="center">
  <img src="https://img.shields.io/badge/Inventory-Intelligence%20Dashboard-0F172A?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Live%20Portfolio%20Project-16A34A?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-2563EB?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://stockwise-inventory-dashboard.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Open%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
  <a href="https://github.com/xebec51/stockwise-inventory-dashboard">
    <img src="https://img.shields.io/badge/Repository-View%20Source-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
</p>

<p align="center">
  <strong>Modern warehouse operations cockpit for inventory control, stock movement approvals, restock workflows, supplier coordination, QR labels, and exportable reports.</strong>
</p>

<p align="center">
  StockWise turns inventory management into a polished, bilingual SaaS experience for admin, manager, staff, and supplier workflows.
</p>

<p align="center">
  <a href="https://stockwise-inventory-dashboard.vercel.app/"><strong>Live Demo</strong></a>
  |
  <a href="#demo-accounts"><strong>Demo Accounts</strong></a>
  |
  <a href="#setup"><strong>Setup Guide</strong></a>
  |
  <a href="#features"><strong>Features</strong></a>
</p>

---

## Overview

StockWise is a full-stack inventory intelligence dashboard built for realistic warehouse operations. It supports product and category management, supplier profiles, transaction approval workflows, restock order coordination, stock-safe updates, analytics, QR labels, export reports, activity logs, authentication, and role-aware access.

The interface has been redesigned around a graphite, cyan, emerald, amber, and risk-red operations identity so the product feels more like a warehouse command center than a generic admin template.

Core product focus:

- product catalog and warehouse stock visibility
- computed stock health instead of stored stock status
- pending transaction review before stock changes
- incoming and outgoing movement audit history
- supplier restock workflow from order to receipt
- QR labels and CSV/XLSX export surfaces
- bilingual English and Bahasa Indonesia UI

---

## Live Demo

- Deployment: `https://stockwise-inventory-dashboard.vercel.app/`
- Platform: Vercel
- Database: Neon PostgreSQL

---

## Portfolio Context

This project is part of a full-stack portfolio focused on building production-ready SaaS applications with modern web technologies, role-based access control, database-backed workflows, analytics, and polished UI/UX.

---

## Highlights

- Role-aware dashboard access for ADMIN, MANAGER, STAFF, and SUPPLIER
- Product and category CRUD with Zod validation and safe delete checks
- Supplier profile management linked to supplier user accounts
- Transaction workflow with pending, approval, rejection, and stock audit fields
- Restock order workflow with supplier confirmation, transit, receipt, and ratings
- Analytics dashboard with inventory value, stock risk, recent movements, and charts
- QR label generation for products
- CSV/XLSX exports for products and transactions
- English and Bahasa Indonesia language switcher with persisted preference
- Vercel-safe Prisma Client generation during install/build

---

## Features

### Inventory Operations

- manage products, SKUs, units, rack locations, QR values, and pricing
- manage categories and prevent deleting categories that still contain products
- compute stock status from `currentStock` and `minimumStock`
- show low-stock and out-of-stock alerts without storing derived status

### Transaction Workflow

- create pending incoming or outgoing transactions with multiple product lines
- approve transactions to apply stock changes safely
- reject transactions without changing stock
- prevent outgoing quantity from exceeding available stock
- save `stockBefore` and `stockAfter` for every transaction item

### Restock Workflow

- create restock orders for suppliers
- supplier confirms, rejects, or marks confirmed orders in transit
- manager/admin receives in-transit orders
- receipt creates linked incoming transactions
- supplier rating is available after valid receipt

### Reporting & QR

- export product data to CSV/XLSX
- export transaction history with item-level audit fields
- display and download product QR labels
- keep exports disabled when no rows are available

### Authentication & Access Control

- credentials login with seeded demo users
- authenticated users visiting `/login` redirect to `/dashboard`
- guests visiting dashboard routes redirect to `/login`
- middleware and server helpers enforce role-aware dashboard access

---

## Roles

### ADMIN

- manage products, categories, suppliers, users, and global workflows
- approve or reject transactions
- receive restock orders
- export reports and view platform-wide operational data

### MANAGER

- monitor stock and low-stock risk
- approve or reject transactions
- create and receive restock orders
- rate suppliers after completed deliveries

### STAFF

- create incoming and outgoing stock transactions
- view products and transaction history
- check current stock availability

### SUPPLIER

- view assigned restock orders
- confirm, reject, or update delivery status
- view received ratings and delivery history

---

## Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-Components-111827?style=flat-square" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/NextAuth-Auth.js-4B5563?style=flat-square" />
  <img src="https://img.shields.io/badge/Zod-Validation-3B82F6?style=flat-square" />
  <img src="https://img.shields.io/badge/Recharts-Analytics-E11D48?style=flat-square" />
  <img src="https://img.shields.io/badge/XLSX-Export-15803D?style=flat-square" />
</p>

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma 7
- PostgreSQL on Neon
- NextAuth/Auth.js
- Zod
- Recharts
- TanStack Table
- QRCode
- xlsx
- bcryptjs
- lucide-react

---

## Database Summary

Implemented Prisma models:

- `User`
- `Supplier`
- `Category`
- `Product`
- `Transaction`
- `TransactionItem`
- `RestockOrder`
- `RestockOrderItem`
- `SupplierRating`
- `ActivityLog`

Important rules:

- stock status is never stored in the database
- `currentStock = 0` displays as out of stock
- `currentStock <= minimumStock` displays as low stock
- pending transactions do not change stock
- approved/completed transactions record item-level stock audit history
- one restock order can create at most one linked incoming transaction
- one restock order can have at most one supplier rating

---

## Routes

### Public

- `/`
- `/login`

### Dashboard

- `/dashboard`
- `/dashboard/products`
- `/dashboard/categories`
- `/dashboard/transactions`
- `/dashboard/restock-orders`
- `/dashboard/suppliers`
- `/dashboard/reports`
- `/dashboard/activity-logs`
- `/dashboard/settings`

---

## Demo Accounts

All demo accounts use:

```text
Password123!
```

Available accounts:

- `admin@stockwise.demo`
- `manager@stockwise.demo`
- `staff@stockwise.demo`
- `supplier.alpha@stockwise.demo`
- `supplier.beta@stockwise.demo`

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Required variables:

```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
# AUTH_SECRET= can be used instead of NEXTAUTH_SECRET
```

Production example:

```env
NEXTAUTH_URL=https://stockwise-inventory-dashboard.vercel.app
```

Notes:

- do not commit `.env`, `.env.local`, or any secret file
- configure the same variables in Vercel before deploying
- Prisma 7 uses the PostgreSQL driver adapter configured in the project runtime helper

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Apply local migration

```bash
npx prisma migrate dev
```

### 5. Seed demo data

```bash
npm run seed
```

### 6. Start development server

```bash
npm run dev
```

---

## Validation Commands

```bash
npx prisma validate
npx prisma generate
npm run lint
npm run build
```

---

## Deployment Notes

### Vercel

- set `DATABASE_URL`, `NEXTAUTH_URL`, and either `NEXTAUTH_SECRET` or `AUTH_SECRET`
- set `NEXTAUTH_URL` to the deployed domain
- `postinstall`, `prebuild`, and `build` scripts generate the Prisma Client before Next.js compiles
- generated Prisma Client files are not committed

### Neon

- point `DATABASE_URL` to the Neon PostgreSQL database
- run migrations intentionally and never use destructive reset commands on production
- seed only development or demo databases

---

## Bilingual Support

StockWise supports English and Bahasa Indonesia through an internal dictionary-based i18n layer.

- language switcher is available on public and dashboard surfaces
- selected language persists across refreshes
- navigation, status labels, dashboard copy, forms, empty states, and reports are translated where practical
- date and currency formatting respect the selected locale

---

## Security and Concurrency Notes

- dashboard access is enforced by middleware and repeated at page level before sensitive Prisma queries run
- Server Actions enforce role and resource ownership checks independently of navigation visibility
- transaction approval and restock receipt use serializable transactions, deterministic product row locks, conditional stock updates, and conservative retries for Prisma `P2034` conflicts
- outgoing stock writes retain an atomic `currentStock >= quantity` guard, while restock receipt locks the order before checking its status and linked transaction
- pending transactions do not change product stock; audit values are finalized only during approval or receipt

Nonnegative stock is enforced by validation and guarded writes. The current database schema does not include a PostgreSQL `CHECK` constraint for stock or quantity values.

---

## Known Limitations

- authentication is credentials-based for demo purposes
- file uploads are not implemented for product/category/supplier images
- supplier-facing workflows are role-aware but still operate within the portfolio demo scope
- exports run in-browser and are not background jobs
- QR labels are generated from product SKU or stored QR value

---

## Future Improvements

- deeper server-side pagination and filtering for very large warehouse datasets
- upload pipeline for product and supplier assets
- richer supplier reliability scoring and restock recommendations
- barcode scanner integrations for warehouse receiving and picking
- notification workflow for approvals, rejected transactions, and delivery updates

---

## Author

**Muh. Rinaldi Ruslan**

- GitHub: [xebec51](https://github.com/xebec51)
- LinkedIn: [rinaldiruslan](https://www.linkedin.com/in/rinaldiruslan)
- Email: [rinaldi.ruslan51@gmail.com](mailto:rinaldi.ruslan51@gmail.com)
- Instagram: [@rinaldiruslan](https://www.instagram.com/rinaldiruslan/)
- TikTok: [@rinaldiruslan](https://www.tiktok.com/@rinaldiruslan)

---

## Connect With Me

<p align="left">
  <a href="https://github.com/xebec51">
    <img src="https://img.shields.io/badge/GitHub-xebec51-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="mailto:rinaldi.ruslan51@gmail.com">
    <img src="https://img.shields.io/badge/Email-rinaldi.ruslan51%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>
  <a href="https://www.linkedin.com/in/rinaldiruslan">
    <img src="https://img.shields.io/badge/LinkedIn-rinaldiruslan-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
  <a href="https://www.instagram.com/rinaldiruslan/">
    <img src="https://img.shields.io/badge/Instagram-rinaldiruslan-E4405F?style=for-the-badge&logo=instagram&logoColor=white" />
  </a>
  <a href="https://www.tiktok.com/@rinaldiruslan">
    <img src="https://img.shields.io/badge/TikTok-rinaldiruslan-000000?style=for-the-badge&logo=tiktok&logoColor=white" />
  </a>
</p>

---

<p align="center">
  <strong>StockWise</strong><br />
  Built by <strong>Muh. Rinaldi Ruslan</strong> as a modern inventory intelligence portfolio project.
</p>

<p align="center">
  Crafted with Next.js, Prisma, PostgreSQL, and warehouse-grade operational workflows.
</p>
