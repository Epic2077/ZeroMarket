"use client";

import { BlogPostPage } from "@/components/blog/BlogPages";
import { useBlog } from "@/context/BlogProvider";
import Link from "next/link";

export default function BlogPostRouteClient({ slug }: { slug: string }) {
  const { hydrated, getPostBySlug } = useBlog();
  const post = getPostBySlug(slug);

  if (!hydrated) {
    return (
      <main className="pt-16 bg-background">
        <section
          className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-10"
          dir="rtl"
        >
          <div className="card-elevated p-6 text-sm text-muted-foreground">
            در حال بارگذاری نوشته...
          </div>
        </section>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="pt-16 bg-background">
        <section
          className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-10"
          dir="rtl"
        >
          <div className="card-elevated p-6 space-y-3 text-center">
            <h1 className="text-lg font-800 text-foreground">نوشته پیدا نشد</h1>
            <p className="text-sm text-muted-foreground">
              ممکن است لینک تغییر کرده باشد یا این نوشته حذف شده باشد.
            </p>
            <Link href="/blog" className="btn-secondary inline-flex text-sm">
              بازگشت به فید وبلاگ
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-16 bg-background">
      <BlogPostPage post={post} />
    </main>
  );
}
