import { supabase } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  tags: string[];
  published_at: string;
  read_time: number;
  featured: boolean;
  source_name: string | null;
  source_url: string | null;
  views_count: number;
  comments_count: number;
  reposts_count: number;
  likes_count: number;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface BlogAuthorRow {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatar: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogMediaRow {
  id: string;
  post_id: string;
  kind: "image" | "video";
  url: string;
  alt: string | null;
  caption: string | null;
  created_at: string;
}

export interface ConfirmedAgencyRow {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  city: string;
  summary: string;
  specialties: string[];
  response_time: string;
  active_deals: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPostWithRelationsRaw {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  tags: string[];
  published_at: string;
  read_time: number;
  featured: boolean;
  source_name: string | null;
  source_url: string | null;
  views_count: number;
  comments_count: number;
  reposts_count: number;
  likes_count: number;
  author: BlogAuthorRow[];
  media: BlogMediaRow[];
}

export interface BlogPostWithRelations {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  tags: string[];
  published_at: string;
  read_time: number;
  featured: boolean;
  source_name: string | null;
  source_url: string | null;
  views_count: number;
  comments_count: number;
  reposts_count: number;
  likes_count: number;
  author: BlogAuthorRow;
  media: BlogMediaRow[];
}

export interface BlogNotificationRow {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchBlogPosts(): Promise<BlogPostWithRelations[]> {
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select(
      `
      slug, title, excerpt, content, tags, published_at, read_time, featured,
      source_name, source_url,
      views_count, comments_count, reposts_count, likes_count,
      author:blog_authors(id, name, handle, role, avatar, verified),
      media:blog_media(id, kind, url, alt, caption)
    `,
    )
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch blog posts: ${error.message}`);

  const rawPosts = (posts ?? []) as BlogPostWithRelationsRaw[];
  return rawPosts.map((post) => ({
    ...post,
    author: post.author[0],
  }));
}

export async function fetchBlogPostBySlug(
  slug: string,
): Promise<BlogPostWithRelations | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      slug, title, excerpt, content, tags, published_at, read_time, featured,
      source_name, source_url,
      views_count, comments_count, reposts_count, likes_count,
      author:blog_authors(id, name, handle, role, avatar, verified),
      media:blog_media(id, kind, url, alt, caption)
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  if (!data) return null;

  const raw = data as BlogPostWithRelationsRaw;
  return {
    ...raw,
    author: raw.author[0],
  };
}

export async function fetchBlogAuthors(): Promise<BlogAuthorRow[]> {
  const { data, error } = await supabase
    .from("blog_authors")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to fetch blog authors: ${error.message}`);
  return (data ?? []) as BlogAuthorRow[];
}

export async function createBlogAuthor(
  author: Omit<BlogAuthorRow, "id" | "created_at" | "updated_at">,
): Promise<BlogAuthorRow | null> {
  const { data, error } = await supabase
    .from("blog_authors")
    .insert(author)
    .select()
    .single();

  if (error) throw error;
  return data as BlogAuthorRow;
}

export async function fetchConfirmedAgencies(): Promise<ConfirmedAgencyRow[]> {
  const { data, error } = await supabase
    .from("confirmed_agencies")
    .select("*")
    .order("name", { ascending: true });

  if (error)
    throw new Error(`Failed to fetch confirmed agencies: ${error.message}`);
  return (data ?? []) as ConfirmedAgencyRow[];
}

export async function updateConfirmedAgency(
  id: string,
  updates: Partial<
    Omit<ConfirmedAgencyRow, "id" | "slug" | "created_at" | "updated_at">
  >,
): Promise<ConfirmedAgencyRow | null> {
  const { data, error } = await supabase
    .from("confirmed_agencies")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ConfirmedAgencyRow;
}

export async function createBlogPost(
  client: SupabaseClient,
  post: Omit<BlogPostRow, "id" | "created_at" | "updated_at">,
): Promise<BlogPostRow | null> {
  const { data, error } = await client
    .from("blog_posts")
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data as BlogPostRow;
}

export async function createBlogMedia(
  client: SupabaseClient,
  media: Omit<BlogMediaRow, "id" | "created_at">[],
): Promise<BlogMediaRow[] | null> {
  const { data, error } = await client
    .from("blog_media")
    .insert(media)
    .select();

  if (error) throw error;
  return data as BlogMediaRow[];
}

export async function fetchBlogNotifications(): Promise<BlogNotificationRow[]> {
  const { data, error } = await supabase
    .from("blog_notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error)
    throw new Error(`Failed to fetch blog notifications: ${error.message}`);
  return (data ?? []) as BlogNotificationRow[];
}
