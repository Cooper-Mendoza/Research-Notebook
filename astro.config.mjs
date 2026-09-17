import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Vercel exposes the production domain at build time (and the preview URL on preview builds);
// locally we fall back to the dev server. A custom domain added in Vercel is picked up automatically.
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const site = host ? `https://${host}` : 'http://localhost:4321';

/** Wraps every Markdown/MDX table in a horizontally scrollable region so wide tables never break the phone layout. */
function rehypeTableWrap() {
  return (tree) => {
    const visit = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'], tabIndex: 0, role: 'region', ariaLabel: 'Scrollable table' },
            children: [child],
          };
        }
        visit(child);
        return child;
      });
    };
    visit(tree);
  };
}

export default defineConfig({
  site,
  output: 'static',
  integrations: [mdx(), sitemap()],
  markdown: {
    rehypePlugins: [rehypeTableWrap],
  },
});
