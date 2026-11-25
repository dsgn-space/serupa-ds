// npm run tokens: tokens.json → tokens.css. The design system page used to write tokens.css; this
// writes the same file from the repo, so a token change no longer needs the (frozen) page. npm run build
// runs it first. --check exits 1 if tokens.css isn't what tokens.json gives (CI and the tests use it).
//   node tools/tokens/build.mjs [--check] [project dir]
//
// tokens.css, in order:
//   :root, [data-theme="<first theme>"]   every themed token (the colors and the shadows) at its first theme's value
//   [data-theme$="-light"], [$="-dark"]   the alias colors every brand shares, once per mode
//   [data-theme="<theme>"]                the default brand's dark theme: the alias colors it changes
//   theme axes (ADR-0011)                 data-brand / data-mode on an element without data-theme: the colors that
//                                         differ between themes as light-dark() pairs, so the operating system's
//                                         light or dark setting applies from the first paint, with no JavaScript.
//                                         Only the default brand (blue) is here: every other brand is its own file,
//                                         brands/<brand>.css, that a page loads after tokens.css (17.0.0), and
//                                         brands/all.css holds them all (buildBrandCss below)
//   :root                                 every other token, the font families, and the type-* shorthands
//   contrast and density axes             data-contrast="more" (and prefers-contrast: more) and data-density="compact"
//   shadow axis (73)                      data-shadow="brand": the box shadows in a deep shade of the brand color,
//                                         and the elevation roles again, so they follow
//   roundness axis                        data-radius="sharp" | "round" | "default": the radius roles' corners
//   type scale axis (22)                  data-type-scale="fluid": sizes from 1.5rem up grow with the viewport
//   :lang() per script (143)              taller lines for Arabic, Devanagari, Thai and CJK; CJK's font by language
//   .type-*                               one class per complete text style
//   @font-face                            the fonts in fonts/
// Everything but the @font-face rules sits in the srp.tokens cascade layer, the first of the system's layers.
import fs from 'node:fs';
import path from 'node:path';

const P = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || path.join(import.meta.dirname, '..', '..'));
// A contrastMore keyed by theme id ({ "blue-light": …, "violet-dark": … }) rather than { light, dark }.
const perTheme = (x) => !!x.contrastMore && typeof x.contrastMore === 'object' && !('light' in x.contrastMore);

/** Each token's description from tokens.json, by its property name (--primary → "Main action color…"). */
export function tokenDescriptions(t) {
  const out = new Map();
  for (const g of Object.values(t)) if (g && Array.isArray(g.tokens)) for (const x of g.tokens) if (x.usage) out.set(`--${x.name}`, x.usage);
  return out;
}

const brandOf = (theme) => theme.split('-')[0];
const themed = (x) => x.value && typeof x.value === 'object';
const escName = (n) => n.replace(/[\\.]/g, '\\$&');
const ref = (v) => String(v).replace(/\{([^}]+)\}/g, (_, n) => `var(--${escName(n)})`);
// No comments: tokens.css is the first stylesheet a page waits for, and the descriptions were over half of it. They
// stay in tokens.json (tokenDescriptions below), design-tokens/ and the editor data.
const line = (n, v) => `  --${escName(n)}: ${ref(v)};\n`;
// Every token, plus the internal ones: a contrastMore with a value per theme (a brand color: violet's is violet) can't
// be one light-dark() pair, so it becomes an internal themed token, --srp-more-<name>, that every theme and brand rule
// sets like any alias; the contrast rule then points the token at it (contrastAndDensity).
function allTokens(t) {
  const tokens = Object.values(t).filter((g) => g && Array.isArray(g.tokens)).flatMap((g) => g.tokens);
  return [...tokens, ...tokens.filter(perTheme).map((x) => ({ name: `srp-more-${x.name}`, value: x.contrastMore }))];
}
const varyingOf = (all) => all.filter((x) => themed(x) && new Set(Object.values(x.value)).size > 1);
// The themed tokens with more than one value, and those of them a brand changes (the rest are set once per mode).
function brandSplit(t, all) {
  const themes = t.color.themes.map((x) => x.id);
  const multi = all.filter((x) => themed(x) && Object.keys(x.value).length > 1);
  const ofMode = (mode) => themes.filter((th) => th.endsWith(`-${mode}`));
  const byBrand = new Set(multi.filter((x) => ['light', 'dark'].some((mode) => new Set(ofMode(mode).map((th) => x.value[th])).size > 1)));
  return { multi, byBrand };
}
// One flat theme per rule, data-theme="<brand>-<mode>": the alias colors its brand changes.
const themeBlocks = (themes, multi, byBrand, line) => themes.map((th) => `[data-theme="${th}"] {\n${multi.filter((x) => byBrand.has(x) && x.value[th] != null).map((x) => line(x.name, x.value[th])).join('')}}\n`).join('');

/** The brands in tokens.json, the default (the first theme's) first. */
export const brandsOf = (t) => [...new Set(t.color.themes.map((x) => brandOf(x.id)))];

const LAYERS = '@layer srp.tokens, srp.base, srp.components, srp.utilities;\n';
// A brand's rules: its flat themes (data-theme) and its data-brand rules.
function brandRules(t, brand) {
  if (brand === brandsOf(t)[0]) throw new Error(`${brand} is the default brand: it is in tokens.css`);
  if (!brandsOf(t).includes(brand)) throw new Error(`no brand ${brand} in tokens.json`);
  const all = allTokens(t);
  const { multi, byBrand } = brandSplit(t, all);
  return themeBlocks([`${brand}-light`, `${brand}-dark`], multi, byBrand, line) + brandAxes(t, varyingOf(all), line, [brand]);
}

/** brands/<brand>.css: one brand other than the default, to load after tokens.css, in the srp.tokens layer like
 *  tokens.css. A page that never names the brand never loads it (17.0.0). */
export const buildBrandCss = (t, brand) =>
  `/* Serupa — the ${brand} brand, generated from tokens.json. Load it after tokens.css. */\n${LAYERS}@layer srp.tokens {\n${brandRules(t, brand)}}\n`;

/** brands/all.css: every brand but the default, for a page that lets people switch brands (the docs, Storybook). */
export const buildAllBrandsCss = (t) =>
  `/* Serupa — every brand but ${brandsOf(t)[0]}, generated from tokens.json. Load it after tokens.css. */\n${LAYERS}@layer srp.tokens {\n${brandsOf(t).slice(1).map((b) => brandRules(t, b)).join('')}}\n`;

export function buildTokensCss(t) {
  const themes = t.color.themes.map((x) => x.id);
  const all = allTokens(t);

  let css = '/* Serupa — generated from tokens.json */\n';
  css += '@layer srp.tokens, srp.base, srp.components, srp.utilities;\n@layer srp.tokens {\n';
  css += `:root, [data-theme="${themes[0]}"] {\n`;
  for (const x of all.filter(themed)) css += line(x.name, x.value[themes[0]]);
  css += '}\n';
  // A theme is a brand and a mode. The colors every brand shares (the neutrals, the status colors, the charts) are
  // written once per mode, for every theme of that mode; each theme then sets only the few its brand changes.
  const { multi, byBrand } = brandSplit(t, all);
  const ofMode = (mode) => themes.filter((th) => th.endsWith(`-${mode}`));
  for (const mode of ['light', 'dark']) {
    const th = ofMode(mode)[0];
    if (!th) continue;
    css += `[data-theme$="-${mode}"] {\n`;
    for (const x of multi.filter((x) => !byBrand.has(x))) css += line(x.name, x.value[th]);
    css += '}\n';
  }
  css += themeBlocks(themes.slice(1).filter((th) => brandOf(th) === brandOf(themes[0])), multi, byBrand, line);

  css += axes(t, varyingOf(all), line);

  const styles = t.type.groups.flatMap((g) => g.styles.map((s) => ({ ...s, family: s.family || g.family })));
  css += ':root {\n';
  for (const x of all.filter((x) => !themed(x))) css += line(x.name, x.value);
  for (const [k, v] of Object.entries(t.type.families)) css += `  --font-${k}: ${v};\n`;
  for (const s of styles) css += line(`text-${s.name}`, `${s.fontWeight} ${s.fontSize}/${s.lineHeight} ${fam(s.family)}`);
  css += '}\n';
  css += contrastAndDensity(all, line);   // after :root, so data-density on the root wins over it
  css += tintedShadows(all, line);
  css += roundness(all, line);
  css += fluidType(all, styles, line);
  css += scripts(t, all);
  for (const s of styles) {
    const f = fluid(s.fontSize) && scaleOf(all, s.fontSize);
    css += `.${s.name} {\n  font-family: ${fam(s.family)};\n  font-size: ${f ? `var(--text-${f})` : s.fontSize};\n  line-height: ${f ? snap('1em', ratio(s.lineHeight, s.fontSize)) : s.lineHeight};\n  font-weight: ${s.fontWeight};\n  letter-spacing: ${s.letterSpacing};\n`;
    if (s.fontStyle && s.fontStyle !== 'normal') css += `  font-style: ${s.fontStyle};\n`;
    if (s.textTransform) css += `  text-transform: ${s.textTransform};\n`;
    if (s.opticalSize != null) css += `  font-variation-settings: "opsz" ${s.opticalSize};\n`;
    css += '}\n';
  }
  css += '}\n';
  for (const f of t.type.fonts || [])
    css += `@font-face {\n  font-family: "${f.family}";\n  src: url("${f.file}") format("woff2");\n  font-weight: ${f.weight};\n  font-style: ${f.style};\n  font-display: swap;\n${f.unicodeRange ? `  unicode-range: ${f.unicodeRange};\n` : ''}}\n`;
  // "Inter Fallback" (144, tools/fonts/fallback.mjs): a font already on the device, sized like Inter, drawn until Inter
  // arrives, so the text doesn't move when it swaps in.
  for (const f of t.type.fallbacks || [])
    css += `@font-face {\n  font-family: "${f.family}";\n  src: ${f.local.map((n) => `local("${n}")`).join(', ')};\n  font-weight: ${f.weight};\n  font-style: ${f.style};\n  size-adjust: ${f.sizeAdjust};\n  ascent-override: ${f.ascentOverride};\n  descent-override: ${f.descentOverride};\n  line-gap-override: ${f.lineGapOverride};\n  unicode-range: ${f.unicodeRange};\n}\n`;
  return css;
}

// Fonts and line heights by script (143, tokens.json's type.scripts). The sans stack names Noto Sans Arabic, Hebrew,
// Devanagari and Thai after Inter: each draws only its own script, so the browser picks the right one per character,
// whatever the lang. Han characters are drawn differently in Japanese, Korean and Chinese, so the CJK font follows lang.
// Marks above and below the letters need more room than Latin: under those langs every text-*--line-height is at least
// the script's ratio of the font size (in em, so it holds at the size the component draws). :where() keeps it at no
// specificity, so a component's or a page's own line height still wins; and it matches every element in that lang, so
// a lang="th" section inside an English page gets it too.
function scripts(t, all) {
  const list = t.type.scripts || [];
  const heights = all.filter((x) => /^text-[a-z0-9]+--line-height$/.test(x.name));
  const sel = (langs) => `:where(${langs.map((l) => `:lang(${l})`).join(', ')})`;
  let css = '';
  for (const ratio of [...new Set(list.map((s) => s.lineHeight).filter(Boolean))]) {
    css += `${sel(list.filter((s) => s.lineHeight === ratio).flatMap((s) => s.lang))} {\n`;
    for (const x of heights) css += `  --${x.name}: max(${/^[\d.]+$/.test(x.value) ? x.value + 'em' : x.value}, ${ratio}em);\n`;
    css += '}\n';
  }
  const sans = t.type.families.sans;
  for (const s of list.filter((s) => s.families))
    css += `${sel(s.lang)} {\n  --font-sans: ${sans.replace('"Inter Fallback", ', `"Inter Fallback", ${s.families.map((f) => `"${f}"`).join(', ')}, `)};\n}\n`;
  return css;
}

// Theme axes (ADR-0011). Themes are "<brand>-<mode>" ids; data-brand and data-mode pick them separately. Each color
// that differs between themes is written once per brand as light-dark(light, dark), and the element's color-scheme
// (set by data-mode, "light dark" for auto) chooses, wherever the color is used: so a data-mode="dark" section works
// inside a light page. An element with data-theme keeps the flat theme above (theme.js sets it), so nothing changes
// for pages that use it. The root without either attribute stays light, as before.
// The brands' light-dark() pairs: a theme sets colors only (src/styles/themeAxes.test.tsx holds the token source to
// it), so every pair is two colors.
function brandPairs(t, varying) {
  const brands = brandsOf(t);
  const pair = (x, b) => {
    const [l, d] = [x.value[b + '-light'], x.value[b + '-dark']];
    return l === d ? l : `light-dark(${l}, ${d})`;
  };
  return { pair, byBrand: varying.filter((x) => new Set(brands.map((b) => pair(x, b))).size > 1) };
}

// A brand's data-brand rules: on the root or any element, and on a nested data-mode element inside the brand's page or
// section, which keeps the brand around it.
function brandAxes(t, varying, line, brands) {
  const { pair, byBrand } = brandPairs(t, varying);
  let css = '';
  for (const b of brands) {
    css += `:root[data-brand="${b}"]:not([data-theme]), [data-brand="${b}"]:not([data-theme]) {\n`;
    for (const x of byBrand) css += line(x.name, pair(x, b));
    css += '}\n';
  }
  for (const b of brands) {
    css += `:is([data-theme^="${b}-"], [data-brand="${b}"]) [data-mode]:not([data-theme], [data-brand]) {\n`;
    for (const x of byBrand) css += line(x.name, pair(x, b));
    css += '}\n';
  }
  return css;
}

function axes(t, varying, line) {
  const brands = brandsOf(t);
  const { pair } = brandPairs(t, varying);
  // The full set goes on the root when it has an axis, and on any nested data-mode element, so a dark section works
  // inside a page with no axes or with data-theme (whose flat values can't flip). :where() keeps it at one
  // attribute's weight: it still beats :root (it comes later), and data-contrast beats it.
  let css = `:where(:root:is([data-brand], [data-mode]), [data-mode]):not([data-theme]) {
  color-scheme: light dark;
`;
  for (const x of varying) css += line(x.name, pair(x, brands[0]));
  css += '}\n';
  // Only the default brand here; the others are in brands/<brand>.css (buildBrandCss).
  css += brandAxes(t, varying, line, [brands[0]]);
  css += `:root[data-mode="auto"]:not([data-theme]), [data-mode="auto"]:not([data-theme]) { color-scheme: light dark; }\n`;
  css += `:root[data-mode="light"]:not([data-theme]), [data-mode="light"]:not([data-theme]) { color-scheme: light; }\n`;
  css += `:root[data-mode="dark"]:not([data-theme]), [data-mode="dark"]:not([data-theme]) { color-scheme: dark; }\n`;
  return css;
}

// Contrast and density (ADR-0011). A color token's contrastMore { light, dark } is its stronger pair (a size token's
// is one value, like a thicker focus ring), used for data-contrast="more" and, unless the page says data-contrast="normal", when the system asks for more contrast.
// The pairs are light-dark(), so data-theme sets color-scheme here too, not only in base.css. A token's compact
// value is its size under data-density="compact"; data-density="comfortable" puts the defaults back in a section.
function contrastAndDensity(all, line) {
  const more = all.filter((x) => x.contrastMore && !perTheme(x));
  const pairs = more.map((x) => line(x.name, typeof x.contrastMore === 'string' ? x.contrastMore : `light-dark(${x.contrastMore.light}, ${x.contrastMore.dark})`)).join('');
  // A per-theme one reads its --srp-more-* token, set by whichever theme or brand rule applies to the element. The
  // brand rules that set the normal value weigh up to three attributes (:root[data-brand]:not([data-theme])), so
  // these carry :not(#srp-more), which matches every element and outweighs them: asking for more contrast beats the
  // brand. They also go on nested data-brand and data-theme sections, which redeclare the brand's colors.
  const brand = all.filter(perTheme).map((x) => `  --${x.name}: var(--srp-more-${x.name});\n`).join('');
  const nested = ':is([data-mode], [data-brand], [data-theme])';
  let css = `[data-theme$="-light"] { color-scheme: light; }\n[data-theme$="-dark"] { color-scheme: dark; }\n`;
  // Also on nested data-mode elements, which redeclare the normal colors.
  // :not(#srp-more) here too: a brand's rules weigh up to three attributes, and asking for more contrast must still
  // beat them.
  css += `[data-contrast="more"]:not(#srp-more), [data-contrast="more"] [data-mode]:not(#srp-more) {\n${pairs}}\n`;
  if (brand) css += `[data-contrast="more"]:not(#srp-more), [data-contrast="more"] ${nested}:not(#srp-more) {\n${brand}}\n`;
  css += `@media (prefers-contrast: more) {\n:root:not([data-contrast="normal"]):not(#srp-more), :root:not([data-contrast="normal"]) [data-mode]:not([data-contrast="normal"] *, #srp-more) {\n${pairs}}\n`;
  if (brand) css += `:root:not([data-contrast="normal"]):not(#srp-more), :root:not([data-contrast="normal"]) ${nested}:not([data-contrast="normal"], [data-contrast="normal"] *, #srp-more) {\n${brand}}\n`;
  css += '}\n';
  const compact = all.filter((x) => x.compact != null);
  css += `[data-density="compact"] {\n${compact.map((x) => line(x.name, x.compact)).join('')}}\n`;
  css += `[data-density="comfortable"] {\n${compact.map((x) => line(x.name, x.value)).join('')}}\n`;
  return css;
}

// Roundness: data-radius="sharp" or "round" points each radius role at its roundness value (2 to 4px corners, or
// 6 to 24px), on any brand; data-radius="default" puts the default back in a section. It beats a brand's own rules (an
// app's brand CSS that sets the roles), so it carries :not(#srp-radius), and it's set again on a nested
// data-brand or data-theme section without a data-radius of its own. The pill stays round. A focus ring is an outline,
// which follows the corner it's drawn around.
function roundness(all, line) {
  const roles = all.filter((x) => x.roundness);
  if (!roles.length) return '';
  const at = (v) => `[data-radius="${v}"]:not(#srp-radius), [data-radius="${v}"] :is([data-brand], [data-theme]):not([data-radius], #srp-radius)`;
  let css = '';
  for (const v of ['sharp', 'round']) css += `${at(v)} {\n${roles.map((x) => line(x.name, x.roundness[v])).join('')}}\n`;
  css += `${at('default')} {\n${roles.map((x) => line(x.name, x.value)).join('')}}\n`;
  return css;
}

// Shadows tinted with the brand (73): data-shadow="brand" swaps each box shadow's black for a deep shade of the
// brand color (its red, green and blue at 30%), at the same opacity, so a raised card or a menu reads as part of
// the brand rather than grey. data-shadow="neutral" puts the black back in a section. The shade is worked out where
// the attribute is, from that element's --primary. As color-mix() with black (30% of each channel, in sRGB) and then
// with transparent (the opacity), not a relative rgb(from …): Chrome 129, the floor, can't take a light-dark() --primary
// (a data-brand section's) as a relative color's origin, so every tinted shadow there was dropped.
const TINT = (_, a) => `color-mix(in srgb, color-mix(in srgb, var(--primary) 30%, black) ${Math.round(Number(a) * 100)}%, transparent)`;
function tintedShadows(all, line) {
  // The directional modal shadows (elevation-modal-up, -left, -right) are box shadows of their own, tinted alike.
  const box = all.filter((x) => /^(?:shadow-(2xs|xs|sm|md|lg|xl|2xl)|elevation-modal-(?:up|left|right))$/.test(x.name));
  const at = (x) => (typeof x.value === 'object' ? Object.values(x.value)[0] : x.value);
  // The elevation roles (elevation-overlay → shadow-lg) are set again beside the shadows they name: a custom property's
  // var() is worked out where it's set, so one set only on :root would keep the root's shadow inside data-shadow="brand".
  const roleTokens = all.filter((x) => box.some((b) => at(x) === `{${b.name}}`));
  const roles = roleTokens.map((x) => line(x.name, at(x))).join('');
  let css = `[data-shadow="brand"] {\n${box.map((x) => line(x.name, at(x).replace(/rgb\(0 0 0 \/ ([\d.]+)\)/g, TINT))).join('')}${roles}}\n`;
  css += `[data-shadow="neutral"] {\n${box.map((x) => line(x.name, at(x))).join('')}${roles}}\n`;
  return css;
}

// Fluid type (22): data-type-scale="fluid" makes every size from 1.5rem (text-2xl) up a clamp() that is 70% of the
// size on a 320px viewport and grows to the full size at 1280px. The body sizes stay put. The smallest size is never
// under 1.25rem, and the largest is at most 1.43 times the smallest, inside the 2.5 of WCAG 1.4.4. Browser zoom also
// narrows the viewport, so at 200% a heading grows only about 1.6 times; by 300% it is at least double (3 × 70%,
// GR82). The --text-* sizes, the --text-type-*
// shorthands and the .type-* classes all follow; data-type-scale="fixed" puts the fixed sizes back in a section.
// A style's font-family. family "heading" (the display and heading roles) is --font-heading, the faces an app names
// for its headings (unset by default), then the sans stack. Both are read where the heading is drawn, so a :lang()
// block's --font-sans (its CJK font, in scripts() below) still applies under a custom heading face.
const fam = (f) => (f === 'heading' ? 'var(--font-heading, var(--font-sans)), var(--font-sans)' : `var(--font-${f})`);
const rem = (v) => (/^[\d.]+rem$/.test(v) ? parseFloat(v) : null);
const fluid = (v) => rem(v) != null && rem(v) >= 1.5;
const r4 = (n) => +n.toFixed(4);
export function fluidSize(v) {
  const max = rem(v), min = Math.max(1.25, max * 0.7), slope = (max - min) / 60;   // 20rem to 80rem of viewport
  return `clamp(${r4(min)}rem, ${r4(min - slope * 20)}rem + ${r4(slope * 100)}vw, ${v})`;
}
const sizesOf = (all) => all.filter((x) => /^text-[a-z0-9]+$/.test(x.name) && typeof x.value === 'string' && fluid(x.value));
const scaleOf = (all, v) => sizesOf(all).find((x) => x.value === v)?.name.slice(5);
function fluidType(all, styles, line) {
  const sizes = sizesOf(all), big = styles.filter((s) => scaleOf(all, s.fontSize));
  const lead = (x) => all.find((y) => y.name === `${x.name}--line-height`)?.value;
  const short = (s, lh) => line(`text-${s.name}`, `${s.fontWeight} var(--text-${scaleOf(all, s.fontSize)})/${lh} ${fam(s.family)}`);
  // A line height follows its size in the fluid scale, at the ratio it has at full size, snapped up to the 4px grid
  // (AX9): on a phone a 21px heading had a 36px line (1.71) and a 33.6px display size a 33.6px one, off the grid.
  const fl = (size, lh) => snap(`var(--text-${size})`, ratio(lh, all.find((x) => x.name === `text-${size}`).value));
  let css = `[data-type-scale="fluid"] {\n${sizes.map((x) => line(x.name, fluidSize(x.value))).join('')}`;
  css += sizes.filter(lead).map((x) => line(`${x.name}--line-height`, fl(x.name.slice(5), lead(x)))).join('');
  // A style on its step's own line height reads that token; only one with its own (the display style) has a formula.
  const own = (s) => { const k = scaleOf(all, s.fontSize), t = lead({ name: `text-${k}` }); return t === s.lineHeight ? `var(--text-${k}--line-height)` : fl(k, s.lineHeight); };
  css += big.map((s) => short(s, own(s))).join('') + '}\n';
  css += `[data-type-scale="fixed"] {\n${sizes.map((x) => line(x.name, x.value)).join('')}`;
  css += sizes.filter(lead).map((x) => line(`${x.name}--line-height`, lead(x))).join('');
  css += big.map((s) => short(s, s.lineHeight)).join('') + '}\n';
  return css;
}
// The line height over the font size: "1.1" stays 1.1, "2.25rem" over "1.875rem" is 1.2.
const ratio = (lh, size) => r4(rem(lh) != null ? rem(lh) / rem(size) : parseFloat(lh));
// size × ratio, rounded up to a multiple of 0.25rem (4px at the default size, and it grows with zoom). A hair less
// first, so a product that is already on the grid (30px × 1.2) isn't pushed up a step by rounding error.
export const snap = (size, r) => `round(up, calc(${size} * ${r} - 0.01px), 0.25rem)`;

/** Every file this script writes, by its path from the project: tokens.css and brands/*.css. */
export function tokenFiles(t) {
  const out = { 'tokens.css': buildTokensCss(t) };
  for (const b of brandsOf(t).slice(1)) out[`brands/${b}.css`] = buildBrandCss(t, b);
  out['brands/all.css'] = buildAllBrandsCss(t);
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const files = tokenFiles(JSON.parse(fs.readFileSync(path.join(P, 'tokens.json'), 'utf8')));
  const now = (f) => (fs.existsSync(path.join(P, f)) ? fs.readFileSync(path.join(P, f), 'utf8') : null);
  const dir = path.join(P, 'brands');
  // A brands/ file no brand makes any more (a brand was removed) is stale too.
  const stray = fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => `brands/${f}`).filter((f) => !(f in files)) : [];
  const stale = Object.keys(files).filter((f) => now(f) !== files[f]);
  if (process.argv.includes('--check')) {
    if (!stale.length && !stray.length) { console.log('tokens.css and brands/ are up to date with tokens.json'); process.exit(0); }
    console.error(`${[...stale, ...stray].join(', ')} out of date with tokens.json: run npm run tokens and commit it`); process.exit(1);
  }
  fs.mkdirSync(dir, { recursive: true });
  for (const f of stale) fs.writeFileSync(path.join(P, f), files[f]);
  for (const f of stray) fs.rmSync(path.join(P, f));
  console.log(stale.length || stray.length ? `Wrote ${[...stale, ...stray.map((f) => `(removed) ${f}`)].join(', ')}` : 'tokens.css and brands/ unchanged');
}
