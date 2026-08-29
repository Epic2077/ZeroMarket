"use client";

import {
  fetchBlogPosts,
  fetchBlogAuthors,
  fetchConfirmedAgencies,
  fetchBlogNotifications,
  createBlogPost,
  createBlogMedia,
  type BlogPostWithRelations,
  type BlogAuthorRow,
  type ConfirmedAgencyRow,
  type BlogNotificationRow,
} from "@/lib/supabase/blog";
import type {
  BlogAuthor,
  BlogMedia,
  BlogNotification,
  BlogPost,
  ConfirmedAgency,
} from "@/types/blog";
import { supabase } from "@/lib/supabase/client";
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

export interface BlogCreateInput {
  title: string;
  excerpt: string;
  content: string[];
  tags: string[];
  featured?: boolean;
  media?: BlogMedia[];
  author: BlogAuthor;
  sourceName?: string;
  sourceUrl?: string;
}

interface BlogContextValue {
  posts: BlogPost[];
  notifications: BlogNotification[];
  agencies: ConfirmedAgency[];
  authors: BlogAuthor[];
  hydrated: boolean;
  loading: boolean;
  getPostBySlug: (slug: string) => BlogPost | undefined;
  createPost: (input: BlogCreateInput) => Promise<string>;
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

function convertSupabasePostToFrontend(item: BlogPostWithRelations): BlogPost {
  return {
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    tags: item.tags,
    publishedAt: item.published_at,
    readTime: item.read_time,
    featured: item.featured,
    media: item.media.map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      alt: m.alt ?? undefined,
      caption: m.caption ?? undefined,
    })),
    author: {
      id: item.author.id,
      name: item.author.name,
      handle: item.author.handle,
      role: item.author.role,
      avatar: item.author.avatar ?? "",
      verified: item.author.verified,
    },
    stats: {
      views: item.views_count,
      comments: item.comments_count,
      reposts: item.reposts_count,
      likes: item.likes_count,
    },
    sourceName: item.source_name ?? undefined,
    sourceUrl: item.source_url ?? undefined,
  };
}

function convertSupabaseAuthorToFrontend(author: BlogAuthorRow): BlogAuthor {
  return {
    id: author.id,
    name: author.name,
    handle: author.handle,
    role: author.role,
    avatar: author.avatar ?? "",
    verified: author.verified,
  };
}

function convertSupabaseAgencyToFrontend(
  agency: ConfirmedAgencyRow,
): ConfirmedAgency {
  return {
    slug: agency.slug,
    name: agency.name,
    avatar: agency.avatar,
    city: agency.city,
    summary: agency.summary,
    specialties: agency.specialties,
    responseTime: agency.response_time,
    activeDeals: agency.active_deals,
    verified: agency.verified,
    id: agency.id,
  };
}

function convertSupabaseNotificationToFrontend(
  notification: BlogNotificationRow,
): BlogNotification {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    time: notification.time,
    unread: notification.unread,
    href: notification.href ?? undefined,
  };
}

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [agencies, setAgencies] = useState<ConfirmedAgency[]>([]);
  const [notifications, setNotifications] = useState<BlogNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [postsData, authorsData, agenciesData, notificationsData] =
          await Promise.all([
            fetchBlogPosts(),
            fetchBlogAuthors(),
            fetchConfirmedAgencies(),
            fetchBlogNotifications(),
          ]);

        if (!mounted) return;

        setPosts(postsData.map(convertSupabasePostToFrontend));
        setAuthors(authorsData.map(convertSupabaseAuthorToFrontend));
        setAgencies(agenciesData.map(convertSupabaseAgencyToFrontend));
        setNotifications(
          notificationsData.map(convertSupabaseNotificationToFrontend),
        );
      } catch (error) {
        console.error(
          "Failed to load blog data:",
          error instanceof Error ? error.message : JSON.stringify(error),
        );
        setPosts([]);
        setAuthors([]);
        setAgencies([]);
        setNotifications([]);
      } finally {
        if (mounted) {
          setHydrated(true);
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const getPostBySlug = useCallback(
    (slug: string) => posts.find((post) => post.slug === slug),
    [posts],
  );

  const createPost = useCallback(async (input: BlogCreateInput) => {
    const baseSlug = toSlug(input.title) || "new-post";
    const nextSlug = `${baseSlug}-${Date.now()}`;

    const postData = {
      slug: nextSlug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      tags: input.tags,
      published_at: new Date().toISOString(),
      read_time: estimateReadMinutes(input.content),
      featured: Boolean(input.featured),
      source_name: input.sourceName ?? null,
      source_url: input.sourceUrl ?? null,
      views_count: 0,
      comments_count: 0,
      reposts_count: 0,
      likes_count: 0,
      author_id: input.author.id ?? "default-author",
    };

    const createdPost = await createBlogPost(supabase, postData);

    if (!createdPost) {
      throw new Error("Failed to create post");
    }

    if (input.media && input.media.length > 0) {
      const mediaData = input.media.map((m) => ({
        post_id: createdPost.id,
        kind: m.kind,
        url: m.url,
        alt: m.alt ?? null,
        caption: m.caption ?? null,
      }));
      await createBlogMedia(supabase, mediaData);
    }

    const newPost: BlogPost = {
      slug: createdPost.slug,
      title: createdPost.title,
      excerpt: createdPost.excerpt,
      content: createdPost.content,
      tags: createdPost.tags,
      publishedAt: toPersianDate(),
      readTime: createdPost.read_time,
      featured: createdPost.featured,
      media: input.media,
      author: input.author,
      stats: {
        views: 0,
        comments: 0,
        reposts: 0,
        likes: 0,
      },
      sourceName: input.sourceName,
      sourceUrl: input.sourceUrl,
    };

    setPosts((prev) => [newPost, ...prev]);
    return nextSlug;
  }, []);

  const value = useMemo<BlogContextValue>(
    () => ({
      posts,
      notifications,
      agencies,
      authors,
      hydrated,
      loading,
      getPostBySlug,
      createPost,
    }),
    [
      posts,
      notifications,
      agencies,
      authors,
      hydrated,
      loading,
      getPostBySlug,
      createPost,
    ],
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
