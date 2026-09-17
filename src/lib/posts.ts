import { getCollection, type CollectionEntry } from 'astro:content';

export type PostType = 'research' | 'book-memo';

/** Collection-agnostic view of a post — used by cards, the homepage, tag pages and (later) the archive. */
export interface PostSummary {
  title: string;
  date: Date;
  summary: string;
  readingTime: string;
  href: string;
  type: PostType;
  author?: string;
  tags: string[];
  draft: boolean;
}

/** Drafts stay visible in `astro dev` for previewing and are excluded from the production build. */
export function isPublished(entry: { data: { draft: boolean } }): boolean {
  return import.meta.env.DEV || !entry.data.draft;
}

const newestFirst = (a: { date: Date }, b: { date: Date }) => b.date.getTime() - a.date.getTime();

export async function getResearch(): Promise<CollectionEntry<'research'>[]> {
  const entries = await getCollection('research', isPublished);
  return entries.sort((a, b) => newestFirst(a.data, b.data));
}

export async function getBookMemos(): Promise<CollectionEntry<'book-memos'>[]> {
  const entries = await getCollection('book-memos', isPublished);
  return entries.sort((a, b) => newestFirst(a.data, b.data));
}

/** Every published post across both collections, newest first. A future /archive page is just this list. */
export async function getAllPosts(): Promise<PostSummary[]> {
  const [research, memos] = await Promise.all([getResearch(), getBookMemos()]);
  return [
    ...research.map((p) => toSummary(p, 'research', `/research/${p.slug}/`)),
    ...memos.map((p) => toSummary(p, 'book-memo', `/book-memos/${p.slug}/`)),
  ].sort(newestFirst);
}

export function toSummary(
  entry: CollectionEntry<'research'> | CollectionEntry<'book-memos'>,
  type: PostType,
  href: string,
): PostSummary {
  return {
    title: entry.data.title,
    date: entry.data.date,
    summary: entry.data.summary,
    readingTime: readingTime(entry.body, entry.data.readingTime),
    href,
    type,
    author: 'author' in entry.data ? entry.data.author : undefined,
    tags: entry.data.tags ?? [],
    draft: entry.data.draft,
  };
}

/** Uses the frontmatter value when given, otherwise estimates from the body at ~220 words per minute. */
export function readingTime(body: string, explicit?: string): string {
  if (explicit) return explicit;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

/** Frontmatter dates are calendar dates with no time zone — format in UTC so local and Vercel builds agree. */
export function formatDate(date: Date, style: 'short' | 'long' = 'short'): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export const isoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Tags across a set of posts with counts, most-used first. */
export function collectTags(posts: PostSummary[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export const tagLabel = (tag: string): string => tag.replace(/-/g, ' ');
export const tagHref = (tag: string): string => `/tags/${tag}/`;
