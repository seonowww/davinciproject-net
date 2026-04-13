# Embedded Finance Website Builder

Create a professional Astro-based website for embedded finance/fintech companies with dark theme, modern UI, Squidex CMS integration for blog content, and Railway deployment.

## Usage

When a user wants to create a fintech/embedded finance website, marketing landing page, or similar project, execute the steps below.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Astro 4.x (SSG) |
| **Language** | TypeScript (strict mode) |
| **Styling** | CSS-in-Astro with CSS custom properties |
| **CMS** | Squidex (headless CMS via API) |
| **Deployment** | Railway (Nixpacks) |
| **SEO** | @astrojs/sitemap |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    CONTENT LAYER                              │
│                                                               │
│  Squidex CMS (cloud.squidex.io)                              │
│  ├── App: {APP_NAME}                                         │
│  ├── Schema: blog-posts                                      │
│  │   ├── title (String, required)                            │
│  │   ├── h1 (String)                                         │
│  │   ├── description (String)                                │
│  │   ├── pubDate (DateTime, required)                        │
│  │   ├── heroImage (String)                                  │
│  │   ├── author (String)                                     │
│  │   ├── category (String)                                   │
│  │   ├── tags (Tags)                                         │
│  │   ├── referenceUrl (String)                               │
│  │   ├── featured (Boolean)                                  │
│  │   └── article-text (RichText)                             │
│  └── Assets (images, files)                                  │
└──────────────────────┬───────────────────────────────────────┘
                       │ OAuth2 API (build-time fetch)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    BUILD LAYER (Astro)                        │
│                                                               │
│  src/lib/squidex.ts          — API client, auth, fetch       │
│  src/lib/richTextToHtml.ts   — ProseMirror JSON → HTML        │
│  src/pages/blog/index.astro  — blog list from Squidex        │
│  src/pages/blog/[...slug].astro — individual posts           │
│                                                               │
│  npm run build → dist/ (static HTML)                         │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    DEPLOY LAYER (Railway)                     │
│                                                               │
│  railway.json → Nixpacks build → npx serve dist -l $PORT     │
│  Env vars: SQUIDEX_URL, SQUIDEX_APP, SQUIDEX_CLIENT_ID,      │
│            SQUIDEX_CLIENT_SECRET                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Step 1: Initialize Project

```bash
npm create astro@latest . -- --template minimal --install --no-git --typescript strict
npm install @astrojs/sitemap
```

## Step 2: Create Configuration Files

### `package.json`

```json
{
  "name": "{project-name}",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/sitemap": "^3.0.0"
  }
}
```

### `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://{DOMAIN}.com',
  integrations: [
    sitemap({
      canonicalURLs: true,
      lastmod: true,
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
});
```

### `railway.json`

```json
{
  "$schema": "https://railway.app/schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npx serve dist -l $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

### `.gitignore`

```
node_modules
dist
.env
```

## Step 3: Create Project Structure

```
src/
├── lib/
│   ├── squidex.ts              # Squidex CMS API client
│   └── richTextToHtml.ts       # ProseMirror JSON → HTML converter
├── layouts/
│   └── Layout.astro
├── pages/
│   ├── blog/
│   │   ├── index.astro         # Blog list (from Squidex)
│   │   └── [...slug].astro     # Individual post (from Squidex)
│   ├── index.astro             # Home page
│   ├── about.astro
│   ├── career.astro
│   ├── embedded-finance.astro
│   ├── baas.astro
│   ├── open-banking.astro
│   ├── payment-gateway.astro
│   ├── help.astro
│   ├── docs.astro
│   ├── api.astro
│   └── press.astro
└── env.d.ts
public/
└── favicon.svg
```

## Step 4: Create Squidex CMS App

### 4.1 Create App on Squidex

1. Go to [cloud.squidex.io](https://cloud.squidex.io)
2. Create a new app named `{APP_NAME}` (e.g., `myproject`)
3. Go to **Settings → Clients**
4. Create a client with ID `{APP_NAME}:default`
5. Copy the **Client Secret**

### 4.2 Create Schema

Create a schema named `blog-posts` with these fields:

| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| `title` | String | ✅ | Post title |
| `h1` | String | — | Same as title (for backward compat) |
| `description` | String | — | Short summary |
| `pubDate` | DateTime | ✅ | Publication date |
| `heroImage` | String | — | Image path or URL |
| `author` | String | — | Author name |
| `category` | String | — | Category slug |
| `tags` | Tags | — | Array of tag strings |
| `referenceUrl` | String | — | External link |
| `featured` | Boolean | — | Featured toggle |
| `article-text` | RichText | — | Full article content |

### 4.3 Install Squidex CLI (macOS)

```bash
# Download from GitHub releases
curl -L -o /tmp/squidex.zip "https://github.com/Squidex/squidex-samples/releases/download/cli-v13.13/osx-arm64.zip"
unzip -o /tmp/squidex.zip -d /tmp/squidex-cli
chmod +x /tmp/squidex-cli/sq
codesign --force --sign - /tmp/squidex-cli/sq
sudo mv /tmp/squidex-cli/sq /usr/local/bin/squidex
```

### 4.4 Connect CLI to Squidex

```bash
sq config add {APP_NAME} {APP_NAME}:default {CLIENT_SECRET} -u https://cloud.squidex.io/ --use
```

### 4.5 Import Content (optional)

Use `import_blog_to_squidex.py` script to import from local Markdown files:

```bash
pip3 install python-frontmatter requests
python3 import_blog_to_squidex.py
```

---

## Step 5: Create Core Libraries

### `src/lib/squidex.ts`

```ts
/**
 * Squidex CMS API client
 *
 * Environment variables (set in .env or Railway):
 * - SQUIDEX_URL: https://cloud.squidex.io
 * - SQUIDEX_APP: {APP_NAME}
 * - SQUIDEX_CLIENT_ID: {APP_NAME}:default
 * - SQUIDEX_CLIENT_SECRET: <secret>
 */

const SQUIDEX_URL = import.meta.env.SQUIDEX_URL || 'https://cloud.squidex.io';
const SQUIDEX_APP = import.meta.env.SQUIDEX_APP || '{APP_NAME}';
const SQUIDEX_CLIENT_ID = import.meta.env.SQUIDEX_CLIENT_ID || '{APP_NAME}:default';
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
```

### `src/lib/richTextToHtml.ts`

```ts
/**
 * Convert Squidex RichText (ProseMirror JSON) to HTML string.
 *
 * Supported nodes: heading, paragraph, bulletList, orderedList,
 * listItem, blockquote, codeBlock, horizontalRule, image, text
 */

interface ProseMirrorNode {
  type: string;
  attrs?: Record<string, any>;
  content?: ProseMirrorNode[];
  text?: string;
  marks?: Array<{ type: string }>;
}

export function richTextToHtml(node: ProseMirrorNode | null): string {
  if (!node) return '';
  return renderNode(node);
}

function renderNode(node: ProseMirrorNode): string {
  switch (node.type) {
    case 'doc':
      return (node.content || []).map(renderNode).join('\n');

    case 'heading': {
      const level = node.attrs?.level || 1;
      const clampedLevel = Math.min(Math.max(level, 1), 6);
      const content = renderInlineContent(node.content || []);
      return `<h${clampedLevel}>${content}</h${clampedLevel}>`;
    }

    case 'paragraph': {
      const content = renderInlineContent(node.content || []);
      return `<p>${content}</p>`;
    }

    case 'bulletList': {
      const items = (node.content || []).map(renderNode).join('\n');
      return `<ul>${items}</ul>`;
    }

    case 'orderedList': {
      const items = (node.content || []).map(renderNode).join('\n');
      return `<ol>${items}</ol>`;
    }

    case 'listItem': {
      const content = (node.content || []).map(renderNode).join('');
      return `<li>${content}</li>`;
    }

    case 'blockquote': {
      const content = (node.content || []).map(renderNode).join('\n');
      return `<blockquote>${content}</blockquote>`;
    }

    case 'codeBlock': {
      const text = node.content
        ?.filter((n) => n.type === 'text')
        .map((n) => escapeHtml(n.text || ''))
        .join('');
      return `<pre><code>${text}</code></pre>`;
    }

    case 'horizontalRule':
      return '<hr />';

    case 'image': {
      const src = node.attrs?.src || '';
      const alt = node.attrs?.alt || '';
      const title = node.attrs?.title ? ` title="${escapeHtml(node.attrs.title)}"` : '';
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${title} />`;
    }

    case 'text':
      return renderTextNode(node);

    default:
      return '';
  }
}

function renderTextNode(node: ProseMirrorNode): string {
  let text = escapeHtml(node.text || '');
  const marks = node.marks || [];

  for (const mark of marks) {
    switch (mark.type) {
      case 'code':
        text = `<code>${text}</code>`;
        break;
      case 'strong':
        text = `<strong>${text}</strong>`;
        break;
      case 'em':
        text = `<em>${text}</em>`;
        break;
      case 'link': {
        const href = mark.attrs?.href || '#';
        const target = mark.attrs?.target || '';
        text = `<a href="${escapeHtml(href)}"${target ? ` target="${target}"` : ''}>${text}</a>`;
        break;
      }
    }
  }

  return text;
}

function renderInlineContent(nodes: ProseMirrorNode[]): string {
  return nodes
    .filter((n) => n.type === 'text')
    .map(renderTextNode)
    .join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

## Step 6: Create Blog Pages

### `src/pages/blog/index.astro`

```astro
---
import { getBlogPosts, type BlogPost } from '../../lib/squidex';
import Layout from '../../layouts/Layout.astro';

const posts = await getBlogPosts();
const sortedPosts: BlogPost[] = posts.sort((a, b) => {
  const dateA = new Date(a.pubDate).valueOf();
  const dateB = new Date(b.pubDate).valueOf();
  return dateB - dateA;
});

function formatDateString(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
---

<Layout title="Blog - {Company Name}" description="Latest insights and articles.">
  <section class="blog-index">
    <h1>Blog</h1>
    <p class="subtitle">Insights and articles from our team</p>

    {sortedPosts.length === 0 && (
      <p class="no-posts">No blog posts yet. Check back soon!</p>
    )}

    <div class="posts-grid">
      {sortedPosts.map(post => (
        <article class="post-card">
          <div class="meta">
            <time datetime={new Date(post.pubDate).toISOString()}>
              {formatDateString(post.pubDate)}
            </time>
            {post.category && <span class="category">{post.category}</span>}
          </div>
          <h2><a href={`/blog/${post.slug}`}>{post.title}</a></h2>
          <p>{post.description}</p>
          <a href={`/blog/${post.slug}`} class="read-more">Read more →</a>
        </article>
      ))}
    </div>
  </section>
</Layout>

<style>
  /* Blog list styles — adapt to project design system */
  .blog-index { max-width: 1200px; margin: 0 auto; padding: 4rem 0; }
  h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--text-primary); }
  .subtitle { font-size: 1rem; color: var(--text-secondary); margin-bottom: 3rem; }
  .no-posts { color: var(--text-secondary); text-align: center; padding: 4rem 0; }
  .posts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
  .post-card { background: var(--bg-card); border-radius: 8px; padding: 2rem; border: 1px solid var(--border); transition: border-color 0.3s; }
  .post-card:hover { border-color: var(--accent-primary); }
  .meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.75rem; color: var(--text-secondary); }
  .category { background: var(--accent-primary); color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.65rem; text-transform: uppercase; }
  .post-card h2 { font-size: 1.25rem; margin-bottom: 0.75rem; }
  .post-card h2 a { color: var(--text-primary); text-decoration: none; }
  .post-card h2 a:hover { color: var(--accent-primary); }
  .post-card p { color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem; }
  .read-more { color: var(--accent-primary); text-decoration: none; font-weight: 500; }
</style>
```

### `src/pages/blog/[...slug].astro`

```astro
---
import { getBlogPosts } from '../../lib/squidex';
import { richTextToHtml } from '../../lib/richTextToHtml';
import Layout from '../../layouts/Layout.astro';

export async function getStaticPaths() {
  const posts = await getBlogPosts();
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const articleHtml = richTextToHtml(post.articleText);

function formatDateString(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
---

<Layout title={post.title} description={post.description}>
  <article class="blog-post">
    <header>
      <div class="meta">
        <time datetime={new Date(post.pubDate).toISOString()}>{formatDateString(post.pubDate)}</time>
        {post.category && <span class="category">{post.category}</span>}
      </div>
      <h1>{post.title}</h1>
      <p class="description">{post.description}</p>
      {post.author && <div class="author">By {post.author}</div>}
    </header>

    <div class="content" set:html={articleHtml} />

    <footer>
      {post.tags?.length > 0 && (
        <div class="tags">{post.tags.map(tag => <span class="tag">#{tag}</span>)}</div>
      )}
      {post.referenceUrl && (
        <div class="reference">
          <p>For more information, check out our <a href={post.referenceUrl}>partner resource</a>.</p>
        </div>
      )}
    </footer>
  </article>
</Layout>

<style>
  /* Blog post styles — adapt to project design system */
  .blog-post { max-width: 800px; margin: 0 auto; padding: 4rem 0; }
  header { margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border); }
  .meta { display: flex; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.75rem; color: var(--text-secondary); }
  .category { background: var(--accent-primary); color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.65rem; text-transform: uppercase; }
  h1 { font-size: 2rem; margin-bottom: 1rem; color: var(--text-primary); }
  .description { font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 1.5rem; }
  .author { font-weight: 500; color: var(--text-secondary); }
  .content { line-height: 1.8; color: var(--text-secondary); }
  .content :global(h2) { font-size: 1.5rem; margin: 2.5rem 0 1rem; color: var(--text-primary); }
  .content :global(h3) { font-size: 1.25rem; margin: 2rem 0 0.75rem; color: var(--text-primary); }
  .content :global(p) { margin-bottom: 1.5rem; }
  .content :global(ul), .content :global(ol) { margin-bottom: 1.5rem; padding-left: 1.5rem; }
  .content :global(blockquote) { border-left: 3px solid var(--accent-primary); padding-left: 1.5rem; }
  .content :global(pre) { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; overflow-x: auto; }
  .content :global(code) { background: var(--bg-secondary); padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; color: var(--accent-secondary); }
  .content :global(pre code) { background: none; padding: 0; }
  .content :global(a) { color: var(--accent-primary); }
  footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border); }
  .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .tag { background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem; color: var(--text-secondary); border: 1px solid var(--border); }
</style>
```

## Step 7: Create Layout (`src/layouts/Layout.astro`)

The layout should include:

- Fixed header with logo, navigation links, and CTA button
- Dark theme with CSS custom properties
- Footer with brand info, link columns, and legal links
- Responsive design with mobile breakpoints
- Open Graph and Twitter meta tags

**CSS Variables:**
```css
:root {
  --bg-primary: #0d0d0f;
  --bg-secondary: #141418;
  --bg-card: #18181c;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --accent-primary: #3b82f6;
  --accent-secondary: #06b6d4;
  --border: #2a2a32;
}
```

## Step 8: Create Pages

### Home page (`src/pages/index.astro`)
1. **Hero Section**: Company name, tagline, description, CTA buttons
2. **How It Works**: Diagram showing business ecosystem
3. **Use Cases**: Tabbed interface (Marketplaces, Food Delivery, etc.)
4. **Analytics Section**: Charts with statistics
5. **Stats Section**: Key metrics
6. **Contact Section**: Contact form + details

### Service pages (`embedded-finance.astro`, `baas.astro`, etc.)
- Hero with title, subtitle, description, CTA
- Features grid
- Benefits section
- Contact CTA

---

## Step 9: Launch on a New Domain — Full Checklist

### 9.1 Create Squidex App

1. Go to [cloud.squidex.io](https://cloud.squidex.io)
2. Create new app: `{APP_NAME}` (lowercase, no spaces)
3. **Settings → Clients** → Create client `{APP_NAME}:default`
4. Copy **Client Secret**
5. **Settings → Schemas** → Create `blog-posts` schema (see Step 4.2)
6. Add initial blog posts via Squidex UI or import script

### 9.2 Initialize Project

```bash
npm create astro@latest . -- --template minimal --install --no-git --typescript strict
npm install @astrojs/sitemap
```

Copy all files from this template into the project.

### 9.3 Replace Placeholders

Find and replace throughout the project:

| Placeholder | Replace With |
|-------------|-------------|
| `{APP_NAME}` | Your Squidex app name (e.g., `myproject`) |
| `{DOMAIN}.com` | Your domain (e.g., `example.com`) |
| `{Company Name}` | Your company display name |
| `{CLIENT_SECRET}` | Your Squidex client secret |

Specifically in:
- `astro.config.mjs` → `site`
- `src/lib/squidex.ts` → defaults for env vars
- `src/layouts/Layout.astro` → logo text, links, titles
- `src/pages/blog/index.astro` → `<Layout title=...>`
- All page `.astro` files → company name, contact info

### 9.4 Create `.env` (local development)

```env
SQUIDEX_URL=https://cloud.squidex.io
SQUIDEX_APP={APP_NAME}
SQUIDEX_CLIENT_ID={APP_NAME}:default
SQUIDEX_CLIENT_SECRET=<your-secret-here>
```

### 9.5 Initialize Git & Deploy

```bash
git init
git add .
git commit -m "Initial commit: {Company Name} website"

# Create GitHub repo
gh repo create {repo-name} --public
git remote add origin git@github.com:{user}/{repo-name}.git
git branch -M main
git push -u origin main
```

### 9.6 Setup Railway

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
2. Select your repo
3. **Settings → Variables** → Add:

   | Variable | Value |
   |----------|-------|
   | `SQUIDEX_URL` | `https://cloud.squidex.io` |
   | `SQUIDEX_APP` | `{APP_NAME}` |
   | `SQUIDEX_CLIENT_ID` | `{APP_NAME}:default` |
   | `SQUIDEX_CLIENT_SECRET` | `<your-secret>` |

4. **Settings → Networking** → Add your custom domain
5. Railway will auto-deploy on every push to `main`

### 9.7 Setup DNS

1. In Railway → **Settings → Networking → Domains** → Add your domain
2. Railway will show you the target DNS record
3. In your DNS provider (Cloudflare, Namecheap, etc.):
   - Add CNAME: `www → {railway-domain}.up.railway.app`
   - Or A record pointing to Railway's IP
4. Wait for DNS propagation (5 min – 48 hrs)

### 9.8 Verify

```bash
# Local build test
npm run build

# Check blog renders
curl http://localhost:4321/blog/ | grep -o '<h2>.*</h2>'

# Production check
curl https://{DOMAIN}.com/blog/ | grep -o '<h2>.*</h2>'
```

### 9.9 Update Content Workflow

**For editors:**
1. Log in to [cloud.squidex.io](https://cloud.squidex.io)
2. Open your app → Content → blog-posts
3. Create/edit/publish posts
4. Trigger rebuild on Railway (or set up webhook)

**For rebuild on content change:**
- Option A: Manual — go to Railway → Deployments → Redeploy
- Option B: GitHub Actions cron — `npm run build && git push`
- Option C: Squidex rule → webhook → Railway API trigger

---

## Design Patterns

### Reusable CSS Classes
- `.container` — max-width wrapper (1200px)
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline` — button variants
- `.page-hero` — hero section with gradient background
- `.features-grid`, `.benefits-grid` — grid layouts
- `.feature-card` — hover-animatable cards

### Responsive Breakpoints
- Desktop: > 968px
- Tablet: 600px – 968px
- Mobile: < 600px

### Interactive Elements
- Tab functionality with JS (active states, content switching)
- Form handling with `onsubmit` prevention
- Hover animations on cards and buttons

## Key Principles

- All pages use `Layout.astro` for consistent header/footer
- Styling via inline `<style>` tags (no external CSS files)
- Dark theme by default with blue/cyan accent gradient
- Mobile-first responsive design
- Semantic HTML with proper ARIA attributes
- TypeScript strict mode throughout
- Blog content comes from **Squidex API**, not local Markdown
- RichText (ProseMirror JSON) is converted to HTML at build time
- All API calls happen at **build time** (SSG) — no client-side JS for CMS
