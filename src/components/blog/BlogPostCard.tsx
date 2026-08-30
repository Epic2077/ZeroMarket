import { toFa } from "@/context/carLabels";
import type { BlogPost } from "@/types/blog";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Repeat2,
  Sparkles,
  Eye,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { BlogMediaPreview } from "./BlogMedia";

interface Props {
  post: BlogPost;
  featured?: boolean;
}

const accentClasses = [
  "from-sky-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-violet-500 to-fuchsia-400",
];

function toneForSlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }

  return accentClasses[Math.abs(hash) % accentClasses.length];
}

export default function BlogPostCard({ post, featured = false }: Props) {
  const tone = toneForSlug(post.slug);

  return (
    <article
      className={`card-elevated card-hover overflow-hidden ${featured ? "border-primary/20" : ""}`}
    >
      <Link href={`/blog/${post.slug}`} className="block p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-800 text-xs shrink-0 bg-linear-to-br ${tone}`}
          >
            {post.author.avatar}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-sm sm:text-base font-800 text-foreground truncate">
                    {post.author.name}
                  </h2>
                  {post.author.verified && (
                    <span className="inline-flex items-center gap-1 text-2xs font-700 text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Sparkles size={10} />
                      تأییدشده
                    </span>
                  )}
                </div>
                <div className="text-2xs sm:text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{post.author.handle}</span>
                  <span>•</span>
                  <span>{post.author.role}</span>
                  <span>•</span>
                  <span>{post.publishedAt}</span>
                  <span>•</span>
                  <span>{toFa(post.readTime)} دقیقه</span>
                </div>
              </div>

              {featured && <span className="status-active shrink-0">ویژه</span>}
            </div>

            <div className={`mt-3 ${featured ? "space-y-4" : "space-y-3"}`}>
              <div>
                <h3
                  className={`${featured ? "text-xl sm:text-2xl" : "text-lg"} font-800 text-foreground leading-8`}
                >
                  {post.title}
                </h3>
                <p className="mt-2 text-sm sm:text-[15px] leading-7 text-muted-foreground">
                  {post.excerpt}
                </p>
              </div>

              <div
                className={`rounded-2xl bg-linear-to-br ${tone} p-4 text-white/90`}
              >
                {post.media?.length ? (
                  <BlogMediaPreview
                    media={post.media}
                    className="overflow-hidden rounded-xl"
                  />
                ) : (
                  <p className="text-xs sm:text-sm leading-6 line-clamp-3">
                    {post.content[0]}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="filter-chip">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Eye size={13} />
                    {toFa(post.stats.views)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle size={13} />
                    {toFa(post.stats.comments)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Repeat2 size={13} />
                    {toFa(post.stats.reposts)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart size={13} />
                    {toFa(post.stats.likes)}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 font-700 text-primary">
                  ادامه مطلب
                  <ArrowLeft size={13} className="rotate-180" />
                </span>
              </div>

              {(post.sourceName || post.sourceUrl) && (
                <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
                  <LinkIcon size={12} className="shrink-0" />
                  <span className="font-700 text-foreground">منبع:</span>
                  {post.sourceUrl ? (
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate max-w-[200px]"
                    >
                      {post.sourceName || post.sourceUrl}
                    </a>
                  ) : (
                    <span className="text-foreground">{post.sourceName}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
