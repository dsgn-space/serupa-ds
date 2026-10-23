// Interoperability: builds design-tokens/ with Style Dictionary (a real token pipeline) through
// tools/tokens/style-dictionary.config.mjs, then checks that every variable it outputs has the same value
// as the system's own tokens, in every theme. Skipped when Style Dictionary isn't installed
// (npm i -D style-dictionary@5).
//   node tools/test/style_dictionary.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { HERE, tokens, report, done, fail } from './lib.mjs';

try { await import('style-dictionary'); } catch {
  // In CI a missing install is a failure, not a skip, so the check can't pass by accident.
  if (process.env.CI || process.env.VITEST) fail('Style Dictionary is not installed (npm ci should install it)');
  console.log('SKIP  Style Dictionary is not installed (npm i -D style-dictionary@5)'); process.exit(0);
}
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-sd-'));
const r = spawnSync('node', [path.join(HERE, '..', 'tokens', 'style-dictionary.config.mjs'), out], { encoding: 'utf8' });
if (r.status !== 0) fail('Style Dictionary build\n' + r.stderr);

const t = tokens();
const first = (v) => (v && typeof v === 'object' ? Object.values(v)[0] : v);
const flat = {};
for (const g of Object.values(t)) if (g && Array.isArray(g.tokens)) for (const x of g.tokens) flat[x.name] = x.value;
for (const [k, v] of Object.entries(t.type.families)) flat['font-' + k] = v;
// component tokens: --button-* → the shared token they reference
const base = JSON.parse(fs.readFileSync(path.join(HERE, '..', '..', 'design-tokens', 'serupa.tokens.json'), 'utf8'));
const compDir = path.join(HERE, '..', '..', 'design-tokens', 'components');
const COMP = {};
if (fs.existsSync(compDir)) for (const f of fs.readdirSync(compDir)) {
  const walk = (tree) => { for (const [k, v] of Object.entries(tree)) { if (k.startsWith('$')) continue; if (v && v.$value !== undefined) COMP[v.$extensions['com.serupa'].cssVar.slice(2)] = v.$value; else if (v && typeof v === 'object') walk(v); } };
  walk(JSON.parse(fs.readFileSync(path.join(compDir, f), 'utf8')));
}
const compRef = (v) => { if (typeof v === 'object') return v.alpha === 0 ? 'transparent' : v.hex; const [grp, name] = v.slice(1, -1).split(/\.(.+)/); return grp === 'color' ? '{' + name + '}' : '{' + base[grp][name].$extensions['com.serupa'].cssVar.slice(2) + '}'; };
for (const [n, v] of Object.entries(COMP)) flat[n] = compRef(v);
const resolve = (name, th) => { let v = flat[name]; v = v && typeof v === 'object' ? (v[th] ?? first(v)) : v; const m = /^\{(.+)\}$/.exec(v); return m ? resolve(m[1], th) : v; };

// Same value, however each side writes it: colors as RGBA, % as a ratio, 0 as 0px, no quotes.
const hex = (h) => { h = h.slice(1); if (h.length <= 4) h = [...h].map((c) => c + c).join(''); const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); return `rgba(${n.join(',')},${h.length === 8 ? +(parseInt(h.slice(6), 16) / 255).toFixed(2) : 1})`; };
const rgb = (_, inner) => { const a = inner.trim().split(/[\s,/]+/); const c = a.slice(0, 3).map((x) => (x.endsWith('%') ? Math.round(parseFloat(x) * 2.55) : Math.round(+x))); const al = a[3] == null ? 1 : a[3].endsWith('%') ? parseFloat(a[3]) / 100 : +a[3]; return `rgba(${c.join(',')},${+al.toFixed(2)})`; };
const norm = (v) => String(v).replace(/cubic-bezier\(0, 0, 1, 1\)/g, 'linear').replace(/rgba?\(\s*0%?\s+0%?\s+0%?\s*\/\s*0\s*\)/g, 'transparent').replace(/#0000\b/g, 'transparent').replace(/#[0-9a-fA-F]{3,8}\b/g, hex).replace(/rgba?\(([^()]*)\)/g, rgb).replace(/rgba\(\d+,\d+,\d+,0\)/g, 'transparent').replace(/["']/g, '').replace(/(^|[^\d.])\.(\d)/g, '$10.$2').replace(/(-?\d*\.?\d+)%/g, (_, n) => String(+(n / 100).toFixed(6))).replace(/(^|[\s(])0(?=[\s,)]|$)/g, '$10px').replace(/(-?\d+\.\d+)/g, (n) => String(+(+n).toFixed(3))).replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim();

// "0 1px rgb(…)" is "0px 1px 0px 0px rgb(…)": pad each shadow layer to x, y, blur, spread
const shadowCanon = (v) => /\d(px)?\s+-?\d/.test(String(v)) && /(rgba?\(|#[0-9a-f]{3,8})/i.test(String(v))
  ? String(v).split(/,(?![^()]*\))/).map((layer) => { const inset = /^\s*inset\s/.test(layer); const col = (layer.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})\s*$/) || [''])[0]; const nums = layer.replace('inset', '').replace(col, '').trim().split(/\s+/).map((n) => (/^-?0$/.test(n) ? '0px' : n)); while (nums.length < 4) nums.push('0px'); return (inset ? 'inset ' : '') + nums.join(' ') + ' ' + col; }).join(', ')
  : v;
const R = [];
const files = fs.readdirSync(out).filter((f) => f.endsWith('.css'));
let compared = 0;
for (const f of files) {
  const th = f.replace('.css', '');
  const css = fs.readFileSync(path.join(out, f), 'utf8');
  const bad = [];
  for (const m of css.matchAll(/^\s*--([A-Za-z0-9._-]+):\s*([^;]*);/gm)) {
    const name = m[1];
    if (!(name in flat)) continue;           // typography composites have no single variable
    compared++;
    const want = resolve(name, th);
    if (norm(shadowCanon(m[2])) !== norm(shadowCanon(want))) bad.push(`--${name}: Style Dictionary ${m[2]} · tokens.json ${want}`);
  }
  R.push({ name: `${th}: every variable Style Dictionary builds equals the token`, ok: !bad.length, detail: bad.slice(0, 6).join('\n      ') });
}
fs.rmSync(out, { recursive: true, force: true });
console.log(`(${compared} values compared across ${files.length} themes)`);
done(report('Style Dictionary', R));
