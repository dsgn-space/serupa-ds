// serupa-brand (I5): the themes it makes from a brand color pass every contrast pair the shipped themes are held to
// (tools/tokens/contrast-pairs.mjs), in light and dark, and 7:1 for more contrast; the shades run from light to dark
// with the color itself among them; the CSS works in a browser after tokens.css, as data-theme, as data-brand with
// data-mode, nested in another theme and with more contrast; a color nothing can pass, a taken name or a wrong
// argument stops with a message and exit 2.
//   node tools/test/brand.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, browser, report, done } from './lib.mjs';
import { PAIRS } from '../tokens/contrast-pairs.mjs';
import { brandTheme, contrast, oklchOf, readTokens, darkFillShift, lighter, BRAND_ALIASES } from '../../bin/brand/generate.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
const tokens = JSON.parse(fs.readFileSync(path.join(PROJECT, 'tokens.json'), 'utf8'));
const tokensCss = fs.readFileSync(path.join(PROJECT, 'tokens.css'), 'utf8');

// The shipped dark themes fill with their light theme's own shade: primary, its hover and its held-down color are the
// light theme's, each lightened as far as 3:1 on a raised dark card asks of the first and always a touch (darkFillShift), under white
// text at 4.5:1. So a primary button is the same color in light and dark, and a new brand in the token source that
// picks a lighter dark fill by hand fails here.
{
  const { palette } = readTokens(tokens);
  const val = (name) => tokens.color.tokens.find((x) => x.name === name).value;
  const hexOf = (v) => { const r = /^\{(.+)\}$/.exec(v)?.[1]; return r ? palette.get(r) : v; };
  const off = [], near = [];
  // Yellow Dark keeps the bright yellow 400 under yellow-950 text (Diki, 22 November 2026): a yellow dark enough for
  // white text reads as brown. Its text on the fill still passes 4.5:1.
  const BRIGHT = { 'yellow-dark': ['{yellow-400}', '{yellow-300}', '{yellow-200}'] };
  for (const [id, want] of Object.entries(BRIGHT)) {
    const got = ['primary', 'primary-hover', 'primary-pressed'].map((n) => val(n)[id]);
    const low = got.map((v) => contrast(hexOf(val('on-primary')[id]), hexOf(v))).filter((r) => r < 4.5);
    t(`${id} keeps its bright fill (${want.join(', ')}) under dark text at 4.5:1`, got.join() === want.join() && !low.length, `${got.join(', ')}; ${low.map((r) => r.toFixed(2)).join(', ')}`);
  }
  for (const { id } of tokens.color.themes.filter((th) => th.id.endsWith('-dark') && !(th.id in BRIGHT))) {
    const lightId = id.replace(/-dark$/, '-light');
    const d = darkFillShift(hexOf(val('primary')[lightId]), hexOf(val('surface-raised')[id]));
    for (const n of ['primary', 'primary-hover', 'primary-pressed']) {
      const want = lighter(hexOf(val(n)[lightId]), d), got = hexOf(val(n)[id]);
      if (got !== want) off.push(`${id} ${n}: ${got}, not ${want}`);
      if (contrast('#ffffff', got) < 4.5 || hexOf(val('on-primary')[id]) !== '#ffffff') off.push(`${id} ${n}: white text ${contrast('#ffffff', got).toFixed(2)}:1`);
    }
    near.push(d);
  }
  t("every other shipped dark theme's primary, hover and held-down fills are its light theme's, lightened as far as 3:1 on a raised card asks and always a touch, under white text", !off.length && near.length > 0, off.join('; '));
  t('no shipped dark fill is more than 0.07 lighter (OKLCH L) than its light theme\'s: the two read as one color', near.every((d) => d <= 0.07), near.join(' '));
}

// Brand colors across the wheel, light and dark, loud and grey.
// The last four passed on white but not on a muted panel before GR327.
const COLORS = ['#2563eb', '#0f766e', '#e11d48', '#f59e0b', '#7c3aed', '#111111', '#fde047', '#22c55e', '#64748b', '#ff00ff', '#00ffff', '#8b4513', '#ffffff', '#000000', '#16a34a', '#db2777', '#059669', '#14532d'];
const made = {};
for (const c of COLORS) {
  let r, err = '';
  try { r = brandTheme({ name: 'acme', color: c, tokens }); } catch (e) { err = e.message; }
  if (!r) { t(`${c}: makes a light and a dark theme`, false, err); continue; }
  made[c] = r;
  const low = [];
  for (const [th, v] of Object.entries(r.themes)) for (const [fg, bg, need] of PAIRS) {
    if (!(fg in v) || !(bg in v)) continue;
    const x = contrast(v[fg], v[bg]);
    if (x < need) low.push(`${th}: ${fg} on ${bg} ${x.toFixed(2)}:1 (needs ${need})`);
  }
  t(`${c}: every contrast pair passes in acme-light and acme-dark`, !low.length, low.join('; '));
  const L = Object.values(r.shades).map((h) => oklchOf(h)[0]);
  t(`${c}: the shades run from light (50) to dark (950), the color among them`, L.every((l, i) => !i || l < L[i - 1]) && Object.values(r.shades).includes(c.length === 4 ? c : c.toLowerCase()), Object.values(r.shades).join(' '));
}
// Every alias of the shipped themes has a value in both, so a brand theme nested in another sets them all.
const shippedAliases = tokens.color.tokens.filter((x) => typeof x.value === 'object' && Object.keys(x.value).length > 1).map((x) => x.name);
const any = Object.values(made)[0];
if (any) {
  const missing = Object.entries(any.themes).flatMap(([th, v]) => shippedAliases.filter((a) => !(a in v)).map((a) => `${th}: ${a}`));
  t('the themes set every alias the shipped themes set', !missing.length, missing.join(', '));
  t('only the brand aliases name the brand shades', !/--(?!acme-|srp-more-|primary|on-primary|focus-ring|link-visited)[a-z-]+: var\(--acme-/.test(any.css) && BRAND_ALIASES.every((a) => any.css.includes(`--${a}:`)), '');
  t('the CSS names no shipped brand hue for a brand alias', !/--(primary|primary-hover|primary-pressed|primary-subtle|primary-subtle-pressed|on-primary|focus-ring|srp-more-[a-z-]+): [^;]*--(blue|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-/.test(any.css));
}
// A violet brand's visited links turn fuchsia, as the violet theme's do, so they stay a hue apart.
if (made['#7c3aed']) t('a violet brand gets fuchsia visited links', made['#7c3aed'].css.includes('--link-visited: var(--fuchsia-700)'));
for (const [name, why] of [['blue', 'a theme Serupa ships'], ['red', "a palette color's name"], ['Acme', "can't be a theme name"], ['9a', "can't be a theme name"]]) {
  let msg = '';
  try { brandTheme({ name, color: '#0f766e', tokens }); } catch (e) { msg = e.message; }
  t(`the name "${name}" is refused (${why})`, msg.includes(why), msg);
}
let msg = '';
try { brandTheme({ name: 'acme', color: 'teal', tokens }); } catch (e) { msg = e.message; }
t('a color that isn\'t hex is refused', msg.includes("isn't a color"), msg);

// The command line.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-brand-'));
const cli = (...args) => spawnSync(process.execPath, [path.join(PROJECT, 'bin', 'serupa-brand.mjs'), ...args], { cwd: dir, encoding: 'utf8' });
try {
  for (const [label, args, word] of [
    ['no color', ['acme'], 'give a name and a color'],
    ['an unknown option', ['acme', '#0f766e', '--dark'], 'unknown option --dark'],
    ['-o with no file name', ['acme', '#0f766e', '-o'], '-o needs a file name'],
    ['--corners, removed in 18.0.0', ['acme', '#0f766e', '--corners', 'round'], 'data-radius'],
    ['--motion, removed in 18.0.0', ['acme', '#0f766e', '--motion', 'brisk'], '--motion-* tokens'],
    ['a taken name', ['emerald', '#0f766e'], 'a theme Serupa ships'],
  ]) {
    const r = cli(...args);
    t(`the command stops on ${label}, saying so`, r.status === 2 && String(r.stderr).includes(String(word)) && String(r.stderr).includes('usage:') && !/\n\s+at /.test(String(r.stderr)), `exit ${r.status}: ${String(r.stderr).slice(0, 300)}`);
  }
  const ok = cli('acme', '#0f766e', '-o', 'themes/acme.css');
  const file = path.join(dir, 'themes', 'acme.css');
  t('the command writes the file and says what it picked', ok.status === 0 && fs.existsSync(file) && /acme-light: primary acme-\d+/.test(ok.stdout), ok.stderr.slice(0, 300));
  // A theme is its colors: the looks (--look) are gone in 16.0.0, and the option is an error rather than ignored.
  const look = cli('acme', '#0f766e', '--look', 'modern');
  t('--look is no longer an option', look.status === 2 && /unknown option --look/.test(look.stderr), look.stderr.slice(0, 300));
  const piped = cli('acme', '#0f766e');
  t('without -o the CSS goes to the standard output', piped.status === 0 && piped.stdout.startsWith('/* acme') && piped.stderr.includes('acme-dark: primary'), piped.stderr.slice(0, 300));

  // In a browser, after tokens.css: each way of choosing the theme gets the brand's values.
  if (fs.existsSync(file)) {
    const css = fs.readFileSync(file, 'utf8');
    const want = made['#0f766e'].themes;
    const b = await browser();
    const page = await b.newPage();
    await page.setContent(`<!doctype html><html><head><style>${tokensCss}\n${css}</style></head><body>
      <div id="l" data-theme="acme-light"></div>
      <div id="d" data-theme="acme-dark"><div id="nl" data-theme="acme-light"></div></div>
      <div data-theme="blue-dark"><div id="bd" data-brand="acme" data-mode="dark"></div></div>
      <div id="m" data-theme="acme-light" data-contrast="more"></div></body></html>`);
    const got = await page.evaluate(() => {
      const probe = (id, prop) => {
        const el = document.getElementById(id); const p = el.appendChild(document.createElement('span'));
        p.style.color = `var(--${prop})`; const c = getComputedStyle(p).color; p.remove(); return c;
      };
      return { probe: Object.fromEntries(['l', 'd', 'nl', 'bd', 'm'].map((id) => [id, { primary: probe(id, 'primary'), surface: probe(id, 'surface'), text: probe(id, 'text') }])) };
    });
    const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
    const L = want['acme-light'], D = want['acme-dark'];
    t('data-theme="acme-light" and "acme-dark" give the brand\'s primary and the system\'s surface', got.probe.l.primary === rgb(L.primary) && got.probe.d.primary === rgb(D.primary) && got.probe.d.surface === rgb(D.surface) && got.probe.l.surface === rgb(L.surface), JSON.stringify(got.probe));
    t('acme-light nested in acme-dark is light again, text and all', got.probe.nl.primary === rgb(L.primary) && got.probe.nl.text === rgb(L.text), JSON.stringify(got.probe.nl));
    t('data-brand="acme" with data-mode="dark" in another theme gives the dark brand', got.probe.bd.primary === rgb(D.primary), JSON.stringify(got.probe.bd));
    t('more contrast gives the stronger primary', got.probe.m.primary === rgb(L['srp-more-primary']) && got.probe.m.primary !== got.probe.l.primary, JSON.stringify(got.probe.m));
    await b.close();
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

done(report('serupa-brand', R));
