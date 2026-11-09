drop index if exists public.telegram_link_codes_one_active_idx;

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
  insert into public.telegram_link_codes (user_id, code_hash, expires_at)
  values (p_user_id, p_code_hash, v_expires_at);

  return v_expires_at;
end;
$$;

revoke all on function public.create_telegram_link_code(uuid, text) from public;
grant execute on function public.create_telegram_link_code(uuid, text) to service_role;
