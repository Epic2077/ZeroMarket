# ZeroMarket Backend Roadmap — Complete Guide

> **Audience:** Front-end Developer + AI Agent (e.g., Cursor, Copilot, Claude)
>
> **Goal:** Transition ZeroMarket from a front-end-only app (with mock data) to a full-stack project with a real database, APIs, and authentication.

---

## Table of Contents

1. [Current Front-end State (Complete Audit)](#1-current-front-end-state-complete-audit)
2. [Backend Technology Stack Selection](#2-backend-technology-stack-selection)
3. [Database Design (Prisma Schema)](#3-database-design-prisma-schema)
4. [API Design (Endpoints)](#4-api-design-endpoints)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Step-by-Step Migration Plan](#6-step-by-step-migration-plan)
7. [Important Considerations & Special Notes](#7-important-considerations--special-notes)
8. [Directory Structure Post-Backend Migration](#8-directory-structure-post-backend-migration)
9. [Final Validation Checklist](#9-final-validation-checklist)

---

## 1. Current Front-end State (Complete Audit)

### 1.1 Current Data Model — How `src/context/` works

Currently, all the application's data lives as hard-coded arrays and React Context inside the `src/context/` directory. **There is no backend.** Any user modification is lost on page refresh (except for storefront banners, which are stored in `localStorage`).

### 1.2 Complete Audit of `src/context/` Files

The following table details the role of each file in the context folder and its backend destiny:

| File                                                                                         | Description                                                                                                                   | Backend Mapping / Destination                                                                                                                                                          |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [data.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/data.ts)                         | Array of 12 `listings` (mock ads) + `priceChartData` + `brandVolumeData` + `formatPrice()` helper                             | ⚡ **Database:** `listings` table. Charts -> API. `formatPrice()` stays on front-end.                                                                                                  |
| [sellers.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/sellers.ts)                   | `SellerSummary` (derived from listings — sellers do not have a dedicated table!)                                              | ⚡ **Database:** Separate `sellers` / `users` table. Currently, sellers are dynamically constructed from `sellerName`/`sellerVerified`... inside listings, which is a **design flaw**. |
| [sellerDashboard.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/sellerDashboard.tsx) | Seller dashboard stats + `buyRequests` + `sellerStats` + tabs/actions                                                         | ⚡ **Database:** `buy_requests` table + analytics aggregation in the backend.                                                                                                          |
| [sellerListings.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/sellerListings.tsx)   | Table column definitions for seller ads                                                                                       | ✅ **Stays on front-end** — Pure UI definition.                                                                                                                                        |
| [offers.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/offers.tsx)                   | Mock `carOffers` array + `offerStatusMap` + column definitions                                                                | ⚡ **Database:** `offers` table — offers sent by buyers for a listing.                                                                                                                 |
| [adminData.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/adminData.ts)               | Platform users (`PlatformUser[]`) + admins + `CURRENT_ADMIN_ID` + role helpers                                                | ⚡ **Database:** `users` table + `admins` table + auth session state.                                                                                                                  |
| [userProfile.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/userProfile.tsx)         | Current user profile (`currentUser`) + `savedListings` + `myRequests` + `priceAlerts` + `notifications` + `notificationPrefs` | ⚡ **Database:** Tables for `saved_listings`, `user_requests`, `price_alerts`, `notifications`, `notification_preferences`.                                                            |
| [blog.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/blog.ts)                         | Mock `blogPosts[]` + `blogNotifications[]` + `confirmedAgencies[]`                                                            | ⚡ **Database:** Tables for `blog_posts`, `blog_notifications`, `agencies`.                                                                                                            |
| [banners.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/banners.ts)                   | Banner presets + resolve functions + localStorage key                                                                         | ⚡ **Database:** `banner` field on `users`/`sellers` table.                                                                                                                            |
| [taxonomy.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/taxonomy.ts)                 | Taxonomy lists (brands, colors, cities, fuel types...)                                                                        | ⚡ **Database:** `taxonomy_options` table.                                                                                                                                             |
| [marketFilters.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/marketFilters.ts)       | Filter options + `applyFilters()` + Persian label maps                                                                        | 🔶 **Hybrid:** Label maps -> Front-end. `applyFilters()` -> Backend (database WHERE query).                                                                                            |
| [carLabels.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/carLabels.ts)               | `toFa()` digit mapper + all translation maps (brandModel, color, city, seller -> Persian)                                     | ✅ **Stays on front-end** — Presentation helpers. (However, database entries will store data in raw form and rely on these maps, or store in Farsi directly).                          |
| [listingTable.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/listingTable.tsx)       | Column definitions for the main marketplace table                                                                             | ✅ **Stays on front-end** — Pure UI definition.                                                                                                                                        |
| [latestTable.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/latestTable.tsx)         | Column definitions + `latestTableData` (derived)                                                                              | 🔶 **Hybrid:** Column defs -> Front-end. Data -> API endpoint.                                                                                                                         |
| [newPostForm.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/newPostForm.tsx)         | Form select options + `suggestedPrice()` helper                                                                               | 🔶 **Hybrid:** Options -> Fetched from taxonomy API. `suggestedPrice()` -> API endpoint.                                                                                               |
| [priceInsight.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/priceInsight.ts)         | `topModels[]` (price analytics data)                                                                                          | ⚡ **Backend:** Calculated database aggregation.                                                                                                                                       |
| [topSellers.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/topSellers.ts)             | Top 4 sellers list                                                                                                            | ⚡ **Backend:** Aggregation query.                                                                                                                                                     |
| [Info.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/Info.tsx)                       | Homepage stats + static brands/cities lists + "how it works" steps                                                            | 🔶 **Hybrid:** Stats -> Dynamic API. Static steps and content -> Front-end.                                                                                                            |
| [Header.ts](file:///c:/Code/ZeroMarket/zeromarket/src/context/Header.ts)                     | Navigation links (`navLinks[]`)                                                                                               | ✅ **Stays on front-end**                                                                                                                                                              |

### 1.3 React Context Providers

| Provider           | File                                                                                           | Responsibility                                      | Backend Transition                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `SessionProvider`  | [SessionProvider.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/SessionProvider.tsx)   | Mock session (role + active admin ID)               | 🔄 **Replace** with real authentication (e.g. NextAuth.js or Supabase Auth). |
| `AdminProvider`    | [AdminProvider.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/AdminProvider.tsx)       | CRUD on users + admins (client-side only)           | 🔄 **Replace** with backend API calls to `/api/admin/*`.                     |
| `ListingsProvider` | [ListingsProvider.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/ListingsProvider.tsx) | CRUD on listings (client-side state)                | 🔄 **Replace** with API calls + caching layer (SWR or React Query).          |
| `TaxonomyProvider` | [TaxonomyProvider.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/TaxonomyProvider.tsx) | CRUD on taxonomy options + change proposals         | 🔄 **Replace** with backend API calls.                                       |
| `BannerProvider`   | [BannerProvider.tsx](file:///c:/Code/ZeroMarket/zeromarket/src/context/BannerProvider.tsx)     | Storefront banner state (persisted to localStorage) | 🔄 **Replace** with API call (`PATCH /api/sellers/:slug/banner`).            |

### 1.4 Type Definitions

| File                                                                             | Contents                                                                                        | Current Status                                                                                                  |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [dataTypes.ts](file:///c:/Code/ZeroMarket/zeromarket/src/types/dataTypes.ts)     | `Listing` type (34 fields, including nested seller attributes)                                  | ⚠️ **Needs Refactoring:** Inline `seller*` fields should be replaced by a database relation to a `User` entity. |
| [marketplace.ts](file:///c:/Code/ZeroMarket/zeromarket/src/types/marketplace.ts) | `FilterState` (search query, min/max price, etc.)                                               | ✅ Good — directly maps to HTTP query parameters.                                                               |
| [admin.ts](file:///c:/Code/ZeroMarket/zeromarket/src/types/admin.ts)             | Types for users, admins, forms (`PlatformUser`, `AdminAccount`, `ProductInput`, `ProfileInput`) | ✅ Good — input types match the expected API request body schemas.                                              |
| [blog.ts](file:///c:/Code/ZeroMarket/zeromarket/src/types/blog.ts)               | Blog posts, authors, agencies, notifications                                                    | ✅ Good.                                                                                                        |
| [user.ts](file:///c:/Code/ZeroMarket/zeromarket/src/types/user.ts)               | Types for profile, bookmarks, price alerts, notifications                                       | ✅ Good — each matches a database table structure.                                                              |

### 1.5 Database Design & Flaws in Current Setup

> [!IMPORTANT]
> **Issue 1: Seller has no separate entity.**
> Currently, every single `Listing` carries copy-pasted seller fields like `sellerName`, `sellerVerified`, `sellerResponseRate`, `sellerMemberSince`, `sellerAvatar`. If a seller registers 20 listings, their info is duplicated 20 times. Sellers must be connected as a database relation to a User/Profile table.

> [!IMPORTANT]
> **Issue 2: Market analytics are hardcoded.**
> Fields like `marketAvgBuy`, `marketAvgSell`, `priceVsMarket`, `trend7d` are hardcoded. In a real backend, these need to be calculated dynamically from listing history or fetched from an external analytics worker.

> [!WARNING]
> **Issue 3: Redundant translations and label mapping.**
> Mapping is split across `marketFilters.ts` and `carLabels.ts`. This configuration should be consolidated.

> [!WARNING]
> **Issue 4: Mixed UI definition and mock data.**
> Files like `sellerDashboard.tsx`, `offers.tsx`, `sellerListings.tsx` mix client column logic with mock data. Cldefs must be separated from actual query results.

### 1.6 Front-end cleanup before backend

Before adding route handlers, the front-end should be normalized so the backend does not have to fit the current mock-data shape:

- Normalize one session/auth boundary instead of hardcoded owner/admin viewer ids.
- Move seller/user identity out of duplicated listing fields and into a relation-shaped view model.
- Centralize route constants and fix stale links like `/listings-marketplace` and `#` placeholders.
- Consolidate label maps and filter vocabulary so UI filters and backend query params share one contract.
- Separate seed/demo records from components that only define columns, cards, or form UI.
- Define one client-side fetch/lookup adapter for listings, sellers, dashboards, and auth before route handlers are added.

---

## 2. Backend Technology Stack Selection

> [!TIP]
> Since you are a front-end developer using Next.js, **the most natural setup uses Javascript/TypeScript tools** so you do not have to learn a separate backend language.

### Recommended Stack: Next.js API Routes (Route Handlers) + Prisma ORM + PostgreSQL

```
┌─────────────────────────────────────────────────┐
│                   Front-end                     │
│  Next.js 16 (App Router) — Current Project      │
│  React 19 + TypeScript + Tailwind CSS v4        │
└───────────────┬─────────────────────────────────┘
                │  fetch("/api/...")
                ▼
┌─────────────────────────────────────────────────┐
│                   Backend                       │
│  Next.js Route Handlers (src/app/api/...)       │
│  + NextAuth.js v5 (Authentication)              │
│  + Prisma ORM (Database connection)             │
│  + Zod (Validation — already installed)         │
└───────────────┬─────────────────────────────────┘
                │  Prisma Client query
                ▼
┌─────────────────────────────────────────────────┐
│                   Database                      │
│  PostgreSQL (Supabase / Neon / Railway / Docker) │
└─────────────────────────────────────────────────┘
```

### Why this combination?

| Tech                       | Rationale                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Next.js Route Handlers** | No need to spin up or maintain a separate Node/Express server. API routes live inside your existing App Router structure (`src/app/api/`). |
| **Prisma ORM**             | Instead of writing raw SQL, write queries in type-safe TypeScript with autocomplete. Auto-generates client types matching your schema.     |
| **PostgreSQL**             | Free, reliable, and relational. Excellent for structured data like listings, users, and offers.                                            |
| **NextAuth.js v5**         | Industry standard authentication library for Next.js. Supports email/password credentials + OAuth (Google, GitHub, etc.).                  |
| **Zod**                    | Already exists in your `package.json`. Ideal for verifying API request inputs.                                                             |

### Alternative: Supabase (BaaS)

If you want a **quick and managed** backend, Supabase is a great alternative:

- ✅ Instantly provisioned cloud PostgreSQL database.
- ✅ Prebuilt auth service (email/password, OAuth provider links).
- ✅ Auto-generated REST API (via PostgREST).
- ✅ Real-time database event subscriptions.
- ❌ Harder to write complex backend analytics calculations (requires database triggers or edge functions).

> [!NOTE]
> **Our recommendation:** Go with **Next.js API Routes + Prisma + PostgreSQL**. It provides total control and is a standard architecture for full-stack Next.js applications.

---

## 3. Database Design

### 3.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ listings : "owns (seller)"
    users ||--o{ saved_listings : "bookmarks"
    users ||--o{ buy_requests : "sends (buyer)"
    users ||--o{ price_alerts : "sets"
    users ||--o{ notifications : "receives"
    users ||--o{ notification_prefs : "configures"
    users }o--o{ admin_assignments : "managed by"
    admins ||--o{ admin_assignments : "manages"

    listings ||--o{ buy_requests : "receives"
    listings ||--o{ offers : "has"
    listings ||--o{ saved_listings : "saved in"
    listings }o--|| taxonomy_options : "brand"
    listings }o--|| taxonomy_options : "bodyType"
    listings }o--|| taxonomy_options : "fuelType"
    listings }o--|| taxonomy_options : "city"

    blog_posts ||--o{ blog_notifications : "triggers"
    agencies {
        string slug PK
        string name
        string city
    }
```

### 3.2 Prisma Schema

> [!NOTE]
> Save this file as `prisma/schema.prisma` in the root of the project.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────── USERS & AUTH ───────────────────────────

enum UserRole {
  BUYER
  SELLER
  CONFIRMED_SELLER
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
}

// Matches: PlatformUser + UserProfile
model User {
  id                      String              @id @default(cuid())
  email                   String              @unique
  passwordHash            String?             // Null if OAuth provider only
  name                    String
  phone                   String?
  city                    String?
  bio                     String?
  avatar                  String?             // Initials or image URL
  role                    UserRole            @default(BUYER)
  status                  AccountStatus       @default(ACTIVE)
  verified                Boolean             @default(false)
  sellerApplicationStatus String              @default("none") // "none" | "pending" | "approved"
  memberSince             DateTime            @default(now())

  // Relations
  listings                Listing[]           // Ads registered by this user (seller role)
  savedListings           SavedListing[]      // Saved ads (buyer role)
  buyRequestsSent         BuyRequest[]        @relation("BuyerRequests")
  buyRequestsReceived     BuyRequest[]        @relation("SellerRequests")
  priceAlerts             PriceAlert[]
  notifications           Notification[]
  notificationPrefs       NotificationPref[]
  adminAssignments        AdminAssignment[]   @relation("ManagedUser")

  // Seller-specific fields (null for buyers)
  sellerSlug              String?             @unique // URL-safe identifier
  bannerPresetId          String?             // Banner preset identifier or "custom"
  bannerImageUrl          String?             // Custom banner upload URL
  responseRate            Float?              @default(90)

  // Aggregated analytics cache
  totalViews              Int                 @default(0)
  totalSalesVolume        Float               @default(0)

  createdAt               DateTime            @default(now())
  updatedAt               DateTime            @updatedAt

  @@map("users")
}

// ─────────────────────────── ADMIN ───────────────────────────

model Admin {
  id                String            @id @default(cuid())
  name              String
  email             String            @unique
  avatar            String?
  userId            String?           @unique // Optional link to corresponding platform user account
  assignments       AdminAssignment[]
  createdAt         DateTime          @default(now())

  @@map("admins")
}

model AdminAssignment {
  id        String   @id @default(cuid())
  admin     Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)
  adminId   String
  user      User     @relation("ManagedUser", fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  createdAt DateTime @default(now())

  @@unique([adminId, userId])
  @@map("admin_assignments")
}

// ─────────────────────────── LISTINGS ───────────────────────────

enum ListingStatus {
  ACTIVE
  PENDING
  SOLD
  NEGOTIABLE
  RESERVED
}

// Matches: Listing type — seller information is moved to user relations
model Listing {
  id              String        @id @default(cuid())

  // Car Specs
  brand           String
  model           String
  trim            String
  year            Int
  color           String
  colorHex        String
  engine          String
  transmission    String
  fuelType        String
  bodyType        String
  factoryOptions  String[]      // Postgres text array mapping

  // Context specs
  city            String
  deliveryDays    Int

  // Pricing
  price           BigInt        // Stored in toman (requires BigInt serialize handling)
  priceUnit       String        @default("Toman")

  // Status
  status          ListingStatus @default(PENDING)
  listedDate      DateTime      @default(now())

  // Analytical trends (managed by backend background scripts)
  marketAvgBuy    BigInt?
  marketAvgSell   BigInt?
  priceVsMarket   Float?
  trend7d         Float?

  // Relations
  seller          User          @relation(fields: [sellerId], references: [id])
  sellerId        String
  offers          Offer[]
  buyRequests     BuyRequest[]
  savedBy         SavedListing[]

  // Hits count
  viewCount       Int           @default(0)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([brand, model])
  @@index([city])
  @@index([status])
  @@index([sellerId])
  @@index([price])
  @@map("listings")
}

// ─────────────────────────── BUY REQUESTS ───────────────────────────

enum RequestStatus {
  PENDING
  APPROVED
  DECLINED
  NEGOTIABLE
}

// Matches: BuyRequest + MyRequest
model BuyRequest {
  id          String        @id @default(cuid())
  buyer       User          @relation("BuyerRequests", fields: [buyerId], references: [id])
  buyerId     String
  seller      User          @relation("SellerRequests", fields: [sellerId], references: [id])
  sellerId    String
  listing     Listing       @relation(fields: [listingId], references: [id])
  listingId   String
  offerPrice  BigInt
  status      RequestStatus @default(PENDING)
  message     String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@map("buy_requests")
}

// ─────────────────────────── OFFERS ───────────────────────────

enum OfferStatus {
  PENDING
  ACCEPTED
  REJECTED
  NEGOTIABLE
}

// Matches: CarOffer
model Offer {
  id          String      @id @default(cuid())
  buyerName   String
  buyerInitials String?
  listing     Listing     @relation(fields: [listingId], references: [id])
  listingId   String
  offerPrice  BigInt
  status      OfferStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("offers")
}

// ─────────────────────────── SAVED LISTINGS ───────────────────────────

model SavedListing {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  listingId   String
  savedAt     DateTime @default(now())

  @@unique([userId, listingId])
  @@map("saved_listings")
}

// ─────────────────────────── PRICE ALERTS ───────────────────────────

model PriceAlert {
  id            String   @id @default(cuid())
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  title         String   // e.g. "تویوتا کمری XLE"
  targetPrice   BigInt
  currentPrice  BigInt?
  active        Boolean  @default(true)
  city          String?
  color         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("price_alerts")
}

// ─────────────────────────── NOTIFICATIONS ───────────────────────────

enum NotificationKind {
  REQUEST
  PRICE
  SAVED
  SYSTEM
}

model Notification {
  id          String           @id @default(cuid())
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  title       String
  body        String
  kind        NotificationKind
  unread      Boolean          @default(true)
  href        String?
  actionLabel String?
  createdAt   DateTime         @default(now())

  @@index([userId, unread])
  @@map("notifications")
}

model NotificationPref {
  id      String  @id @default(cuid())
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId  String
  key     String  // "requests", "price", "saved", "newsletter"
  label   String
  desc    String
  enabled Boolean @default(true)

  @@unique([userId, key])
  @@map("notification_prefs")
}

// ─────────────────────────── TAXONOMY ───────────────────────────

model TaxonomyOption {
  id       String @id @default(cuid())
  category String // "brands", "years", "colors", "cities", "bodyTypes", "fuelTypes", "transmissions"
  value    String // Persian text value

  @@unique([category, value])
  @@index([category])
  @@map("taxonomy_options")
}

model TaxonomyChangeRequest {
  id          String   @id @default(cuid())
  category    String
  action      String   // "add" | "remove" | "rename"
  value       String
  newValue    String?
  requestedBy String
  status      String   @default("pending") // "pending" | "approved" | "rejected"
  createdAt   DateTime @default(now())

  @@map("taxonomy_change_requests")
}

// ─────────────────────────── BLOG ───────────────────────────

model BlogPost {
  id             String   @id @default(cuid())
  slug           String   @unique
  title          String
  excerpt        String
  content        String[] // List of paragraphs
  tags           String[]
  publishedAt    DateTime
  readTime       Int
  featured       Boolean  @default(false)
  authorName     String
  authorHandle   String
  authorRole     String
  authorAvatar   String
  authorVerified Boolean  @default(false)
  views          Int      @default(0)
  comments       Int      @default(0)
  reposts        Int      @default(0)
  likes          Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("blog_posts")
}

model BlogNotification {
  id      String  @id @default(cuid())
  title   String
  body    String
  time    String
  unread  Boolean @default(true)
  href    String?

  @@map("blog_notifications")
}

model Agency {
  id           String   @id @default(cuid())
  slug         String   @unique
  name         String
  avatar       String?
  city         String
  summary      String
  specialties  String[]
  responseTime String
  activeDeals  Int      @default(0)
  verified     Boolean  @default(true)

  @@map("agencies")
}

// ─────────────────────────── PRICE HISTORY (FOR CHARTS) ───────────────────────────

model PriceHistory {
  id        String   @id @default(cuid())
  brand     String
  model     String
  date      DateTime
  avgPrice  BigInt

  @@unique([brand, model, date])
  @@index([brand, model])
  @@map("price_history")
}
```

### 3.3 Crucial Schema Details

> [!TIP]
> **Why `BigInt` for prices?** Prices are in Iranian Tomans (e.g., 7,800,000,000). A standard `Int` field in PostgreSQL has a maximum limit of roughly 2.1 billion. `BigInt` supports values up to $9.2 \times 10^{18}$.

> [!TIP]
> **Why is there no separate Seller table?** A seller is simply a `User` account with a role status of `SELLER` or `CONFIRMED_SELLER`. Standard seller attributes (like `sellerSlug`, `bannerPresetId`, `responseRate`) are safely added as nullable attributes on the core `User` model.

---

## 4. API Design (Endpoints)

### 4.1 Folder Organization

Create Route Handlers in Next.js using the following folder structure:

```
src/app/api/
├── auth/               # NextAuth endpoints
│   └── [...nextauth]/
│       └── route.ts
├── listings/
│   ├── route.ts        # GET (list + filter) | POST (create)
│   └── [id]/
│       ├── route.ts    # GET | PATCH | DELETE
│       └── offers/
│           └── route.ts  # GET | POST
├── users/
│   ├── route.ts        # GET (list) | POST (create)
│   ├── me/
│   │   └── route.ts    # GET | PATCH (profile update)
│   └── [id]/
│       ├── route.ts    # GET | PATCH
│       └── role/
│           └── route.ts  # PATCH (promote/demote)
├── requests/
│   ├── route.ts        # GET | POST (deals)
│   └── [id]/
│       └── route.ts    # PATCH (accept/decline)
├── saved/
│   └── route.ts        # GET | POST | DELETE
├── alerts/
│   ├── route.ts        # GET | POST
│   └── [id]/
│       └── route.ts    # PATCH | DELETE
├── notifications/
│   └── route.ts        # GET | PATCH
├── sellers/
│   ├── route.ts        # GET (directory)
│   └── [slug]/
│       ├── route.ts    # GET (storefront details)
│       └── banner/
│           └── route.ts  # PATCH
├── taxonomy/
│   ├── route.ts        # GET
│   └── options/
│       └── route.ts    # POST | PATCH | DELETE
├── admin/
│   ├── users/
│   │   └── route.ts    # GET (moderation)
│   ├── admins/
│   │   └── route.ts    # GET | POST | DELETE
│   └── assignments/
│       └── route.ts    # POST | DELETE
├── blog/
│   ├── posts/
│   │   ├── route.ts    # GET (feed)
│   │   └── [slug]/
│   │       └── route.ts  # GET (details)
│   ├── agencies/
│   │   └── route.ts    # GET
│   └── notifications/
│       └── route.ts    # GET
├── analytics/
│   ├── price-chart/
│   │   └── route.ts    # GET
│   ├── brand-volume/
│   │   └── route.ts    # GET
│   ├── price-insights/
│   │   └── route.ts    # GET
│   └── stats/
│       └── route.ts    # GET
└── seed/
    └── route.ts        # POST (populates DB with mock data for local development)
```

### 4.2 Endpoint Specifications

#### 🏠 Public Endpoints (No Authentication Required)

```
GET    /api/listings                    Fetch filtered and paginated ads
       Query Parameters: ?search=&brand=&bodyType=&city=&fuelType=&status=
                        &priceMin=&priceMax=&verifiedOnly=&sortBy=&sortDir=
                        &page=1&limit=20
       Response: { data: Listing[], total: number, page: number }

GET    /api/listings/:id                Single listing details (joins seller info)
       Response: Listing

GET    /api/sellers                     List all storefronts
       Response: SellerSummary[]

GET    /api/sellers/:slug               Get storefront details + active ads
       Response: SellerSummary + listings[]

GET    /api/blog/posts                  Get blog articles
GET    /api/blog/posts/:slug            Get single blog article
GET    /api/blog/agencies               Get verified agencies
GET    /api/blog/notifications          Get blog activity logs

GET    /api/analytics/price-chart       Price charting metrics
       Query Parameters: ?brands=Toyota,Hyundai&days=7
GET    /api/analytics/brand-volume      Active inventory counts by brand
GET    /api/analytics/price-insights    Market averages (top models)
GET    /api/analytics/stats             Homepage overall metrics

GET    /api/taxonomy                    Get active options categories
```

#### 🔒 Authenticated Endpoints (Login Session Required)

```
# ─── User Profile ───
GET    /api/users/me                    Get current session user profile
PATCH  /api/users/me                    Update details
       Body: { name, phone, city, bio }

# ─── Bookmarks ───
GET    /api/saved                       Get bookmarked items
POST   /api/saved                       Bookmark an item
       Body: { listingId }
DELETE /api/saved?listingId=xxx         Remove bookmark

# ─── Buy Requests (Buyer perspective) ───
GET    /api/requests?role=buyer         Get active purchase proposals
POST   /api/requests                    Send new purchase proposal
       Body: { listingId, sellerId, offerPrice, message? }

# ─── Buy Requests (Seller perspective) ───
GET    /api/requests?role=seller        Get incoming proposals
PATCH  /api/requests/:id               Respond to proposal (approve/negotiate/decline)
       Body: { status: "approved" | "declined" | "negotiable" }

# ─── Direct Listing Offers ───
GET    /api/listings/:id/offers         Get offers list (seller view)
POST   /api/listings/:id/offers         Submit counter offer (buyer view)
       Body: { offerPrice }

# ─── Pricing Alerts ───
GET    /api/alerts                      Get active alerts
POST   /api/alerts                      Create target alert
       Body: { title, targetPrice, city?, color? }
PATCH  /api/alerts/:id                  Toggle alert state
DELETE /api/alerts/:id                  Delete alert

# ─── Activity Notifications ───
GET    /api/notifications               Get inbox notifications
PATCH  /api/notifications               Mark notifications read
       Body: { ids: string[] }

# ─── Listing Submissions ───
POST   /api/listings                    Create new listing
       Body: ProductInput
PATCH  /api/listings/:id               Update listing attributes
DELETE /api/listings/:id               Delete listing

# ─── Storefront Configurations ───
PATCH  /api/sellers/:slug/banner        Set storefront custom banner / theme
       Body: { presetId } | FormData (for image upload)
```

#### 🛡️ Admin & Owner Endpoints

```
GET    /api/admin/users                 Search platform users
PATCH  /api/users/:id                   Edit user profile directly
PATCH  /api/users/:id/role              Modify roles (promote/demote)
       Body: { role: "BUYER" | "SELLER" | "CONFIRMED_SELLER" }

GET    /api/admin/admins                List managers
POST   /api/admin/admins                Register new administrator credentials
DELETE /api/admin/admins/:id            De-register administrator

POST   /api/admin/assignments           Assign a customer account to manager
       Body: { adminId, userId }
DELETE /api/admin/assignments           Unassign user

# ─── Taxonomy Rules ───
POST   /api/taxonomy/options            Append metadata item (e.g. brand)
       Body: { category, value }
PATCH  /api/taxonomy/options            Update metadata label
       Body: { category, oldValue, newValue }
DELETE /api/taxonomy/options            Delete metadata label
       Body: { category, value }
```

### 4.3 Listing Endpoint Implementation Sample

```typescript
// src/app/api/listings/route.ts

import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─── GET: Listing index with filters ───
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const skip = (page - 1) * limit;

  const where: Record<string, any> = {};
  const brand = searchParams.get("brand");
  if (brand) where.brand = brand;

  const city = searchParams.get("city");
  if (city) where.city = city;

  const status = searchParams.get("status");
  if (status) where.status = status.toUpperCase();

  const search = searchParams.get("search");
  if (search) {
    where.OR = [
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
      { trim: { contains: search, mode: "insensitive" } },
    ];
  }

  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  if (priceMin || priceMax) {
    where.price = {};
    if (priceMin) where.price.gte = BigInt(Number(priceMin) * 1_000_000_000);
    if (priceMax) where.price.lte = BigInt(Number(priceMax) * 1_000_000_000);
  }

  const [data, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            name: true,
            avatar: true,
            verified: true,
            responseRate: true,
            sellerSlug: true,
          },
        },
      },
      orderBy: { listedDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({ data, total, page });
}

// ─── POST: Publish Listing ───
const CreateListingSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().min(1),
  year: z.number().int(),
  color: z.string(),
  colorHex: z.string(),
  engine: z.string(),
  transmission: z.string(),
  fuelType: z.string(),
  bodyType: z.string(),
  city: z.string(),
  deliveryDays: z.number().int().min(0),
  price: z.number().positive(),
  factoryOptions: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  // Replace this with session identifier retrieval via auth middleware
  const body = await request.json();
  const parsed = CreateListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const listing = await prisma.listing.create({
    data: {
      ...parsed.data,
      price: BigInt(parsed.data.price),
      sellerId: "TODO_FROM_SESSION",
      status: "PENDING",
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
```

---

## 5. Authentication & Authorization

### 5.1 NextAuth.js v5 Setup

```typescript
// src/lib/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        return valid ? user : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.id = token.userId as string;
      return session;
    },
  },
});
```

### 5.2 Endpoint Access Guard Middleware

```typescript
// src/lib/auth-guard.ts

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!roles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
```

### 5.3 Role-Based Access Matrix

| Endpoint Area                   | Guest | Buyer | Seller | Confirmed Seller | Admin | Owner |
| ------------------------------- | ----- | ----- | ------ | ---------------- | ----- | ----- |
| Search marketplace listings     | ✅    | ✅    | ✅     | ✅               | ✅    | ✅    |
| Detailed specifications page    | ✅    | ✅    | ✅     | ✅               | ✅    | ✅    |
| Add Bookmark / Saved ad         | ❌    | ✅    | ✅     | ✅               | ✅    | ✅    |
| Initiate buying deal proposal   | ❌    | ✅    | ❌     | ❌               | ❌    | ❌    |
| Create storefront item listings | ❌    | ❌    | ✅     | ✅               | ✅    | ✅    |
| Update/delete own listing       | ❌    | ❌    | ✅     | ✅               | ✅    | ✅    |
| Accept proposals / set details  | ❌    | ❌    | ✅     | ✅               | ✅    | ✅    |
| Update taxonomy categories      | ❌    | ❌    | ❌     | ❌               | ✅    | ✅    |
| Users management panel          | ❌    | ❌    | ❌     | ❌               | ✅    | ✅    |
| Assign management relationships | ❌    | ❌    | ❌     | ❌               | ❌    | ✅    |

---

## 6. Step-by-Step Migration Plan

> [!IMPORTANT]
> **Migration Rule:** Implement API transitions module-by-module. The application UI must remain fully operational at all checkpoints.

### Phase 0: System Init & Preparation (1-2 Days)

```
- [ ] Install full suite of dependencies:
      npm install prisma @prisma/client next-auth @auth/prisma-adapter bcryptjs swr
      npm install -D @types/bcryptjs
- [ ] Create schema file path: prisma/schema.prisma (copied from section 3.2 above)
- [ ] Configure environment details in .env.local:
      DATABASE_URL="postgresql://..."
      NEXTAUTH_SECRET="generate-a-random-string"
      NEXTAUTH_URL="http://localhost:3000"
      GOOGLE_CLIENT_ID="..."
      GOOGLE_CLIENT_SECRET="..."
- [ ] Setup global database client helper: src/lib/prisma.ts
- [ ] Push layout structure to local DB instance: npx prisma db push
- [ ] Implement database seeding handler script: prisma/seed.ts
- [ ] Seed the database instance: npx prisma db seed
```

#### Initialization Code Blueprints:

```typescript
// src/lib/prisma.ts — Prisma Client Singleton
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

```typescript
// prisma/seed.ts — Seed mock data to database
import { PrismaClient } from "@prisma/client";
import { listings } from "../src/context/data";
import { blogPosts, confirmedAgencies } from "../src/context/blog";

const prisma = new PrismaClient();

async function main() {
  const sellerMap = new Map<string, string>(); // nameEn -> userId

  const uniqueSellers = new Map<string, (typeof listings)[0]>();
  for (const l of listings) {
    if (!uniqueSellers.has(l.sellerName)) uniqueSellers.set(l.sellerName, l);
  }

  for (const [name, listing] of uniqueSellers) {
    const user = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, "-")}@zeromarket.ir`,
        role: listing.sellerVerified ? "CONFIRMED_SELLER" : "SELLER",
        verified: listing.sellerVerified,
        avatar: listing.sellerAvatar,
        responseRate: listing.sellerResponseRate,
        sellerSlug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        status: "ACTIVE",
      },
    });
    sellerMap.set(name, user.id);
  }

  for (const l of listings) {
    await prisma.listing.create({
      data: {
        brand: l.brand,
        model: l.model,
        trim: l.trim,
        year: l.year,
        color: l.color,
        colorHex: l.colorHex,
        engine: l.engine,
        transmission: l.transmission,
        fuelType: l.fuelType,
        bodyType: l.bodyType,
        city: l.city,
        deliveryDays: l.deliveryDays,
        price: BigInt(l.price),
        priceUnit: l.priceUnit,
        status: l.status.toUpperCase() as any,
        listedDate: new Date(l.listedDate),
        factoryOptions: l.factoryOptions,
        marketAvgBuy: BigInt(l.marketAvgBuy),
        marketAvgSell: BigInt(l.marketAvgSell),
        priceVsMarket: l.priceVsMarket,
        trend7d: l.trend7d,
        sellerId: sellerMap.get(l.sellerName)!,
      },
    });
  }

  console.log("✅ Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Phase 1: Authentication API Setup (2-3 Days)

```
- [ ] Create NextAuth configuration: src/lib/auth.ts
- [ ] Create Auth route handler route path: src/app/api/auth/[...nextauth]/route.ts
- [ ] Create server session checker: src/lib/auth-guard.ts
- [ ] Refactor login forms path: auth/login/page.tsx -> connect input submit to signIn() handlers
- [ ] Refactor signup forms path: auth/signup/page.tsx -> verify username/email, save user and call signIn()
- [ ] Refactor SessionProvider -> swap mock config state with active useSession() hooks from next-auth
- [ ] Update Layout Header views to display user names and icons dynamically
```

### Phase 2: Core Listings API Migration (2-3 Days)

```
- [ ] Create main Listings route handler: src/app/api/listings/route.ts (GET & POST handlers)
- [ ] Create sub Listings route handler: src/app/api/listings/[id]/route.ts (GET, PATCH, & DELETE handlers)
- [ ] Setup unified client network query utilities:
      src/lib/api/listings.ts:
        - fetchListings(filters) -> fetch("/api/listings?...")
        - fetchListing(id) -> fetch("/api/listings/${id}")
        - createListing(data) -> fetch("/api/listings", POST method)
        - updateListing(id, data) -> fetch("/api/listings/${id}", PATCH method)
        - deleteListing(id) -> fetch("/api/listings/${id}", DELETE method)
- [ ] Refactor marketplace page route market/page.tsx -> replace static data.ts lists with backend fetches
- [ ] Refactor details layout listings/[id]/page.tsx -> replace static listing lookup with fetch api queries
- [ ] Update ListingsProvider -> replace frontend state cache arrays with API query results via SWR or TanStack Query
- [ ] Clean up mock dataset elements within local listings configurations
```

> [!TIP]
> **Should I use SWR or React Query?** Either works. SWR is lightweight and made by Vercel; React Query features complex cache settings. For this project, SWR is sufficient:
>
> ```
> npm install swr
> ```
>
> ```typescript
> import useSWR from "swr";
> const fetcher = (url: string) => fetch(url).then((r) => r.json());
> const { data, error, isLoading } = useSWR("/api/listings", fetcher);
> ```

### Phase 3: Sellers API Integration (1-2 Days)

```
- [ ] Implement Sellers index endpoint: src/app/api/sellers/route.ts
- [ ] Implement Storefront details endpoint: src/app/api/sellers/[slug]/route.ts
- [ ] Implement Theme Banner endpoint: src/app/api/sellers/[slug]/banner/route.ts
- [ ] Refactor active seller overview page path: sellers/page.tsx -> connect to API queries
- [ ] Refactor seller storefront page path: sellers/[slug]/page.tsx -> connect to API queries
- [ ] Update BannerProvider logic -> connect banner changes directly to API update handlers
- [ ] Remove mock calculations and derived details files: src/context/sellers.ts & src/context/topSellers.ts
```

### Phase 4: Buyer Dashboard API Integration (2-3 Days)

```
- [ ] Implement Bookmarks API endpoint: src/app/api/saved/route.ts (GET, POST, & DELETE methods)
- [ ] Implement Proposals API endpoint: src/app/api/requests/route.ts (GET & POST methods)
- [ ] Implement Proposal modifier: src/app/api/requests/[id]/route.ts (PATCH method)
- [ ] Implement Price Alerts API endpoint: src/app/api/alerts/route.ts (GET, POST, PATCH, & DELETE methods)
- [ ] Implement Inbox Notifications API endpoint: src/app/api/notifications/route.ts (GET & PATCH methods)
- [ ] Refactor components under Buyer Dashboard -> fetch values dynamically from endpoints
- [ ] Remove mock dashboard data values from src/context/userProfile.tsx
```

### Phase 5: Seller Dashboard API Integration (2-3 Days)

```
- [ ] Implement listing offers retrieval: src/app/api/listings/:id/offers/route.ts
- [ ] Update seller dashboard screens to use ListingsProvider API-backed data structure
- [ ] Refactor offers component details list -> read listings directly via API queries
- [ ] Refactor dashboard stats calculations to pull statistics dynamically from aggregated analytics route
- [ ] Clean up mock dashboard datasets: src/context/sellerDashboard.tsx
```

### Phase 6: Admin Management & Taxonomy API Integration (2-3 Days)

```
- [ ] Implement Administration routes: /api/admin/users, /api/admin/admins, /api/admin/assignments
- [ ] Implement Taxonomy categories manager endpoints: /api/taxonomy/options, /api/taxonomy/options/change-requests
- [ ] Refactor AdminProvider -> point context mutations directly to database API requests
- [ ] Refactor TaxonomyProvider -> point modifications directly to taxonomy endpoints
- [ ] Remove mock records: adminData.ts & taxonomy.ts default initial states
```

### Phase 7: Blog & Analytics API Integration (1-2 Days)

```
- [ ] Implement Blog endpoints: /api/blog/posts, /api/blog/agencies, /api/blog/notifications
- [ ] Implement charts and analytics endpoints: /api/analytics/price-chart, /api/analytics/brand-volume
- [ ] Update blog pages to render from DB-driven articles list
- [ ] Connect homepage stats and charts panels to fetch values from analytical backend route handlers
- [ ] Remove mock data layers from blog.ts & priceInsight.ts
```

### Phase 8: Clean-up & Review (1 Day)

```
- [ ] Audit src/context/ -> ensure only label maps, formatters, and static UI definitions remain
- [ ] Delete orphaned or unused mock configurations
- [ ] Validate core application workflows (authorization checks, listing publication, filters)
- [ ] Update AGENTS.md instructions with descriptions of the new API boundaries
```

---

## 7. Important Considerations & Special Notes

### 7.1 BigInt JSON Serialization

> [!CAUTION]
> **Issue:** JavaScript's `JSON.stringify` cannot serialize database `BigInt` values. Serving a Prisma response containing a `BigInt` inside a `NextResponse.json()` request will throw a runtime error.

**Solution:** Wrap all responses returning listing objects or prices in a serialization helper:

```typescript
// src/lib/serialize.ts
export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = serializeBigInt(val);
    }
    return result;
  }
  return obj;
}

// Usage in Route Handlers:
return NextResponse.json(serializeBigInt(listing));
```

### 7.2 Persian Translation Labels — Database Storage

There are two main strategies for storing translations:

| Approach                                                                       | Advantages                                                          | Disadvantages                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Option A: Store English in DB, Map to Persian in Front-end** (Current setup) | Highly clean database state, ready for multi-language localization. | Front-end components must maintain translation dictionaries.          |
| **Option B: Save Persian Strings Directly in DB**                              | Simplifies query parameters, straightforward database output.       | Multi-language extensions will require major database schema updates. |

**Recommended Path:** Go with **Option A**. Continue to use English identifiers inside database fields, and map them to Persian display text on the client using the translation files (e.g. `carLabels.ts`). This structure keeps your database clean and allows for simple localization changes in the future.

### 7.3 Storefront Banner Image Uploads

Currently, custom storefront banner backgrounds are stored in `localStorage` as Base64 data URLs. Once you migrate to a backend, you should upload images to a storage service:

- **Simple setup:** Vercel Blob Storage (`npm install @vercel/blob`).
- **Free setup:** Cloudinary (`npm install cloudinary`).
- **Enterprise setup:** AWS S3 or MinIO.

### 7.4 Real-time Communication

If real-time notifications or price alert modifications are needed:

- **Server-Sent Events (SSE)** — Simple, clean, unidirectional updates.
- **WebSockets** — Bidirectional, requires extra server setup (e.g. Socket.io).
- **Supabase Realtime** — Out of the box if using Supabase as a BaaS.

### 7.5 Security Checks

```
- [ ] Implement rate limiting using Upstash Rate Limit: npm install @upstash/ratelimit
- [ ] Configure standard CORS headers on endpoints.
- [ ] Add input verification schema checks via Zod to intercept SQL injection.
```

---

## 8. Directory Structure Post-Backend Migration

```
zeromarket/
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   ├── seed.ts                    # Seeding script
│   └── migrations/                # Schema migrations
├── src/
│   ├── app/
│   │   ├── api/                   # 🆕 API route handlers
│   │   │   ├── auth/
│   │   │   ├── listings/
│   │   │   ├── sellers/
│   │   │   ├── requests/
│   │   │   ├── saved/
│   │   │   ├── alerts/
│   │   │   ├── notifications/
│   │   │   ├── admin/
│   │   │   ├── taxonomy/
│   │   │   ├── blog/
│   │   │   └── analytics/
│   │   ├── auth/                  # Authentication page views
│   │   ├── market/                # Marketplace page routes
│   │   ├── dashboard/             # Panels page routes
│   │   └── ...
│   ├── lib/                       # 🆕 Backend utility scripts
│   │   ├── prisma.ts              # Global Prisma client instance
│   │   ├── auth.ts                # NextAuth setup
│   │   ├── auth-guard.ts          # Authentication guards
│   │   ├── serialize.ts           # BigInt serialization
│   │   └── api/                   # 🆕 API client helper query functions
│   │       ├── listings.ts        # fetchListings, etc.
│   │       ├── sellers.ts
│   │       ├── requests.ts
│   │       └── ...
│   ├── context/                   # 🔄 Simplified — Presentation helpers only
│   │   ├── carLabels.ts           # ✅ Kept — Translation mapping definitions
│   │   ├── listingTable.tsx       # ✅ Kept — Table configurations
│   │   ├── sellerListings.tsx     # ✅ Kept — Table configurations
│   │   ├── latestTable.tsx        # 🔄 Modified — Mock records removed
│   │   ├── offers.tsx             # 🔄 Modified — Mock records removed
│   │   ├── marketFilters.ts       # 🔄 Modified — Filtering utilities moved to query level
│   │   ├── Header.ts              # ✅ Kept — Main menu links
│   │   ├── Info.tsx               # 🔄 Modified — Analytics values retrieved via endpoints
│   │   └── newPostForm.tsx        # 🔄 Modified — Fetch lists from taxonomy API
│   ├── types/                     # Shared TypeScript interface models
│   └── components/                # Visual components UI layout
├── .env.local                     # 🆕 Credentials configuration env
├── package.json
└── ...
```

---

## 9. Final Validation Checklist

### Verify the following tasks once the backend setup is complete:

```
Authentication
  - [ ] Register new user using credentials (email / password)
  - [ ] Sign in using credentials
  - [ ] Sign in using Google provider OAuth integration
  - [ ] Sign out completely
  - [ ] Session is persisted on page refreshes

Marketplace
  - [ ] Listings are loaded from DB
  - [ ] Search input and filter parameters (brand, city, price range) query DB correctly
  - [ ] Sort configurations (price asc/desc, listed date) update results correctly
  - [ ] Page navigation parameters (pagination) work correctly
  - [ ] Detail page renders correct information matching listing record
  - [ ] Detailed page includes linked seller profile details

Sellers Directory
  - [ ] List directories loads correctly
  - [ ] Unique seller profile page displays info + active listings
  - [ ] Seller theme banner displays correct selection

User Panels
  - [ ] Saved listings toggle registers bookmarks on database
  - [ ] Send buy request submits record to database
  - [ ] Sent buy requests overview table displays correct status
  - [ ] Register pricing alert saves specifications correctly
  - [ ] Unread status flags on notifications dismiss correctly
  - [ ] Modify profile info updates database records

Seller Panels
  - [ ] Form submit creates listing on database
  - [ ] Edit/delete actions update active DB entries
  - [ ] Offers list displays proposals from DB
  - [ ] Update status triggers change on offers database records
  - [ ] Stats cards displays aggregated calculation values

Administration Panels
  - [ ] User list loads correctly
  - [ ] Promote/demote role status triggers change on DB
  - [ ] Register/unregister admin managers functions correctly
  - [ ] Taxonomy option updates reflect on create-form options

Blog Page
  - [ ] Article feed loads from database
  - [ ] Detailed article page displays correct content
  - [ ] Verified agencies directory lists values from database

Homepage Analytics
  - [ ] Price insights dashboard charts display trend lines
  - [ ] Total active items, cities, and brands stats display dynamic totals
```

---

## 📦 Dependencies Summary

### Production dependencies:

```bash
npm install @prisma/client next-auth @auth/prisma-adapter bcryptjs swr
```

### Development dependencies:

```bash
npm install -D prisma @types/bcryptjs
```

### Required Configuration Env (.env.local):

```env
# Database connection string
DATABASE_URL="postgresql://user:password@host:5432/zeromarket?schema=public"

# NextAuth secret key
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google provider credentials (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

> [!NOTE]
> **Instructions for the AI Agent:** This file is a complete implementation plan. Each phase can be executed independently. Use existing mock datasets (`src/context/data.ts`, `src/context/adminData.ts`, etc.) as the database seed source. The Prisma schema is production-ready; run `npx prisma db push` to synchronize structures. The existing TS models (`src/types/`) are mostly aligned with the schema but the `Listing` interface needs refactoring to load nested seller details.
