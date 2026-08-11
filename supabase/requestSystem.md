I understand completely. Keeping the listing's public status independent from the private transaction status is essential—it allows sellers to handle multiple buyers or hold multi-unit inventory without taking down their active listing.

Regarding your question about notifications: **Use the general `user_notifications` table.** You do not need a separate table. Sellers are regular users (`profiles`), so inserting an item into `user_notifications` with `user_id = seller_id` and `kind = 'REQUEST'` keeps your notification hub centralized, clean, and easy to maintain.

---

### 1. Database Schema & Phone Security

We will create a `buy_requests` table to track individual buyer offers and a **Secure View** (`seller_buy_requests_view`).

The Secure View uses a conditional `CASE` statement so that the buyer's phone number remains `NULL` on the database level while the status is `WAITING` or `REJECTED`, and is automatically revealed _only_ when the seller changes the status to `ACCEPTED` or `NEGOTIABLE`.

Go to your **SQL Editor** and run this:

```sql
-- 1. Create the Buy Requests Table
create table public.buy_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,

  offered_price numeric not null,
  message text,
  status text not null default 'WAITING' check (status in ('WAITING', 'ACCEPTED', 'NEGOTIABLE', 'REJECTED')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Prevent duplicate requests for the same listing by the same buyer
  constraint unique_buyer_listing_request unique (listing_id, buyer_id)
);

-- Auto-update timestamp
create trigger set_buy_requests_updated_at
  before update on public.buy_requests
  for each row execute function public.handle_updated_at();

-- 2. Enable Row Level Security (RLS)
alter table public.buy_requests enable row level security;

-- Buyers can view and insert their own requests
create policy "Buyers can manage their own requests"
  on public.buy_requests for all
  using (auth.uid() = buyer_id)
  with check (auth.uid() = buyer_id);

-- Sellers can view and update requests assigned to them
create policy "Sellers can view and update incoming requests"
  on public.buy_requests for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- Admins full access
create policy "Admins manage all buy requests"
  on public.buy_requests for all
  using (public.is_admin());

-- ==========================================
-- 3. SECURE VIEW: Conditional Phone Number Masking
-- ==========================================
create or replace view public.seller_buy_requests_view
with (security_invoker = true) as
select
  br.id,
  br.listing_id,
  br.buyer_id,
  br.seller_id,
  br.offered_price,
  br.message,
  br.status,
  br.created_at,
  br.updated_at,
  p.full_name as buyer_name,
  p.avatar_url as buyer_avatar,

  -- Phone number is strictly masked unless ACCEPTED or NEGOTIABLE
  case
    when br.status in ('ACCEPTED', 'NEGOTIABLE') then p.phone
    else null
  end as buyer_phone

from public.buy_requests br
join public.profiles p on p.id = br.buyer_id;

```

---

### 2. Notification Triggers

These two triggers handle automated alerts through your existing `user_notifications` table:

1. **New Request Alert:** When a buyer submits an offer, the seller receives a notification.
2. **Status Change Alert:** When the seller accepts, rejects, or sets a request to negotiable, the buyer receives an update.

```sql
-- Trigger 1: Notify Seller when a new offer arrives
create or replace function public.notify_seller_on_buy_request()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_notifications (user_id, title, description, kind, href)
  values (
    new.seller_id,
    'New Buy Offer Received',
    'A buyer submitted an offer of ' || new.offered_price || ' for your listing.',
    'REQUEST',
    '/seller/dashboard/requests'
  );
  return new;
end;
$$;

create trigger trigger_notify_seller_buy_request
  after insert on public.buy_requests
  for each row execute function public.notify_seller_on_buy_request();


-- Trigger 2: Notify Buyer when the Seller makes a decision
create or replace function public.notify_buyer_on_request_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if old.status != new.status then
    insert into public.user_notifications (user_id, title, description, kind, href)
    values (
      new.buyer_id,
      'Offer Status Updated',
      'The seller set your request status to "' || new.status || '".',
      'REQUEST',
      '/buyer/dashboard/requests'
    );
  end if;
  return new;
end;
$$;

create trigger trigger_notify_buyer_request_update
  after update on public.buy_requests
  for each row execute function public.notify_buyer_on_request_update();

```

---

### 3. Frontend Integration Guide

Here is how you interact with this system in your React/Next.js frontend.

#### A. Buyer submits an offer

```typescript
import { supabase } from "./client";

export async function sendBuyRequest(params: {
  listingId: string;
  sellerId: string;
  buyerId: string;
  offeredPrice: number;
  message?: string;
}) {
  const { data, error } = await supabase
    .from("buy_requests")
    .insert({
      listing_id: params.listingId,
      seller_id: params.sellerId,
      buyer_id: params.buyerId,
      offered_price: params.offeredPrice,
      message: params.message,
      status: "WAITING",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
```

#### B. Seller fetches incoming offers (Using the Secure View)

```typescript
export async function getSellerIncomingRequests(sellerId: string) {
  // Querying the VIEW ensures buyer_phone is safely null unless ACCEPTED or NEGOTIABLE
  const { data: requests, error } = await supabase
    .from("seller_buy_requests_view")
    .select(
      `
      id,
      listing_id,
      offered_price,
      message,
      status,
      created_at,
      buyer_name,
      buyer_avatar,
      buyer_phone
    `,
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return requests;
}
```

#### C. Seller updates the request status

```typescript
export async function updateRequestStatus(
  requestId: string,
  newStatus: "ACCEPTED" | "NEGOTIABLE" | "REJECTED" | "WAITING",
) {
  const { error } = await supabase
    .from("buy_requests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (error) throw error;
}
```
