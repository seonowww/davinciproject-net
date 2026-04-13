/**
 * Squidex CMS API client
 *
 * Environment variables (set in .env or Railway):
 * - SQUIDEX_URL: https://cloud.squidex.io
 * - SQUIDEX_APP: davinciproject
 * - SQUIDEX_CLIENT_ID: davinciproject:default
 * - SQUIDEX_CLIENT_SECRET: <secret>
 */

const SQUIDEX_URL = import.meta.env.SQUIDEX_URL || 'https://cloud.squidex.io';
const SQUIDEX_APP = import.meta.env.SQUIDEX_APP || 'davinciproject';
const SQUIDEX_CLIENT_ID = import.meta.env.SQUIDEX_CLIENT_ID || 'davinciproject:default';
const SQUIDEX_CLIENT_SECRET = import.meta.env.SQUIDEX_CLIENT_SECRET || '';

let cachedToken: { token: string; expires: number } | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  const response = await fetch(`${SQUIDEX_URL}/identity-server/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SQUIDEX_CLIENT_ID,
      client_secret: SQUIDEX_CLIENT_SECRET,
      scope: 'squidex-api',
    }),
  });

  if (!response.ok) {
    throw new Error(`Squidex auth failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

export interface BlogPost {
  id: string;
  title: string;
  h1: string;
  description: string;
  pubDate: string;
  heroImage: string;
  author: string;
  category: string;
  tags: string[];
  referenceUrl: string;
  featured: boolean;
  articleText: any;
  slug: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const token = await getAuthToken();

  const response = await fetch(
    `${SQUIDEX_URL}/api/content/${SQUIDEX_APP}/blog-posts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch blog posts: ${response.status}`);
  }

  const data = await response.json();

  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.data.title?.iv || '',
    h1: item.data.h1?.iv || '',
    description: item.data.description?.iv || '',
    pubDate: item.data.pubDate?.iv || '',
    heroImage: item.data.heroImage?.iv || '',
    author: item.data.author?.iv || '',
    category: item.data.category?.iv || '',
    tags: item.data.tags?.iv || [],
    referenceUrl: item.data.referenceUrl?.iv || '',
    featured: item.data.featured?.iv || false,
    articleText: item.data['article-text']?.iv || null,
    slug: item.data.title?.iv
      ? item.data.title.iv.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : item.id,
  }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export function getAssetUrl(assetPath: string): string {
  if (!assetPath) return '';
  if (assetPath.startsWith('http')) return assetPath;
  return `${SQUIDEX_URL}${assetPath}`;
}

export function getOptimizedImageUrl(
  appId: string,
  assetId: string,
  options?: { width?: number; height?: number; quality?: number; format?: string }
): string {
  const { width, height, quality = 80, format = 'WEBP' } = options || {};
  let url = `${SQUIDEX_URL}/api/assets/${appId}/${assetId}?quality=${quality}&format=${format}`;
  if (width && height) {
    url += `&width=${width}&height=${height}&mode=Max`;
  }
  return url;
}
