alter table public.price_alerts
  alter column year type text
  using year::text;

notify pgrst, 'reload schema';
