# Telegram Bot Plan for KhodroJu (ZeroMarket)

## Project Overview

KhodroJu (خودروجو) is a marketplace for **brand-new, zero-kilometer factory cars** in Iran. The Telegram bot will extend the web platform to provide real-time notifications, quick actions, and a conversational interface for buyers, sellers, and admins.

**Tech Stack:**
- **Backend:** Next.js 16 (App Router) + Supabase (PostgreSQL + Auth + Realtime)
- **Bot Framework:** Telegraf.js (Node.js) or grammy.js (TypeScript-first)
- **Database:** Supabase (existing tables: `listings`, `buy_requests`, `vehicle_requests`, `user_notifications`, `price_alerts`, `profiles`, `sellers`)
- **Language:** Persian (Farsi), RTL support

---

## User Roles & Permissions

| Role | Telegram Features |
|------|------------------|
| **Buyer** (regular user) | Search listings, price alerts, buy requests, saved searches, notifications |
| **Seller** (verified dealer) | Manage listings, respond to buy requests, view analytics, seller dashboard |
| **Admin** | Moderate listings/users, view system stats, broadcast announcements |

---

## Core Bot Features

### 1. Buyer Features

#### 1.1 Smart Car Search (`/search`)
```
/search [brand] [model] [year] [city] [price_min] [price_max]
```
- Inline query support: `@khodroju_bot Toyota Camry 2026`
- Results as carousel cards with: photo, brand/model/trim, price, city, status badge, market insight (price vs market %)
- Quick actions: "View Details", "Submit Buy Request", "Save Search", "Set Price Alert"

#### 1.2 Price Alerts (`/alert`)
```
/alert create <brand> <model> [year] <target_price>
/alert list
/alert toggle <alert_id>
/alert delete <alert_id>
```
- Monitors `car_market_insights` + active listings
- Notifies when listing price ≤ target price
- Shows current market avg vs target

#### 1.3 Buy Requests (`/buy`)
```
/buy <listing_id> <offer_price> [message]
/buy history
/buy cancel <request_id>
```
- Submits to `buy_requests` table (status: `WAITING`)
- Notifies seller via bot + web push
- Tracks status: `WAITING` → `ACCEPTED`/`NEGOTIABLE`/`REJECTED` → `COMPLETED`/`CLOSED`
- Reveals seller contact only when `ACCEPTED`/`NEGOTIABLE`

#### 1.4 Vehicle Request (Custom Order) (`/request`)
```
/request <brand> <model> <purchase_method> <city> <phone>
```
- Creates `vehicle_requests` row (existing API)
- Monthly limit enforcement (free: 3, premium: higher)
- Status tracking: `PENDING` → `PROCESSING` → `COMPLETED`

#### 1.5 Saved Searches (`/save`)
```
/save <name> <filters_json>
/save list
/save delete <id>
```
- Stores filter state (brand, model, body_type, city, fuel, price range, verified_only)
- Scheduled job runs daily, sends new matches

#### 1.6 Notifications (`/notifications`)
```
/notifications
/notifications unread
/notifications mark_read <id>
```
- Real-time via Supabase Realtime + bot push
- Types: `REQUEST` (buy offer update), `PRICE` (alert triggered), `SAVED` (saved search match), `SYSTEM` (announcements)

#### 1.7 Market Insights (`/market`)
```
/market <brand> <model> [year]
```
- Shows: avg listed price, avg sold price, 7d trend %, days to sell, active listings count
- Price chart (last 7 days) as rendered image or text summary

#### 1.8 Favorites / Watchlist (`/fav`)
```
/fav add <listing_id>
/fav list
/fav remove <listing_id>
```
- Quick access to tracked listings
- Notifies on status change (sold, price drop, reserved)

---

### 2. Seller Features

#### 2.1 Seller Dashboard (`/dashboard`)
```
/dashboard
/dashboard listings
/dashboard requests
/dashboard analytics
```
- **Listings:** Paginated list with status badges, quick actions (edit, delete, toggle negotiable, mark sold)
- **Requests:** Incoming buy requests with buyer info, offer price, message; actions: Accept, Negotiate, Reject
- **Analytics:** Views, inquiries, conversion rate, avg response time, price vs market

#### 2.2 Listing Management (`/listing`)
```
/listing create          # Step-by-step wizard
/listing edit <id>
/listing delete <id>
/listing status <id> <status>
/listing renew <id>      # Repost (extends listedDate)
```
- Wizard collects: brand, model, trim, year, color, engine, transmission, fuel, body_type, city, delivery_days, price, factory_options, photos
- Validates against `checkDuplicateListing`
- Publishes to `listings` table with `status: WAITING` (admin approval) or `AVAILABLE`

#### 2.3 Request Responses (`/respond`)
```
/respond <request_id> accept
/respond <request_id> negotiate <counter_price> [message]
/respond <request_id> reject [reason]
```
- Updates `buy_requests.status`
- Sends notification to buyer with seller contact (if accepted/negotiable)
- Creates `user_notifications` row

#### 2.4 Quick Stats (`/stats`)
```
/stats today
/stats week
/stats month
```
- New requests, accepted, conversion %, avg response time
- Top viewed listings

---

### 3. Admin Features

#### 3.1 Moderation (`/admin`)
```
/admin users
/admin listings pending
/admin listings reported
/admin taxonomy requests
/admin broadcast
```
- Approve/reject listings (change `status` from `WAITING`)
- Suspend/activate users
- Review taxonomy requests (new brand/model/color/city)
- Broadcast message to all users (with confirmation)

#### 3.2 System Stats (`/admin stats`)
```
/admin stats users
/admin stats listings
/admin stats requests
/admin stats revenue
```

---

### 4. Shared / Utility Features

#### 4.1 Language & Locale (`/lang`)
```
/lang fa
/lang en
```
- Persian (default) + English
- Persian digits (`toLocaleString('fa-IR')`), Jalali dates

#### 4.2 Help & Onboarding (`/start`, `/help`)
```
/start                    # Welcome, role detection, quick menu
/help                     # Command reference
/onboard                  # Guided setup (role, preferences, notifications)
```

#### 4.3 Profile & Settings (`/profile`)
```
/profile                  # View profile, subscription tier, limits
/profile notifications    # Toggle notification types
/profile language
```

#### 4.4 Share & Deep Linking
- `https://t.me/khodroju_bot?start=listing_<id>` → opens listing detail
- `https://t.me/khodroju_bot?start=request_<id>` → pre-fills buy request
- `https://t.me/khodroju_bot?start=alert_<brand>_<model>` → pre-fills price alert

---

## Technical Architecture

### Bot Structure (Telegraf/grammy)

```
telegram-bot/
├── src/
│   ├── index.ts                 # Entry point, bot initialization
│   ├── config.ts                # Env, constants, Persian maps
│   ├── middlewares/
│   │   ├── auth.ts              # Supabase auth, user/seller resolution
│   │   ├── i18n.ts              # Language, Persian digits, Jalali dates
│   │   ├── rateLimit.ts         # Per-user rate limiting
│   │   └── logging.ts           # Request/response logging
│   ├── scenes/
│   │   ├── buyer/
│   │   │   ├── searchWizard.ts
│   │   │   ├── buyRequestWizard.ts
│   │   │   ├── priceAlertWizard.ts
│   │   │   └── vehicleRequestWizard.ts
│   │   ├── seller/
│   │   │   ├── listingWizard.ts
│   │   │   ├── editListingWizard.ts
│   │   │   └── respondWizard.ts
│   │   └── admin/
│   │       └── broadcastWizard.ts
│   ├── handlers/
│   │   ├── commands.ts          # /start, /help, /search, /alert, etc.
│   │   ├── callbacks.ts         # Inline keyboard callbacks
│   │   ├── inlineQuery.ts       # @bot search
│   │   └── notifications.ts     # Supabase Realtime → bot push
│   ├── services/
│   │   ├── supabase.ts          # Supabase client (service role)
│   │   ├── listings.ts          # Search, filter, format
│   │   ├── buyRequests.ts       # CRUD + status transitions
│   │   ├── priceAlerts.ts       # Create, check, notify
│   │   ├── notifications.ts     # Fetch, mark read, push
│   │   ├── marketInsights.ts    # Query car_market_insights
│   │   ├── sellers.ts           # Seller dashboard data
│   │   └── scheduler.ts         # Cron: price alerts, saved searches
│   ├── keyboards/
│   │   ├── mainMenu.ts          # Role-based main menu
│   │   ├── searchFilters.ts     # Inline filter keyboards
│   │   ├── listingCard.ts       # Listing action buttons
│   │   ├── requestActions.ts    # Accept/Negotiate/Reject
│   │   └── pagination.ts        # Universal pagination
│   ├── formatters/
│   │   ├── listing.ts           # Format listing for Telegram (MarkdownV2)
│   │   ├── price.ts             # formatPrice + Persian digits
│   │   ├── date.ts              # Jalali date formatting
│   │   └── status.ts            # Status badge + emoji
│   └── types/
│       ├── bot.ts               # Extended Telegraf context
│       └── domain.ts            # Shared types from web (Listing, BuyRequest, etc.)
├── package.json
├── tsconfig.json
├── .env.example
└── Dockerfile
```

### Supabase Integration

**Service Role Client** (bypasses RLS for bot operations):
```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

**Realtime Subscriptions** (for instant notifications):
```typescript
// services/notifications.ts
supabaseAdmin
  .channel('user_notifications')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, payload => {
    const notification = payload.new as UserNotification;
    bot.telegram.sendMessage(notification.user_id, formatNotification(notification));
  })
  .subscribe();
```

**User Resolution** (Telegram ID → Supabase UUID):
```typescript
// middlewares/auth.ts
// profiles table needs: telegram_id (unique), role (buyer/seller/admin), seller_id (nullable)
async function resolveUser(ctx: BotContext) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role, seller_id, subscription_tier, monthly_request_count, request_limit')
    .eq('telegram_id', ctx.from.id)
    .single();
  ctx.user = profile;
  if (profile?.seller_id) {
    const { data: seller } = await supabaseAdmin.from('sellers').select('*').eq('id', profile.seller_id).single();
    ctx.seller = seller;
  }
}
```

---

## Database Schema Extensions

Add to existing Supabase schema:

```sql
-- profiles table additions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"request": true, "price": true, "saved": true, "system": true}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fa';

-- price_alerts: already exists, add index
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_active ON price_alerts(user_id, is_active) WHERE is_active = true;

-- buy_requests: already exists, ensure notification trigger exists
-- (existing trigger creates user_notifications row on status change)

-- saved_searches (new table)
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,  -- FilterState from marketplace.ts
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_saved_searches_user_active ON saved_searches(user_id, is_active);

-- favorites (new table)
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- bot_sessions (for wizard state persistence)
CREATE TABLE bot_sessions (
  chat_id BIGINT PRIMARY KEY,
  scene TEXT,
  state JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Persian Localization Utilities

```typescript
// formatters/persian.ts
export const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
export const toFa = (str: string | number) => String(str).replace(/\d/g, d => faDigits[+d]);

export const formatPriceFa = (price: number): string => {
  if (price >= 1_000_000_000) return `${toFa((price/1_000_000_000).toFixed(3))} میلیارد`;
  if (price >= 1_000_000) return `${toFa((price/1_000_000).toFixed(0))} میلیون`;
  return toFa(price.toLocaleString());
};

export const formatJalali = (iso: string) => new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric', month: 'long', day: 'numeric'
}).format(new Date(iso));

export const statusEmoji: Record<Listing['status'], string> = {
  active: '✅', pending: '⏳', sold: '🔴', negotiable: '💜', reserved: '🔵'
};

export const statusLabelFa: Record<Listing['status'], string> = {
  active: 'موجود', pending: 'در انتظار', sold: 'فروخته شد', negotiable: 'قابل مذاکره', reserved: 'رزرو شده'
};
```

---

## Key Implementation Flows

### Flow 1: Buyer Searches & Submits Buy Request
```
User: /search Toyota Camry 2026 Tehran
Bot:  [Inline results carousel]
      🚗 Toyota Camry XLE 2.5L 2026
      💰 ۲.۸۵۰ میلیارد تومان | 📍 تهران
      📊 +2.5% از میانگین بازار
      [View] [Buy Request] [Save] [Alert]

User: Taps [Buy Request]
Bot:  Wizard: "قیمت پیشنهادی؟" → "پیام اضافه (اختیاری)؟"
User: 2,800,000,000 / "آماده‌ام برای بررسی فیزیکی"
Bot:  ✅ درخواست ثبت شد (محدودیت ماهانه: ۲ باقی‌مانده)
      📩 فروشنده اعلان دریافت می‌کند
```

### Flow 2: Seller Receives & Responds to Request
```
Bot (push to seller): 🔔 درخواست خرید جدید
      🚗 Toyota Camry XLE 2.5L 2026
      👤 علی رضایی | 💰 ۲.۸۰۰ میلیارد
      💬 "آماده‌ام برای بررسی فیزیکی"
      [تأیید ✅] [مذاکره 💜] [رد ❌]

Seller: Taps [مذاکره]
Bot:  "قیمتcontre پیشنهادی؟"
Seller: 2,820,000,000
Bot:  ✅ مذاکره ارسال شد. شماره تماس خریدار: 0912xxxxyyy
```

### Flow 3: Price Alert Triggered
```
Cron (every 15 min): Checks active price_alerts
  → Joins car_market_insights + listings
  → Finds listings where price <= target_price
Bot (push to user): 🔔 هشدار قیمت!
      🚗 Toyota Camry XLE 2026
      💰 ۲.۷۸۰ میلیارد تومان (هدف: ۲.۸۰۰ میلیارد)
      📍 تهران | ✅ آریا موتورز
      [مشاهده] [غیرفعال کردن هشدار]
```

---

## Deployment & Operations

### Environment Variables
```env
BOT_TOKEN=123456:ABC-DEF...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
WEBAPP_URL=https://khodroju.ir
ADMIN_TELEGRAM_IDS=123456789,987654321
CRON_SECRET=random-secret-for-scheduler-webhook
```

### Docker Compose (Production)
```yaml
services:
  bot:
    build: .
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    deploy:
      replicas: 2
      restart_policy: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s

  scheduler:
    build: .
    command: npm run scheduler
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - CRON_SECRET=${CRON_SECRET}
    deploy:
      replicas: 1
```

### Health Check Endpoint
```typescript
// src/routes/health.ts (if using webhook mode)
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
```

---

## Development Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Bot scaffold (Telegraf + TypeScript + Supabase client)
- [ ] Auth middleware (Telegram ID ↔ Supabase profile)
- [ ] Persian localization (digits, dates, RTL MarkdownV2)
- [ ] Main menu keyboards (role-based)
- [ ] `/start`, `/help`, `/profile`, `/lang`

### Phase 2: Buyer Core (Week 2-3)
- [ ] `/search` with inline query + carousel results
- [ ] Listing detail view + action buttons
- [ ] `/buy` wizard (buy request submission)
- [ ] `/alert` CRUD + scheduler (15-min cron)
- [ ] `/notifications` list + mark read
- [ ] `/save` saved searches + daily cron
- [ ] `/fav` favorites

### Phase 3: Seller Core (Week 3-4)
- [ ] `/dashboard` with tabs (listings, requests, analytics)
- [ ] `/listing create` wizard (multi-step, validation)
- [ ] `/listing edit|delete|status|renew`
- [ ] `/respond` accept/negotiate/reject with buyer contact reveal
- [ ] Real-time push for new requests (Supabase Realtime)

### Phase 4: Admin & Polish (Week 4-5)
- [ ] `/admin` moderation commands
- [ ] Broadcast with confirmation
- [ ] System stats
- [ ] Rate limiting, error handling, logging
- [ ] Deep linking (listing, request, alert)
- [ ] Webhook mode + health checks

### Phase 5: Advanced (Week 5+)
- [ ] Market insights charts (rendered as images via quickchart.io)
- [ ] Subscription tier management (premium limits)
- [ ] Referral program
- [ ] AI-assisted listing creation (photo → spec extraction)
- [ ] Multi-language (English/Arabic)
- [ ] Web App (Telegram Mini App) for rich listing view

---

## Testing Strategy

| Layer | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest | Formatters, filters, price calculation, Persian utils |
| Integration | Vitest + Supabase local | Services (listings, requests, alerts) |
| E2E | Telegraf test context | Wizard flows, command handlers, callbacks |
| Load | k6 | 1000 concurrent users, notification throughput |

---

## Security Considerations

1. **Never expose service role key** — only in server env
2. **Validate all user input** — Zod schemas matching web validation
3. **Rate limit** — 30 req/min per user, stricter for mutations
4. **Admin commands** — guarded by `ADMIN_TELEGRAM_IDS` env
5. **Contact info** — only revealed on `ACCEPTED`/`NEGOTIABLE` status
6. **PII** — don't log phone numbers, full names in bot logs
7. **Webhook secret** — validate `X-Telegram-Bot-Api-Secret-Token` header

---

## Prompt for AI-Assisted Implementation

> **Build a Telegram bot for KhodroJu (ZeroMarket) — an Iranian zero-kilometer car marketplace.**
>
> **Context:** The web app is Next.js 16 + Supabase. Key tables: `listings`, `buy_requests`, `vehicle_requests`, `user_notifications`, `price_alerts`, `profiles`, `sellers`, `car_market_insights`. All UI is Persian/RTL.
>
> **Bot Stack:** TypeScript, Telegraf.js (or grammy.js), Supabase service-role client.
>
> **Implement:**
> 1. **Project scaffold** with config, middlewares (auth, i18n, rateLimit), scene-based wizards
> 2. **Buyer features:** `/search` (inline query + carousel), `/buy` wizard, `/alert` CRUD + cron scheduler, `/notifications`, `/save` (saved searches), `/fav`, `/market` insights
> 3. **Seller features:** `/dashboard`, `/listing` CRUD wizard, `/respond` accept/negotiate/reject, real-time request push via Supabase Realtime
> 4. **Admin features:** `/admin` moderation, broadcast, stats
> 5. **Shared:** `/start` onboarding, `/profile`, deep linking, Persian formatting (digits, Jalali dates, MarkdownV2 RTL)
> 6. **Database migrations** for `telegram_id`, `notification_prefs`, `saved_searches`, `favorites`, `bot_sessions`
> 7. **Dockerfile + docker-compose** for bot + scheduler services
> 8. **Tests** for formatters, services, wizard flows
>
> **Code style:** Follow existing web app conventions — Persian labels from `context/marketFilters.ts`/`context/carLabels.ts`, `formatPrice` from `context/data.ts`, status enums from `types/dataTypes.ts` and `lib/supabase/buyRequests.ts`.
>
> **Deliverables:** Complete `telegram-bot/` folder with README, `.env.example`, and deployment docs.

---

## Quick Reference: Command Map

| Command | Role | Description |
|---------|------|-------------|
| `/start` | All | Welcome, role detection, main menu |
| `/help` | All | Command reference |
| `/lang` | All | Switch language (fa/en) |
| `/profile` | All | View profile, subscription, limits |
| `/search` | Buyer | Smart search with filters |
| `/buy` | Buyer | Submit buy request |
| `/alert` | Buyer | Price alert management |
| `/save` | Buyer | Saved searches |
| `/fav` | Buyer | Favorites/watchlist |
| `/notifications` | Buyer | View notifications |
| `/request` | Buyer | Vehicle request (custom order) |
| `/market` | Buyer | Market insights |
| `/dashboard` | Seller | Seller dashboard |
| `/listing` | Seller | Listing CRUD |
| `/respond` | Seller | Respond to buy request |
| `/stats` | Seller | Quick analytics |
| `/admin` | Admin | Moderation panel |
| `/admin stats` | Admin | System statistics |

---

## Next Steps

1. **Create `telegram-bot/` directory** in repo root
2. **Initialize package.json** with dependencies: `telegraf`, `@supabase/supabase-js`, `zod`, `date-fns-jalali`, `node-cron`, `quickchart-js`
3. **Write migrations** for schema extensions
4. **Implement Phase 1** foundation
5. **Test locally** with ngrok webhook to Supabase dev instance
6. **Iterate** through phases with user feedback