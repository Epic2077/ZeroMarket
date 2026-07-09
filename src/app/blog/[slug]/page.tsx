import BlogPostRouteClient from "@/components/blog/BlogPostRouteClient";

type PageParams = Promise<{ slug: string }>;

export default async function BlogPostRoute({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  return <BlogPostRouteClient slug={slug} />;
}
