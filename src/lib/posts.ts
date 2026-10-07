import { getCollection, type CollectionEntry } from 'astro:content';

export type PostType = 'research' | 'book-memo' | 'project';

export const KIND_LABEL: Record<PostType, string> = {
  research: 'Research',
  'book-memo': 'Book Memo',
  project: 'Project',
};

export const SECTION_HREF: Record<PostType, string> = {
  research: '/research/',
  'book-memo': '/book-memos/',
  project: '/projects/',
};

/** Collection-agnostic view of a post — used by rows, the homepage, tag pages and the archive. */
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

type AnyEntry = CollectionEntry<'research'> | CollectionEntry<'book-memos'> | CollectionEntry<'projects'>;

/** Drafts stay visible in `astro dev` for previewing and are excluded from the production build. */
export function isPublished(entry: { data: { draft: boolean } }): boolean {
  return import.meta.env.DEV || !entry.data.draft;
}

const newestFirst = (a: { date: Date }, b: { date: Date }) => b.date.getTime() - a.date.getTime();

export async function getResearch(): Promise<CollectionEntry<'research'>[]> {
  return (await getCollection('research', isPublished)).sort((a, b) => newestFirst(a.data, b.data));
}

export async function getBookMemos(): Promise<CollectionEntry<'book-memos'>[]> {
  return (await getCollection('book-memos', isPublished)).sort((a, b) => newestFirst(a.data, b.data));
}

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  return (await getCollection('projects', isPublished)).sort((a, b) => newestFirst(a.data, b.data));
}

/** Every published post across all collections, newest first. */
export async function getAllPosts(): Promise<PostSummary[]> {
  const [research, memos, projects] = await Promise.all([getResearch(), getBookMemos(), getProjects()]);
  return [
    ...research.map((p) => toSummary(p, 'research')),
    ...memos.map((p) => toSummary(p, 'book-memo')),
    ...projects.map((p) => toSummary(p, 'project')),
  ].sort(newestFirst);
}

export function toSummary(entry: AnyEntry, type: PostType): PostSummary {
  return {
    title: entry.data.title,
    date: entry.data.date,
    summary: entry.data.summary,
    readingTime: readingTime(entry.body, entry.data.readingTime),
    href: `${SECTION_HREF[type]}${entry.slug}/`,
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

/** "5 min read" → "5 min" for tight metadata columns. */
export const shortReadingTime = (rt: string): string => rt.replace(/\s*read$/i, '');

/** Frontmatter dates are calendar dates with no time zone — format in UTC so local and Vercel builds agree. */
export function formatDate(date: Date, style: 'short' | 'long' | 'month' = 'short'): string {
  const opts: Intl.DateTimeFormatOptions =
    style === 'month'
      ? { year: 'numeric', month: 'short' }
      : { year: 'numeric', month: style === 'long' ? 'long' : 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}

export const isoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** "1 memo" / "3 memos" */
export const countLabel = (n: number, singular: string, plural = `${singular}s`): string =>
  `${n} ${n === 1 ? singular : plural}`;

/** Tags across a set of posts with counts, most-used first. */
export function collectTags(posts: PostSummary[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export const tagLabel = (tag: string): string => tag.replace(/-/g, ' ');
/** "equity-analysis" → "Equity Analysis" for page titles. */
export const tagTitle = (tag: string): string => tagLabel(tag).replace(/\b\w/g, (c) => c.toUpperCase());
export const tagHref = (tag: string): string => `/tags/${tag}/`;
