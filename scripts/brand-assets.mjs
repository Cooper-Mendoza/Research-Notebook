#!/usr/bin/env node
/**
 * Generates the site's brand assets in public/ from the same font files the site ships,
 * so the marks match the header exactly and never depend on a font being installed:
 *   favicon.svg           — CM tile with the letterforms as paths (renders in every favicon context)
 *   favicon.png           — 32×32 raster fallback (Safari and older browsers)
 *   apple-touch-icon.png  — 180×180 iOS home-screen icon
 *   og-default.png        — 1200×630 Open Graph image for LinkedIn / iMessage / Slack previews
 * Run: npm run assets
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ot from 'opentype.js';
import sharp from 'sharp';

const opentype = ot.parse ? ot : ot.default;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (file) => path.join(root, 'public', file);

const PAPER = '#F4EFE6', INK = '#2B2620', ORANGE = '#BF5700', SUBTLE = '#6F635A', BORDER = '#DDD6CB';

function loadFont(pkg, file) {
  const buf = readFileSync(path.join(root, 'node_modules/@fontsource', pkg, 'files', file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
const fraunces = loadFont('fraunces', 'fraunces-latin-500-normal.woff');
const mono = loadFont('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff');
const newsreader = loadFont('newsreader', 'newsreader-latin-400-normal.woff');

/** Text as an SVG path, positioned by its ink box. letterSpacing is in em. */
function text(font, str, { size, x, y, letterSpacing = 0, anchor = 'start', vAlign = 'baseline', fill }) {
  // kerning: false — opentype.js returns NaN kerning offsets for these WOFF files, which stops SVG rendering mid-word.
  const opts = { kerning: false, letterSpacing };
  const probe = font.getPath(str, 0, 0, size, opts).getBoundingBox();
  const width = probe.x2 - probe.x1;
  const dx = anchor === 'middle' ? x - probe.x1 - width / 2 : anchor === 'end' ? x - probe.x2 : x - probe.x1;
  const dy = vAlign === 'middle' ? y - (probe.y1 + probe.y2) / 2 : y;
  const p = font.getPath(str, dx, dy, size, opts);
  const d = p.toPathData(2);
  if (d.includes("NaN")) throw new Error(`Bad outline while rendering "${str}"`);
  return { svg: `<path d="${d}" fill="${fill}"/>`, width };
}

/** The CM monogram tile. Use radius 0 for iOS, which applies its own corner mask. */
function tile({ size = 100, radius = 22, px } = {}) {
  const cm = text(fraunces, 'CM', {
    size: size * 0.46, x: size / 2, y: size / 2, letterSpacing: -0.02, anchor: 'middle', vAlign: 'middle', fill: PAPER,
  });
  const dims = px ? ` width="${px}" height="${px}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"${dims}>
  <rect width="${size}" height="${size}" rx="${radius}" fill="${ORANGE}"/>
  ${cm.svg}
</svg>`;
}

function ogImage() {
  const W = 1200, H = 630, M = 80, T = 96;
  const tileCM = text(fraunces, 'CM', {
    size: T * 0.46, x: M + T / 2, y: M + T / 2, letterSpacing: -0.02, anchor: 'middle', vAlign: 'middle', fill: PAPER,
  });
  const name = text(fraunces, 'Cooper Mendoza', { size: 96, x: M, y: 318, letterSpacing: -0.02, fill: INK });
  const eyebrow = text(mono, 'RESEARCH NOTEBOOK · UT AUSTIN MCCOMBS', { size: 22, x: M, y: 378, letterSpacing: 0.16, fill: ORANGE });
  let size = 34, tagline;
  do {
    tagline = text(newsreader, 'Company research, book memos, and how my thinking changes over time.', { size, x: M, y: 470, fill: SUBTLE });
    size -= 1;
  } while (tagline.width > W - 2 * M && size > 20);
  const footer = text(mono, 'AUSTIN, TEXAS', { size: 18, x: M, y: 556, letterSpacing: 0.16, fill: SUBTLE });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect x="${M}" y="${M}" width="${T}" height="${T}" rx="21" fill="${ORANGE}"/>
  ${tileCM.svg}
  ${name.svg}
  ${eyebrow.svg}
  ${tagline.svg}
  <rect x="${M}" y="510" width="${W - 2 * M}" height="1" fill="${BORDER}"/>
  ${footer.svg}
</svg>`;
}

async function png(svg, file, { width } = {}) {
  let img = sharp(Buffer.from(svg));
  if (width) img = img.resize(width, width);
  await img.png({ compressionLevel: 9 }).toFile(out(file));
}

writeFileSync(out('favicon.svg'), tile() + '\n');
await png(tile({ px: 512 }), 'favicon.png', { width: 32 });
await png(tile({ radius: 0, px: 180 }), 'apple-touch-icon.png');
await png(ogImage(), 'og-default.png');
console.log('wrote public/favicon.svg, favicon.png, apple-touch-icon.png, og-default.png');
