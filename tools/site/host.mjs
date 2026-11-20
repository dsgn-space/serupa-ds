// What the built site needs to be served as a website (Cloudflare Pages reads these files; a host that doesn't simply
// ignores them). The build (tools/site/vite.config.mjs) calls writeHostFiles after it writes index.html:
// - a copy of index.html for every address (/components/button is components/button.html), each with its own title,
//   description, canonical address and link-preview tags (tools/site/head.mjs), so a crawler or a chat app that
//   reads the page without running it gets that page, not the front page's;
// - 404.html, which the host sends with a 404 for an address the site has no page for: the site's own "no page here";
// - _redirects, which serves /frame/<story> (one story drawn alone for a frame on the site's own pages) from index.html;
// - _headers: hashed assets cached for a year, and the security headers, the Content-Security-Policy with the hash of
//   each inline script (theme.js, which sets the theme before the first paint);
// - sitemap.xml and robots.txt. The sitemap, the canonical addresses and the preview image need the site's own
//   address: SERUPA_SITE_URL (https://serupa.example.com), set where the site is built for going live.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { siteRoutes } from './head.mjs';

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The Content-Security-Policy for a page whose only inline scripts are these. */
export function contentSecurityPolicy(inlineScripts) {
  const hashes = inlineScripts.map((s) => `'sha256-${crypto.createHash('sha256').update(s).digest('base64')}'`);
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`,
    // The components set inline styles (positions, sizes, custom properties), and some stories write a <style>.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'self' blob:",
    "frame-ancestors 'self'",
    "worker-src 'self' blob:",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

/** The inline scripts of a page: what a CSP hash has to cover. */
export const inlineScripts = (html) => [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

/**
 * Writes the host's files beside the built index.html.
 * @param {string} outDir
 * @param {{ base?: string, siteUrl?: string, root?: string }} [options]
 */
export function writeHostFiles(outDir, { base = '/', siteUrl = '', root } = {}) {
  const url = siteUrl.replace(/\/+$/, '');
  const at = (p) => base.replace(/\/$/, '') + p;
  const absolute = (p) => url + at(p);
  const index = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');

  /** index.html with this title and description, and the tags that go with them. */
  const page = (title, description, p, { noindex = false } = {}) => {
    const tags = [
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="Serupa" />`,
      `<meta property="og:title" content="${escape(title)}" />`,
      `<meta property="og:description" content="${escape(description)}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      ...(url && p ? [`<link rel="canonical" href="${escape(absolute(p))}" />`, `<meta property="og:url" content="${escape(absolute(p))}" />`] : []),
      ...(url ? [`<meta property="og:image" content="${escape(absolute('/og.png'))}" />`, `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`, `<meta property="og:image:alt" content="Serupa, a design system" />`] : []),
      ...(noindex ? ['<meta name="robots" content="noindex" />'] : []),
    ];
    return index
      .replace(/<title>[^<]*<\/title>/, () => `<title>${escape(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>/, () => `<meta name="description" content="${escape(description)}" />`)
      .replace('</head>', () => `    ${tags.join('\n    ')}\n  </head>`);
  };

  const routes = siteRoutes(root);
  for (const r of routes) {
    const file = r.path === '/' ? 'index.html' : r.path.slice(1) + '.html';
    fs.mkdirSync(path.dirname(path.join(outDir, file)), { recursive: true });
    fs.writeFileSync(path.join(outDir, file), page(r.title, r.description, r.path));
  }
  fs.writeFileSync(path.join(outDir, '404.html'), page('Page not found · Serupa', 'There’s no page at this address on the Serupa site.', '', { noindex: true }));

  fs.writeFileSync(path.join(outDir, '_redirects'), `${at('/frame/*')} ${at('/')} 200\n`);
  fs.writeFileSync(path.join(outDir, '_headers'), [
    `${at('/assets/*')}`,
    '  Cache-Control: public, max-age=31536000, immutable',
    `${at('/*')}`,
    `  Content-Security-Policy: ${contentSecurityPolicy(inlineScripts(index))}`,
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    `${at('/frame/*')}`,
    '  X-Robots-Tag: noindex',
    '',
  ].join('\n'));

  fs.writeFileSync(path.join(outDir, 'robots.txt'), ['User-agent: *', 'Allow: /', ...(url ? ['', `Sitemap: ${absolute('/sitemap.xml')}`] : []), ''].join('\n'));
  if (url) {
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...routes.map((r) => `  <url><loc>${escape(absolute(r.path))}</loc></url>`),
      '</urlset>',
      '',
    ].join('\n'));
  }
  return routes;
}
