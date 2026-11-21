// Building blocks for the Storybook pages. Everything here reads tokens.json, README.md and the component
// guidelines at build time, so the documentation can't drift from the system.
import * as React from 'react';
import { DocsContext, Markdown, Primary } from '@storybook/addon-docs/blocks';
import tokens from '../tokens.json';
import readme from '../README.md?raw';
import foundations from './foundations.md?raw';
import { Icon } from '../src/components/Icon/Icon';
import { Button } from '../src/components/Button/Button';
import { SearchInput } from '../src/components/SearchInput/SearchInput';
import { CopyButton } from '../src/components/CopyButton/CopyButton';
import { customIcons, isIconData } from '../src/icons';
import type { IconData } from '../src/material/types';
import { DEFAULT_LABELS, idLabels, type SerupaLabels } from '../src/internal/labels';
import labelsSource from '../src/internal/labels.ts?raw';
import { componentStatus } from './generated/status';
import pkg from '../package.json';
import { majorsIn, upcomingMajor, type Major } from './upgrades';
import { transformsAfter } from '../bin/migrate/transforms.mjs';
import acr from './acr.json';
import { changesFor } from './changes';
import since from './since.json';
import { sinceText, type Since } from './since';
import { AnatomyDiagram, parseAnatomy, type Anatomy } from './anatomy';
import { DoDont, doDontAt } from './doDont';
// What the blocks need from every component folder at once (each one's docs page id, other names, label uses, tokens)
// is read once by tools/build/registry.mjs, not here: a glob of every README, story file and stylesheet made each
// page ask a development server for some 650 files.
import { componentDocs as docsId } from './generated/pages';

type Token = { name: string; value: string | Record<string, string>; usage?: string };
type Group = { note?: string; tokens: Token[] };
type TypeStyle = { name: string; fontSize: string; lineHeight: string; fontWeight: string };
type TypeGroup = { name: string; note?: string; styles: TypeStyle[] };
const T = tokens as unknown as Record<string, Group> & { type: { groups: TypeGroup[] }; color: Group & { themes: { id: string; name: string }[] } };

/* Heading ids (GR361). markdown-to-jsx gives each heading an id from its text, without looking at the rest of the
   page, so a guide's "States" section and the "States" story under it shared one, as did the Changelog's "Fixed" in
   every release. One slugify per page block: an id already used in the block, a story's name on the page, or a
   heading the page writes itself (reserve) takes -1, -2…, as Storybook's own story headings do. */
type Slugify = (text: string, base: (text: string) => string) => string;
function useSlugify(reserve: readonly string[] = []): Slugify {
  const ctx = React.useContext(DocsContext);
  let stories: string[] = [];
  try { stories = ctx.componentStories().map((x) => x.name); } catch { /* a page of docs/ alone has no stories */ }
  const taken = new Map<string, number>();
  let seeded = false;
  return (text, base) => {
    if (!seeded) { seeded = true; for (const r of [...reserve, ...stories]) taken.set(base(r), 0); }
    const id = base(text);
    let out = id;
    while (taken.has(out)) { const n = (taken.get(id) || 0) + 1; taken.set(id, n); out = id + '-' + n; }
    taken.set(out, 0);
    return out;
  };
}
/** Markdown whose headings have ids no other heading on the page has (useSlugify). */
export function DocMarkdown({ children, reserve, slugify }: { children: string; reserve?: readonly string[]; slugify?: Slugify }) {
  const own = useSlugify(reserve);
  return <Markdown options={{ slugify: slugify || own }}>{children}</Markdown>;
}

// Links between component guides (../Loader/README.md) become links to their Storybook pages.
function relink(md: string): string {
  return md.replace(/\]\((?:\.\.\/)?(?:src\/components\/)?(\w+)\/README\.md(#[\w-]+)?\)/g, (_, name) => `](?path=/docs/${docsId[name] || `components-${name.toLowerCase()}`}--docs)`)
    .replace(/\]\(README\.md(#[\w-]+)?\)/g, '](?path=/docs/introduction--docs)');
}

// The guide in pieces, with the anatomy diagram after the "## Anatomy" heading and the text before its list.
function anatomyAt(md: string): (string | Anatomy)[] {
  const at = md.search(/^## Anatomy\s*$/m);
  if (at < 0) return [md];
  const end = md.slice(at + 1).search(/^## /m), section = end < 0 ? md.slice(at) : md.slice(at, at + 1 + end);
  const list = section.search(/^1\. /m), anatomy = parseAnatomy(section);
  if (list < 0 || !anatomy.parts.length) return [md];
  return [md.slice(0, at + list), anatomy, md.slice(at + list)];
}

/** A component's guidelines (its README.md), without the title the page already has. */
/** A component's guide as an agent reads it: a line saying what it is and where it comes from, then the README as it
 *  is, so an agent pasted it knows the import, the props and the accessibility rules without a link it can't open. */
export function forAgent(name: string, source: string): string {
  return `<!-- ${pkg.name} ${pkg.version}: the ${name} component's usage guide. Import it with: import { ${name} } from "${pkg.name}"; -->\n\n${source.trim()}\n`;
}

export function Guide({ source }: { source: string }) {
  const name = /^# (\w+)/.exec(source)?.[1];
  const slugify = useSlugify();
  // The site's Title already prints the since line under the page name (its docs context carries the props, which
  // Storybook's doesn't), so the guide leaves it out there rather than say it twice.
  const sinceInTitle = Array.isArray((React.useContext(DocsContext) as { docs?: unknown }).docs);
  // On the site, what the component is comes first, right under the title, then the example: the guide's lead (its
  // text up to the first code block) is drawn above the first story, which the page's own Primary leaves out there.
  // Storybook keeps its own order (the .mdx page's), the example first.
  const body = source.replace(/^# .*\n+/, '');
  const fence = sinceInTitle ? body.search(/^```/m) : -1, head = body.search(/^## /m);
  const cut = fence > 0 && (head < 0 || fence < head) ? fence : 0;
  return <>
    {cut ? <DocMarkdown slugify={slugify}>{relink(body.slice(0, cut))}</DocMarkdown> : null}
    {cut ? <Primary placed /> : null}
    {name && <div className="sb-copy-guide" data-print="hide">
      <CopyButton value={() => forAgent(name, source)} size="sm">Copy for AI</CopyButton>
      <span>The whole guide as Markdown, to paste into a coding agent.</span>
    </div>}
    {name && componentStatus[name] && <ComponentStatus status={componentStatus[name]} />}
    {name && !sinceInTitle && <ComponentSince name={name} />}
    {anatomyAt(body.slice(cut)).flatMap((part) => (typeof part === 'string' ? doDontAt(part) : [part])).map((part, i) => (typeof part === 'string'
      ? <DocMarkdown key={i} slugify={slugify}>{relink(part)}</DocMarkdown>
      : Array.isArray(part) ? <DoDont key={i} pairs={part.map((p) => ({ do: { ...p.do, text: relink(p.do.text) }, dont: { ...p.dont, text: relink(p.dont.text) } }))} />
      : <AnatomyDiagram key={i} {...part} />))}
    {name && <TestedBehavior name={name} />}
    {name && <ComponentChanges name={name} />}
  </>;
}

/** Data a block loads when it's drawn, not with every page: the changelog and the tests' names weigh as much as the
 * rest of the docs together, and only the sections at a page's foot and the upgrade guide read them. Null until it
 * arrives. */
function useLoaded<T>(load: () => Promise<T>): T | null {
  const [data, setData] = React.useState<T | null>(null);
  React.useEffect(() => {
    let live = true;
    void load().then((d) => { if (live) setData(() => d); });
    return () => { live = false; };
  }, [load]);
  return data;
}
const loadChangelog = () => import('../CHANGELOG.md?raw').then((m) => m.default);
const loadTests = () => import('./generated/tested').then((m) => m.componentTests);
// Other names, label uses, component tokens and waiting changesets: some 480 KB only a few sections show.
const loadFacts = () => import('./generated/facts');

/** What changed in a component, release by release (134): the CHANGELOG.md entries that name it, newest first, the
 * latest few open and the rest folded away. */
export function ComponentChanges({ name }: { name: string }) {
  const changelog = useLoaded(loadChangelog);
  const all = changelog ? changesFor(name, changelog) : [];
  if (!all.length) return null;
  const SHOWN = 5;
  const md = (list: typeof all) => list.map((c) => `- **${c.version}**${c.kind ? ` (${c.kind.toLowerCase()})` : ''}: ${c.text}`).join('\n');
  return <section className="sb-changes" aria-labelledby={`changes-${name}`}>
    <h2 id={`changes-${name}`}>Changes</h2>
    <p>The entries of the <a href="?path=/docs/changelog--docs">changelog</a> that name {name}, newest first.</p>
    <Markdown>{relink(md(all.slice(0, SHOWN)))}</Markdown>
    {all.length > SHOWN && <details>
      <summary>Earlier changes ({all.length - SHOWN})</summary>
      <Markdown>{relink(md(all.slice(SHOWN)))}</Markdown>
    </details>}
  </section>;
}

// A test name without the backlog ids it carries for the people working on the repository: "(GR44)", "(62)", "(FH1, 180)",
// "GR55: ".
const plainName = (t: string) => t.replace(/\s*\((?:[A-Z]{0,3}\d+[a-z]?(?:,\s*)?)+\)/g, '').replace(/^[A-Z]{1,3}\d+: /, '').trim();

/** What a component's tests check (131), by their names, read from its <Name>.test.tsx when the docs are built, so
 * the list is the suite and can't promise more than it runs. Closed by default: it's long, and for the curious. */
export function TestedBehavior({ name }: { name: string }) {
  const tests = useLoaded(loadTests);
  const groups = tests?.[name] || [];
  const count = groups.reduce((n, g) => n + g.tests.length, 0);
  if (!count) return null;
  return <section className="sb-tested" aria-labelledby={`tested-${name}`}>
    <h2 id={`tested-${name}`}>What the tests check</h2>
    <p>{count} {count === 1 ? 'test' : 'tests'} in <code>{name}.test.tsx</code> run in Chromium on every pull request that changes it, and in Firefox and WebKit every night. Besides these, every story is checked with axe in every theme, at 200% text, with wider text spacing and at 320px wide, and compared with its screenshots.</p>
    <details>
      <summary>Every test, by name</summary>
      {groups.map((g, i) => <React.Fragment key={i}>
        {groups.length > 1 && <h3>{plainName(g.group)}</h3>}
        <ul>{g.tests.map((t, j) => <li key={j}>{plainName(t)}</li>)}</ul>
      </React.Fragment>)}
    </details>
  </section>;
}

// What each status means to someone choosing a component, as README.md's Versioning section says it.
const STATUS_TEXT = {
  alpha: 'Still taking shape. Its props and behaviour may change in any release; try it, but pin the version you ship.',
  beta: 'Ready to use, but its API may still change in a minor release, and the changeset will say how.',
  deprecated: 'It keeps working until the next major release removes it. Its guide says what to use instead.',
} as const;
/** A component's status above its guide, when it isn't stable. */
export function ComponentStatus({ status }: { status: keyof typeof STATUS_TEXT }) {
  return <p role="note" className="sb-unstyled" style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '8px 12px', border: '1px solid var(--border-strong)', borderRadius: 6, font: '14px/20px var(--font-sans)' }}>
    <strong style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.04em' }}>{status}</strong>
    <span>{STATUS_TEXT[status]}</span>
  </p>;
}

/** Which release a component arrived in and last changed its API, and the props new in the latest releases (AX6). */
export function ComponentSince({ name }: { name: string }) {
  const text = sinceText((since as Record<string, Since>)[name]);
  if (!text) return null;
  return <div className="sb-since" style={{ font: '14px/20px var(--font-sans)', color: 'var(--text-muted)' }}><Markdown>{text}</Markdown></div>;
}

const ROOT = readme;
// True on the docs site, whose build defines it (tools/site/vite.config.mjs); Storybook leaves it undefined.
declare const __SITE__: boolean | undefined;
const onSite = typeof __SITE__ !== 'undefined' && __SITE__;

/** The README's introduction, before its first section. On the site it leaves out the paragraph on running the docs
 * from the repo (Storybook and the site at localhost), which is for someone with the repo open, not a visitor. */
export function ReadmeIntro() {
  const intro = ROOT.slice(0, ROOT.indexOf('\n## ')).replace(/^# .*\n+/, '');
  return <Markdown>{relink(onSite ? intro.replace(/^The documentation is Storybook\b.*\n?/m, '') : intro)}</Markdown>;
}
/** What is said in Storybook only, such as its toolbar's tabs. */
export function InStorybook({ children }: { children: React.ReactNode }) {
  return onSite ? null : <>{children}</>;
}
const slug = (heading: string) => heading.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
/** The page each `##` section of docs/foundations.md is on, by its id. In the file one section links to another with
 * `#id`; on a page that doesn't have that section, the link goes to the page that does. */
const SECTION_PAGE: Record<string, string> = Object.fromEntries(Object.entries({
  'foundations-colors': ['Color families', 'Naming', 'Using the shades', 'Contrast'],
  'foundations-themes': ['Themes', 'Alias tokens'],
  'foundations-typography': ['Typography'],
  'foundations-icons': ['Iconography'],
  'foundations-spacing': ['Spacing', 'Sizing'],
  'foundations-corner-radius': ['Corner radius'],
  'foundations-effects-and-borders': ['Borders and outlines', 'Effects'],
  'foundations-elevation-and-layers': ['Elevation and layers'],
  'foundations-layout': ['Page layout'],
  'foundations-motion': ['Motion'],
  'foundations-content-and-voice': ['Content and voice'],
  'foundations-data-formats': ['Data formats'],
  'foundations-ethical-design': ['Ethical design'],
  'foundations-accessibility': ['Accessibility standard'],
  'foundations-utility-classes': ['Backgrounds', 'Layout', 'Flexbox and grid', 'Filters', 'Tables', 'Transforms', 'SVG', 'Interactivity'],
}).flatMap(([page, sections]) => sections.map((s) => [slug(s), page])));

/** Sections of README.md and docs/foundations.md by their headings (## level), each with its subsections. */
/** A section whose heading the page writes itself (reserve, such as its title) comes without that heading, so the page
 * doesn't say "Typography" twice, and its subsections step up a level under the title. */
export function ReadmeSections({ headings, reserve }: { headings: string[]; /** Headings the page writes itself, such as its title: theirs keep the plain id. */ reserve?: string[] }) {
  const parts = [ROOT, foundations].flatMap((md) => md.split(/\n(?=## )/));
  const md = headings.map((h) => {
    const part = parts.find((p) => p.startsWith(`## ${h}\n`));
    if (!part) return `> Missing README section: ${h}`;
    if (!reserve?.includes(h)) return part;
    // Its heading is the page's own title now, so its subsections step up a level (### to ##), outside code: a page
    // never skips from its title to an h3.
    let code = false;
    return part.slice(part.indexOf('\n') + 1).split('\n').map((line) => {
      if (line.startsWith('```')) code = !code;
      return !code && /^###+ /.test(line) ? line.slice(1) : line;
    }).join('\n');
  }).join('\n\n');
  return <DocMarkdown reserve={reserve}>{relink(md.replace(/\]\(#([\w-]+)\)/g, (link, id: string) => {
    const page = SECTION_PAGE[id];
    return page && !headings.some((h) => slug(h) === id) ? `](?path=/docs/${page}--docs)` : link;
  }))}</DocMarkdown>;
}


/** A table or swatch grid wider than a narrow screen scrolls in its own box instead of pushing the page sideways
 * (WCAG 1.4.10 at 320px). While it does, it's a named region Tab reaches, so the arrow keys scroll it; when it fits,
 * it's no tab stop. */
function Wide({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    check();
    return () => ro.disconnect();
  }, []);
  return <div ref={ref} className={scrolls ? 'sb-wide sb-wide--scrolls' : 'sb-wide'} role={scrolls ? 'region' : undefined} aria-label={scrolls ? label : undefined} tabIndex={scrolls ? 0 : undefined}>{children}</div>;
}

const code = (s?: string) => (s || '').split(/`([^`]+)`/).map((x, i) => (i % 2 ? <code key={i}>{x}</code> : x));
const cell: React.CSSProperties = { padding: '6px 10px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', textAlign: 'left' };
// A row that runs to many lines (a token's value in 34 themes) starts each cell at its top, so its name isn't halfway down.
const top: React.CSSProperties = { ...cell, verticalAlign: 'top' };
// An alias's value reads as the CSS that resolves it (var(--spacing-1)), not the token file's {spacing-1} syntax.
const val = (v: Token['value']) => { const s = typeof v === 'string' ? v : Object.values(v)[0]; return typeof s === 'string' ? s.replace(/\{([^}]+)\}/g, (_, n: string) => `var(--${n})`) : s; };

// What a token is for keeps a readable measure when the table is wider than a phone (spacing-96's 384px preview):
// the table scrolls in its box, and the words don't stand two to a line down a row as tall as a screen.
const use: React.CSSProperties = { ...cell, minWidth: '12rem' };
// A value that names another token breaks only before the name, never inside it: var(--outline-width-2) wraps as
// "var(" over "--outline-width-2)", not "var(--" over "outline-" over "width-2)".
const whole = (v: ReturnType<typeof val>) => typeof v !== 'string' ? v : v.split(/(--[\w.-]+)/).map((x, i) => (i % 2 ? <React.Fragment key={i}><wbr /><span style={{ whiteSpace: 'nowrap' }}>{x}</span></React.Fragment> : x));

/** Every token in a group, with its value, what it's for and a live preview. data-token-sheet marks each token block
 * for the visual snapshots (tools/test/visual.mjs), so a changed token value shows as a changed picture. */
export function TokenTable({ group, preview }: { group: string; preview?: 'space' | 'radius' | 'shadow' | 'duration' | 'none' }) {
  const g = T[group];
  const show = (t: Token) => {
    const v = `var(--${t.name.replace(/[\\.]/g, '\\$&')})`;   // --spacing-0\.5: a dot in a custom property's name is escaped in CSS
    if (preview === 'space') return <div style={{ height: 12, width: v, background: 'var(--primary)', borderRadius: 2 }} />;
    if (preview === 'radius') return <div style={{ height: 40, width: 40, border: '2px solid var(--primary)', borderRadius: v }} />;
    // The tile sits in a muted well with room around it, so its shadow shows (and isn't clipped by the cell) on
    // every row, not only on the striped ones.
    if (preview === 'shadow') return <div style={{ display: 'inline-block', padding: 16, borderRadius: 8, background: 'var(--surface-muted)' }}><div style={{ height: 40, width: 64, background: 'var(--surface)', boxShadow: t.name.startsWith('text-') ? undefined : v, textShadow: t.name.startsWith('text-') ? v : undefined, borderRadius: 6, display: 'grid', placeItems: 'center' }}>{t.name.startsWith('text-') ? 'Aa' : ''}</div></div>;
    if (preview === 'duration' && /^(duration|delay)-/.test(t.name)) return <span className="dk-sb-pulse" style={{ display: 'inline-block', height: 12, width: 12, borderRadius: 6, background: 'var(--primary)', animationDuration: `calc(${v} * 2 + 200ms)` }} />;
    return null;
  };
  return <div data-token-sheet={group}>
    {g.note && <p>{code(g.note)}</p>}
    <Wide label={`${group} tokens`}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr><th style={cell}>Token</th><th style={cell}>Value</th>{preview && preview !== 'none' && <th style={cell}>Preview</th>}<th style={cell}>Use</th></tr></thead>
      <tbody>{g.tokens.map((t) => <tr key={t.name}>
        <td style={{ ...cell, whiteSpace: 'nowrap' }}><code>--{t.name}</code></td><td style={cell}><code>{whole(val(t.value))}</code></td>
        {preview && preview !== 'none' && <td style={cell}>{show(t)}</td>}<td style={use}>{code(t.usage)}</td></tr>)}</tbody>
    </table></Wide>
  </div>;
}

const SHADES = /^([a-z]+)-(50|100|200|300|400|500|600|700|800|900|950)$/;
/** The palette: every color family, 50 to 950. */
export function Palette() {
  const fam: Record<string, Token[]> = {};
  for (const t of T.color.tokens) { const m = SHADES.exec(t.name); if (m && (typeof t.value === 'string' || Object.keys(t.value).length === 1)) (fam[m[1]] ||= []).push(t); }
  return <Wide label="Palette"><div data-token-sheet="palette" style={{ display: 'grid', gap: 8 }}>
    {/* The family's name on the swatches' line, and a hairline inside each swatch, so 50 on a light page and 950 on a
        dark one still show their edge (as an image's outline does). */}
    {Object.entries(fam).map(([f, list]) => <div key={f} style={{ display: 'grid', gridTemplateColumns: '80px repeat(11, 1fr)', gap: 4, alignItems: 'start', fontSize: 12 }}>
      <strong style={{ lineHeight: '36px' }}>{f}</strong>
      {list.map((t) => <div key={t.name} title={`--${t.name}: ${val(t.value)}`}><div style={{ height: 36, borderRadius: 6, background: `var(--${t.name})`, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--text) 10%, transparent)' }} /><div>{t.name.split('-')[1]}</div><code style={{ fontSize: 10 }}>{val(t.value)}</code></div>)}
    </div>)}
  </div></Wide>;
}

/** The alias colors: a live swatch in the theme picked in the toolbar, and the palette color in every theme. */
export function Aliases() {
  const themes = T.color.themes;
  const list = T.color.tokens.filter((t) => typeof t.value === 'object' && Object.keys(t.value).length > 1);
  return <Wide label="Alias colors"><table data-token-sheet="aliases" style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
    <thead><tr><th style={cell}>Alias</th><th style={cell}>Now</th>{themes.map((th) => <th key={th.id} style={cell}>{th.name}</th>)}<th style={cell}>Use</th></tr></thead>
    <tbody>{list.map((t) => <tr key={t.name}>
      <td style={cell}><code>--{t.name}</code></td>
      <td style={cell}><div style={{ height: 24, width: 40, borderRadius: 4, background: `var(--${t.name})`, border: '1px solid var(--border)' }} /></td>
      {themes.map((th) => <td key={th.id} style={cell}><code>{String((t.value as Record<string, string>)[th.id]).replace(/[{}]/g, '')}</code></td>)}
      <td style={cell}>{code(t.usage)}</td></tr>)}</tbody>
  </table></Wide>;
}

/** The chart colors (CH1) in the theme picked in the toolbar: the 8 series as touching bars with the gap between
 * them, and the two ramps. */
export function ChartColors() {
  const names = (re: RegExp) => T.color.tokens.map((t) => t.name).filter((n) => re.test(n));
  const row = (list: string[], gap: boolean) => <div style={{ display: 'flex', gap: gap ? 2 : 0, background: 'var(--chart-gap)', padding: 2, borderRadius: 6 }}>
    {list.map((n) => <div key={n} title={`--${n}`} style={{ flex: 1, minWidth: 0 }}>
      <div style={{ height: 40, background: `var(--${n})` }} />
      <code style={{ display: 'block', fontSize: 10, color: 'var(--chart-label)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.replace('chart-', '')}</code>
    </div>)}
  </div>;
  return <div data-token-sheet="chart-colors" style={{ display: 'grid', gap: 16 }}>
    <div><strong>Series</strong>{row(names(/^chart-\d+$/), true)}</div>
    <div><strong>Sequential</strong>{row(names(/^chart-seq-\d+$/), false)}</div>
    <div><strong>Diverging</strong>{row(names(/^chart-div-\d+$/), false)}</div>
  </div>;
}

/** The type scale: each type-* style rendered in its own family, size, line height and weight. */
export function TypeScale() {
  return <div data-token-sheet="type-scale">{T.type.groups.map((g) => <div key={g.name} style={{ marginBottom: 24 }}>
    <h3>{g.name}</h3>{g.note && <p>{code(g.note)}</p>}
    {/* The name beside its sample, or above it on a phone, where a 128px sample has the whole width to wrap in. */}
    {g.styles.map((s) => <div key={s.name} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: '0 0 180px', fontSize: 12 }}><code>{s.name}</code><br />{s.fontSize} / {s.lineHeight} · {s.fontWeight}</div>
      <div className={s.name} style={{ flex: '1 1 16rem', minWidth: 0, overflowWrap: 'anywhere' }}>The quick brown fox jumps over the lazy dog</div>
    </div>)}
  </div>)}</div>;
}

// The whole icon set (3 MB) is fetched when the gallery is on the page, not with every page that uses these blocks.
const materialIcons = (): Promise<IconData[]> => import('../src/material/icons')
    // A to Z, with the names that start with a number (10k, 3d_rotation) after them, so the gallery opens on words.
  .then((m) => (Object.values(m) as unknown[]).filter(isIconData).sort((x, y) => Number(/^\d/.test(x.name)) - Number(/^\d/.test(y.name)) || x.name.localeCompare(y.name)));

/** Every Material Symbol, plus your custom icons: search by name, and a click copies an icon's name. */
export function IconGallery() {
  const [q, setQ] = React.useState('');
  const [copied, setCopied] = React.useState('');
  const [limit, setLimit] = React.useState(240);
  const [all, setAll] = React.useState<IconData[] | null>(null);
  React.useEffect(() => { let live = true; void materialIcons().then((list) => { if (live) setAll(list); }); return () => { live = false; }; }, []);
  const term = q.trim().toLowerCase().replace(/\s+/g, '_');
  React.useEffect(() => setLimit(240), [term]);
  const copy = (text: string) => {
    try { navigator.clipboard.writeText(text); } catch { /* no clipboard: the text still shows */ }
    setCopied(text);
  };
  const custom = customIcons.filter((n) => !term || n.includes(term));
  const material = (all ?? []).filter((d) => !term || d.name.includes(term));
  const tile = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 4px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', cursor: 'var(--cursor-interactive)', font: 'inherit' } as const;
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))', gap: 8 } as const;
  const label = { fontSize: 12, color: 'var(--text-muted)', overflowWrap: 'anywhere', textAlign: 'center' } as const;
  const heading = { margin: '0 0 8px', fontSize: 16, fontWeight: 600 } as const;
  const tileFor = (n: string, icon: React.ReactNode) => <button key={n} type="button" onClick={() => copy(n)} title={`<Icon name="${n}" />`} style={tile}>
    {icon}
    {/* A long name wraps after an underscore (1x_mobiledata_ / badge), not inside a word. */}
    <span style={label}>{n.split('_').flatMap((part, i, all) => i < all.length - 1 ? [`${part}_`, <wbr key={i} />] : [part])}</span>
  </button>;
  // sb-unstyled: keeps Storybook's docs styles off the buttons.
  return <div className="sb-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ maxWidth: 320 }}><SearchInput aria-label="Find an icon" placeholder="Find an icon, such as arrow" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    <p role="status" style={{ margin: 0, minHeight: 20, color: 'var(--text-muted)' }}>{copied ? <>Copied <code>{copied}</code></> : 'Click an icon to copy its name.'}</p>
    {custom.length ? <section>
      <h3 style={heading}>Your custom icons</h3>
      <div style={grid}>{custom.map((n) => tileFor(n, <Icon name={n} />))}</div>
    </section> : null}
    <section>
      <h3 style={heading}>Material Symbols{all ? ` (${material.length})` : ''}</h3>
      {!all ? <p style={{ margin: 0, color: 'var(--text-muted)' }}>Loading the icons…</p> : material.length ? <div style={grid}>{material.slice(0, limit).map((d) => tileFor(d.name, <Icon icon={d} />))}</div> : <p style={{ margin: 0 }}>No icon matches.</p>}
      {material.length > limit ? <div style={{ marginTop: 8 }}><Button variant="secondary" size="sm" onClick={() => setLimit(limit + 480)}>Show more ({material.length - limit} left)</Button></div> : null}
    </section>
  </div>;
}

/** "Know it by another name?": every other name a component is known by (snackbar, dropzone, modal), filtered as you
 * type, each linked to the Serupa component that does the job. */
export function OtherNames() {
  const facts = useLoaded(loadFacts);
  const [q, setQ] = React.useState('');
  const term = q.trim().toLowerCase();
  if (!facts) return null;
  const { otherNames } = facts;
  const rows = otherNames.filter((r) => !term || r.other.toLowerCase().includes(term) || r.name.toLowerCase().includes(term));
  return <div className="sb-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ maxWidth: 320 }}><SearchInput aria-label="Find a name" placeholder="Find a name, such as snackbar" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    <p role="status" style={{ margin: 0, color: 'var(--text-muted)' }}>{rows.length ? `${rows.length} of ${otherNames.length} names` : 'No component goes by that name. Try the tables above, or the sidebar search.'}</p>
    {rows.length ? <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr><th style={cell}>You may know it as</th><th style={cell}>In Serupa</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={`${r.other}-${r.name}`}>
        <td style={cell}>{r.other}</td>
        <td style={cell}><a href={`?path=/docs/${docsId[r.name] || `components-${r.name.toLowerCase()}`}--docs`} target="_top">{r.name}</a></td>
      </tr>)}</tbody>
    </table> : null}
  </div>;
}

/** Icons at the system's sizes, with what each is for. */
export function IconSizes() {
  const sizes: ['xs' | 'sm' | 'md' | 'lg' | 'xl', number, string][] = [['xs', 14, '`sm` buttons, `text-xs`'], ['sm', 16, '`md` buttons, inline with `text-sm`'], ['md', 20, '`lg` buttons, list rows, `text-base`'], ['lg', 24, 'The default: toolbars, navigation'], ['xl', 40, 'Empty states']];
  // In even columns, each icon on the same line in a box as tall as the largest, so the sizes and their names line up
  // across a row however many lines a use takes.
  return <div className="sb-unstyled" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))', gap: 24, alignItems: 'start' }}>
    {sizes.map(([step, s, use]) => <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', fontSize: 12 }}>
      <span style={{ display: 'flex', alignItems: 'flex-end', height: 40 }}><Icon name="favorite" size={step} /></span><strong>{code(`\`${step}\``)} {s}px</strong><span style={{ color: 'var(--text-muted)' }}>{code(use).map((x) => typeof x === 'string' ? x : React.cloneElement(x, { style: { whiteSpace: 'nowrap' } }))}</span>
    </div>)}
  </div>;
}

// Which components say each label: the doc comment above its key (or group of keys) in SerupaLabels.
const sharedLabelUse: Record<string, string> = {};
{
  let use = '';
  for (const line of labelsSource.slice(labelsSource.indexOf('export interface '), labelsSource.indexOf('\n}\n')).split('\n').slice(1)) {
    const doc = /^\s*\/\*\*\s*(.*?)\s*\*\/$/.exec(line), key = /^\s*(\w+):/.exec(line);
    if (doc) use = doc[1]; else if (key) sharedLabelUse[key[1]] = use;
  }
}
// A function label is shown with "n" for its first argument; one that takes a list (cascadePath) can't, so it says so.
const word = (v: SerupaLabels[keyof SerupaLabels]) => {
  if (typeof v !== 'function') return v;
  try { return v('n' as unknown as number); } catch { return '(built from its arguments)'; }
};
/* eslint-disable jsx-a11y-x/no-redundant-roles, jsx-a11y-x/no-interactive-element-to-noninteractive-role -- on a phone CSS draws this table as blocks (site.css), and a browser that then drops its table semantics gets them back from the roles */
/** Every word the components say on their own, in English and Indonesian, with where it's used. */
export function LabelTable() {
  const facts = useLoaded(loadFacts);
  if (!facts) return null;
  // Each component's own words (src/components/<Name>/labels.ts), whose doc comments say where each is used too.
  const labelUse = { ...sharedLabelUse, ...facts.componentLabelUse };
  return <table className="sb-doc-table sb-doc-table--stack" role="table" style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
    <thead role="rowgroup"><tr role="row"><th style={cell} role="columnheader">Key</th><th style={cell} role="columnheader">English</th><th style={cell} role="columnheader">Indonesian (<code>idLabels</code>)</th><th style={cell} role="columnheader">Where</th></tr></thead>
    <tbody role="rowgroup">{(Object.keys(DEFAULT_LABELS) as (keyof SerupaLabels)[]).map((k) => <tr key={k} role="row">
      <td style={cell} role="cell"><code>{k}</code></td><td style={cell} role="cell" data-label="English">{word(DEFAULT_LABELS[k])}</td><td style={cell} role="cell" data-label="Indonesian (idLabels)">{word(idLabels[k])}</td><td style={cell} role="cell" data-label="Where">{labelUse[k]}</td></tr>)}</tbody>
  </table>;
}
/* eslint-enable jsx-a11y-x/no-redundant-roles, jsx-a11y-x/no-interactive-element-to-noninteractive-role */

const LEVELS: [string, string, string, string][] = [
  ['Page', 'surface-page', 'transparent', 'none'], ['Resting', 'surface', 'border', 'shadow-xs'], ['Raised', 'surface-raised', 'border', 'shadow-md'],
  ['Floating', 'surface-overlay', 'border-overlay', 'shadow-lg'], ['Modal', 'surface-overlay', 'border-overlay', 'shadow-xl'],
];
/** The elevation levels drawn with their tokens, on a light and a dark page side by side. */
export function ElevationLevels() {
  return <div data-token-sheet="elevation-levels" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, margin: '16px 0 24px' }}>
    {(['light', 'dark'] as const).map((mode) => <div key={mode} data-theme={`blue-${mode}`} style={{ background: 'var(--surface-page)', color: 'var(--text)', padding: 24, borderRadius: 8, border: '1px solid var(--border)', display: 'grid', gap: 16 }}>
      {LEVELS.map(([name, bg, edge, shadow]) => <div key={name} style={{ background: `var(--${bg})`, border: `1px solid ${edge === 'transparent' ? 'transparent' : `var(--${edge})`}`, boxShadow: shadow === 'none' ? 'none' : `var(--${shadow})`, borderRadius: 8, padding: '12px 16px', fontSize: 14 }}>
        <strong>{name}</strong> <span style={{ color: 'var(--text-muted)' }}>{mode}: <code>{bg}</code>{shadow !== 'none' && <>, <code>{shadow}</code></>}</span>
      </div>)}
    </div>)}
  </div>;
}

// The token explorer's index: every shared token in tokens.json and every component token (<name>.tokens.json),
// with the components whose CSS reads it. Built once, when the page first draws.
type Found = { css: string; group: string; values: { theme?: string; ref?: string; value: string }[]; usage: string; usedBy: string[] };
const COLOR = new Map(T.color.tokens.map((t) => [t.name, t.value]));
// A color token's value in one theme, following references ({blue-600}) to the literal color.
function resolve(value: Token['value'], theme: string, depth = 0): string {
  const v = typeof value === 'string' ? value : value[theme] ?? Object.values(value)[0];
  const ref = /^\{([^}]+)\}$/.exec(v)?.[1];
  return ref && COLOR.has(ref) && depth < 8 ? resolve(COLOR.get(ref)!, theme, depth + 1) : v;
}
type Facts = Awaited<ReturnType<typeof loadFacts>>;
let INDEX: Found[] | undefined;
function tokenIndex({ componentTokens, tokenUsers }: Facts): Found[] {
  if (INDEX) return INDEX;
  const users = (css: string, own?: string) => [...new Set([...(tokenUsers[css] ?? []), ...(own ? [own] : [])])].sort();
  const out: Found[] = [];
  for (const [group, g] of Object.entries(T)) {
    if (!g || typeof g !== 'object' || !Array.isArray((g as Group).tokens)) continue;
    for (const t of (g as Group).tokens) {
      const css = `--${t.name}`;
      const values = typeof t.value === 'object' && Object.keys(t.value).length > 1
        ? T.color.themes.map((th) => ({ theme: th.name, ref: String((t.value as Record<string, string>)[th.id]).replace(/[{}]/g, ''), value: resolve(t.value, th.id) }))
        : [{ value: group === 'color' ? resolve(t.value, T.color.themes[0].id) : val(t.value) }];
      out.push({ css, group, values, usage: t.usage ?? '', usedBy: users(css) });
    }
  }
  for (const t of componentTokens) out.push({ css: t.css, group: t.component, values: [{ value: t.value }], usage: t.usage, usedBy: users(t.css, t.component) });
  return (INDEX = out);
}
// The text to paste into CSS: a dot (or a backslash) in a token name is escaped there (--spacing-1\.5), every one.
const asVar = (css: string) => `var(${css.replace(/[\\.]/g, '\\$&')})`;
const isColor = (v: string) => /^(#|rgb|hsl|oklch|oklab|color\(|transparent$)/.test(v);

/** Every token, shared and component: search by name, value, use or component, see its value in each theme and
 * which components read it, and copy it as var(--name). */
export function TokenExplorer() {
  const facts = useLoaded(loadFacts);
  const [q, setQ] = React.useState('');
  const [limit, setLimit] = React.useState(60);
  const term = q.trim().toLowerCase().replace(/^var\(|\)$/g, '');
  React.useEffect(() => setLimit(60), [term]);
  if (!facts) return null;
  const all = tokenIndex(facts);
  const hits = term ? all.filter((t) => [t.css, t.group, t.usage, ...t.usedBy, ...t.values.flatMap((v) => [v.value, v.ref ?? ''])].some((s) => s.toLowerCase().includes(term))) : all;
  const swatch = (v: string) => isColor(v) ? <span aria-hidden="true" style={{ display: 'inline-block', width: 14, height: 14, marginInlineEnd: 6, verticalAlign: 'middle', borderRadius: 3, border: '1px solid var(--border)', background: v }} /> : null;
  // sb-unstyled: keeps Storybook's docs styles off the controls.
  return <div className="sb-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ maxWidth: 360 }}><SearchInput aria-label="Find a token" placeholder="Find a token, such as primary or Button" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    <p role="status" style={{ margin: 0, color: 'var(--text-muted)' }}>{hits.length === all.length ? `${all.length} tokens.` : `${hits.length} of ${all.length} tokens match.`}</p>
    {/* eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex -- a region that scrolls sideways must take focus so a keyboard can scroll it (WCAG 2.1.1) */}
    {hits.length ? <div role="region" aria-label="Tokens found" tabIndex={0} style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead><tr><th style={cell}>Token</th><th style={cell}>Value</th><th style={cell}>Used by</th><th style={cell}>Use</th></tr></thead>
        <tbody>{hits.slice(0, limit).map((t) => <tr key={t.css}>
          <td style={top}><div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}><code>{t.css}</code><CopyButton value={asVar(t.css)} iconOnly size="sm" variant="ghost">{`Copy ${asVar(t.css)}`}</CopyButton></div><div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.group}</div></td>
          <td style={top}>{t.values.map((v, i) => <div key={i} style={{ whiteSpace: 'nowrap' }}>
            {v.theme && <span style={{ color: 'var(--text-muted)' }}>{v.theme}: </span>}
            {swatch(v.value)}{v.ref && v.ref !== v.value ? <><code>{v.ref}</code> </> : null}<code>{v.value}</code>
          </div>)}</td>
          <td style={top}>{t.usedBy.length ? t.usedBy.map((n, i) => <React.Fragment key={n}>{i ? ', ' : ''}<a href={`?path=/docs/${docsId[n] || `components-${n.toLowerCase()}`}--docs`} target="_top">{n}</a></React.Fragment>) : <span style={{ color: 'var(--text-muted)' }}>No component</span>}</td>
          <td style={top}>{code(t.usage)}</td>
        </tr>)}</tbody>
      </table>
    </div> : <p style={{ margin: 0 }}>No token matches.</p>}
    {hits.length > limit ? <div><Button variant="secondary" size="sm" onClick={() => setLimit(limit + 200)}>Show more ({hits.length - limit} left)</Button></div> : null}
  </div>;
}

type Transform = { version: string; id: string; title: string };

/** The upgrade guide (40): each major's breaking changes, the next one first while its changesets wait for a release,
 * and what `npx serupa-migrate` changes for it. */
export function UpgradeGuide() {
  const changelog = useLoaded(loadChangelog);
  const facts = useLoaded(loadFacts);
  if (changelog === null || facts === null) return null;
  const auto = transformsAfter(null) as Transform[];
  const next = upcomingMajor(pkg.version, facts.pendingChangesets, auto.map((t) => t.version));
  const majors: Major[] = [...(next ? [next] : []), ...majorsIn(changelog)];
  return <>{majors.map((m) => {
    const prev = Number(m.version.split('.')[0]) - 1;
    const mine = auto.filter((t) => t.version === m.version);
    const intro = m.next && !m.entries.length
      ? `Not released yet. These props are deprecated now and go in ${m.version}.`
      : m.next
      ? `Not released yet: these changes are waiting for the next major, so they may still change. [RFCs](https://github.com/dsgn-space/serupa-ds/tree/main/docs/rfcs) has the proposal.`
      : m.date ? `Released ${m.date}.` : '';
    const run = mine.length
      ? `**Made for you:** \`npx serupa-migrate src --from ${prev}\` (add \`--write\` to change the files) makes ${mine.length === 1 ? 'this change' : 'these changes'}:\n\n${mine.map((t) => `- ${t.title}`).join('\n')}`
      : '';
    const body = m.entries.length ? m.entries.join('\n')
      : m.next ? `- Nothing is removed yet. The old names still work in ${prev}.x and warn in development, so you can switch now, before the release.`
      : '- No entry of this release is marked breaking; [the Changelog](?path=/docs/changelog--docs) has what changed.';
    return <section key={m.version}>
      <Markdown>{[`## ${m.version}${m.next ? ' (next)' : ''}`, intro, run, body].filter(Boolean).join('\n\n')}</Markdown>
    </section>;
  })}</>;
}
type Criterion = { id: string; name: string; level: string; conformance: string; remarks: string };
const ACR = acr as { standard: string; product: string; reviewed: { version: string; date: string }; criteria: Criterion[] };
/** How many criteria each conformance level covers, from docs/acr.json (162). */
export function ConformanceSummary() {
  const count = (c: string) => ACR.criteria.filter((x) => x.conformance === c).length;
  const partial = ACR.criteria.filter((x) => x.conformance === 'Partially Supports');
  const stale = ACR.reviewed.version.split('.')[0] !== pkg.version.split('.')[0];
  return <>
    <p>Of the {ACR.criteria.length} {ACR.standard} criteria at levels A and AA, the components support {count('Supports')}, partly support {count('Partially Supports')}{count('Does Not Support') ? `, don't support ${count('Does Not Support')}` : ''}, and {count('Not Applicable')} are the app's alone (page titles, media, navigation across pages). Reviewed for version {ACR.reviewed.version} on {ACR.reviewed.date}.</p>
    {stale && <p role="note"><strong>This review is for {ACR.reviewed.version.split('.')[0]}.x; the current version is {pkg.version}.</strong> A new major is reviewed before its report is updated.</p>}
    {partial.length > 0 && <ul>{partial.map((x) => <li key={x.id}><strong>{x.id} {x.name}</strong>: {code(x.remarks)}</li>)}</ul>}
  </>;
}
/* eslint-disable jsx-a11y-x/no-redundant-roles, jsx-a11y-x/no-interactive-element-to-noninteractive-role -- on a phone CSS draws this table as blocks (site.css), and a browser that then drops its table semantics gets them back from the roles */
/** The Accessibility Conformance Report (18): every WCAG criterion at A and AA, as VPAT 2.5's table has it. */
export function ConformanceReport() {
  return <table className="sb-doc-table sb-doc-table--stack" role="table" style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
    <caption style={{ textAlign: 'start', fontWeight: 600, paddingBlock: 8 }}>{ACR.standard} Level A and AA: {ACR.product}, version {ACR.reviewed.version}</caption>
    <thead role="rowgroup"><tr role="row"><th style={cell} scope="col" role="columnheader">Criteria</th><th style={cell} scope="col" role="columnheader">Conformance level</th><th style={cell} scope="col" role="columnheader">Remarks and explanations</th></tr></thead>
    <tbody role="rowgroup">{ACR.criteria.map((x) => <tr key={x.id} role="row">
      <th style={{ ...cell, fontWeight: 'normal' }} scope="row" role="rowheader">{x.id} {x.name} (Level {x.level})</th>
      <td style={cell} role="cell" data-label="Conformance level">{x.conformance}</td>
      <td style={cell} role="cell" data-label="Remarks and explanations">{code(x.remarks)}</td>
    </tr>)}</tbody>
  </table>;
}
/* eslint-enable jsx-a11y-x/no-redundant-roles, jsx-a11y-x/no-interactive-element-to-noninteractive-role */
