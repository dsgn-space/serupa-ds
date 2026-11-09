// The proof brand's leak report (.storybook/proof-brand.ts): opens every story in proof-light and proof-dark and lists
// what doesn't follow the brand, by component, so each is a hard-coded value to route through a token. Not a CI check:
// the brand isn't shipped, and the list is a to-do, not a gate.
//   npm run build-storybook && node tools/test/proof-brand.mjs [report.md]
// What counts as a leak, on any element a story draws:
//   corner    a rounded corner that isn't a circle or pill (every rounded-* step and radius role is 0 in the brand)
//   typeface  text drawn in a sans face (the brand's is Georgia; monospace is left alone)
//   color     a color, background or border in a zinc, blue, green, amber, red or sky step (the brand swaps all six)
//   shadow    a box-shadow with blur (the brand's shadows are hard offsets)
// It also checks every contrast pair (tools/tokens/contrast-pairs.mjs) in both modes of the brand.
import fs from 'node:fs';
import path from 'node:path';
import { PAGES, PROJECT, browser, inParallel, openUrl, serve } from './lib.mjs';
import { PAIRS } from '../tokens/contrast-pairs.mjs';

const SB = path.join(PROJECT, 'storybook-static');
if (!fs.existsSync(path.join(SB, 'index.json'))) { console.log('FAIL  storybook-static/ is missing (npm run build-storybook)'); process.exit(1); }
const out = process.argv.slice(2).find((a) => !a.startsWith('--'));
const tokens = JSON.parse(fs.readFileSync(path.join(PROJECT, 'tokens.json'), 'utf8'));
const hexOf = (name) => { for (const g of Object.values(tokens)) if (g && Array.isArray(g.tokens)) { const t = g.tokens.find((x) => x.name === name); if (t) return typeof t.value === 'string' ? t.value : Object.values(t.value)[0]; } return null; };
const rgb = (h) => `rgb(${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)})`;
// The swapped families' steps, as computed styles print them; a step another family shares exactly isn't counted.
const SWAPPED = ['zinc', 'blue', 'green', 'amber', 'red', 'sky'], STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const KEEP = new Set(['stone', 'indigo', 'emerald', 'yellow', 'rose', 'cyan'].flatMap((f) => STEPS.map((s) => hexOf(`${f}-${s}`))).filter(Boolean).map(rgb));
const LEAK = Object.fromEntries(SWAPPED.flatMap((f) => STEPS.map((s) => [hexOf(`${f}-${s}`), `${f}-${s}`])).filter(([h]) => h && !KEEP.has(rgb(h))).map(([h, n]) => [rgb(h), n]));

const stories = Object.values(JSON.parse(fs.readFileSync(path.join(SB, 'index.json'), 'utf8')).entries)
  .filter((e) => e.type === 'story' && e.exportName !== 'Playground' && !(e.tags || []).includes('!visual'));
const { base, close } = serve(SB);
const b = await browser();
const pages = await Promise.all(Array.from({ length: PAGES }, async () => (await b.newContext({ viewport: { width: 900, height: 600 } })).newPage()));

function scan(LEAK) {
  const found = [];
  const name = (el) => [...el.classList].find((c) => c.startsWith('dk-')) || el.tagName.toLowerCase();
  const root = document.querySelector('#storybook-root');
  const els = [root, ...root.querySelectorAll('*'), ...document.querySelectorAll('[popover], dialog, .dk-toaster *, body > div:not(#storybook-root) *')];
  for (const el of new Set(els)) {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    if (s.display === 'none' || s.visibility === 'hidden' || !r.width || !r.height) continue;
    const owner = el.closest('[class*="dk-"]');
    if (!owner) continue;   // the story's own markup, not a component's
    const who = name(owner);
    const rad = Math.max(...['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((c) => parseFloat(s[`border${c}Radius`]) || 0));
    if (rad > 0.5 && rad < Math.min(r.width, r.height) / 2 - 0.5 && !/%/.test(s.borderTopLeftRadius)) found.push(['corner', who, `${rad}px`]);
    const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (text && !/georgia/i.test(s.fontFamily) && !/mono/i.test(s.fontFamily)) found.push(['typeface', who, s.fontFamily.split(',')[0]]);
    for (const p of ['color', 'backgroundColor', 'borderTopColor', 'outlineColor', 'fill', 'stroke']) {
      if (p === 'borderTopColor' && !(parseFloat(s.borderTopWidth) > 0)) continue;
      if (p === 'outlineColor' && s.outlineStyle === 'none') continue;
      if (p === 'color' && !text) continue;
      const v = s[p], n = LEAK[v];
      if (n) found.push(['color', who, `${p.replace(/Color$/, '')} ${n}`]);
    }
    // Each layer is "[inset] <color> x y blur spread" as computed; a ring (0 0 0 spread) or a hard offset has no blur.
    const blurred = s.boxShadow !== 'none' && s.boxShadow.replace(/[a-z-]+\([^)]*\)/g, '').split(',').some((l) => (parseFloat(l.trim().replace(/^inset\s*/, '').split(/\s+/)[2]) || 0) > 0);
    if (blurred) found.push(['shadow', who, 'blurred']);
  }
  return found;
}

const leaks = new Map();   // "kind|component|detail" → Set of story ids
const broken = [];
await inParallel(stories, pages, async (e, page) => {
  for (const mode of ['light', 'dark']) {
    const err = await openUrl(page, `${base}/iframe.html?id=${e.id}&viewMode=story&globals=brand:proof;mode:${mode};a11y.manual:!true`);
    const drawn = !err && await page.waitForFunction(() => document.querySelector('#storybook-root')?.children.length > 0, null, { timeout: 15000 }).then(() => true, () => false);
    if (!drawn) { broken.push(`${e.id} (${mode})`); continue; }
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(150);
    for (const [kind, who, detail] of await page.evaluate(scan, LEAK)) {
      const k = `${kind}|${who}|${detail}`;
      if (!leaks.has(k)) leaks.set(k, new Set());
      leaks.get(k).add(e.id.replace(/--.*/, ''));
    }
  }
});

// Contrast pairs in the brand, from the custom properties as the page computes them.
const page = pages[0];
await openUrl(page, `${base}/iframe.html?id=${stories[0].id}&viewMode=story&globals=brand:proof;mode:light`);
const contrast = [];
for (const mode of ['light', 'dark']) {
  const res = await page.evaluate(({ PAIRS, mode }) => {
    document.documentElement.setAttribute('data-theme', `proof-${mode}`);
    const probe = document.createElement('i');
    document.body.appendChild(probe);
    const col = (n) => { probe.style.color = `var(--${n})`; return getComputedStyle(probe).color.match(/[\d.]+/g).map(Number); };
    const lum = ([r, g, b]) => [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const bad = [];
    for (const [fg, bg, need, what] of PAIRS) {
      const x = lum(col(fg)), y = lum(col(bg)), r = (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      if (r < need) bad.push(`${fg} on ${bg}: ${r.toFixed(2)}:1, needs ${need}:1 (${what})`);
    }
    probe.remove();
    return bad;
  }, { PAIRS, mode });
  for (const x of res) contrast.push(`proof-${mode}: ${x}`);
}
await b.close();
close();

const byKind = {};
for (const [k, ids] of leaks) { const [kind, who, detail] = k.split('|'); (byKind[kind] ||= []).push({ who, detail, ids: [...ids].sort() }); }
const lines = [`# Proof brand leaks`, '', `${stories.length} stories in proof-light and proof-dark. Each line is a component part that doesn't follow the brand, with the stories it shows in.`, ''];
for (const kind of ['corner', 'typeface', 'color', 'shadow']) {
  const rows = (byKind[kind] || []).sort((a, z) => z.ids.length - a.ids.length || a.who.localeCompare(z.who));
  lines.push(`## ${kind[0].toUpperCase() + kind.slice(1)} (${rows.length})`, '');
  for (const r of rows) lines.push(`- \`${r.who}\` ${r.detail}: ${r.ids.slice(0, 6).join(', ')}${r.ids.length > 6 ? ` and ${r.ids.length - 6} more` : ''}`);
  lines.push('');
}
lines.push(`## Contrast (${contrast.length})`, '', ...contrast.map((c) => `- ${c}`), '');
if (broken.length) lines.push(`## Stories that didn't draw (${broken.length})`, '', ...broken.map((x) => `- ${x}`), '');
const text = lines.join('\n');
if (out) fs.writeFileSync(out, text); else console.log(text);
console.log(`Proof brand: ${leaks.size} leaks, ${contrast.length} contrast pairs short${out ? `, written to ${out}` : ''}`);
