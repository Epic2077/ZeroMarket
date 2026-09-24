-- Vehicle Requests Table for "Vehicle Purchase Interest" feature
-- This is different from buy_requests - it's for general interest in a vehicle brand/model
-- not tied to a specific listing

create table public.vehicle_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  brand text not null,
  model text not null,
  purchase_method text not null check (purchase_method in ('CASH', 'INSTALLMENT', 'PRE_SALE', 'MULTI_STAGE')),
  first_name text not null,
  last_name text not null,
  city text not null,
  phone text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update timestamp
create trigger set_vehicle_requests_updated_at
  before update on public.vehicle_requests
  for each row execute function public.handle_updated_at();@

-- Enable Row Level Security
alter table public.vehicle_requests enable row level security;

-- Users can view and insert their own requests
create policy "Users can manage their own vehicle requests"
  on public.vehicle_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins/Staff can view all requests
create policy "Staff can view all vehicle requests"
  on public.vehicle_requests for select
  using (public.is_admin() or public.is_owner());

-- Add columns to profiles for request limiting
alter table public.profiles
  add column if not exists monthly_request_count integer not null default 0,
  add column if not exists request_limit integer not null default 3,
  add column if not exists last_request_reset timestamptz not null default now(),
  add column if not exists subscription_tier text not null default 'FREE' check (subscription_tier in ('FREE', 'PREMIUM', 'VIP'));

-- Index for efficient querying
create index vehicle_requests_user_id_created_at_idx on public.vehicle_requests (user_id, created_at desc);
create index vehicle_requests_status_idx on public.vehicle_requests (status);