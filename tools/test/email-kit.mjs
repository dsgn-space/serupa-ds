// The email-safe kit (139): dist/email/ holds each brand's email CSS and starting email, and tokens.json, in step with
// the tokens. It checks that they use only what email clients keep (hex colors, px, no variables, rem, alpha or
// layers), that every color equals the theme's own, that text and buttons pass WCAG 2.2 AA in light and dark in
// every brand, and, in the browser, that the email shows the dark colors under prefers-color-scheme: dark and fits a
// 375px phone without scrolling sideways.
//   node tools/test/email-kit.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { emailColors, emailFiles, emailRules, emailSizes } from '../build/email-kit.mjs';
import { PROJECT, browser, done, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail: String(detail) });
const D = path.join(PROJECT, 'dist', 'email');
const DT = path.join(PROJECT, 'design-tokens');
const tokens = JSON.parse(fs.readFileSync(path.join(PROJECT, 'tokens.json'), 'utf8'));
const themes = tokens.color.themes.map((x) => x.id);
const brands = [...new Set(themes.map((x) => x.split('-')[0]))];
const version = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8')).version;

const FILES = [...brands.flatMap((b) => [`${b}.css`, `${b}.html`]), 'tokens.json'];
const read = (f) => { try { return fs.readFileSync(path.join(D, f), 'utf8'); } catch { return null; } };
const missing = FILES.filter((f) => read(f) == null);
t(`dist/email/ has the ${FILES.length} files (npm run build)`, !missing.length, missing.join(', '));
if (missing.length) done(report('Email kit', R));

const want = emailFiles(DT, version);
const stale = FILES.filter((f) => read(f) !== want[f]);
t('dist/email/ is what tools/build/email-kit.mjs makes from design-tokens/', !stale.length, `run npm run build: ${stale.join(', ')}`);

// What email clients drop: CSS variables, rem and em, alpha and modern color functions, layers, <link>ed or
// imported stylesheets, and web fonts.
const BAD = [/var\(/, /\d(r?em)\b/, /rgba?\(|hsla?\(|oklch\(|oklab\(|color-mix\(/, /@layer|@import|@font-face/, /<link\b/, /#[0-9a-f]{8}\b|#[0-9a-f]{3,4}\b(?![0-9a-f])/i];
const bad = FILES.filter((f) => f.endsWith('.css') || f.endsWith('.html')).flatMap((f) => BAD.filter((re) => re.test(read(f))).map((re) => `${f}: ${re}`));
t('the CSS and HTML use only #rrggbb colors and px: no var(), rem, em, alpha, color functions, layers, imports, <link> or web fonts', !bad.length, bad.join('; '));

// Every color equals the theme's own, read from tokens.json itself (not the generator's reading of design-tokens/).
// A color with alpha (#rrggbbaa) is mixed over the theme's surface, as the kit does.
const all = new Map();
for (const g of Object.values(tokens)) if (g && Array.isArray(g.tokens)) for (const x of g.tokens) all.set(x.name, x);
const at = (name, th) => {
  let v = all.get(name)?.value;
  for (let i = 0; i < 10; i++) {
    if (v && typeof v === 'object') v = v[th] ?? Object.values(v)[0];
    const m = /^\{([^}]+)\}$/.exec(String(v));
    if (!m) break;
    v = all.get(m[1])?.value;
  }
  return String(v).toLowerCase();
};
const mix = (v, under) => {
  if (!/^#[0-9a-f]{8}$/.test(v)) return v;
  const a = parseInt(v.slice(7), 16) / 255, n = (h, i) => parseInt(h.slice(i, i + 2), 16);
  return '#' + [1, 3, 5].map((i) => Math.round(n(v, i) * a + n(under, i) * (1 - a)).toString(16).padStart(2, '0')).join('');
};
const off = [];
const colors = emailColors(DT);
let compared = 0;
for (const th of themes) {
  for (const [name, hex] of Object.entries(colors[th] ?? {})) {
    const v = mix(at(name, th), at('surface', th));
    compared++;
    if (v !== hex) off.push(`${th} ${name}: ${hex}, tokens.json ${v}`);
  }
}
t(`every color of the kit equals tokens.json in its theme (${compared} in ${themes.length} themes)`, !off.length && Object.keys(colors).length === themes.length && compared > 200, off.slice(0, 6).join('; ') || `${compared} compared`);

// WCAG 2.2 AA: 4.5:1 for every text on what's behind it, in every theme.
const lum = (h) => { const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const sizes = emailSizes(DT);
const low = [];
for (const th of themes) {
  const r = emailRules(colors[th], sizes);
  const get = (k, p) => r[k].find(([q]) => q === p)?.[1];
  const surface = get('serupa-container', 'background-color');
  const pairs = [
    ['heading', get('serupa-h1', 'color'), surface], ['text', get('serupa-text', 'color'), surface],
    ['muted text', get('serupa-muted', 'color'), surface], ['footer', get('serupa-footer', 'color'), surface],
    ['link', get('serupa-link', 'color'), surface], ['button', get('serupa-button', 'color'), get('serupa-button', 'background-color')],
    ['page text', get('serupa-body', 'color'), get('serupa-body', 'background-color')],
    ...['info', 'success', 'warning', 'danger'].map((x) => [`${x} callout`, get(`serupa-callout-${x}`, 'color'), get(`serupa-callout-${x}`, 'background-color')]),
  ];
  for (const [what, fg, bg] of pairs) if (!(ratio(fg, bg) >= 4.5)) low.push(`${th} ${what}: ${fg} on ${bg} is ${ratio(fg, bg).toFixed(2)}:1`);
}
t(`text, links, the button and callouts pass 4.5:1 in all ${themes.length} themes`, !low.length, low.join('; '));

// Outlook for Windows (Word) ignores a link's padding: the button's cell carries the same padding as mso-padding-alt,
// and each callout has a right-to-left twin with its bar on the right, in light and dark.
{
  const r = emailRules(colors[themes[0]], sizes);
  const get = (k, p) => r[k]?.find(([q]) => q === p)?.[1];
  t('the button cell pads the button in Outlook as the link does elsewhere', get('serupa-button-cell', 'mso-padding-alt') === get('serupa-button', 'padding') && get('serupa-button', 'mso-padding-alt') === '0', `${get('serupa-button-cell', 'mso-padding-alt')} vs ${get('serupa-button', 'padding')}`);
  const rtl = ['info', 'success', 'warning', 'danger'].filter((x) => !get(`serupa-callout-${x}-rtl`, 'border-right') || get(`serupa-callout-${x}-rtl`, 'border-right') !== get(`serupa-callout-${x}`, 'border-left') || get(`serupa-callout-${x}-rtl`, 'border-left'));
  const darkRtl = brands.filter((b) => !/@media \(prefers-color-scheme: dark\)[^]*\.serupa-callout-info-rtl \{ [^}]*border-right: 4px solid #[0-9a-f]{6} !important/.test(read(`${b}.css`)));
  t('each callout has a right-to-left class with its bar on the right, in light and dark', !rtl.length && !darkRtl.length, [...rtl, ...darkRtl].join(', '));
}

// The starting email: a document a screen reader can read, with layout tables marked as such.
const html = brands.map((b) => [b, read(`${b}.html`)]);
const shape = [];
for (const [b, h] of html) {
  if (!/<html lang="[a-z-]+"/.test(h)) shape.push(`${b}: no lang`);
  if (!/<title>[^<]+<\/title>/.test(h)) shape.push(`${b}: no title`);
  const tables = h.match(/<table\b[^>]*>/g) ?? [];
  if (!tables.length || tables.some((x) => !/role="presentation"/.test(x))) shape.push(`${b}: a layout table without role="presentation"`);
  if ((h.match(/<a\b[^>]*>/g) ?? []).some((x) => !/href="https:/.test(x))) shape.push(`${b}: a link without an https href`);
  if ((h.match(/<h1\b/g) ?? []).length !== 1) shape.push(`${b}: not one h1`);
  const defined = new Set([...read(`${b}.css`).matchAll(/\.(serupa-[a-z0-9-]+)/g)].map((m) => m[1]));
  for (const m of h.matchAll(/class="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) if (!defined.has(c)) shape.push(`${b}: .${c} isn't in ${b}.css`);
}
t('each email has lang, a title, one h1, layout tables with role="presentation", https links, and only classes its CSS has', !shape.length, shape.join('; '));

// In the browser: light and dark show each theme's colors, and a 375px phone doesn't scroll sideways.
const br = await browser();
const seen = [];
try {
  const page = await br.newPage();
  for (const [b] of html) {
    for (const mode of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: mode });
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(pathToFileURL(path.join(D, `${b}.html`)).href);
      const got = await page.evaluate(() => {
        const rgb = (c) => '#' + (c.match(/\d+/g) ?? []).slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
        const s = (sel, p) => rgb(getComputedStyle(document.querySelector(sel))[p]);
        return { button: s('.serupa-button', 'backgroundColor'), label: s('.serupa-button', 'color'), text: s('.serupa-text', 'color'), surface: s('.serupa-container', 'backgroundColor'), wide: document.documentElement.scrollWidth > innerWidth };
      });
      const c = colors[`${b}-${mode}`];
      const exp = { button: c.primary, label: c['on-primary'], text: c.text, surface: c.surface, wide: false };
      for (const k of Object.keys(exp)) if (got[k] !== exp[k]) seen.push(`${b} ${mode} ${k}: ${got[k]}, want ${exp[k]}`);
    }
  }
} finally { await br.close(); }
t(`in the browser each brand's email shows its light and dark colors, and fits 375px without scrolling sideways`, !seen.length, seen.join('; '));

done(report('Email kit', R));
