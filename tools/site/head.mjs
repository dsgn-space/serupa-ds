// What each address of the docs site says about itself before any script runs: its title, a description, and the
// tags link previews and search engines read. The site draws its pages in the browser, so without these every
// address would share the one index.html's title and description (tools/site/vite.config.mjs writes a copy of
// index.html for each address with its own head, the sitemap and robots.txt; tools/test/site.mjs checks them).
//   node tools/site/head.mjs   prints each address with its title and description
import fs from 'node:fs';
import path from 'node:path';
import { sitePages } from './pages.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

export const SITE_NAME = 'Serupa';
/** The front page's title, and the description of any page that has none of its own. */
export const HOME_TITLE = 'Serupa design system';
export const DEFAULT_DESCRIPTION = 'Serupa is a design system by Diki: design tokens, a theme for every accent color and accessible React components, with the guides for using them.';

/** Markdown as plain text: links as their words, no code ticks, emphasis or inline HTML tags (a component's <Name> stays). */
const plain = (s) => s.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/<\/?(?:kbd|code|em|strong|b|i|abbr|span|br)\b[^>]*>/g, '').replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();
/** The first sentence of a paragraph. */
const sentence = (s) => (/^.*?[.!?](?=\s|$)/.exec(s) || [s])[0];
/** The first paragraph of prose in Markdown: not a heading, a list, a table, a quote, code or a tag. */
const firstProse = (md) => /^(?![ \t]*(?:[<#|>`{-]|\d+\.|import |export ))[ \t]*([A-Za-z"“(][^\n]*)$/m.exec(md)?.[1] ?? '';

/** A description the page gives itself, for when its first sentence doesn't say what the page is: an MDX comment
 * `{/* description: … *\/}` anywhere in its .mdx. */
const own = (mdx) => /\{\/\*\s*description:\s*([\s\S]*?)\s*\*\/\}/.exec(mdx)?.[1].replace(/\s+/g, ' ') ?? '';

/**
 * A page's description: one its .mdx gives itself, else its guide's first sentence (a component, block or pattern),
 * else the first sentence of the README.md or docs/foundations.md section its page shows first (<ReadmeSections />,
 * <ReadmeIntro />), else of the page's own first paragraph under its title, else the site's.
 * @param {{ file: string, name: string, summary: string }} page
 */
export function describe(page, root = ROOT) {
  const mdx = fs.readFileSync(path.join(root, page.file), 'utf8').replace(/^```[\s\S]*?^```/gm, '');
  if (own(mdx)) return own(mdx);
  if (page.summary) return plain(page.summary);
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const foundations = fs.readFileSync(path.join(root, 'docs', 'foundations.md'), 'utf8');
  let text = '';
  const heading = /<ReadmeSections\s+headings=\{\["([^"]+)"/.exec(mdx)?.[1];
  if (heading) {
    const part = [readme, foundations].flatMap((md) => md.split(/\n(?=## )/)).find((p) => p.startsWith(`## ${heading}\n`));
    if (part) text = firstProse(part.slice(part.indexOf('\n')));
  } else if (/<ReadmeIntro\b/.test(mdx)) {
    text = firstProse(readme.slice(readme.indexOf('\n'), readme.indexOf('\n## ')));
  }
  if (!text) text = firstProse(mdx.split(/^# .*$/m)[1] ?? '');
  return sentence(plain(text)) || DEFAULT_DESCRIPTION;
}

/** The section indexes: their names, addresses and leads, as the site's top bar shows them (site/src/sections.json). */
export function siteSections(root = ROOT) {
  /** @type {{ id: string, label: string, path: string, lead?: string }[]} */
  const list = JSON.parse(fs.readFileSync(path.join(root, 'site', 'src', 'sections.json'), 'utf8'));
  const count = sitePages(root).filter((p) => p.component).length;
  return list.map((s) => ({ ...s, lead: s.lead?.replace('{count}', String(count)) }));
}

/**
 * Every address the site answers, with the title its page sets (site/src/*.tsx set the same one as they draw) and its
 * description. /frame/<story> is left out: it is one story drawn alone for a frame on the site's own pages, not a page
 * to share or find.
 * @returns {{ path: string, title: string, description: string }[]}
 */
export function siteRoutes(root = ROOT) {
  const mine = [
    { path: '/', title: HOME_TITLE, description: DEFAULT_DESCRIPTION },
    { path: '/about', title: `The story · ${SITE_NAME}`, description: 'Why Serupa exists and how it is made: the story, the principles it holds to and the decisions on record.' },
    { path: '/themes', title: `Themes · ${SITE_NAME}`, description: 'One piece of product under every Serupa theme at once, each brand color in light and dark, with more contrast, density and roundness.' },
    { path: '/showcase', title: `Showcase · ${SITE_NAME}`, description: 'Every Serupa pattern as a whole screen, at a phone’s, a tablet’s or a laptop’s width, in its loading, empty and error states.' },
  ];
  const indexes = siteSections(root).filter((s) => s.lead).map((s) => ({ path: s.path, title: `${s.label} · ${SITE_NAME}`, description: /** @type {string} */ (s.lead) }));
  const pages = sitePages(root).map((p) => ({ path: p.path, title: `${p.name} · ${SITE_NAME}`, description: describe(p, root) }));
  return [...mine, ...indexes, ...pages];
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  for (const r of siteRoutes()) console.log(`${r.path}\t${r.title}\t${r.description}`);
}
