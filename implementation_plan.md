# On-Road Vehicle Breakdown Assistance System - Implementation Plan

## Goal Description
Develop a production-ready, highly scalable, and modern web application that connects vehicle owners with nearby mechanics in real time during breakdowns. The platform will feature a premium, mobile-first design, leverage a modern Next.js + Supabase stack, and include a critical **Offline Emergency SMS System** for zero/low-connectivity areas.

---

## 1. Software Requirement Specification (SRS)
**Project Title**: On-Road Vehicle Breakdown Assistance System
**Objective**: To provide a seamless, Uber-like experience for roadside assistance, bridging the gap between stranded drivers and local mechanics, working even in offline/low-network conditions.
**Target Audience**:
- **Customers**: Everyday vehicle owners and drivers.
- **Mechanics**: Independent mechanics and towing service providers.
- **Admins**: Platform operators managing quality, disputes, and analytics.

**Constraints**:
- No Firebase.
- No Express.js.
- No separate backend service — everything runs inside Next.js (Route Handlers + Server Actions).
- TypeScript throughout, Clean Architecture, SOLID principles.

---

## 2. Tech Stack
- **Frontend**: Next.js 15+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Animation**: Framer Motion
- **Forms/Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Backend**: Next.js Route Handlers + Server Actions
- **Database**: Supabase PostgreSQL (with PostGIS extension)
- **Auth**: Supabase Auth (email + phone OTP)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime channels
- **Maps**: Leaflet + OpenStreetMap (React Leaflet)
- **SMS Gateway**: Twilio / MSG91 / Fast2SMS (via server action, no separate backend)
- **Deployment**: Vercel

---

## 3. Functional Requirements
### Customer Features
- **Auth & Profile**: Register, Login, Forgot Password, Profile Management, Emergency Contacts.
- **Vehicle Management**: Add and manage multiple vehicles.
- **Breakdown Request**: Select issue type, capture live GPS location, upload images, add descriptions.
- **Offline/Emergency Fallback**: Detect network connectivity (client-side `navigator.onLine` + ping). If offline, queue locally (IndexedDB) and trigger SMS intent to nearest cached mechanics.
- **Real-Time Tracking**: Instantly see mechanic acceptance, track mechanic location on a Leaflet map, view ETA.
- **Communication**: Real-time chat and call integration (`tel:` intent) with the assigned mechanic.
- **Post-Service**: View service history, download PDF receipt, rate mechanics, and submit feedback.

### Mechanic Features
- **Auth & Onboarding**: Register, complete profile, upload shop info and verification documents.
- **Status**: Toggle availability (Online/Offline).
- **Request Management**: Receive nearby requests in real-time (50km radius via PostGIS `ST_DWithin`) and via SMS in offline mode, accept/reject requests.
- **Navigation & Execution**: Update job status (Accepted → Moving → Arrived → In Progress → Completed) with zero page refresh.
- **Analytics**: View earnings, ratings, and job history.

### Admin Dashboard
- **Overview**: High-level metrics, active requests, total revenue, user counts.
- **User Management**: Manage Customers and Mechanics (approve verifications).
- **Request Management**: Monitor active and past requests, handle disputes.
- **System Settings**: Application configuration, feedback/complaints management.

---

## 4. System Architecture
- **Frontend Core**: Next.js 15+ (App Router), React, TypeScript.
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion, Lucide Icons.
- **Forms & Validation**: React Hook Form, Zod.
- **Backend Logic**: Next.js Server Actions and Route Handlers.
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth).
- **Storage**: Supabase Storage (images/documents).
- **Realtime**: Supabase Realtime channels.
- **Maps**: Leaflet + OpenStreetMap (React Leaflet).
- **Hosting**: Vercel.

---

## 5. Folder Structure
*Note: Next.js route groups like `(customer)/dashboard` will conflict if multiple resolve to `/dashboard`. We will use standard folders (e.g., `/customer/dashboard`) to ensure distinct URLs without conflicts, matching the intended modularity.*

```text
/ (Project Root)
├── app/
│   ├── (auth)/             # Login, Register
│   ├── customer/dashboard/ # Customer routes
│   ├── mechanic/dashboard/ # Mechanic routes
│   ├── admin/dashboard/    # Admin routes
│   ├── api/                # Next.js Route Handlers
│   ├── globals.css         # Tailwind and base styles
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Shadcn UI components
│   └── shared/             # Headers, Footers, Sidebars
├── features/               # Domain-specific logic
│   ├── auth/
│   ├── vehicles/
│   ├── requests/
│   ├── mechanics/
│   ├── admin/
│   └── offline-emergency/
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── supabase/
│   ├── sms/
│   └── geo/
├── services/               # External service abstractions
│   ├── request.service.ts
│   ├── mechanic.service.ts
│   └── sms.service.ts
├── supabase/
│   └── migrations/         # Database migrations and types
├── types/                  # Global TypeScript definitions
├── utils/                  # Helper functions
├── constants/              # Application constants (Enums, Config)
└── middleware.ts           # Route protection and role-based redirects
```

---

## 6. Database Schema (Supabase)

Includes tables:
- `profiles` (extends auth.users)
- `vehicles`
- `emergency_contacts`
- `mechanics` (with PostGIS spatial columns for radius matching)
- `breakdown_requests` (with offline fields)
- `request_status`
- `messages`
- `ratings`
- `payments`
- `service_history`
- `notifications`
- `offline_sms_logs`

*Geo query note:* Enable PostGIS (`create extension postgis;`) and store `geography(Point,4326)` columns on `mechanics` and `breakdown_requests` for accurate radius queries (`ST_DWithin`).

---

## 7. Next Steps & Progress
- **Phase 1**: SRS Analysis & Master Plan Creation (✅ Completed)
- **Phase 2**: Restructure folder layout and push to GitHub to trigger Vercel deployment (✅ Completed)
- **Phase 3+**: Database setup, Authentication flow, offline capabilities, map integration, and realtime features.
