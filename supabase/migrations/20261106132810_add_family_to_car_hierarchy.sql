do $$
declare
  category_type text;
begin
  select t.typname
    into category_type
  from pg_catalog.pg_attribute a
  join pg_catalog.pg_class c on c.oid = a.attrelid
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  join pg_catalog.pg_type t on t.oid = a.atttypid
  where n.nspname = 'public'
    and c.relname = 'taxonomy_options'
    and a.attname = 'category'
    and t.typtype = 'e';

  if category_type is not null then
    execute format(
      'alter type public.%I add value if not exists ''FAMILY''',
      category_type
    );
  end if;
exception
  when undefined_object then
    null;
end
$$;

-- Add an optional family level between brand and model.
alter table public.car_specs
  add column if not exists family text;

alter table public.car_specs_change_requests
  add column if not exists family text,
  add column if not exists old_family text;

alter table public.listings
  add column if not exists family text;

create index if not exists car_specs_brand_family_model_idx
  on public.car_specs (brand, family, model);

create index if not exists listings_brand_family_model_idx
  on public.listings (brand, family, model);