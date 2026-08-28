-- Create blog_notifications table
create table if not exists public.blog_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  time text not null,
  unread boolean not null default true,
  href text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.blog_notifications enable row level security;

-- Public read access
create policy "Public read access" on public.blog_notifications
  for select using (true);

-- Insert some sample notifications (optional)
insert into public.blog_notifications (title, body, time, unread, href) values
  ('یک آژانس تأییدشده به فید اضافه شد', 'پارسیان خودرو امروز ۳ نوشته تازه منتشر کرد.', '۱۲ دقیقه پیش', true, '/blog/agencies'),
  ('تحلیل جدید بازار منتشر شد', 'سیگنال‌های نیمه دوم سال اکنون در بالای فید قرار گرفته‌اند.', 'دیروز', false, '/blog/market-signal-q2-zero-km'),
  ('صفحه اعلان‌ها آماده مرور است', 'می‌توانید همه اعلان‌ها را در صفحه اختصاصی ببینید.', '۲ روز پیش', false, '/blog/notifications')
on conflict do nothing;