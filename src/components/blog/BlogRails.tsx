"use client";

import { getRelatedBlogPosts } from "@/context/blog";
import { useBlog } from "@/context/BlogProvider";
import { toFa } from "@/context/carLabels";
import { useSession } from "@/context/SessionProvider";
import type { BlogPost } from "@/types/blog";
import {
  Bell,
  Bookmark,
  Compass,
  Home,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BlogMediaPreview } from "./BlogMedia";
import BlogPostCard from "./BlogPostCard";

export function BlogRightRail() {
  const pathname = usePathname();
  const { notifications } = useBlog();
  const { role } = useSession();
  const canCreate = role === "owner" || role === "admin";

  const navItems = [
    { href: "/blog", label: "خانه", icon: Home },
    { href: "/blog/notifications", label: "اعلان ها", icon: Bell },
    { href: "/blog/agencies", label: "آژانس های تاییدشده", icon: Compass },
  ];

  return (
    <div className="space-y-4 xl:sticky xl:top-24">
      <nav className="card-elevated p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/blog" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-700 transition-colors duration-150 ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={18} />
              {item.label}
              {item.href === "/blog/notifications" && (
                <span
                  className={`mr-auto rounded-full px-2 py-0.5 text-2xs ${
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {toFa(notifications.filter((n) => n.unread).length)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-foreground font-800">
            <PencilLine size={16} className="text-accent" />
            انتشار نوشته
          </div>
          {!canCreate && <span className="status-pending">owner/admin</span>}
        </div>

        <p className="text-xs leading-6 text-muted-foreground">
          فقط مالک یا مدیر می تواند نوشته جدید ثبت کند. کاربران عادی همچنان به
          فید و جزئیات دسترسی کامل دارند.
        </p>

        <Link
          href="/blog/new"
          className={`w-full justify-center text-sm ${canCreate ? "btn-primary" : "btn-secondary opacity-80"}`}
          aria-disabled={!canCreate}
        >
          نوشتن پست جدید
        </Link>
      </div>

      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-foreground font-800">
            <Bookmark size={16} className="text-warning" />
            دنبال شده ها
          </div>
          <span className="status-pending">soon</span>
        </div>

        <p className="text-xs leading-6 text-muted-foreground">
          لیست دنبال شده ها در فاز بعدی فعال می شود. در حال حاضر می توانید از
          صفحه اعلان ها برای پیگیری به روزرسانی ها استفاده کنید.
        </p>

        <Link
          href="/blog/notifications"
          className="btn-secondary w-full justify-center text-sm"
        >
          رفتن به اعلان ها
        </Link>
      </div>
    </div>
  );
}

export function BlogLeftRail() {
  const { agencies } = useBlog();

  return (
    <div className="space-y-4 xl:sticky xl:top-24">
      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-800">
          <ShieldCheck size={16} className="text-success" />
          آژانس‌های تأییدشده
        </div>
        <p className="text-xs leading-6 text-muted-foreground">
          آژانس‌هایی که سابقه و پاسخ‌گویی آن‌ها در سرتاسر وبلاگ قابل مشاهده است.
        </p>

        <div className="space-y-2">
          {agencies.slice(0, 4).map((agency) => (
            <Link
              key={agency.slug}
              href="/blog/agencies"
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 hover:bg-muted transition-colors duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent text-white font-800 text-xs flex items-center justify-center shrink-0">
                {agency.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-700 text-foreground truncate">
                    {agency.name}
                  </span>
                  {agency.verified && (
                    <Sparkles size={11} className="text-primary shrink-0" />
                  )}
                </div>
                <div className="text-2xs text-muted-foreground truncate">
                  {agency.city} · {agency.responseTime}
                </div>
                <div className="text-2xs text-muted-foreground truncate">
                  {agency.summary}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/blog/agencies"
          className="btn-secondary w-full justify-center text-sm"
        >
          مشاهده همه آژانس‌ها
        </Link>
      </div>
    </div>
  );
}

export function BlogNotificationsView() {
  const { notifications } = useBlog();

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <article
          key={notification.id}
          className={`card-elevated p-4 ${notification.unread ? "border-primary/20" : ""}`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-2 w-2.5 h-2.5 rounded-full shrink-0 ${notification.unread ? "bg-primary" : "bg-muted-foreground"}`}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-sm sm:text-base font-800 text-foreground">
                  {notification.title}
                </h2>
                <span className="text-2xs text-muted-foreground">
                  {notification.time}
                </span>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                {notification.body}
              </p>
              {notification.href && (
                <Link
                  href={notification.href}
                  className="text-sm font-700 text-primary inline-flex items-center gap-1"
                >
                  مشاهده جزئیات
                </Link>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function BlogAgenciesView() {
  const { agencies } = useBlog();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {agencies.map((agency) => (
        <article key={agency.slug} className="card-elevated p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-accent text-white font-800 text-sm flex items-center justify-center shrink-0">
              {agency.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-800 text-foreground">
                  {agency.name}
                </h2>
                {agency.verified && (
                  <span className="status-active">تأییدشده</span>
                )}
              </div>
              <div className="text-2xs text-muted-foreground mt-0.5">
                {agency.city} · {agency.responseTime}
              </div>
            </div>
          </div>

          <p className="text-sm leading-7 text-muted-foreground">
            {agency.summary}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {agency.specialties.map((specialty) => (
              <span key={specialty} className="filter-chip">
                {specialty}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border text-xs text-muted-foreground">
            <span>{toFa(agency.activeDeals)} معامله فعال</span>
            <span>پیگیری جزئیات</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function BlogFeedView() {
  const { posts } = useBlog();

  return (
    <div className="space-y-4">
      <article className="card-elevated p-4 sm:p-5 border-primary/20 bg-linear-to-br from-background to-primary/5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="section-label">فید</div>
            <h2 className="text-lg sm:text-xl font-800 text-foreground mt-1">
              برای شما
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="status-active">جدیدترین</span>
            <span className="status-pending">دنبال‌شده‌ها</span>
          </div>
        </div>
      </article>

      {posts.map((post, index) => (
        <BlogPostCard key={post.slug} post={post} featured={index === 0} />
      ))}
    </div>
  );
}

export function BlogRelatedView({ currentPost }: { currentPost: BlogPost }) {
  const { posts } = useBlog();
  const relatedPosts = getRelatedBlogPosts(
    currentPost.slug,
    currentPost.tags,
    posts,
  );

  return (
    <div className="space-y-4">
      <article className="card-elevated p-5 space-y-4">
        <div className="section-label">مقاله</div>
        <h1 className="text-2xl sm:text-3xl font-800 text-foreground leading-10">
          {currentPost.title}
        </h1>

        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          <span>{currentPost.author.name}</span>
          <span>•</span>
          <span>{currentPost.author.role}</span>
          <span>•</span>
          <span>{currentPost.publishedAt}</span>
          <span>•</span>
          <span>{toFa(currentPost.readTime)} دقیقه مطالعه</span>
        </div>

        <div className="rounded-3xl bg-linear-to-br from-foreground to-slate-800 p-5 text-white space-y-3">
          <p className="text-sm leading-7 text-slate-200">
            {currentPost.excerpt}
          </p>
          {currentPost.media?.length ? (
            <BlogMediaPreview
              media={currentPost.media}
              className="overflow-hidden rounded-2xl"
            />
          ) : (
            <p className="text-xs leading-6 text-slate-400">
              {currentPost.content[0]}
            </p>
          )}
        </div>

        <div className="space-y-4 text-sm leading-8 text-foreground/90">
          {currentPost.content.slice(1).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-2">
          {currentPost.tags.map((tag) => (
            <span key={tag} className="filter-chip">
              {tag}
            </span>
          ))}
        </div>
      </article>

      <div className="grid gap-4">
        <div className="section-label">نوشته‌های مرتبط</div>
        {relatedPosts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
