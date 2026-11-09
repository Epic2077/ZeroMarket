alter table public.profiles
  add column if not exists telegram_id text,
  add column if not exists telegram_username text,
  add column if not exists telegram_connected_at timestamptz;

create unique index if not exists profiles_telegram_id_unique_idx
  on public.profiles (telegram_id)
  where telegram_id is not null;

drop function if exists public.complete_telegram_link(text, text, text);

create function public.complete_telegram_link(
  p_code_hash text,
  p_telegram_id text,
  p_telegram_username text
)
returns table(user_id uuid, telegram_id text, telegram_username text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.telegram_link_codes%rowtype;
begin
  select *
  into v_code
  from public.telegram_link_codes
  where code_hash = p_code_hash
    and used_at is null
    and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if not found then
    return;
  end if;

  update public.telegram_link_codes
  set used_at = now()
  where id = v_code.id;

  update public.profiles
  set telegram_id = p_telegram_id,
      telegram_username = p_telegram_username,
      telegram_connected_at = now()
  where id = v_code.user_id;

  return query
  select v_code.user_id, p_telegram_id, p_telegram_username;
end;
$$;

revoke all on function public.complete_telegram_link(text, text, text) from public;
grant execute on function public.complete_telegram_link(text, text, text) to service_role;