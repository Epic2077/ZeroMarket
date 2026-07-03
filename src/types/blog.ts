export interface BlogAuthor {
  name: string;
  handle: string;
  role: string;
  avatar: string;
  verified: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  tags: string[];
  publishedAt: string;
  readTime: number;
  featured?: boolean;
  author: BlogAuthor;
  stats: {
    views: number;
    comments: number;
    reposts: number;
    likes: number;
  };
}

export interface BlogNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href?: string;
}

export interface ConfirmedAgency {
  slug: string;
  name: string;
  avatar: string;
  city: string;
  summary: string;
  specialties: string[];
  responseTime: string;
  activeDeals: number;
  verified: boolean;
}
