// Works out every dark fill from its light theme's (ADR-0026) and writes it into the token source, as the hex and
// the palette step it is lifted from: tokens/serupa.tokens.json's lift says where each hex comes from, and
// source.mjs checks the two still agree. Run it after a palette step, a raised surface or the rule changes, then
// npm run tokens.
//   node tools/tokens/lift.mjs
// The rule is darkFillShift's in bin/brand/generate.mjs, the same serupa-brand uses: the light theme's shade,
// lightened in OKLCH (hue and chroma kept) as far as 3:1 on a raised dark card asks, and at least DARK_LIFT while
// the text on it keeps 4.5:1. Hover and held down are lifted as much as the fill. Yellow Dark keeps its palette
// steps (bright yellow under dark text, Diki 22 Nov 2026).
import fs from 'node:fs';
import { SOURCE, toSource, fromSource } from './source.mjs';
import { darkFillShift, lighter } from '../../bin/brand/generate.mjs';

const src = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
const { tokens } = fromSource(src);
const C = src.color;
const ref = (v) => /^\{(?:color\.)?([^{}]+)\}$/.exec(String(v))?.[1];
const hex = (v) => { const r = ref(v); return r ? hex(C[r].$value.hex ?? C[r].$value) : v; };
const themes = tokens.color.themes.map((t) => t.id);
const ext = (n) => C[n].$extensions['com.serupa'];
// A value as the source gives it for a theme: its own, the dark one, or $value.
const at = (n, id) => ext(n).themes?.[id] ?? (id.endsWith('-dark') && ext(n).dark != null ? ext(n).dark : C[n].$value);
const lifts = {};
const set = (n, key, from, by) => {
  const v = lighter(hex(from), by);
  if (key === 'dark') ext(n).dark = v; else ext(n).themes[key] = v;
  (lifts[n] ??= {})[key] = { from: `{color.${ref(from)}}`, by };
};

// The brand fills, theme by theme.
for (const id of themes.filter((t) => t.endsWith('-dark') && t !== 'yellow-dark')) {
  const lightId = id.replace(/-dark$/, '-light');
  const d = darkFillShift(hex(at('surface-brand', lightId)), hex(at('surface-raised', id)));
  for (const n of ['surface-brand', 'surface-brand-hover', 'surface-brand-pressed']) set(n, id, at(n, lightId), d);
}
// The status fills, the same in every dark theme (each has one raised surface, checked here).
const raised = new Set(themes.filter((t) => t.endsWith('-dark')).map((t) => hex(at('surface-raised', t))));
if (raised.size !== 1) throw new Error(`the dark themes' raised surfaces differ (${[...raised].join(', ')}): a status fill would need one per theme`);
for (const s of ['success', 'warning', 'info', 'danger']) {
  const d = darkFillShift(hex(C[`surface-${s}`].$value), [...raised][0], hex(at(`text-on-${s}`, 'blue-dark')));
  for (const n of [`surface-${s}`, `surface-${s}-hover`, `surface-${s}-pressed`].filter((x) => C[x])) set(n, 'dark', C[n].$value, d);
}
for (const [n, l] of Object.entries(lifts)) ext(n).lift = l;

const r = fromSource(src);
if (r.problems.length) { console.error(r.problems.join('\n')); process.exit(1); }
fs.writeFileSync(SOURCE, JSON.stringify(toSource(r.tokens), null, 2) + '\n');
console.log(`tokens/serupa.tokens.json: ${Object.values(lifts).reduce((a, l) => a + Object.keys(l).length, 0)} dark fills lifted from their light theme's`);
