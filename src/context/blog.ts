import type { BlogNotification, BlogPost, ConfirmedAgency } from "@/types/blog";

export const blogNotifications: BlogNotification[] = [
  {
    id: "notif-001",
    title: "یک آژانس تأییدشده به فید اضافه شد",
    body: "پارسیان خودرو امروز ۳ نوشته تازه منتشر کرد.",
    time: "۱۲ دقیقه پیش",
    unread: true,
    href: "/blog/agencies",
  },
  {
    id: "notif-002",
    title: "رزرو اشتراک هنوز آماده نیست",
    body: "این بخش در ستون کناری با برچسب soon نمایش داده می‌شود.",
    time: "۱ ساعت پیش",
    unread: true,
    href: "/blog",
  },
  {
    id: "notif-003",
    title: "تحلیل جدید بازار منتشر شد",
    body: "سیگنال‌های نیمه دوم سال اکنون در بالای فید قرار گرفته‌اند.",
    time: "دیروز",
    unread: false,
    href: "/blog/market-signal-q2-zero-km",
  },
  {
    id: "notif-004",
    title: "صفحه اعلان‌ها آماده مرور است",
    body: "می‌توانید همه اعلان‌ها را در صفحه اختصاصی ببینید.",
    time: "۲ روز پیش",
    unread: false,
    href: "/blog/notifications",
  },
];

export function getRelatedBlogPosts(
  currentSlug: string,
  tags: string[],
  posts: BlogPost[] = [],
) {
  return posts
    .filter((post) => post.slug !== currentSlug)
    .sort((left, right) => {
      const leftScore = left.tags.filter((tag) => tags.includes(tag)).length;
      const rightScore = right.tags.filter((tag) => tags.includes(tag)).length;
      return (
        rightScore - leftScore ||
        right.publishedAt.localeCompare(left.publishedAt)
      );
    })
    .slice(0, 3);
}