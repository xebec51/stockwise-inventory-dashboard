# Eventra

<p align="center">
  <img src="https://img.shields.io/badge/Smart-Event%20Ticketing%20Platform-111827?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Live%20Portfolio%20Project-16A34A?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-2563EB?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://eventra-ticketing-platform.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Open%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
  <a href="https://github.com/xebec51/eventra-ticketing-platform">
    <img src="https://img.shields.io/badge/Repository-View%20Source-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
</p>

<p align="center">
  <strong>Approval-driven event ticketing platform for campus programs, seminars, workshops, competitions, community events, and small-to-mid scale operations.</strong>
</p>

<p align="center">
  Eventra combines public event discovery with role-based dashboards for admins, organizers, and attendees in one cohesive product flow.
</p>

<p align="center">
  <a href="https://eventra-ticketing-platform.vercel.app/"><strong>Live Demo</strong></a>
  |
  <a href="#demo-accounts"><strong>Demo Accounts</strong></a>
  |
  <a href="#setup"><strong>Setup Guide</strong></a>
  |
  <a href="#features"><strong>Features</strong></a>
</p>

---

## Overview

Eventra is a smart event ticketing platform designed to handle both the public-facing discovery experience and the operational complexity behind approvals, bookings, ticket issuance, payment review, check-in, reporting, and moderation.

It is built as a portfolio-grade SaaS-style application with realistic business rules, role-aware access control, and deployable production behavior.

Core product focus:

- public event exploration and event detail browsing
- role-based authentication and dashboard access
- organizer approval workflow
- booking and manual payment review flow
- QR-based ticket delivery and verification
- check-in operations
- organizer and admin reporting

---

## Live Demo

- Deployment: `https://eventra-ticketing-platform.vercel.app/`
- Platform: Vercel
- Database: Neon PostgreSQL

---

## Highlights

- Public event discovery with role-aware operational dashboards
- Admin, organizer, and user workflows inside one unified platform
- Approval-driven booking lifecycle with separate booking and payment states
- QR ticket generation and public verification route
- Organizer moderation and admin oversight
- XLSX export support for operational reporting
- Prisma + PostgreSQL data model designed around realistic ticketing workflows

---

## Features

### Public Experience

- landing page with featured, popular, and upcoming events
- searchable event catalog
- category and city filtering
- event detail pages
- public ticket verification route at `/verify/[ticketCode]`

### Authentication & Access Control

- credentials-based authentication with NextAuth/Auth.js
- role-aware dashboard redirects
- protected dashboard routes through `proxy.ts`
- organizer status handling for `PENDING` and `REJECTED`

### Admin Workspace

- approve or reject organizer accounts
- manage user statuses
- manage event categories
- oversee events, bookings, and payments
- moderate event reviews
- inspect activity logs
- analytics and XLSX export support

### Organizer Workspace

- manage organizer profile
- create and manage events
- configure ticket types
- review bookings and manual payments
- approve cash-on-venue bookings
- check in attendees by ticket code
- access organizer analytics and reports

### User Experience

- register and sign in
- book tickets
- submit payment proof manually
- view booking history and booking detail
- access QR ticket wallet
- save favorite events
- submit post-event reviews
- manage personal profile

---

## Roles

### ADMIN

- platform moderation and global oversight
- organizer approval and rejection
- user and category management
- booking, payment, review, and analytics supervision

### ORGANIZER

- event and ticket management
- booking review and payment verification
- attendee check-in
- scoped reporting and analytics

### USER

- browse events
- book tickets
- upload payment proof
- manage favorites, reviews, and profile

### Guest

- browse public events
- view event details
- verify tickets publicly by code

---

## Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/NextAuth-Auth.js-4B5563?style=flat-square" />
  <img src="https://img.shields.io/badge/Zod-Validation-3B82F6?style=flat-square" />
  <img src="https://img.shields.io/badge/Recharts-Analytics-E11D48?style=flat-square" />
  <img src="https://img.shields.io/badge/XLSX-Export-15803D?style=flat-square" />
</p>

- Next.js 16.2.10 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma 7.8.0
- PostgreSQL on Neon
- NextAuth/Auth.js
- Zod
- React Hook Form
- Recharts
- TanStack Table
- QRCode
- xlsx
- date-fns
- bcryptjs

---

## Core Business Rules

### Organizer Approval

- organizer registration creates a `User` with role `ORGANIZER` and status `PENDING`
- admin approval sets organizer status to `ACTIVE` and records `approvedAt` plus `approvedBy`
- admin rejection sets organizer status to `REJECTED` and stores a rejection reason

### Booking & Payment

- `BookingStatus` and `PaymentStatus` are separate
- free bookings use `FREE`, become `APPROVED` immediately, and issue tickets instantly
- `BANK_TRANSFER` and `E_WALLET` start as `PENDING + UNPAID` with a 24-hour expiry deadline
- payment proof submission changes payment state to `WAITING_CONFIRMATION`
- payment verification marks the booking `PAID`, records verifier metadata, approves the booking, and generates tickets
- invalid proof marks payment as `FAILED` while leaving the booking pending for resubmission
- `CASH_ON_VENUE` reserves inventory without immediate payment, but tickets still require approval
- expired `PENDING + UNPAID` bookings become `CANCELLED`

### Tickets & QR

- tickets are generated only after booking approval
- one ticket is generated per booked quantity
- QR images are not stored in the database
- only `ticketCode` and `qrPayload` are stored
- the frontend renders the QR image from `qrPayload`

### Check-in & Reviews

- check-in is tracked at ticket level
- a valid ticket becomes `USED` after successful check-in
- duplicate check-in is blocked
- reviews require the event to be finished
- reviews require at least one `USED` ticket for that event
- one booking can only produce one review
- one user can only review an event once

---

## Database Summary

Implemented Prisma models:

- `User`
- `OrganizerProfile`
- `EventCategory`
- `Event`
- `TicketType`
- `Booking`
- `BookingItem`
- `Ticket`
- `FavoriteEvent`
- `EventReview`
- `ActivityLog`

Key relationships:

- `events.organizer_profile_id` references `organizer_profiles.id`
- `booking_items` belong to `bookings` and `ticket_types`
- `tickets` belong to `bookings`, `booking_items`, `events`, `users`, and `ticket_types`
- `event_reviews.booking_id` is unique
- `favorite_events.user_id + event_id` is unique

---

## Routes

### Public

- `/`
- `/events`
- `/events/[slug]`
- `/login`
- `/register`
- `/register/organizer`
- `/verify/[ticketCode]`
- `/pending-organizer`
- `/rejected-organizer`
- `/unauthorized`

### Shared Dashboard

- `/dashboard`
- `/dashboard/profile`
- `/dashboard/settings`

### Admin

- `/dashboard/admin`
- `/dashboard/admin/users`
- `/dashboard/admin/organizers`
- `/dashboard/admin/events`
- `/dashboard/admin/categories`
- `/dashboard/admin/bookings`
- `/dashboard/admin/payments`
- `/dashboard/admin/reports`
- `/dashboard/admin/activity-logs`

### Organizer

- `/dashboard/organizer`
- `/dashboard/organizer/events`
- `/dashboard/organizer/events/[id]`
- `/dashboard/organizer/bookings`
- `/dashboard/organizer/payments`
- `/dashboard/organizer/check-in`
- `/dashboard/organizer/reports`
- `/dashboard/organizer/profile`

### User

- `/dashboard/user`
- `/dashboard/user/bookings`
- `/dashboard/user/bookings/[id]`
- `/dashboard/user/tickets`
- `/dashboard/user/favorites`
- `/dashboard/user/reviews`
- `/dashboard/user/profile`

---

## Demo Accounts

All demo accounts use:

```text
Password123!
```

Available accounts:

- `admin@eventra.demo`
- `organizer.alpha@eventra.demo`
- `organizer.beta@eventra.demo`
- `organizer.pending@eventra.demo`
- `organizer.rejected@eventra.demo`
- `user.one@eventra.demo`
- `user.two@eventra.demo`

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
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Production example:

```env
NEXTAUTH_URL=https://eventra-ticketing-platform.vercel.app
NEXT_PUBLIC_APP_URL=https://eventra-ticketing-platform.vercel.app
```

Notes:

- do not commit `.env`, `.env.local`, or any secret file
- if your Postgres provider appends `sslmode=require`, switch it to `sslmode=verify-full`

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

## Payment Model

### Manual Payment

Eventra simulates manual payment operations rather than integrating a live payment gateway.

- users create a paid booking
- users upload a payment proof URL
- organizer or admin reviews the proof
- valid proof marks the booking as paid and triggers approval
- invalid proof keeps the booking pending with a failed payment state so the user can resubmit

### Cash on Venue

`CASH_ON_VENUE` acts as an offline seat reservation flow.

- the user reserves inventory
- payment is handled at the venue
- tickets still require organizer or admin approval before issuance

### Booking Status vs Payment Status

Examples:

- `PENDING + UNPAID`
- `PENDING + WAITING_CONFIRMATION`
- `PENDING + FAILED`
- `APPROVED + PAID`
- `APPROVED + NOT_REQUIRED`
- `CANCELLED + UNPAID`

---

## Deployment Notes

### Vercel

- set all environment variables in the Vercel project
- ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` point to the deployed domain
- the build script already runs `prisma generate && next build`

### Neon

- point `DATABASE_URL` to the Neon database
- run migrations against production before first use

---

## Known Limitations

- payment proof is URL-based and does not yet include a real upload pipeline
- no live payment gateway integration
- no QR scanner camera flow yet
- exports are generated as route-based XLSX downloads without background jobs

---

## Future Improvements

- real payment gateway integration
- file uploads for payment proof and organizer branding assets
- QR scanner camera support
- email notifications for approvals, reminders, and check-in confirmations
- stronger search, pagination, and server-side filtering
- automated scheduled expiry jobs

---

## Repository Notes

- Prisma client output is generated into `app/generated/prisma`
- seed data includes multiple booking, payment, ticket, and review states
- the project is designed to remain deployable on Vercel with Neon-backed PostgreSQL

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
  <strong>Eventra</strong><br />
  Built by <strong>Muh. Rinaldi Ruslan</strong> as a modern event ticketing portfolio project.
</p>

<p align="center">
  Crafted with Next.js, Prisma, PostgreSQL, and approval-driven product workflows.
</p>
