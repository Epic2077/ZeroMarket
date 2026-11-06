# ClickCars Self-Hosted Supabase Backend Reference

This document provides a comprehensive technical overview of the ClickCars self-hosted Supabase backend architecture deployed on Docker (Debian 13 VPS at `89.46.217.161`).

---

## 1. Stack Architecture & Deployment Summary

The backend runs on a self-hosted Supabase Docker stack composed of the following primary containers:

| Container Name | Service | Exposed Ports / Scope | Notes |
| :--- | :--- | :--- | :--- |
| `supabase-db` | PostgreSQL 17.6 | `5432` (Internal/Host) | Stores standard schemas (`public`, `auth`, `storage`, `extensions`, `vault`) |
| `supabase-auth` | GoTrue Auth | `9999` (Internal) / Proxied to `/auth/v1` | Handles user authentication, metadata parsing, and JWT issuance |
| `supabase-rest` | PostgREST 14.18 | `3000` (Internal) / Proxied to `/rest/v1` | Exposes PostgreSQL tables and views as RESTful APIs |
| Nginx / Reverse Proxy | TLS / SSL Proxy | `89.46.217.161:443` (`clickcars.ir`) | Handles HTTPS termination and proxies `/auth/v1` and `/rest/v1` |

---

## 2. Authentication & Profile Synchronization Flow

When a user signs up on the frontend (`https://clickcars.ir`), the signup request flows through GoTrue into PostgreSQL.

### Sign-Up Data Pipeline

```
[ Frontend: supabase.auth.signUp() ] 
                │
                ▼ (HTTPS POST /auth/v1/signup)
[ GoTrue Auth Service (supabase-auth) ]
                │
                ▼ Inserts record into auth.users
[ PostgreSQL: auth.users ]
                │
                ▼ Fires AFTER INSERT Trigger (on_auth_user_created)
[ public.handle_new_user() Trigger Function ]
                │
                ▼ Extracts raw_user_meta_data JSON
[ public.profiles Table ] ── (Fires on_first_listing_created when listing added) ──> [ public.sellers Table ]
```

### Trigger Implementation (`public.handle_new_user`)

The trigger function operates as `SECURITY DEFINER` to bypass Row-Level Security (RLS) constraints during registration while dynamically extracting client-provided metadata.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    phone, 
    city
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'phone_number', -- Supports phone / phone_number key formats
    NEW.raw_user_meta_data->>'city'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    city = COALESCE(EXCLUDED.city, public.profiles.city);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger binding to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions across internal roles
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
```

---

## 3. Database Custom Enums

The application relies on 9 custom PostgreSQL ENUM types defined in the `public` schema:

| Enum Name | Values | Usage Context |
| :--- | :--- | :--- |
| `user_role` | `'USER'`, `'ADMIN'`, `'OWNER'` | Role-Based Access Control (RBAC) in `public.profiles` |
| `account_status` | `'ACTIVE'`, `'SUSPENDED'` | User account lifecycle state |
| `seller_application_status` | `'NONE'`, `'PENDING'`, `'APPROVED'`, `'REJECTED'` | Seller onboarding state |
| `listing_status` | `'AVAILABLE'`, `'WAITING'`, `'NEGOTIABLE'`, `'RESERVED'`, `'SOLD'` | Car listing lifecycle state |
| `change_request_action` | `'ADD'`, `'UPDATE'`, `'DELETE'` | Taxonomy / Car spec moderation requests |
| `change_request_status` | `'PENDING'`, `'APPROVED'`, `'REJECTED'` | Approval workflow status |
| `notification_kind` | `'REQUEST'`, `'PRICE'`, `'SAVED'`, `'SYSTEM'`, `'TICKETREP'` | Categorization of user notifications |
| `owner_notification_type` | `'TAXONOMY_REQUEST'`, `'SELLER_APPLICATION'`, `'SYSTEM_ALERT'`, `'REPORT'`, `'TICKET'` | Category for owner admin notifications |
| `ticket_status` | `'OPEN'`, `'IN_PROGRESS'`, `'RESOLVED'`, `'CLOSED'` | Support system ticket lifecycle |

---

## 4. Primary Data Models & Core Schema

### `public.profiles`
Primary user profile table extending `auth.users`.
*   **Key Columns:** `id` (FK to `auth.users`), `email`, `full_name`, `phone`, `city`, `role` (`user_role`), `status` (`account_status`), `verified` (boolean), `subscription_tier` (`'FREE'`, `'PREMIUM'`, `'VIP'`).
*   **Constraints:** Foreign key cascading delete from `auth.users`.

### `public.sellers`
Extended storefront profiles for verified car dealers and sellers.
*   **Key Columns:** `id` (FK to `public.profiles`), `full_name`, `city`, `verified`, `answer_rate`, `active_listings_count`, `total_sold_count`, `seller_score`, `total_cars_sold`, `total_volume`.

### `public.listings`
Car inventory items for sale or purchase requests.
*   **Key Columns:** `id`, `seller_id` (FK to `public.profiles`), `slug`, `brand`, `family` (nullable grouping between brand and model), `model`, `year`, `price`, `city`, `status` (`listing_status`), `listing_type` (`'SELL'`, `'BUY'`), `deleted_at`.
*   **Soft Delete Interceptor:** Uses a trigger (`soft_delete_listing_interceptor`) to update `deleted_at` instead of executing a hard row delete.

### `public.buy_requests`
Negotiation offers submitted by buyers for listings.
*   **Key Columns:** `id`, `listing_id`, `buyer_id`, `seller_id`, `offered_price`, `message`, `status` (`'WAITING'`, `'ACCEPTED'`, `'NEGOTIABLE'`, `'REJECTED'`, `'COMPLETED'`, `'CLOSED'`).

### `public.completed_sales`
Historical transaction log generated automatically when a buy request status changes to `'COMPLETED'`.

---

## 5. Automated Database Triggers & Workflows

| Trigger Name | Target Table | Event | Execution Function | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `on_auth_user_created` | `auth.users` | `AFTER INSERT` | `handle_new_user()` | Automatically populates `public.profiles` on user signup |
| `on_first_listing_created` | `public.listings` | `AFTER INSERT` | `auto_create_seller()` | Automatically creates a `sellers` record when a user posts their first car |
| `on_request_completed_create_sale` | `public.buy_requests` | `AFTER INSERT OR UPDATE` | `auto_create_completed_sale_on_request_completion()` | Inserts a row into `completed_sales` when an offer is completed |
| `on_confirmed_sale_update_seller` | `public.completed_sales` | `AFTER INSERT/DELETE/UPDATE` | `sync_confirmed_sales_to_seller()` | Updates total cars sold and sales volume metrics on `sellers` |
| `on_delete_listing_soft_delete` | `public.listings` | `BEFORE DELETE` | `soft_delete_listing_interceptor()` | Converts raw `DELETE` SQL commands into soft deletes (`deleted_at = NOW()`) |
| `on_car_specs_decision` | `public.car_specs_change_requests` | `AFTER UPDATE` | `handle_car_specs_decision()` | Applies approved car specification changes, including family, to the live `car_specs` table |
| `on_taxonomy_request_approved` | `public.taxonomy_change_requests` | `AFTER UPDATE` | `process_taxonomy_approval()` | Synchronizes approved admin taxonomy additions/modifications |
| `on_new_listing_check_alerts` | `public.listings` | `AFTER INSERT` | `trigger_check_price_alerts()` | Matches new listings against `price_alerts` and sends user notifications |
| `on_new_ticket_created` | `public.tickets` | `AFTER INSERT` | `notify_owner_on_new_ticket()` | Generates an owner alert when a support ticket is opened |
| `on_ticket_message_created` | `public.ticket_messages` | `AFTER INSERT` | `notify_user_on_ticket_message()` | Sends a user notification when staff replies to a ticket |

---

## 6. Helper & Maintenance Stored Procedures (RPCs)

These stored functions can be called directly via RPC from PostgREST or scheduled via `pg_cron`:

### Car hierarchy

The canonical car hierarchy is `brand → family → model`. `family` is nullable during
the migration period so existing listings and technical specifications remain valid.
Taxonomy `FAMILY` rows should store the owning brand in `metadata.brand`; `MODEL` rows
may store both `metadata.brand` and `metadata.family`.

### 1. `refresh_homepage_stats()`
Aggregates live count metrics (`active_posts_count`, `today_new_posts`, `total_sellers`, `avg_post_price`) into `public.homepage_stats`.

### 2. `refresh_seller_analytics()`
Recalculates every seller's inventory count, total cars sold, and updates the proprietary `seller_score` dynamically:
$$\text{Seller Score} = \text{answer\_rate} + (\text{if verified}: 50) + \min(\text{active\_listings} \times 5, 50) + (\text{sold\_cars} \times 10)$$

### 3. `refresh_car_market_insights()`
Aggregates price trends over 7-day and 30-day windows per brand, family, model, and year, storing output in `public.car_market_insights`.

---

## 7. Security & Row-Level Security (RLS) Rules

RLS is enabled across all tables in the `public` schema.

### Helper Security Functions
*   `public.is_admin()`: Returns `TRUE` if `auth.uid()` has `role = 'ADMIN'` or `role = 'OWNER'` in `public.profiles`.
*   `public.is_owner()`: Returns `TRUE` if `auth.uid()` has `role = 'OWNER'`.

### Core RLS Policies Overview
1.  **Profiles (`public.profiles`):**
    *   `SELECT`: Publicly readable (`USING (true)`).
    *   `UPDATE`: Restricted to record owner (`auth.uid() = id`).
2.  **Listings (`public.listings`):**
    *   `SELECT`: Publicly readable for active listings (`status IN ('AVAILABLE', 'NEGOTIABLE', 'RESERVED') AND deleted_at IS NULL`).
    *   `INSERT/UPDATE/DELETE`: Restricted to listing owner (`seller_id = auth.uid()`) or admins via `is_admin()`.
3.  **Buy Requests (`public.buy_requests`):**
    *   `ALL`: Accessible only by the involved buyer (`buyer_id = auth.uid()`), seller (`seller_id = auth.uid()`), or admins.
4.  **Support Tickets (`public.tickets` & `public.ticket_messages`):**
    *   `ALL`: Accessible only by the ticket creator (`user_id = auth.uid()`) or staff (`is_admin()`).

---

## 8. Frontend Integration Guidelines

When invoking Supabase Auth sign-ups from the frontend client library, pass custom metadata in the `options.data` payload to populate profile fields automatically during registration:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://clickcars.ir', 'YOUR_ANON_KEY')

export async function signUpUser(email: string, password: string, fullName: string, phone: string, city: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phone,
        city: city
      }
    }
  })
  return { data, error }
}
```