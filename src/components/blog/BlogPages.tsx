import type { BlogPost } from "@/types/blog";
import BlogComposer from "./BlogComposer";
import BlogShell from "./BlogShell";
import {
  BlogAgenciesView,
  BlogFeedView,
  BlogLeftRail,
  BlogNotificationsView,
  BlogRelatedView,
  BlogRightRail,
} from "./BlogRails";

export function BlogHomePage() {
  return (
    <BlogShell
      title="وبلاگ، تحلیل و خبرهای ZeroMarket"
      description="فیدی فشرده و شبیه شبکه‌های اجتماعی برای خبرها، تحلیل‌های بازار، و نوشته‌های کوتاه درباره خرید خودروهای صفرکیلومتر."
      rightRail={<BlogRightRail />}
      leftRail={<BlogLeftRail />}
    >
      <BlogFeedView />
    </BlogShell>
  );
}

export function BlogNotificationsPage() {
  return (
    <BlogShell
      title="اعلان‌ها"
      description="اعلان‌های مهم، به‌روزرسانی‌های فید و ارجاع‌ها در یک صفحه مستقل مرور می‌شوند."
      rightRail={<BlogRightRail />}
      leftRail={<BlogLeftRail />}
    >
      <BlogNotificationsView />
    </BlogShell>
  );
}

export function BlogAgenciesPage() {
  return (
    <BlogShell
      title="آژانس‌های تأییدشده"
      description="فهرست کامل آژانس‌هایی که در وبلاگ و فید با نشان تأیید نمایش داده می‌شوند."
      rightRail={<BlogRightRail />}
      leftRail={<BlogLeftRail />}
    >
      <BlogAgenciesView />
    </BlogShell>
  );
}

export function BlogPostPage({ post }: { post: BlogPost }) {
  return (
    <BlogShell
      title="جزئیات نوشته"
      description="مقاله کامل با ریتمی مشابه فید اصلی، اما با تمرکز بیشتر روی متن و نوشته‌های مرتبط."
      rightRail={<BlogRightRail />}
      leftRail={<BlogLeftRail />}
    >
      <BlogRelatedView currentPost={post} />
    </BlogShell>
  );
}

export function BlogCreatePage() {
  return (
    <BlogShell
      title="نوشتن پست جدید"
      description="مدیر یا مالک می تواند پست تازه منتشر کند، به آن تصویر یا ویدیو اضافه کند و بلافاصله در فید نمایش دهد."
      rightRail={<BlogRightRail />}
      leftRail={<BlogLeftRail />}
    >
      <BlogComposer />
    </BlogShell>
  );
}
