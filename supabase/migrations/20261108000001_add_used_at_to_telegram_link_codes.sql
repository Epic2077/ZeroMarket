alter table public.telegram_link_codes
  add column if not exists used_at timestamptz;
