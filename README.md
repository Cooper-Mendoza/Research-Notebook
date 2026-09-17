# Research Notebook

Cooper Mendoza's public notebook — company research, book memos, and how the thinking changes over time.

Built with [Astro](https://astro.build) as a fully static site: no client-side JavaScript, self-hosted fonts, ~8 pages under half a megabyte including type.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run assets     # regenerate favicon / share image from the site's own fonts
```

## Adding a post

Drop one Markdown/MDX file into a collection and it appears everywhere it should — the section listing, the homepage, tag pages, the sitemap.

| Collection | Folder | Body font | Extras |
|---|---|---|---|
| Research | `src/content/research/*.mdx` | Inter (built for tables and charts) | optional `stats:` key-figures row |
| Book memos | `src/content/book-memos/*.md` | Newsreader | `author:` |

Frontmatter:

```yaml
title: "Title"
date: 2026-09-17
summary: "One or two sentences shown on cards and in link previews."
tags: ["utilities", "equity-analysis"]   # optional; tag pages are generated from these
readingTime: "9 min read"                # optional; estimated from the body when omitted
draft: true                              # optional; keeps the file out of the public build
stats:                                   # research only, optional
  - { label: "Rate base", value: "$52B", note: "FY2025" }
```

Drafts still render under `npm run dev` for previewing. Charts exported from R/ggplot go in `public/` and are referenced as `![caption](/chart.png)`.

## Structure

```
src/content/config.ts   frontmatter schema (Zod)
src/lib/posts.ts        published-post queries, dates, reading time, tags
src/layouts/            Base (head/meta) → Page (nav/footer) → ResearchPost / ProsePost
src/components/         Nav, PostCard, StatRow, Footer, Eyebrow
src/pages/              index, research/, book-memos/, tags/, about, 404
src/styles/global.css   design tokens and prose styles
scripts/brand-assets.mjs favicon + Open Graph image generator
```

Deployed on Vercel; every push to `main` rebuilds the site.
