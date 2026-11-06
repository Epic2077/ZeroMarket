do $$
declare
  category_type text;
begin
  select udt_name
    into category_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'taxonomy_options'
    and column_name = 'category';

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