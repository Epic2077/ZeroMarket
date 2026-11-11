alter table public.listings
  alter column year type text
  using year::text;

notify pgrst, 'reload schema';
