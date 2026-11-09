create table if not exists public.telegram_link_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null default (now() + interval '60 seconds'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists telegram_link_codes_user_id_idx
  on public.telegram_link_codes(user_id);

create or replace function public.create_telegram_link_code(
  p_user_id uuid,
  p_code_hash text
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expires_at timestamptz := now() + interval '60 seconds';
begin
  update public.telegram_link_codes
  set used_at = now()
  where user_id = p_user_id
    and used_at is null
    and expires_at > now();

  insert into public.telegram_link_codes (user_id, code_hash, expires_at)
  values (p_user_id, p_code_hash, v_expires_at);

  return v_expires_at;
end;
$$;

revoke all on function public.create_telegram_link_code(uuid, text) from public;
grant execute on function public.create_telegram_link_code(uuid, text) to service_role;
