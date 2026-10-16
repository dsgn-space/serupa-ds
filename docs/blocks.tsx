// Building blocks for the Storybook pages. Everything here reads tokens.json, README.md and the component
// guidelines at build time, so the documentation can't drift from the system.
import * as React from 'react';
import { Markdown } from '@storybook/blocks';
import tokens from '../tokens.json';
import readme from '../README.md?raw';

type Token = { name: string; value: string | Record<string, string>; usage?: string };
type Group = { note?: string; tokens: Token[] };
const T = tokens as unknown as Record<string, Group> & { type: any; color: Group & { themes: { id: string; name: string }[] } };

// Links between component guides (../Loader/README.md) become links to their Storybook pages.
function relink(md: string): string {
  return md.replace(/\]\((?:\.\.\/)?(?:src\/components\/)?(\w+)\/README\.md(#[\w-]+)?\)/g, (_, name) => `](?path=/docs/components-${name.toLowerCase()}--docs)`)
    .replace(/\]\(README\.md(#[\w-]+)?\)/g, '](?path=/docs/introduction--docs)');
}

/** A component's guidelines (its README.md), without the title the page already has. */
export function Guide({ source }: { source: string }) {
  return <Markdown>{relink(source.replace(/^# .*\n+/, ''))}</Markdown>;
}

const ROOT = readme.slice(0, readme.indexOf('\n---\n\n## Consuming this system'));
/** The README's introduction, before its first section. */
export function ReadmeIntro() {
  return <Markdown>{relink(ROOT.slice(0, ROOT.indexOf('\n## ')).replace(/^# .*\n+/, ''))}</Markdown>;
}
/** README sections by their headings (## level), each with its subsections. */
export function ReadmeSections({ headings }: { headings: string[] }) {
  const parts = ROOT.split(/\n(?=## )/);
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
  return <div>{T.type.groups.map((g: any) => <div key={g.name} style={{ marginBottom: 24 }}>
    <h3>{g.name}</h3>{g.note && <p>{code(g.note)}</p>}
    {g.styles.map((s: any) => <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12 }}><code>{s.name}</code><br />{s.fontSize} / {s.lineHeight} · {s.fontWeight}</div>
      <div className={s.name}>The quick brown fox jumps over the lazy dog</div>
    </div>)}
  </div>)}</div>;
}
