import { defineCollection, z } from 'astro:content';

const statSchema = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().optional(),
});

// Fields shared by every post type. Adding a post = adding one file with this frontmatter.
const postFields = {
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
  // Optional — when omitted it is estimated from the body at build time (~220 wpm).
  readingTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // true = keep the file in the repo but leave it out of the public build.
  // Drafts still render in `npm run dev` so they can be previewed locally.
  draft: z.boolean().default(false),
};

const research = defineCollection({
  type: 'content',
  schema: z.object({
    ...postFields,
    // Optional 3-up key-stats row rendered above the body.
    stats: z.array(statSchema).optional(),
  }),
});

const bookMemos = defineCollection({
  type: 'content',
  schema: z.object({
    ...postFields,
    author: z.string(),
  }),
});

export const collections = { research, 'book-memos': bookMemos };
