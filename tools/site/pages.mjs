// The site's pages (site/, npm run site): one for every .mdx page Storybook has, from the same files, so the two
// can't list different things. A page's title is its <Meta title="…" />, or the title of the stories its
// <Meta of={…} /> names; its address on the site comes from that title:
//   Components/Actions/Button  →  /components/button        (a component's group is left out: names are unique)
//   Foundations/Colors         →  /foundations/colors
//   Getting started            →  /getting-started
// The site's Vite config hands this list to the page (virtual:site-pages), and tools/test/site.mjs checks it.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

/** Storybook's id for a title or a story's export name: lowercase, with a hyphen for each run of anything else. */
export const storybookId = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** A story's id part from its export name, as Storybook makes it (AsLink → as-link). */
export const storyIdPart = (exportName) => exportName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (e.name !== 'generated') walk(path.join(dir, e.name), out); } else if (e.name.endsWith('.mdx')) out.push(path.join(dir, e.name));
  }
  return out;
};

/** The first sentence of a guide (README.md), without its Markdown links: what the component is for. */
export function summaryOf(guide) {
  const intro = (/^# .*\n+([^\n#`|<-][^\n]*)/m.exec(guide) || [])[1] ?? '';
  return (/^.*?[.!?](?=\s|$)/.exec(intro) || [intro])[0].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`/g, '');
}

/** A component's status from the doc comment on its export (as tools/build/registry.mjs reads it). */
function statusOf(file, name) {
  if (!fs.existsSync(file)) return 'stable';
  const text = fs.readFileSync(file, 'utf8');
  const at = new RegExp(`^export (?:const|function) ${name}\\b`, 'm').exec(text);
  const before = at ? text.slice(0, at.index).trimEnd() : '';
  if (!before.endsWith('*/')) return 'stable';
  return (/@(alpha|beta|deprecated)\b/.exec(before.slice(before.lastIndexOf('/**'))) || [])[1] ?? 'stable';
}

/**
 * Every page, in no particular order.
 * @returns {{ file: string, title: string, id: string, path: string, section: string, group: string, name: string, summary: string, status: string, stories: string | null, component: string | null }[]}
 */
export function sitePages(root = ROOT) {
  const files = [...walk(path.join(root, 'docs')), ...walk(path.join(root, 'src'))];
  const pages = [];
  for (const abs of files) {
    const file = path.relative(root, abs).split(path.sep).join('/');
    const mdx = fs.readFileSync(abs, 'utf8');
    const meta = /<Meta\s+([^>]*?)\s*\/>/.exec(mdx)?.[1];
    if (meta == null) throw new Error(`${file}: no <Meta … />, so it has no title`);
    let title = /title="([^"]+)"/.exec(meta)?.[1];
    let stories = null;
    const of = /of=\{(\w+)\}/.exec(meta)?.[1];
    if (!title && of) {
      const from = new RegExp(`import \\* as ${of} from '([^']+)'`).exec(mdx)?.[1];
      if (!from) throw new Error(`${file}: <Meta of={${of}} /> but no import * as ${of}`);
      const storiesAbs = path.resolve(path.dirname(abs), from) + '.tsx';
      stories = path.relative(root, storiesAbs).split(path.sep).join('/');
      title = /const meta[\s\S]*?\btitle: '([^']+)'/.exec(fs.readFileSync(storiesAbs, 'utf8'))?.[1];
    }
    if (!title) throw new Error(`${file}: its <Meta /> gives no title`);
    const parts = title.split('/');
    const name = parts.at(-1), section = parts[0], group = parts.length > 2 ? parts.slice(1, -1).join('/') : '';
    // The folder of a component, block or pattern: its guide's first sentence and its status.
    const folder = /^src\/(components|blocks|patterns)\/(\w+)\/\2\.mdx$/.exec(file);
    const readme = folder && path.join(path.dirname(abs), 'README.md');
    const summary = readme && fs.existsSync(readme) ? summaryOf(fs.readFileSync(readme, 'utf8')) : '';
    const component = folder?.[1] === 'components' ? folder[2] : null;
    pages.push({
      file, title, id: storybookId(title), section, group, name, summary, stories, component,
      path: '/' + (parts.length > 1 ? [section, name] : [name]).map(storybookId).join('/'),
      status: component ? statusOf(path.join(path.dirname(abs), `${component}.tsx`), component) : 'stable',
    });
  }
  const seen = new Map();
  for (const p of pages) {
    if (seen.has(p.path)) throw new Error(`${p.file} and ${seen.get(p.path)} would both be the site's ${p.path}: give one another title`);
    seen.set(p.path, p.file);
  }
  return pages;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  for (const p of sitePages().sort((a, b) => a.path.localeCompare(b.path))) console.log(`${p.path}\t${p.file}`);
}
