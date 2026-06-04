import { defineCollection, z } from 'astro:content';

const statSchema = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().optional(),
});

const research = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    readingTime: z.string(),
    tags: z.array(z.string()).optional(),
    stats: z.array(statSchema).optional(),
  }),
});

const bookMemos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    readingTime: z.string(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { research, 'book-memos': bookMemos };
