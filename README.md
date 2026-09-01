# ZeroMarket · خودروجو

A marketplace for **brand-new, zero-kilometer factory cars** in Iran. Buyers browse
structured listings from verified dealers, compare them against live market-price
insights, and send purchase or negotiation requests. Sellers manage their listings and
incoming offers from a dedicated dashboard. The entire interface is **Persian (Farsi)
and right-to-left**.

<p>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS v4" src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=white">
  <img alt="shadcn/ui" src="https://img.shields.io/badge/shadcn%2Fui-radix-000000?logo=shadcnui&logoColor=white">
  <img alt="Radix UI" src="https://img.shields.io/badge/Radix_UI-primitives-161618?logo=radixui&logoColor=white">
  <img alt="Framer Motion" src="https://img.shields.io/badge/Motion-12-0055FF?logo=framer&logoColor=white">
  <img alt="Recharts" src="https://img.shields.io/badge/Recharts-charts-22B5BF">
  <img alt="TanStack Table" src="https://img.shields.io/badge/TanStack_Table-8-FF4154?logo=reactquery&logoColor=white">
  <img alt="Sonner" src="https://img.shields.io/badge/Sonner-toasts-000000">
  <img alt="Lucide" src="https://img.shields.io/badge/Lucide-icons-F56565?logo=lucide&logoColor=white">
</p>

> **Note** — ZeroMarket is currently a front-end prototype. Every screen runs on mock
> data, so actions like saving a car, sending an offer, or signing in show the intended
> flow (with on-screen confirmations) but don't yet persist to a server.

---

## How to use the website

This is a guided tour of what each part of the site does and how the typical journeys
flow. It describes **using** ZeroMarket — not installing it.

### The two journeys at a glance

```
                         ┌────────────── Home (/) ──────────────┐
                         │  hero · latest cars · price insight  │
                         │  verified sellers · how it works     │
                         └───────────────────┬──────────────────┘
                                             │
                ┌────────────────────────────┴────────────────────────────┐
                │                                                          │
          BUYER journey                                            SELLER journey
                │                                                          │
   Market  →  Listing detail  →  Send request           Seller dashboard → New / bulk post
     │             │                   │                        │                 │
   Sellers     Save / alert       Buyer dashboard          Manage listings   Handle requests
  directory        │              (saved · requests             │
     │             │                · alerts)                Analytics
  Seller page → their listings                                  │
                                                       Profile → upgrade to seller
```

### For buyers

1. **Start on the home page (`/`).** The landing page introduces the marketplace and
   surfaces the latest listings, a live price-insight widget, and top verified sellers.
2. **Browse the market (`/market`).** Use the sidebar filters (brand, body type, city,
   fuel, price range, verified-only) and sorting to narrow the list. Results are shown
   in a sortable table with status and price.
3. **Open a car (`/market/listings/[id]`).** The detail page shows full specs, a
   price panel comparing the asking price to the live market average and 7-day trend,
   and the seller's profile card. Use the heart icon to **save** the car.
4. **See alternatives.** At the bottom of every car page, the **"خودروهای مشابه و سایر
   فروشندگان"** section shows the same model from other sellers plus close alternatives
   as cards — a quick way to compare offers.
5. **Send a request.** Open the request/auction panel to submit a purchase or
   negotiation offer to the seller.
6. **Track everything in your dashboard (`/dashboard/user`):**
   - **آگهی‌های ذخیره‌شده** — cars you've bookmarked.
   - **درخواست‌های من** — offers you've sent and their status (pending / accepted /
     negotiating / declined), with the option to withdraw.
   - **هشدارهای قیمت** — price alerts that notify you when a model hits your target price.

### For browsing sellers

1. **Open the sellers directory (`/sellers`)** from the header nav ("فروشندگان").
2. **Search and filter.** Search by seller name, city, or brand, and toggle
   **"فقط تأییدشده‌ها"** to show only verified dealers.
3. **Open a seller (`/sellers/[slug]`).** Each seller page shows their name, city,
   membership, response rate, verification status, specialties, and a grid of **all of
   their current listings** — click any card to jump back into a car's detail page.

### For sellers

1. **Open the seller dashboard (`/dashboard/seller`).** The header shows the dealer
   identity and quick actions.
2. **Post inventory.** Use **"ثبت آگهی جدید"** for a single car (the form suggests a
   market-based price) or **"ورود گروهی (اکسل)"** to bulk-import many cars from a
   spreadsheet template.
3. **Work the tabs:**
   - **آگهی‌های من** — manage your active listings.
   - **درخواست‌ها** — review incoming buyer offers and approve / negotiate / decline.
   - **اعلان‌ها** — activity and notifications.
   - **تحلیل‌ها** — performance analytics (views, conversion, response time).

### Account & settings (any user)

1. **Open your profile (`/user-profile`)** from the header.
2. **Manage your account across tabs:**
   - **اطلاعات شخصی** — name, contact details, city, avatar, bio.
   - **امنیت** — change password and toggle two-factor authentication.
   - **اعلان‌ها** — choose which events notify you.
   - **ارتقا به فروشنده** — _(regular accounts only)_ Every one is a seller just as a buyer but confirmed sellers need to
     submit business details. After submitting, the application shows a **pending**
     review state; once approved it unlocks the seller dashboard.

### Signing in

`/auth/login` and `/auth/signup` provide the entry screens for returning and new users.

---

## Tech stack

| Area          | Tools                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | **Next.js 16** (App Router, Turbopack), **React 19**                    |
| Language      | **TypeScript** (strict)                                                 |
| Styling       | **Tailwind CSS v4** (CSS-first theme, no config file), `tw-animate-css` |
| UI components | **shadcn/ui** on the unified **Radix UI** package                       |
| Icons         | **lucide-react**                                                        |
| Tables        | **@tanstack/react-table**                                               |
| Charts        | **recharts**                                                            |
| Animation     | **motion** (Framer Motion v12)                                          |
| Toasts        | **sonner**                                                              |
| Forms         | **react-hook-form**                                                     |

The UI is fully right-to-left; all numbers render in Persian digits and prices/dates use
the Persian (Jalali) calendar. Design tokens and reusable utility classes live in
`src/app/globals.css`, and all mock data lives in `src/context/`.

> Looking for what's next? See [`todo.md`](./todo.md) for the project backlog.
