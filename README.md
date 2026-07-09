# StockWise

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/shadcn/ui-Admin%20UI-black" />
  <img src="https://img.shields.io/badge/Status-Portfolio%20Project-success" />
</p>

<p align="center">
  <a href="https://github.com/xebec51">
    <img src="https://img.shields.io/badge/GitHub-xebec51-181717?logo=github" />
  </a>
  <a href="mailto:rinaldi.ruslan51@gmail.com">
    <img src="https://img.shields.io/badge/Email-rinaldi.ruslan51%40gmail.com-D14836?logo=gmail&logoColor=white" />
  </a>
  <a href="https://www.instagram.com/rinaldiruslan/">
    <img src="https://img.shields.io/badge/Instagram-rinaldiruslan-E4405F?logo=instagram&logoColor=white" />
  </a>
  <a href="https://www.tiktok.com/@rinaldiruslan">
    <img src="https://img.shields.io/badge/TikTok-rinaldiruslan-000000?logo=tiktok&logoColor=white" />
  </a>
</p>

<p align="center">
  <strong>Modern Inventory Intelligence Dashboard</strong><br/>
  SaaS-style warehouse management system for stock control, supplier coordination, transaction approvals, analytics, QR labels, and export reporting.
</p>

---

## Deskripsi Proyek

StockWise adalah dashboard manajemen inventaris modern yang dirancang untuk membantu tim gudang mengelola:

- produk dan kategori gudang
- stok masuk dan stok keluar
- approval transaksi
- workflow restock order
- supplier dan supplier rating
- activity logs
- inventory analytics
- QR product labels
- export report ke CSV dan XLSX

Fokus utama proyek ini bukan sekadar CRUD, tetapi membangun pengalaman aplikasi admin yang terasa seperti produk SaaS nyata, dengan struktur domain yang rapi, workflow operasional yang jelas, dan UI yang siap dipresentasikan sebagai portfolio project.

---

## Key Highlights

- End-to-end warehouse workflow dari products sampai restock receiving
- Prisma + PostgreSQL schema yang mengikuti ERD operasional nyata
- Role-based authentication untuk `ADMIN`, `MANAGER`, `STAFF`, dan `SUPPLIER`
- Pending transaction approval yang benar-benar mengubah stock hanya saat disetujui
- Restock order yang otomatis membuat linked incoming transaction saat status `RECEIVED`
- Dashboard analytics berbasis query database nyata
- QR code label generation dan export CSV/XLSX
- Responsive admin dashboard dengan Next.js App Router + shadcn/ui

---

## Fitur Utama

### 1. Product & Category Management

- create, edit, delete category
- create, edit, delete product
- validasi Zod
- computed stock status:
  - `OUT_OF_STOCK`
  - `LOW_STOCK`
  - `IN_STOCK`

### 2. Supplier Management

- read supplier data dari database
- create, edit, delete supplier profile
- relasi supplier dengan user account
- ringkasan restock dan rating supplier

### 3. Transaction Workflow

- create pending `INCOMING` dan `OUTGOING` transaction
- multi-item transaction
- approval dan rejection flow
- `stockBefore` dan `stockAfter` tersimpan di `transaction_items`
- outgoing transaction tidak boleh melebihi stock tersedia

### 4. Restock Workflow

- manager membuat restock order
- supplier bisa confirm atau reject
- supplier bisa mark `IN_TRANSIT`
- manager bisa mark `RECEIVED`
- saat `RECEIVED`, sistem membuat linked incoming transaction
- stock produk otomatis diperbarui
- supplier rating tersedia setelah order diterima

### 5. Analytics Dashboard

- total products
- total inventory value
- low stock count
- out of stock count
- pending transaction count
- active restock order count
- recent transactions
- low stock products
- charts dengan Recharts

### 6. QR & Reporting

- generate QR code untuk product identifier
- download QR sebagai PNG
- export products ke CSV/XLSX
- export transactions ke CSV/XLSX

### 7. Authentication & Role-Based Access

- credential login dengan data user dari database
- middleware protection untuk semua route dashboard
- role-aware navigation
- pembatasan akses berdasarkan role

---

## Tech Stack

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

## User Roles

### ADMIN

- full dashboard access
- manage products, categories, suppliers
- approve workflow access
- reporting and monitoring access

### MANAGER

- monitor stock dan inventory
- approve/reject transactions
- create restock orders
- receive restock deliveries
- rate suppliers

### STAFF

- create stock transactions
- view products
- view own transaction workspace

### SUPPLIER

- view assigned restock orders
- confirm/reject order
- update delivery status ke `IN_TRANSIT`

---

## ERD Summary

Entity utama yang sudah digunakan di Prisma schema:

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

Aturan bisnis penting:

- stock status tidak disimpan di database
- stock status dihitung dari `currentStock` dan `minimumStock`
- pending transaction tidak mengubah stock
- stock hanya berubah saat transaction approved/completed
- outgoing quantity tidak boleh melebihi stock tersedia
- restock order `RECEIVED` membuat linked incoming transaction
- supplier rating hanya boleh dibuat setelah restock diterima

---

## Module Routes

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

Semua seeded account menggunakan password berikut:

```text
Password123!
```

Daftar akun demo:

- `admin@stockwise.demo`
- `manager@stockwise.demo`
- `staff@stockwise.demo`
- `supplier.alpha@stockwise.demo`
- `supplier.beta@stockwise.demo`

---

## Setup Project

### 1. Install dependency

```bash
npm install
```

### 2. Buat file `.env`

Isi minimal:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

Catatan:

- `DATABASE_URL` wajib untuk Prisma, migration, seed, auth lookup, dan data reads
- `NEXTAUTH_SECRET` wajib disiapkan untuk session auth yang stabil, terutama di production

### 3. Validasi Prisma

```bash
npx prisma validate
```

### 4. Jalankan migration

```bash
npx prisma migrate dev --name init_stockwise_schema
```

### 5. Seed data demo

```bash
npm run seed
```

### 6. Jalankan aplikasi

```bash
npm run dev
```

---

## Prisma Commands

Command yang sering dipakai:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate dev --name init_stockwise_schema
npm run seed
```

---

## Export & QR Features

### Export

- products bisa diexport dari halaman products atau reports
- transactions bisa diexport dari halaman transactions atau reports
- format export:
  - CSV
  - XLSX

### QR Labels

- QR label tersedia di table products
- QR akan menggunakan `qrCode` jika ada
- jika `qrCode` kosong, sistem memakai `sku`
- QR bisa didownload sebagai PNG

---

## Authentication Notes

- auth menggunakan `users` table yang sama dengan domain utama
- login memakai credentials provider
- dashboard dilindungi middleware
- navigation dan route access difilter berdasarkan role
- user dengan status `PENDING`, `REJECTED`, atau `INACTIVE` tidak bisa memakai dashboard aktif

---

## Quality Checks

Jalankan ini setelah ada perubahan:

```bash
npx prisma validate
npm run lint
npm run build
```

---

## Screenshot Placeholder

Tambahkan screenshot di sini nanti:

- landing page
- login page
- dashboard analytics
- products page
- transactions workflow
- restock workflow
- reports/export page

---

## Roadmap Lanjutan

- activity log timeline yang lebih kaya
- filter dan search table yang lebih lengkap
- settings preferences yang lebih detail
- reporting preset
- scheduled exports
- dashboard insight yang lebih dalam
- portfolio screenshots dan deployment guide

---

## Status Proyek

Phase yang sudah selesai:

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

## Author

**Muh. Rinaldi Ruslan**

- Email: [rinaldi.ruslan51@gmail.com](mailto:rinaldi.ruslan51@gmail.com)
- GitHub: https://github.com/xebec51
- Instagram: https://www.instagram.com/rinaldiruslan/
- TikTok: https://www.tiktok.com/@rinaldiruslan

StockWise dikembangkan sebagai portfolio-grade warehouse management project menggunakan stack modern React ecosystem, Prisma, dan PostgreSQL.
