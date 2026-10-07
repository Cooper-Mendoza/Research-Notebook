# Research Notebook

**Live at [coopermendoza.vercel.app](https://coopermendoza.vercel.app)**

Cooper Mendoza's public notebook — company research, book memos, and how the thinking changes over time.

Built with [Astro](https://astro.build) as a fully static site: no client-side JavaScript, self-hosted fonts, ~8 pages under half a megabyte including type.

## Updating the site yourself (no terminal needed)

Everything on the site is a text file in this repository. Change a file on GitHub and Vercel republishes the site about a minute later. If a change breaks the build, the live site simply stays on the last good version — you can't take it down by mistake.

**Add a post**

1. Open the folder for the section on GitHub: [`src/content/research`](src/content/research), [`src/content/book-memos`](src/content/book-memos) or [`src/content/projects`](src/content/projects).
2. Click **Add file → Create new file**. Name it with lowercase words and hyphens, ending in `.md` (e.g. `pge-rate-base.md`). The file name becomes the web address.
3. Paste one of the templates below, replace the text, and write the post underneath in plain Markdown (`## Heading`, `**bold**`, `- list`, tables with `|`).
4. Click **Commit changes…** → **Commit directly to the `main` branch** → **Commit changes**.
5. Wait a minute, then reload the site.

**Edit or hide a post** — open the file on GitHub, click the pencil icon, change the text, commit. To hide a post without deleting it, set `draft: true`; to publish a draft, set it to `false` (or remove the line).

**Add a chart or image** — in the [`public`](public) folder choose **Add file → Upload files**, commit, then reference it in the post as `![What the chart shows](/your-file.png)`.

**Change the About page or homepage text** — edit [`src/pages/about.astro`](src/pages/about.astro) or [`src/pages/index.astro`](src/pages/index.astro); only touch the sentences between the tags.

**See what's happening** — the Vercel dashboard (vercel.com → coopermendoza → Deployments) shows every publish and whether it succeeded.

### Research post template

```yaml
---
title: "Pacific Gas & Electric — a regulated-utility teardown"
date: 2026-10-20
summary: "One or two sentences. Shown on the cards and in link previews."
tags: ["utilities", "equity-analysis"]
stats:
  - { label: "Rate base", value: "$52B", note: "FY2025" }
  - { label: "Allowed ROE", value: "10.0%", note: "CPUC" }
  - { label: "Dividend yield", value: "1.8%", note: "at $20" }
---

## Why I looked at it

Write the post here.
```

### Book memo template

```yaml
---
title: "The Most Important Thing"
author: "Howard Marks"
date: 2026-10-20
summary: "What stuck, what I'd push back on, and how it changed how I think."
tags: ["investing"]
---

Write the memo here.
```

### Project template

```yaml
---
title: "A KPI framework for Dell"
client: "Dell"
date: 2026-10-20
summary: "What the problem was, which metrics I chose and rejected, and why."
tags: ["kpis", "analytics"]
stats:
  - { label: "KPIs tracked", value: "12", note: "across 4 teams" }
---

Write the write-up here.
```

Optional on every post: `readingTime: "9 min read"` (estimated automatically if left out) and `draft: true`.

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
| Research | `src/content/research/*.md(x)` | Inter (built for tables and charts) | optional `stats:` key-figures row |
| Book memos | `src/content/book-memos/*.md` | Source Serif 4 | `author:` |
| Projects | `src/content/projects/*.md(x)` | Inter | optional `stats:`, `client:` |

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
src/components/         Nav, Footer, PostCard, SectionHeader, EmptyState, StatRow
src/pages/              index, research/, book-memos/, projects/, archive, tags/, about, 404
src/styles/global.css   design tokens and prose styles
scripts/brand-assets.mjs favicon + Open Graph image generator
```

Deployed on Vercel; every push to `main` rebuilds the site.
