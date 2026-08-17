-- Create how_it_works_steps table
create table if not exists public.how_it_works_steps (
  id uuid primary key default gen_random_uuid(),
  step_order int not null,
  icon_name text not null,
  icon_color text not null,
  title text not null,
  description text not null,
  created_at timestamptz default now()
);

-- Insert the 3 steps
insert into public.how_it_works_steps (step_order, icon_name, icon_color, title, description) values
  (1, 'Search', 'primary', 'مرور و فیلتر آگهی‌ها', 'بیش از ۸٬۵۰۰ آگهی صفرکیلومتر را بر اساس برند، مدل، تریم، رنگ، شهر و محدوده قیمت جستجو کنید. با جدول بورس‌مانند ما مرتب‌سازی کنید.'),
  (2, 'Send', 'accent', 'ارسال درخواست خرید', 'خودروی مناسب پیدا کردید؟ درخواست خرید را مستقیماً به فروشنده تأییدشده ارسال کنید. بدون تماس تلفنی — درخواست شامل شرایط و قیمت پیشنهادی شماست.'),
  (3, 'CheckCircle', 'success', 'پاسخ فروشنده', 'فروشنده تأیید، رد یا قابل مذاکره اعلام می‌کند — فوری اطلاع‌رسانی می‌شوید. در صورت قابل مذاکره، اطلاعات تماس برای گفتگوی مستقیم به اشتراک گذاشته می‌شود.')
on conflict do nothing;

-- Enable RLS (optional - allow public read)
alter table public.how_it_works_steps enable row level security;

create policy "Public read access" on public.how_it_works_steps
  for select using (true);

-- Create homepage_stats table (singleton row for homepage statistics)
create table if not exists public.homepage_stats (
  id int primary key default 1,
  active_posts_count int default 0,
  today_new_posts int default 0,
  total_sellers int default 0,
  avg_response_rate numeric(5,2) default 0,
  supported_brands int default 0,
  avg_post_price bigint default 0,
  price_change_since_last_week bigint default 0,
  last_updated timestamptz default now()
);

-- Insert default row
insert into public.homepage_stats (id) values (1)
on conflict (id) do nothing;

-- Enable RLS
alter table public.homepage_stats enable row level security;

create policy "Public read access" on public.homepage_stats
  for select using (true);