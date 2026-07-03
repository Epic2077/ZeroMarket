import { BlogPostPage } from "@/components/blog/BlogPages";
import { getBlogPostBySlug } from "@/context/blog";
import { notFound } from "next/navigation";

type PageParams = Promise<{ slug: string }>;

export default async function BlogPostRoute({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="pt-16 bg-background">
      <BlogPostPage post={post} />
    </main>
  );
}
