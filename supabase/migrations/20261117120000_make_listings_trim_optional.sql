-- Make `trim` optional so listings can be submitted without a trim/version.
alter table public.listings
  alter column trim drop not null;

notify pgrst, 'reload schema';
