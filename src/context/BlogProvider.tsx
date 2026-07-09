"use client";

import {
  blogNotifications as seedBlogNotifications,
  confirmedAgencies as seedConfirmedAgencies,
  seedBlogPosts,
} from "@/context/blog";
import type {
  BlogAuthor,
  BlogMedia,
  BlogNotification,
  BlogPost,
  ConfirmedAgency,
} from "@/types/blog";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const BLOG_POSTS_STORAGE_KEY = "zeromarket.blog.posts.v1";

export interface BlogCreateInput {
  title: string;
  excerpt: string;
  content: string[];
  tags: string[];
  featured?: boolean;
  media?: BlogMedia[];
  author: BlogAuthor;
}

interface BlogContextValue {
  posts: BlogPost[];
  notifications: BlogNotification[];
  agencies: ConfirmedAgency[];
  hydrated: boolean;
  getPostBySlug: (slug: string) => BlogPost | undefined;
  createPost: (input: BlogCreateInput) => string;
}

const BlogContext = createContext<BlogContextValue | null>(null);

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const estimateReadMinutes = (blocks: string[]) => {
  const words = blocks.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const toPersianDate = (date = new Date()) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>(seedBlogPosts);
  const [hydrated, setHydrated] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BLOG_POSTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BlogPost[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
        }
      }
    } catch {
      setPosts(seedBlogPosts);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(BLOG_POSTS_STORAGE_KEY, JSON.stringify(posts));
  }, [posts, hydrated]);

  const getPostBySlug = useCallback(
    (slug: string) => posts.find((post) => post.slug === slug),
    [posts],
  );

  const createPost = useCallback((input: BlogCreateInput) => {
    const baseSlug = toSlug(input.title) || "new-post";
    const nextSlug = `${baseSlug}-${Date.now()}-${(seq.current += 1)}`;

    const nextPost: BlogPost = {
      slug: nextSlug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      tags: input.tags,
      featured: Boolean(input.featured),
      media: input.media,
      publishedAt: toPersianDate(),
      readTime: estimateReadMinutes(input.content),
      author: input.author,
      stats: {
        views: 0,
        comments: 0,
        reposts: 0,
        likes: 0,
      },
    };

    setPosts((prev) => [nextPost, ...prev]);
    return nextSlug;
  }, []);

  const value = useMemo<BlogContextValue>(
    () => ({
      posts,
      notifications: seedBlogNotifications,
      agencies: seedConfirmedAgencies,
      hydrated,
      getPostBySlug,
      createPost,
    }),
    [posts, hydrated, getPostBySlug, createPost],
  );

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const ctx = useContext(BlogContext);
  if (!ctx) {
    throw new Error("useBlog must be used within a <BlogProvider>");
  }
  return ctx;
}
