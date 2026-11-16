-- Use stable ids (not names) as the parent/child key in taxonomy_options.
-- Every row already has a uuid `id`; this backfills parent ids into metadata and
-- keeps them in sync for existing AND future rows via triggers.

-- 1) Backfill brand_id on FAMILY rows.
update public.taxonomy_options f
set metadata = coalesce(f.metadata, '{}'::jsonb) || jsonb_build_object('brand_id', b.id)
from public.taxonomy_options b
where f.category = 'FAMILY'
  and b.category = 'BRAND'
  and b.value = (f.metadata ->> 'brand');

-- 2) Backfill brand_id + family_id on MODEL rows.
update public.taxonomy_options m
set metadata = coalesce(m.metadata, '{}'::jsonb)
             || jsonb_build_object('brand_id', b.id, 'family_id', fam.id)
from public.taxonomy_options b
left join public.taxonomy_options fam
  on fam.category = 'FAMILY'
  and fam.value = (m.metadata ->> 'family')
  and (fam.metadata ->> 'brand') = b.value
where m.category = 'MODEL'
  and b.category = 'BRAND'
  and b.value = (m.metadata ->> 'brand');

-- 3) Keep parent ids in sync for every future insert/update (new rows too).
create or replace function public.sync_taxonomy_parent_ids()
returns trigger
language plpgsql
as $$
declare
  v_brand_id uuid;
  v_family_id uuid;
begin
  if new.category = 'FAMILY' then
    select t.id into v_brand_id
      from public.taxonomy_options t
      where t.category = 'BRAND' and t.value = (new.metadata ->> 'brand')
      limit 1;
    new.metadata = jsonb_set(
      coalesce(new.metadata, '{}'::jsonb),
      '{brand_id}',
      case when v_brand_id is null then 'null'::jsonb else to_jsonb(v_brand_id) end,
      true
    );
  elsif new.category = 'MODEL' then
    select t.id into v_brand_id
      from public.taxonomy_options t
      where t.category = 'BRAND' and t.value = (new.metadata ->> 'brand')
      limit 1;
    select t.id into v_family_id
      from public.taxonomy_options t
      where t.category = 'FAMILY'
        and t.value = (new.metadata ->> 'family')
        and (t.metadata ->> 'brand') = (new.metadata ->> 'brand')
      limit 1;
    new.metadata = jsonb_set(
      jsonb_set(
        coalesce(new.metadata, '{}'::jsonb),
        '{brand_id}',
        case when v_brand_id is null then 'null'::jsonb else to_jsonb(v_brand_id) end,
        true
      ),
      '{family_id}',
      case when v_family_id is null then 'null'::jsonb else to_jsonb(v_family_id) end,
      true
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_taxonomy_parent_ids on public.taxonomy_options;
create trigger trg_sync_taxonomy_parent_ids
  before insert or update on public.taxonomy_options
  for each row execute function public.sync_taxonomy_parent_ids();

-- 4) When a brand/family is renamed, cascade the name to children's metadata so
--    any remaining name-based reads stay consistent (id-based reads are unaffected).
create or replace function public.sync_taxonomy_children_on_rename()
returns trigger
language plpgsql
as $$
begin
  if new.value is not distinct from old.value then
    return new;
  end if;

  if new.category = 'BRAND' then
    update public.taxonomy_options
      set metadata = jsonb_set(
        coalesce(metadata, '{}'::jsonb),
        '{brand}',
        to_jsonb(new.value),
        true
      )
      where category in ('FAMILY', 'MODEL')
        and metadata ->> 'brand' = old.value;
  elsif new.category = 'FAMILY' then
    update public.taxonomy_options
      set metadata = jsonb_set(
        coalesce(metadata, '{}'::jsonb),
        '{family}',
        to_jsonb(new.value),
        true
      )
      where category = 'MODEL'
        and metadata ->> 'family' = old.value;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_taxonomy_children_on_rename on public.taxonomy_options;
create trigger trg_sync_taxonomy_children_on_rename
  after update of value on public.taxonomy_options
  for each row execute function public.sync_taxonomy_children_on_rename();

-- 5) Names should no longer be the unique key. Drop the (category, value) unique
--    constraint so the same model name can exist under different brands/families
--    and a deleted name can be reused. If you want flat categories (COLOR, CITY,
--    …) to stay unique, remove this block and add a partial unique index instead.
do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace n on n.oid = rel.relnamespace
    where n.nspname = 'public'
      and rel.relname = 'taxonomy_options'
      and con.contype = 'u'
      and (select array_agg(attname order by attnum)
             from pg_attribute
            where attrelid = rel.oid and attnum = any(con.conkey)
          ) = array['category', 'value']
  loop
    execute format('alter table public.taxonomy_options drop constraint %I', r.conname);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
