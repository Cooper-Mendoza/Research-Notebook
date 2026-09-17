import type { APIRoute } from 'astro';

// Built to dist/robots.txt. The sitemap URL follows `site` in astro.config.mjs,
// which Vercel fills in from the production domain at build time.
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
