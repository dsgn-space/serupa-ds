// Checks design-tokens/ (the W3C Design Tokens export): in step with tokens.json, valid against the format
// (DTCG 2025.10), every reference resolves, and every token in tokens.json is exported somewhere.
//
//   node tools/test/design-tokens.mjs [project dir]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const P = path.resolve(process.argv[2] || path.join(HERE, '..', '..'));
const D = path.join(P, 'design-tokens');
const BASE_FILE = 'serupa.tokens.json';
const NS = 'com.serupa';
const R = [];
const check = (name, ok, detail = '') => R.push([name, !!ok, detail]);
const report = () => {
  for (const [n, ok, d] of R) console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}` + (ok || !d ? '' : `\n      ${d}`));
  const failed = R.filter((x) => !x[1]);
  console.log(`\nDesign tokens: ${R.length - failed.length}/${R.length} passed`);
  process.exit(failed.length ? 1 : 0);
};
const load = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

const r = spawnSync(process.execPath, [path.join(HERE, '..', 'tokens', 'export.mjs'), '--check'], { cwd: P, encoding: 'utf8' });
check('design-tokens/ is in step with tokens.json', r.status === 0, (r.stdout || '').trim());
if (r.status !== 0 && !fs.existsSync(path.join(D, BASE_FILE))) report();

const base = load(path.join(D, BASE_FILE));
const themes = Object.fromEntries(fs.readdirSync(path.join(D, 'themes')).sort().map((f) => [f.slice(0, -'.tokens.json'.length), load(path.join(D, 'themes', f))]));
const cssOnly = load(path.join(D, 'css-values.json'));

const TYPES = new Set(['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography']);
function* tokens(tree, p = []) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith('$') || !v || typeof v !== 'object') continue;
    if ('$value' in v) yield [[...p, k], v];
    else yield* tokens(v, [...p, k]);
  }
}
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isRef = (v) => typeof v === 'string' && /^\{[^{}]+\}$/.test(v);
const okColor = (v) => isRef(v) || (isObj(v) && v.colorSpace === 'srgb' && Array.isArray(v.components) && v.components.length === 3 && v.components.every((c) => c >= 0 && c <= 1)
  && (v.alpha ?? 1) >= 0 && (v.alpha ?? 1) <= 1 && /^#[0-9a-f]{6}$/.test(v.hex ?? '#000000'));
const okDim = (v) => isRef(v) || (isObj(v) && isNum(v.value) && ['px', 'rem'].includes(v.unit));
const okLayer = (v) => isObj(v) && okColor(v.color) && ['offsetX', 'offsetY', 'blur', 'spread'].every((k) => okDim(v[k])) && typeof (v.inset ?? false) === 'boolean';
const SHAPE = {
  color: okColor, dimension: okDim,
  fontFamily: (v) => isRef(v) || typeof v === 'string' || (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string')),
  fontWeight: (v) => isRef(v) || (isNum(v) && v >= 1 && v <= 1000),
  duration: (v) => isRef(v) || (isObj(v) && isNum(v.value) && ['ms', 's'].includes(v.unit)),
  cubicBezier: (v) => isRef(v) || (Array.isArray(v) && v.length === 4 && v[0] >= 0 && v[0] <= 1 && v[2] >= 0 && v[2] <= 1),
  number: (v) => isRef(v) || isNum(v),
  shadow: (v) => isRef(v) || okLayer(v) || (Array.isArray(v) && v.length > 0 && v.every(okLayer)),
  typography: (v) => isObj(v) && ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight'].every((k) => k in v),
};
const badType = [], badValue = [], badName = [];
const allFiles = [[BASE_FILE, base], ...Object.entries(themes).map(([k, v]) => [`themes/${k}.tokens.json`, v])];
const compDir = path.join(D, 'components');
if (fs.existsSync(compDir)) for (const f of fs.readdirSync(compDir).sort()) allFiles.push([`components/${f}`, load(path.join(compDir, f))]);
for (const [f, tree] of allFiles) {
  for (const [p, tok] of tokens(tree)) {
    if (p.some((x) => /[.{}]|^\$/.test(x))) badName.push(p.join('.'));
    const ty = tok.$type;
    if (!TYPES.has(ty)) { badType.push(`${f}: ${p.join('.')} (${ty})`); continue; }
    if (SHAPE[ty] && !SHAPE[ty](tok.$value)) badValue.push(`${f}: ${p.join('.')}`);
  }
}
check('every token has a standard $type', !badType.length, badType.slice(0, 8).join('; '));
check('every $value has the shape its type requires', !badValue.length, badValue.slice(0, 8).join('; '));
check('token names avoid the reserved characters . { } and a leading $', !badName.length, badName.slice(0, 8).join('; '));

const index = new Set([...tokens(base)].map(([p]) => p.join('.')));
for (const [p] of tokens(Object.values(themes)[0])) index.add(p.join('.'));   // component tokens may point at theme aliases
function* refs(v) {
  if (isRef(v)) yield v.slice(1, -1);
  else if (v && typeof v === 'object') for (const x of Object.values(v)) yield* refs(x);
}
const unres = [];
for (const [f, tree] of allFiles) for (const [p, tok] of tokens(tree)) for (const rf of refs(tok.$value)) if (!index.has(rf)) unres.push(`${f}: ${p.join('.')} → {${rf}}`);
check(`every reference resolves (to ${BASE_FILE} or a theme alias)`, !unres.length, unres.slice(0, 8).join('; '));

const src = load(path.join(P, 'tokens.json'));
const exported = new Set();
for (const [, tree] of allFiles) for (const [, tok] of tokens(tree)) { const v = tok.$extensions?.[NS]?.cssVar; if (v) exported.add(v.slice(2)); }
for (const v of Object.values(cssOnly)) if (isObj(v)) for (const n of Object.keys(v)) exported.add(n);
const missing = Object.values(src).filter((g) => isObj(g) && Array.isArray(g.tokens)).flatMap((g) => g.tokens).map((x) => x.name).filter((n) => !exported.has(n));
check('every token in tokens.json is exported (typed, as an alias, or as a CSS value)', !missing.length, missing.slice(0, 10).join(', '));
const nAlias = new Set(Object.values(themes).map((t) => Object.keys(t.color || {}).length));
check(`each of the ${Object.keys(themes).length} theme files has the same aliases`, nAlias.size === 1, [...nAlias].join(', '));
report();
