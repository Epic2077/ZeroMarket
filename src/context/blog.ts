import type { BlogNotification, BlogPost, ConfirmedAgency } from "@/types/blog";

export const seedBlogPosts: BlogPost[] = [
  {
    slug: "market-signal-q2-zero-km",
    title: "سیگنال‌های بازار صفرکیلومتر در نیمه دوم سال چه می‌گویند؟",
    excerpt:
      "فاصله قیمت کارخانه تا بازار، سرعت تحویل و رفتار آگهی‌های تأییدشده سه شاخصی هستند که این هفته بیشتر از همیشه جهت بازار را تعیین کردند.",
    content: [
      "بازار خودروهای صفرکیلومتر در این بازه بیشتر از هر چیز به موجودی واقعی، سرعت پاسخ‌گویی فروشنده و فاصله قیمت پیشنهادی تا میانگین بازار حساس است.",
      "در داده‌های زیرومارکت، مدل‌هایی که تحویل کوتاه‌تری دارند و از سوی چند آژانس تأییدشده عرضه می‌شوند، نرخ تعامل بالاتری ثبت کرده‌اند. همین موضوع باعث شده کارت‌های فید به‌جای متن سنگین، خلاصه و تیز باشند.",
      "برای خواندن سیگنال بازار، بهتر است به ترکیب قیمت، امتیاز فروشنده، و چرخه پاسخ‌گویی نگاه کنید نه فقط یک عدد منفرد.",
    ],
    tags: ["تحلیل بازار", "قیمت", "آگهی تأییدشده"],
    publishedAt: "2026-06-28",
    readTime: 4,
    featured: true,
    media: [
      {
        id: "media-market-signal-cover",
        kind: "image",
        url: "/assets/images/verified-seller-1.webp",
        alt: "تحلیل بازار خودرو",
        caption: "مرور سیگنال های قیمت در بازار صفرکیلومتر",
      },
    ],
    author: {
      name: "مریم رضوی",
      handle: "@maryamrad",
      role: "تحلیل‌گر بازار",
      avatar: "MR",
      verified: true,
    },
    stats: { views: 12840, comments: 64, reposts: 18, likes: 412 },
  },
  {
    slug: "reservation-coming-soon",
    title: "رزرو اشتراک در راه است؛ تجربه خواندن و پیگیری را ساده‌تر می‌کنیم",
    excerpt:
      "اشتراک‌ها و رزروها قرار است با یک لایه سبک و شفاف به وبلاگ اضافه شوند؛ فعلاً این بخش به‌صورت teaser در سایدبار دیده می‌شود.",
    content: [
      "این بخش هنوز آماده نشده و فعلاً فقط در سایدبار معرفی می‌شود تا کاربر بداند رزرو اشتراک در نقشه راه حضور دارد.",
      "پس از فعال شدن، همین مسیر می‌تواند برای پیگیری موضوعات، ذخیره تحلیل‌ها و دریافت اعلان‌های اختصاصی استفاده شود.",
    ],
    tags: ["به‌زودی", "اشتراک", "اعلان"],
    publishedAt: "2026-06-26",
    readTime: 2,
    author: {
      name: "تیم محصول",
      handle: "@zeromarket",
      role: "ZeroMarket",
      avatar: "ZM",
      verified: true,
    },
    stats: { views: 7450, comments: 21, reposts: 11, likes: 265 },
  },
  {
    slug: "verified-agencies-ui",
    title: "چرا آژانس‌های تأییدشده باید در ستون مستقل دیده شوند؟",
    excerpt:
      "وقتی کاربر بین چند منبع عرضه جابه‌جا می‌شود، نمایش هم‌زمان آژانس‌های تأییدشده در ستون کناری اعتماد و سرعت تصمیم‌گیری را بالا می‌برد.",
    content: [
      "ستون چپ برای آژانس‌های تأییدشده فقط یک فهرست نیست؛ یک نشانه بصری از اعتماد است که باید از شلوغی فید جدا بماند.",
      "در این طراحی، آژانس‌ها در همه صفحات وبلاگ قابل مشاهده‌اند و در صفحه مستقل خود هم نسخه کامل‌تری دارند.",
    ],
    tags: ["تجربه کاربری", "اعتماد", "آژانس"],
    publishedAt: "2026-06-23",
    readTime: 3,
    author: {
      name: "نوید کریمی",
      handle: "@navidk",
      role: "طراح محصول",
      avatar: "NK",
      verified: true,
    },
    stats: { views: 9360, comments: 29, reposts: 8, likes: 301 },
  },
  {
    slug: "notifications-as-pages",
    title: "اعلان‌ها فقط یک آیکن نیستند؛ باید به صفحه هم تبدیل شوند",
    excerpt:
      "سایدبار اعلان‌ها سریع است، اما وقتی حجم اعلان‌ها بالا می‌رود، یک صفحه اختصاصی برای مرور و فیلتر کردن لازم می‌شود.",
    content: [
      "برای تجربه‌ای شبیه X.com، اعلان‌ها باید هم در سایدبار باشند و هم در یک صفحه مستقل تا کاربر از خلاصه به جزئیات برود.",
      "در این فاز، اعلان‌ها از یک منبع mock مشترک می‌آیند تا فید و صفحه مستقل همیشه هم‌راستا بمانند.",
    ],
    tags: ["اعلان", "محصول", "صفحه"],
    publishedAt: "2026-06-20",
    readTime: 2,
    author: {
      name: "سارا منصوری",
      handle: "@saram",
      role: "مدیر محتوا",
      avatar: "SM",
      verified: false,
    },
    stats: { views: 8021, comments: 17, reposts: 9, likes: 198 },
  },
  {
    slug: "social-feed-density",
    title: "چطور فید وبلاگ را فشرده کنیم بدون اینکه خوانایی از بین برود؟",
    excerpt:
      "فید باید سریع و قابل اسکن باشد: عنوان کوتاه، خلاصه روشن، متادیتای سبک و اکشن‌های واضح، بدون آنکه حس کارت‌های شلوغ بازار را تکرار کند.",
    content: [
      "الگوی فید اجتماعی به ما می‌گوید که کاربر اول اسکن می‌کند، بعد می‌خواند. پس سلسله‌مراتب تایپوگرافی و فاصله‌ها مهم‌تر از تزئینات هستند.",
      "در این پیاده‌سازی، کارت‌های نوشته بین حالت فشرده و حالت featured تقسیم می‌شوند تا ریتم بصری فید حفظ شود.",
    ],
    tags: ["UI", "فید", "خوانایی"],
    publishedAt: "2026-06-18",
    readTime: 5,
    author: {
      name: "امیر خسروی",
      handle: "@amirx",
      role: "طراح سیستم",
      avatar: "AK",
      verified: true,
    },
    stats: { views: 10920, comments: 44, reposts: 14, likes: 348 },
  },
];

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

export const confirmedAgencies: ConfirmedAgency[] = [
  {
    slug: "parsian-khodro",
    name: "پارسیان خودرو",
    avatar: "PK",
    city: "تهران",
    summary: "عرضه سریع مدل‌های محبوب با پاسخ‌گویی بالا",
    specialties: ["تویوتا", "هیوندای", "کیا"],
    responseTime: "کمتر از ۳۰ دقیقه",
    activeDeals: 12,
    verified: true,
  },
  {
    slug: "bavarian-center",
    name: "باواریان سنتر",
    avatar: "BC",
    city: "تهران",
    summary: "متمرکز بر سدان‌های پریمیوم و موجودی محدود",
    specialties: ["BMW", "MINI", "لوکس"],
    responseTime: "کمتر از ۱ ساعت",
    activeDeals: 6,
    verified: true,
  },
  {
    slug: "star-auto",
    name: "استار خودرو",
    avatar: "SA",
    city: "شیراز",
    summary: "شبکه سراسری با موجودی متنوع برای تحویل سریع",
    specialties: ["شاسی‌بلند", "تحویل فوری", "صفرکیلومتر"],
    responseTime: "کمتر از ۴۵ دقیقه",
    activeDeals: 9,
    verified: true,
  },
  {
    slug: "haval-center",
    name: "مرکز هاوال",
    avatar: "HC",
    city: "تبریز",
    summary: "کارشناسی تخصصی محصولات چینی و هیبریدی",
    specialties: ["هاوال", "جتور", "چری"],
    responseTime: "کمتر از ۲۰ دقیقه",
    activeDeals: 8,
    verified: true,
  },
];

export const blogPosts = seedBlogPosts;

export function getBlogPostBySlug(
  slug: string,
  posts: BlogPost[] = seedBlogPosts,
) {
  return posts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(
  currentSlug: string,
  tags: string[],
  posts: BlogPost[] = seedBlogPosts,
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
