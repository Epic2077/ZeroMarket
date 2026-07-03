import {
  blogNotifications,
  blogPosts,
  confirmedAgencies,
  getRelatedBlogPosts,
} from "@/context/blog";
import { toFa } from "@/context/carLabels";
import type { BlogPost } from "@/types/blog";
import { Bell, Bookmark, Home, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import BlogPostCard from "./BlogPostCard";

export function BlogRightRail() {
  return (
    <div className="space-y-4">
      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-800">
          <Home size={16} className="text-primary" />
          خانه
        </div>
        <p className="text-xs leading-6 text-muted-foreground">
          خلاصه‌ای از نوشته‌ها، رویدادها و تحلیل‌های تازه.
        </p>
        <Link
          href="/blog"
          className="btn-primary w-full justify-center text-sm"
        >
          رفتن به فید
        </Link>
      </div>

      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-foreground font-800">
            <Bookmark size={16} className="text-accent" />
            رزرو اشتراک
          </div>
          <span className="status-pending">soon</span>
        </div>
        <p className="text-xs leading-6 text-muted-foreground">
          این مسیر هنوز فعال نشده و فعلاً فقط به‌صورت teaser در سایدبار دیده
          می‌شود.
        </p>
      </div>

      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-foreground font-800">
            <Bell size={16} className="text-warning" />
            اعلان‌ها
          </div>
          <Link
            href="/blog/notifications"
            className="text-xs font-700 text-primary"
          >
            همه
          </Link>
        </div>

        <div className="space-y-2">
          {blogNotifications.slice(0, 3).map((notification) => (
            <Link
              key={notification.id}
              href={notification.href ?? "/blog/notifications"}
              className={`block rounded-xl border px-3 py-2.5 transition-colors duration-150 ${notification.unread ? "border-primary/30 bg-primary/5" : "border-border bg-muted/40"}`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.unread ? "bg-primary" : "bg-muted-foreground"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-700 text-foreground">
                    {notification.title}
                  </div>
                  <div className="mt-0.5 text-2xs leading-5 text-muted-foreground">
                    {notification.body}
                  </div>
                  <div className="mt-1 text-2xs text-muted-foreground">
                    {notification.time}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogLeftRail() {
  return (
    <div className="space-y-4">
      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-800">
          <ShieldCheck size={16} className="text-success" />
          آژانس‌های تأییدشده
        </div>
        <p className="text-xs leading-6 text-muted-foreground">
          آژانس‌هایی که سابقه و پاسخ‌گویی آن‌ها در سرتاسر وبلاگ قابل مشاهده است.
        </p>

        <div className="space-y-2">
          {confirmedAgencies.slice(0, 4).map((agency) => (
            <Link
              key={agency.slug}
              href="/blog/agencies"
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 hover:bg-muted transition-colors duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent text-white font-800 text-xs flex items-center justify-center shrink-0">
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
  return (
    <div className="space-y-4">
      {blogNotifications.map((notification) => (
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
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {confirmedAgencies.map((agency) => (
        <article key={agency.slug} className="card-elevated p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-800 text-sm flex items-center justify-center shrink-0">
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
  return (
    <div className="space-y-4">
      <article className="card-elevated p-4 sm:p-5 border-primary/20 bg-gradient-to-br from-background to-primary/5">
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

      {blogPosts.map((post, index) => (
        <BlogPostCard key={post.slug} post={post} featured={index === 0} />
      ))}
    </div>
  );
}

export function BlogRelatedView({ currentPost }: { currentPost: BlogPost }) {
  const relatedPosts = getRelatedBlogPosts(currentPost.slug, currentPost.tags);

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

        <div className="rounded-3xl bg-gradient-to-br from-foreground to-slate-800 p-5 text-white space-y-3">
          <p className="text-sm leading-7 text-slate-200">
            {currentPost.excerpt}
          </p>
          <p className="text-xs leading-6 text-slate-400">
            {currentPost.content[0]}
          </p>
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
