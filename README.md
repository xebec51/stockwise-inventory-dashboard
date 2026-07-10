# StockWise

<p align="center">
  <img src="https://img.shields.io/badge/Modern-Inventory%20Intelligence-0F172A?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready%20Portfolio-16A34A?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-2563EB?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://stockwise-inventory-dashboard.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Open%20on%20Vercel-111827?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
  <a href="https://github.com/xebec51/stockwise-inventory-dashboard">
    <img src="https://img.shields.io/badge/Repository-View%20Source-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
</p>

<p align="center">
  <strong>Portfolio-grade warehouse management dashboard for inventory control, transaction approval, restock workflows, supplier operations, analytics, QR labels, and export reporting.</strong>
</p>

<p align="center">
  StockWise is designed to feel like a real SaaS operations product, not a simple CRUD demo.
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

StockWise is a modern inventory intelligence dashboard built for warehouse teams that need better visibility into stock movement, replenishment, supplier coordination, and operational approvals.

This project focuses on realistic product behavior:

- role-aware access for `ADMIN`, `MANAGER`, `STAFF`, and `SUPPLIER`
- stock movement approval workflows
- restock order lifecycle handling
- computed stock status instead of stored stock labels
- exportable operational data
- modern admin UI with a strong portfolio presentation

---

## Live Demo

- Deployment: `https://stockwise-inventory-dashboard.vercel.app/`
- Platform: Vercel
- Database: Neon PostgreSQL

---

## Highlights

- End-to-end warehouse domain modeling with Prisma and PostgreSQL
- Responsive SaaS-style dashboard built with Next.js App Router and shadcn/ui
- Credentials authentication with role-based route protection
- Incoming and outgoing transaction workflow with approval gates
- Restock order workflow with supplier confirmation and warehouse receiving
- Real analytics cards and charts powered by database queries
- QR code product labels and CSV/XLSX export support

---

## Features

### Product & Category Management

- create, edit, and delete categories
- create, edit, and delete products
- Zod validation for form input
- computed stock status:
  - `OUT_OF_STOCK`
  - `LOW_STOCK`
  - `IN_STOCK`

### Supplier Management

- supplier directory from the database
- create, edit, and delete supplier profiles
- linked supplier user accounts
- supplier restock summary and rating context

### Transaction Workflow

- create pending `INCOMING` and `OUTGOING` transactions
- multi-item transaction support
- approve or reject transaction flow
- stock audit fields with `stockBefore` and `stockAfter`
- outgoing quantity validation against current stock

### Restock Workflow

- manager creates restock orders
- supplier confirms or rejects requests
- supplier marks shipments `IN_TRANSIT`
- manager marks orders `RECEIVED`
- received restocks create linked incoming transactions
- stock updates are applied through transaction items
- supplier rating becomes available after receipt

### Analytics & Reporting

- total products
- total inventory value
- low stock and out-of-stock signals
- pending transaction count
- active restock order count
- recent transaction feed
- inventory analytics charts
- CSV/XLSX export for products and transactions

### QR Labels & Access Control

- QR code generation per product
- QR fallback using SKU when custom code is empty
- credentials login with route protection
- role-aware navigation and dashboard access

---

## Product Roles

### ADMIN

- full dashboard access
- manage products, categories, and suppliers
- oversee workflows and reporting

### MANAGER

- monitor inventory
- approve or reject transactions
- create and receive restock orders
- rate suppliers

### STAFF

- create stock transactions
- access product and transaction workspace

### SUPPLIER

- review assigned restock orders
- confirm, reject, and update delivery status

---

## Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-Component%20System-111111?style=flat-square" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/NextAuth-Credentials-4B5563?style=flat-square" />
  <img src="https://img.shields.io/badge/Zod-Validation-3B82F6?style=flat-square" />
  <img src="https://img.shields.io/badge/Recharts-Analytics-E11D48?style=flat-square" />
  <img src="https://img.shields.io/badge/XLSX-Export-15803D?style=flat-square" />
</p>

- Next.js 16
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma ORM
- PostgreSQL / Neon
- NextAuth Credentials
- Zod
- Recharts
- TanStack Table
- QRCode
- xlsx
- lucide-react

---

## Core Domain

Main entities used in the current Prisma schema:

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

Important business rules:

- stock status is never stored in the database
- stock status is computed from `currentStock` and `minimumStock`
- pending transactions do not change stock
- stock changes only happen after approval or completion
- outgoing quantity cannot exceed available stock
- a received restock creates a linked incoming transaction
- supplier ratings are only valid after restock receipt

---

## Routes

- `/`
- `/login`
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

All seeded demo accounts use:

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

Create `.env` with at least:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

Notes:

- `DATABASE_URL` is required for Prisma, auth lookup, seeding, and dashboard data
- `NEXTAUTH_SECRET` is required for stable NextAuth sessions, especially in production

### 3. Validate Prisma

```bash
npx prisma validate
```

### 4. Run migration

```bash
npx prisma migrate dev --name init_stockwise_schema
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

## Useful Commands

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate dev --name init_stockwise_schema
npm run seed
npm run lint
npm run build
```

---

## Export & QR Notes

### Export

- products can be exported from Products and Reports
- transactions can be exported from Transactions and Reports
- supported formats:
  - CSV
  - XLSX

### QR Labels

- QR labels are available from the products table
- the app uses `qrCode` when present
- if `qrCode` is empty, it falls back to `sku`
- QR can be downloaded as PNG

---

## Authentication Notes

- authentication uses the same `users` table as the main domain
- login uses NextAuth Credentials
- middleware protects dashboard routes
- navigation and route access are filtered by role
- users with `PENDING`, `REJECTED`, or `INACTIVE` status are blocked from active dashboard use

---

## Quality Checks

Run these after changes:

```bash
npx prisma validate
npm run lint
npm run build
```

---

## Screenshot Checklist

You can add screenshots for:

- landing page
- login page
- analytics dashboard
- products management
- transaction workflow
- restock workflow
- reporting and export

---

## Project Status

Completed milestones:

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

---

## Roadmap

- richer activity log timeline
- more advanced search and filtering
- deeper settings and preferences
- reporting presets
- scheduled exports
- more advanced operational insights
- polished screenshot gallery for portfolio presentation

---

## Author

**Muh. Rinaldi Ruslan**

- GitHub: [xebec51](https://github.com/xebec51)
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
  Built by <strong>Muh. Rinaldi Ruslan</strong> as a modern warehouse intelligence portfolio project.
</p>

<p align="center">
  Crafted with Next.js, Prisma, PostgreSQL, and a product-first mindset for realistic operational workflows.
</p>
