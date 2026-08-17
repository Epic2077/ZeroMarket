# ثبت معامله و تأیید خریدار (Buyer Confirmation Flow)

This feature records a sale as `PENDING_BUYER`; the buyer then confirms or rejects it.
Only `CONFIRMED` sales feed seller + owner statistics.
Run the SQL below in your Supabase **SQL Editor** once.

---

## 1. Table

```sql
create table public.completed_sales (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  listing_type text not null default 'SELL' check (listing_type in ('SELL', 'BUY')),
  final_sold_price numeric not null check (final_sold_price > 0),
  status text not null default 'PENDING_BUYER'
    check (status in ('PENDING_BUYER', 'CONFIRMED', 'REJECTED')),
  created_at timestamptz not null default now()
);
```

## 2. Seller stat columns

```sql
alter table public.sellers
  add column if not exists total_cars_sold integer not null default 0,
  add column if not exists total_volume numeric not null default 0;
```

## 3. Allow `INACTIVE` listing status

```sql
-- Drop any existing check constraint on listings.status, then re-add with INACTIVE.
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.listings'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.listings drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.listings
  add constraint listings_status_check
  check (status in ('WAITING', 'AVAILABLE', 'NEGOTIABLE', 'SOLD', 'RESERVED', 'INACTIVE'));
```

## 4. Row Level Security

Seller inserts, buyer updates status, staff manage everything.

```sql
alter table public.completed_sales enable row level security;

-- Staff (admin + owner) full access
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('ADMIN', 'OWNER')
  );
$$;

create policy "Staff manage all completed sales"
  on public.completed_sales for all
  using (public.is_staff())
  with check (public.is_staff());

-- Seller can insert (and read) their own sales
create policy "Sellers insert own sales"
  on public.completed_sales for insert
  with check (auth.uid() = seller_id);

create policy "Sellers read own sales"
  on public.completed_sales for select
  using (auth.uid() = seller_id);

-- Buyer can read and update the status of their own sales
create policy "Buyers read own sales"
  on public.completed_sales for select
  using (auth.uid() = buyer_id);

create policy "Buyers update own sales status"
  on public.completed_sales for update
  using (auth.uid() = buyer_id)
  with check (auth.uid() = buyer_id);
```

> If you also want buyers to be able to `delete`, add a separate `for delete` policy — the flow above only needs `select` + `update`.

## 5. Auto-update seller stats (only on CONFIRMED)

```sql
create or replace function public.update_seller_sales_stats()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status = 'CONFIRMED' then
    update public.sellers
      set total_cars_sold = total_cars_sold + 1,
          total_volume = total_volume + new.final_sold_price,
          total_sold_count = total_sold_count + 1
      where id = new.seller_id;
  elsif tg_op = 'UPDATE' then
    if new.status = 'CONFIRMED' and old.status is distinct from 'CONFIRMED' then
      update public.sellers
        set total_cars_sold = total_cars_sold + 1,
            total_volume = total_volume + new.final_sold_price,
            total_sold_count = total_sold_count + 1
        where id = new.seller_id;
    elsif old.status = 'CONFIRMED' and new.status is distinct from 'CONFIRMED' then
      update public.sellers
        set total_cars_sold = greatest(total_cars_sold - 1, 0),
            total_volume = greatest(total_volume - old.final_sold_price, 0),
            total_sold_count = greatest(total_sold_count - 1, 0)
        where id = old.seller_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trigger_update_seller_sales_stats
  after insert or update on public.completed_sales
  for each row execute function public.update_seller_sales_stats();
```

> Note: `sellers.total_sold_count` (the original column) is maintained here too, so the
> seller profile grid stays in sync with `total_cars_sold`.

### 5b. Backfill existing sales into the seller counters

If you already have `CONFIRMED` rows in `completed_sales` that were recorded
before this trigger existed, run this once to sync the counters:

```sql
update public.sellers s
set
  total_cars_sold = (
    select count(*) from public.completed_sales c
    where c.seller_id = s.id and c.status = 'CONFIRMED'
  ),
  total_volume = (
    select coalesce(sum(c.final_sold_price), 0) from public.completed_sales c
    where c.seller_id = s.id and c.status = 'CONFIRMED'
  ),
  total_sold_count = (
    select count(*) from public.completed_sales c
    where c.seller_id = s.id and c.status = 'CONFIRMED'
  );
```

## 6. Owner platform summary view (CONFIRMED only)

```sql
create or replace view public.owner_platform_summary
with (security_invoker = true) as
select
  coalesce(sum(final_sold_price), 0)::numeric as grand_total_volume,
  count(*)::integer as grand_total_cars_sold,
  (select count(*)::integer
     from public.sellers
    where active_listings_count > 0) as total_active_sellers
from public.completed_sales
where status = 'CONFIRMED';
```

## 7. Notify buyer on new pending sale (optional)

The client also inserts a `user_notifications` row. For a DB-driven fallback:

```sql
create or replace function public.notify_buyer_on_pending_sale()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_notifications (user_id, title, description, kind, href)
  values (
    new.buyer_id,
    'تأیید معامله جدید',
    'فروشنده معامله‌ای برای شما ثبت کرده است. لطفاً آن را تأیید یا رد کنید.',
    'REQUEST',
    '/dashboard/user'
  );
  return new;
end;
$$;

create trigger trigger_notify_buyer_pending_sale
  after insert on public.completed_sales
  for each row
  when (new.status = 'PENDING_BUYER')
  execute function public.notify_buyer_on_pending_sale();
```

> Note: if you enable this trigger, remove the client-side notification insert in
> `src/lib/supabase/completedSales.ts` (`recordSale` step 3) to avoid duplicates.
