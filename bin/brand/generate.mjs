// A light and a dark theme from one brand color (I5). Pure: give it the shipped tokens.json and a color, get CSS.
//
// The brand's eleven shades (50 to 950) are made in OKLCH from the color's hue and chroma, at the lightness of the
// shipped palette's steps, each clipped into sRGB. The color itself takes the step nearest its own lightness, so the
// brand shows as given. Then each brand alias takes the shade that passes its contrast, the same pairs
// tools/test/foundation.mjs checks the shipped themes with:
//
//   light  primary          the color itself when it passes, else the lightest of 500 to 800: white text at 4.5:1,
//                           4.5:1 on the surface and on surface-muted, and a hover one step darker that passes too (and 4.5:1 on
//                           primary-subtle, brand 50)
//          focus-ring       the lightest of 400 to 800 at 3:1 on the surface, on a popover and on primary-subtle
//          more contrast    primary the lightest of 600 to 900 at 7:1 on the surface and on brand 50, hover a step
//                           darker; focus ring the lightest at 4.5:1
//   dark   the same, mirrored: the darkest of 500 to 200, with brand 950 text and tint, on zinc-900 and zinc-800
//
// Every other alias is copied from the blue theme of the same mode, so the neutrals, the status colors and the
// shadows are the system's own. A color too light or too dark for any step to pass is an error, with the reason.

// The contrast pairs (from tools/tokens/contrast-pairs.mjs) that a brand alias is in, plus the 7:1 that more contrast
// promises. "more:" names the more-contrast value of the alias.
/** @type {[string, string, number][]} */
const PAIRS_FOR_BRAND = [
  ['text', 'primary-subtle', 4.5], ['on-primary', 'primary', 4.5], ['on-primary', 'primary-hover', 4.5],
  ['primary', 'surface', 4.5], ['primary', 'surface-muted', 4.5], ['primary-hover', 'surface-muted', 4.5], ['primary', 'surface-overlay', 3], ['primary-hover', 'primary-subtle', 4.5],
  ['link-visited', 'surface', 4.5], ['link-visited', 'surface-muted', 4.5],
  ['focus-ring', 'surface', 3], ['focus-ring', 'surface-overlay', 3], ['focus-ring', 'primary-subtle', 3],
  ['more:primary', 'surface', 7], ['more:primary', 'primary-subtle', 7], ['more:primary-hover', 'surface', 7],
  ['on-primary', 'more:primary', 4.5], ['on-primary', 'more:primary-hover', 4.5], ['more:focus-ring', 'surface', 3],
];

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
// Chroma at each step, as a share of the color's own (peaks at 600, like the shipped hues).
const CHROMA = [0.06, 0.13, 0.24, 0.43, 0.67, 0.87, 1, 0.99, 0.81, 0.6, 0.37];
// The aliases the brand sets; every other one is copied.
export const BRAND_ALIASES = ['primary', 'primary-hover', 'primary-subtle', 'on-primary', 'focus-ring', 'link-visited'];
const CORNERS = {
  sharp: { 'radius-inner': 'rounded-none', 'radius-control': 'rounded-xs', 'radius-surface': 'rounded-sm', 'radius-container': 'rounded-md' },
  round: { 'radius-inner': 'rounded-md', 'radius-control': 'rounded-lg', 'radius-surface': 'rounded-xl', 'radius-container': 'rounded-2xl' },
};
export const CORNER_PRESETS = ['default', ...Object.keys(CORNERS)];

// --- color math: sRGB hex <-> OKLCH (Björn Ottosson's OKLab), WCAG 2.2 contrast ---
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
/** @returns {[number, number, number] | null} */
export function parseHex(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return /** @type {[number, number, number]} */ ([0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255));
}
const hexOf = (rgb) => '#' + rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, '0')).join('');
function rgbToOklch([r, g, b]) {
  [r, g, b] = [r, g, b].map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}
function oklchToLinear([L, C, h]) {
  const A = C * Math.cos((h * Math.PI) / 180), B = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const inGamut = (lin) => lin.every((c) => c >= -1e-4 && c <= 1 + 1e-4);
// The color at this lightness and hue with as much of the chroma as sRGB can show.
function clip([L, C, h]) {
  let lo = 0, hi = C;
  if (inGamut(oklchToLinear([L, C, h]))) lo = C;
  else for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (inGamut(oklchToLinear([L, mid, h]))) lo = mid; else hi = mid; }
  return hexOf(oklchToLinear([L, lo, h]).map((c) => toGam(Math.min(1, Math.max(0, c)))));
}
export const oklchOf = (hex) => rgbToOklch(parseHex(hex));
const lum = (hex) => { const [r, g, b] = parseHex(hex).map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

// --- the shipped tokens ---
const ref = (v) => /^\{(.+)\}$/.exec(String(v))?.[1];
/** The shipped tokens.json, read for what a theme needs: palette hex values and every alias per theme. */
export function readTokens(tokens) {
  const color = tokens.color.tokens;
  const multi = (x) => x.value && typeof x.value === 'object' && Object.keys(x.value).length > 1;
  const palette = new Map(color.filter((x) => !multi(x)).map((x) => [x.name, typeof x.value === 'object' ? Object.values(x.value)[0] : x.value]));
  const aliases = color.filter(multi);
  return { palette, aliases, radius: new Set(tokens.radius.tokens.map((x) => x.name)) };
}

/** The brand's shades, 50 to 950, as hex. The lightness of each step is the shipped blue's. */
export function ramp(hex, palette) {
  const [L, C, h] = oklchOf(hex);
  const target = STEPS.map((s) => oklchOf(palette.get(`blue-${s}`))[0]);
  const out = STEPS.map((s, i) => clip([target[i], C * CHROMA[i], h]));
  // The color takes the step nearest its own lightness.
  let near = 0;
  target.forEach((t, i) => { if (Math.abs(t - L) < Math.abs(target[near] - L)) near = i; });
  out[near] = hexOf(parseHex(hex));
  return { shades: Object.fromEntries(STEPS.map((s, i) => [s, out[i]])), seedStep: STEPS[near], hue: h, chroma: C };
}

const NAME = /^[a-z][a-z0-9]{0,23}$/;

/**
 * A brand's light and dark themes as CSS, to load after tokens.css.
 * @param {{ name: string, color: string, corners?: string, tokens: any }} o
 * @returns {{ css: string, shades: Record<string,string>, themes: Record<string, Record<string,string>>, picks: object }}
 */
export function brandTheme({ name, color, corners = 'default', tokens }) {
  if (!NAME.test(String(name))) throw new Error(`the name "${name}" can't be a theme name: use lowercase letters and digits, starting with a letter (such as acme)`);
  if (!parseHex(color)) throw new Error(`"${color}" isn't a color: give a hex value, such as #0f766e`);
  if (!CORNER_PRESETS.includes(corners)) throw new Error(`corners takes ${CORNER_PRESETS.join(', ')}, not ${corners}`);
  const { palette, aliases } = readTokens(tokens);
  const shipped = new Set(tokens.$extensions?.['com.serupa']?.themes?.map((t) => t.id.replace(/-(light|dark)$/, '')) ?? ['blue', 'violet', 'emerald']);
  if (shipped.has(name)) throw new Error(`"${name}" is a theme Serupa ships: pick another name`);
  if (palette.has(`${name}-500`) || palette.has(name)) throw new Error(`"${name}" is a palette color's name (--${name}-500): pick another name`);

  const { shades, seedStep, hue } = ramp(color, palette);
  const S = (s) => shades[s];
  const base = (mode) => Object.fromEntries(aliases.map((x) => [x.name, x.value[`blue-${mode}`]]));
  const hexAt = (v, own) => { const r = ref(v); if (!r) return v; if (own[r] !== undefined) return hexAt(own[r], own); const m = /^(.+)-(\d+)$/.exec(r); if (m && m[1] === name) return shades[m[2]]; return palette.get(r); };
  const picks = {};
  const fail = (mode, what) => { throw new Error(`${color} can't make a ${mode} theme: no shade of it gives ${what}. Try a color with more contrast against ${mode === 'light' ? 'white' : 'black'}.`); };

  for (const mode of ['light', 'dark']) {
    const b = base(mode);
    const surface = hexAt(b.surface, b), overlay = hexAt(b['surface-overlay'], b), muted = hexAt(b['surface-muted'], b);
    const light = mode === 'light';
    const on = light ? palette.get('white') : S('950');
    const subtle = light ? S('50') : S('950');
    // Light themes look from light to dark, dark themes from dark to light; hover is the next shade on.
    const order = (from, to) => { const a = STEPS.slice(STEPS.indexOf(from), STEPS.indexOf(to) + 1); return light ? a : a.reverse(); };
    const next = (s) => STEPS[STEPS.indexOf(s) + (light ? 1 : -1)];
    // A link is primary text, on the page and on a muted panel (GR327: #16a34a passed on white, not on zinc-50).
    const okFill = (s) => contrast(on, S(s)) >= 4.5 && contrast(S(s), surface) >= 4.5 && contrast(S(s), muted) >= 4.5 && contrast(S(s), overlay) >= 3;
    const passes = (s) => okFill(s) && okFill(next(s)) && contrast(S(next(s)), subtle) >= 4.5;
    // The color itself when it passes, so the buttons are the brand's own; else the shade nearest the page's end.
    const cands = order(light ? '500' : '200', light ? '800' : '500');
    const primary = cands.includes(seedStep) && passes(seedStep) ? seedStep : cands.find(passes);
    if (!primary) fail(mode, `${light ? 'white' : 'dark'} text at 4.5:1 and 4.5:1 on the ${light ? 'white' : 'dark'} page, with a hover that passes too`);
    const ring = (need) => (s) => contrast(S(s), surface) >= need && contrast(S(s), overlay) >= need && contrast(S(s), subtle) >= need;
    const focus = order(light ? '400' : '200', light ? '800' : '600').find(ring(3));
    if (!focus) fail(mode, 'a focus ring at 3:1 on the surface');
    const strong = (s) => contrast(S(s), surface) >= 7 && contrast(S(s), subtle) >= 7 && contrast(on, S(s)) >= 4.5;
    const more = order(light ? '600' : '100', light ? '900' : '400').find((s) => strong(s) && strong(next(s)));
    if (!more) fail(mode, 'a stronger primary at 7:1 for more contrast');
    const moreFocus = order(light ? '500' : '100', light ? '900' : '500').find(ring(4.5)) || more;
    // A visited link stays a hue apart: violet, or fuchsia when the brand is violet-ish (as the violet theme does).
    const violetHue = oklchOf(palette.get('violet-600'))[2];
    const dist = Math.min(Math.abs(hue - violetHue), 360 - Math.abs(hue - violetHue));
    const visited = dist < 30 ? (light ? '{fuchsia-700}' : '{fuchsia-300}') : b['link-visited'];
    picks[mode] = { primary, hover: next(primary), focus, more, moreHover: next(more), moreFocus };
    Object.assign(b, {
      primary: `{${name}-${primary}}`, 'primary-hover': `{${name}-${next(primary)}}`, 'primary-subtle': `{${name}-${light ? '50' : '950'}}`,
      'on-primary': light ? '{white}' : `{${name}-950}`, 'focus-ring': `{${name}-${focus}}`, 'link-visited': visited,
      'dk-more-primary': `{${name}-${more}}`, 'dk-more-primary-hover': `{${name}-${next(more)}}`, 'dk-more-focus-ring': `{${name}-${moreFocus}}`,
    });
    picks[mode].values = b;
  }

  const themes = {};
  for (const mode of ['light', 'dark']) {
    const own = picks[mode].values;
    themes[`${name}-${mode}`] = Object.fromEntries(Object.keys(own).map((k) => [k, hexAt(own[k], own)]));
  }
  // Every brand-color pair the shipped themes are held to, checked again on the result.
  const low = [];
  for (const [th, v] of Object.entries(themes)) for (const [fg, bg, need] of PAIRS_FOR_BRAND) {
    const pick = (n) => v[n.replace(/^more:/, 'dk-more-')] ?? v[n];
    const r = contrast(pick(fg), pick(bg));
    if (r < need - 1e-9) low.push(`${th}: ${fg} on ${bg} ${r.toFixed(2)}:1 (needs ${need})`);
  }
  if (low.length) throw new Error(`${color} doesn't make themes that pass: ${low.join('; ')}`);

  const v = (x) => { const r = ref(x); return r ? `var(--${r})` : x; };
  const block = (sel, own) => `${sel} {\n${Object.entries(own).map(([k, x]) => `  --${k}: ${v(x)};\n`).join('')}}\n`;
  const L = picks.light.values, D = picks.dark.values;
  const pair = Object.fromEntries(['primary', 'primary-hover', 'primary-subtle', 'on-primary', 'focus-ring', 'link-visited', 'dk-more-primary', 'dk-more-primary-hover', 'dk-more-focus-ring']
    .map((k) => [k, `light-dark(${v(L[k])}, ${v(D[k])})`]));
  const radius = CORNERS[corners];
  const css = [
    `/* ${name}: a Serupa theme from ${hexOf(parseHex(color))} (${name}-${seedStep}), made by serupa-brand. Load it after tokens.css, then\n`,
    `   set data-theme="${name}-light" or "${name}-dark" (or data-brand="${name}" with data-mode). */\n`,
    // In tokens.css's layer, after it: the more-contrast and forced-colors rules there still win, as for a shipped theme.
    '@layer dk.tokens {\n',
    `:root {\n${STEPS.map((s) => `  --${name}-${s}: ${shades[s]};\n`).join('')}}\n`,
    block(`[data-theme="${name}-light"]`, L),
    block(`[data-theme="${name}-dark"]`, D),
    block(`:root[data-brand="${name}"]:not([data-theme]), [data-brand="${name}"]:not([data-theme])`, pair),
    block(`:is([data-theme^="${name}-"], [data-brand="${name}"]) [data-mode]:not([data-theme], [data-brand])`, pair),
    radius ? block(`:is([data-theme^="${name}-"], [data-brand="${name}"])`, Object.fromEntries(Object.entries(radius).map(([k, x]) => [k, `{${x}}`]))) : '',
    '}\n',
  ].join('');
  return { css, shades, themes, picks: { light: { ...picks.light, values: undefined }, dark: { ...picks.dark, values: undefined } } };
}
