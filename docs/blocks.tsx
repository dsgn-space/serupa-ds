// Building blocks for the Storybook pages. Everything here reads tokens.json, README.md and the component
// guidelines at build time, so the documentation can't drift from the system.
import * as React from 'react';
import { Markdown } from '@storybook/addon-docs/blocks';
import tokens from '../tokens.json';
import readme from '../README.md?raw';
import foundations from './foundations.md?raw';
import iconNames from './icon-names.json';
import { Icon } from '../src/components/Icon/Icon';
import { SearchInput } from '../src/components/SearchInput/SearchInput';
import { customIcons, isIconData } from '../src/icons';
import type { IconData } from '../src/material/types';

type Token = { name: string; value: string | Record<string, string>; usage?: string };
type Group = { note?: string; tokens: Token[] };
type TypeStyle = { name: string; fontSize: string; lineHeight: string; fontWeight: string };
type TypeGroup = { name: string; note?: string; styles: TypeStyle[] };
const T = tokens as unknown as Record<string, Group> & { type: { groups: TypeGroup[] }; color: Group & { themes: { id: string; name: string }[] } };

// Each component's sidebar path (Components/Forms/Input), read from its stories' title, so links follow the grouping.
const storyFiles = import.meta.glob('../src/components/*/*.stories.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const docsId: Record<string, string> = {};
for (const src of Object.values(storyFiles)) {
  const title = /title: '([^']+)'/.exec(src)?.[1];
  if (title) docsId[title.split('/').pop()!] = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Links between component guides (../Loader/README.md) become links to their Storybook pages.
function relink(md: string): string {
  return md.replace(/\]\((?:\.\.\/)?(?:src\/components\/)?(\w+)\/README\.md(#[\w-]+)?\)/g, (_, name) => `](?path=/docs/${docsId[name] || `components-${name.toLowerCase()}`}--docs)`)
    .replace(/\]\(README\.md(#[\w-]+)?\)/g, '](?path=/docs/introduction--docs)');
}

/** A component's guidelines (its README.md), without the title the page already has. */
export function Guide({ source }: { source: string }) {
  return <Markdown>{relink(source.replace(/^# .*\n+/, ''))}</Markdown>;
}

const ROOT = readme;
/** The README's introduction, before its first section. */
export function ReadmeIntro() {
  return <Markdown>{relink(ROOT.slice(0, ROOT.indexOf('\n## ')).replace(/^# .*\n+/, ''))}</Markdown>;
}
/** Sections of README.md and docs/foundations.md by their headings (## level), each with its subsections. */
export function ReadmeSections({ headings }: { headings: string[] }) {
  const parts = [ROOT, foundations].flatMap((md) => md.split(/\n(?=## )/));
  const md = headings.map((h) => parts.find((p) => p.startsWith(`## ${h}\n`)) || `> Missing README section: ${h}`).join('\n\n');
  return <Markdown>{relink(md)}</Markdown>;
}

const code = (s?: string) => (s || '').split(/`([^`]+)`/).map((x, i) => (i % 2 ? <code key={i}>{x}</code> : x));
const cell: React.CSSProperties = { padding: '6px 10px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', textAlign: 'left' };
const val = (v: Token['value']) => (typeof v === 'string' ? v : Object.values(v)[0]);

/** Every token in a group, with its value, what it's for and a live preview. */
export function TokenTable({ group, preview }: { group: string; preview?: 'space' | 'radius' | 'shadow' | 'duration' | 'none' }) {
  const g = T[group];
  const show = (t: Token) => {
    const v = `var(--${t.name})`;
    if (preview === 'space') return <div style={{ height: 12, width: v, background: 'var(--primary)', borderRadius: 2 }} />;
    if (preview === 'radius') return <div style={{ height: 40, width: 40, border: '2px solid var(--primary)', borderRadius: v }} />;
    if (preview === 'shadow') return <div style={{ height: 40, width: 64, background: 'var(--surface)', boxShadow: t.name.startsWith('text-') ? undefined : v, textShadow: t.name.startsWith('text-') ? v : undefined, borderRadius: 6, display: 'grid', placeItems: 'center' }}>{t.name.startsWith('text-') ? 'Aa' : ''}</div>;
    if (preview === 'duration' && /^(duration|delay)-/.test(t.name)) return <span className="dk-sb-pulse" style={{ display: 'inline-block', height: 12, width: 12, borderRadius: 6, background: 'var(--primary)', animationDuration: `calc(${v} * 2 + 200ms)` }} />;
    return null;
  };
  return <div>
    {g.note && <p>{code(g.note)}</p>}
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr><th style={cell}>Token</th><th style={cell}>Value</th>{preview && preview !== 'none' && <th style={cell}>Preview</th>}<th style={cell}>Use</th></tr></thead>
      <tbody>{g.tokens.map((t) => <tr key={t.name}>
        <td style={cell}><code>--{t.name}</code></td><td style={cell}><code>{val(t.value)}</code></td>
        {preview && preview !== 'none' && <td style={cell}>{show(t)}</td>}<td style={cell}>{code(t.usage)}</td></tr>)}</tbody>
    </table>
  </div>;
}

const SHADES = /^([a-z]+)-(50|100|200|300|400|500|600|700|800|900|950)$/;
/** The palette: every color family, 50 to 950. */
export function Palette() {
  const fam: Record<string, Token[]> = {};
  for (const t of T.color.tokens) { const m = SHADES.exec(t.name); if (m && typeof t.value === 'string') (fam[m[1]] ||= []).push(t); }
  return <div style={{ display: 'grid', gap: 8 }}>
    {Object.entries(fam).map(([f, list]) => <div key={f} style={{ display: 'grid', gridTemplateColumns: '80px repeat(11, 1fr)', gap: 4, alignItems: 'center', fontSize: 12 }}>
      <strong>{f}</strong>
      {list.map((t) => <div key={t.name} title={`--${t.name}: ${t.value}`}><div style={{ height: 36, borderRadius: 6, background: `var(--${t.name})` }} /><div>{t.name.split('-')[1]}</div><code style={{ fontSize: 10 }}>{String(t.value)}</code></div>)}
    </div>)}
  </div>;
}

/** The alias colors: a live swatch in the theme picked in the toolbar, and the palette color in every theme. */
export function Aliases() {
  const themes = T.color.themes;
  const list = T.color.tokens.filter((t) => typeof t.value === 'object' && Object.keys(t.value).length > 1);
  return <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
    <thead><tr><th style={cell}>Alias</th><th style={cell}>Now</th>{themes.map((th) => <th key={th.id} style={cell}>{th.name}</th>)}<th style={cell}>Use</th></tr></thead>
    <tbody>{list.map((t) => <tr key={t.name}>
      <td style={cell}><code>--{t.name}</code></td>
      <td style={cell}><div style={{ height: 24, width: 40, borderRadius: 4, background: `var(--${t.name})`, border: '1px solid var(--border)' }} /></td>
      {themes.map((th) => <td key={th.id} style={cell}><code>{String((t.value as Record<string, string>)[th.id]).replace(/[{}]/g, '')}</code></td>)}
      <td style={cell}>{code(t.usage)}</td></tr>)}</tbody>
  </table>;
}

/** The type scale: each type-* style rendered in its own family, size, line height and weight. */
export function TypeScale() {
  return <div>{T.type.groups.map((g) => <div key={g.name} style={{ marginBottom: 24 }}>
    <h3>{g.name}</h3>{g.note && <p>{code(g.note)}</p>}
    {g.styles.map((s) => <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12 }}><code>{s.name}</code><br />{s.fontSize} / {s.lineHeight} · {s.fontWeight}</div>
      <div className={s.name}>The quick brown fox jumps over the lazy dog</div>
    </div>)}
  </div>)}</div>;
}

/** A searchable gallery of icons (docs/icon-names.json) and your custom icons; a click copies an icon's name. */
export function IconGallery() {
  const [q, setQ] = React.useState('');
  const [copied, setCopied] = React.useState('');
  const [all, setAll] = React.useState<[string, IconData][] | null>(null);
  const groups: Record<string, string[]> = { ...(iconNames as unknown as Record<string, string[]>) };
  delete groups.$description;
  if (customIcons.length) groups['Your custom icons'] = [...customIcons];
  const term = q.trim().toLowerCase().replace(/\s+/g, '_');
  // The full set (about 3 MB) loads only once someone searches.
  React.useEffect(() => {
    if (term && !all) import('../src/material/icons').then((m) => setAll(Object.entries(m).filter((e): e is [string, IconData] => isIconData(e[1]))));
  }, [term, all]);
  const copy = (text: string) => {
    try { navigator.clipboard.writeText(text); } catch { /* no clipboard: the text still shows */ }
    setCopied(text);
  };
  const shown = Object.entries(groups).map(([g, list]) => [g, list.filter((n) => !term || n.includes(term))] as const).filter(([, l]) => l.length);
  const everyday = new Set(Object.values(groups).flat());
  const more = term && all ? all.filter(([, d]) => !everyday.has(d.name) && d.name.includes(term)) : [];
  const LIMIT = 120;
  const tile = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 4px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', font: 'inherit' } as const;
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))', gap: 8 } as const;
  const label = { fontSize: 12, color: 'var(--text-muted)', overflowWrap: 'anywhere', textAlign: 'center' } as const;
  // sb-unstyled: keeps Storybook's docs styles off the buttons.
  return <div className="sb-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ maxWidth: 320 }}><SearchInput aria-label="Find an icon" placeholder="Find an icon, such as arrow" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    <p role="status" style={{ margin: 0, minHeight: 20, color: 'var(--text-muted)' }}>{copied ? <>Copied <code>{copied}</code></> : 'Click an icon to copy its name, or for other icons its import.'}</p>
    {shown.map(([g, list]) => <section key={g}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>{g}</h3>
      <div style={grid}>
        {list.map((n) => <button key={n} type="button" onClick={() => copy(n)} title={`<Icon name="${n}" />`} style={tile}>
          <Icon name={n} />
          <span style={label}>{n}</span>
        </button>)}
      </div>
    </section>)}
    {term ? <section>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>More Material Symbols{all ? ` (${more.length})` : ''}</h3>
      <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: 14 }}>These aren't everyday icons, so they don't work by name. Click one to copy its import, then pass it to the icon prop, such as <code>{'icon={Category}'}</code>.</p>
      {!all ? <p style={{ margin: 0 }}>Loading the full set…</p> : more.length ? <div style={grid}>
        {more.slice(0, LIMIT).map(([exp, d]) => <button key={exp} type="button" onClick={() => copy(`import { ${exp} } from "serupa-ds/icons";`)} title={`import { ${exp} } from "serupa-ds/icons"`} style={tile}>
          <Icon icon={d} />
          <span style={label}>{exp}</span>
        </button>)}
      </div> : <p style={{ margin: 0 }}>No other icon matches.</p>}
      {more.length > LIMIT ? <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Showing {LIMIT} of {more.length}. Type more of the name to narrow it down.</p> : null}
    </section> : null}
  </div>;
}

/** Icons at the system's sizes, with what each is for. */
export function IconSizes() {
  const sizes: [number, string][] = [[14, '`sm` buttons'], [16, '`md` buttons, inline with `text-sm`'], [20, '`lg` buttons, list rows'], [24, 'The default: toolbars, navigation'], [40, 'Empty states']];
  return <div className="sb-unstyled" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
    {sizes.map(([s, use]) => <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, maxWidth: 140, textAlign: 'center', fontSize: 12 }}>
      <Icon name="favorite" size={s} /><strong>{s}px</strong><span style={{ color: 'var(--text-muted)' }}>{code(use)}</span>
    </div>)}
  </div>;
}
