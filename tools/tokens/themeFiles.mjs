// Reading a theme from design-tokens/: its mode's aliases (themes/light or themes/dark) with its brand's overlay
// (brands/<theme>) on top. For the tools that build from design-tokens/ (native, email, Figma, Style Dictionary).
import fs from 'node:fs';
import path from 'node:path';

const load = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
export const modeOf = (theme) => (theme.endsWith('-dark') ? 'dark' : 'light');

/** The theme ids, from the overlays there are: blue-dark, blue-light, … (sorted). */
export const themeIds = (dir) => fs.readdirSync(path.join(dir, 'brands')).filter((f) => f.endsWith('.tokens.json')).sort().map((f) => f.slice(0, -'.tokens.json'.length));

/** One theme's alias colors, whole: { color: { primary: {…}, … } }, in the mode file's order. */
export function loadTheme(dir, theme) {
  const mode = load(path.join(dir, 'themes', `${modeOf(theme)}.tokens.json`)), own = load(path.join(dir, 'brands', `${theme}.tokens.json`));
  return { color: { ...mode.color, ...own.color } };
}

/** Every theme, whole: { 'blue-dark': { color }, … }. */
export const loadThemes = (dir) => Object.fromEntries(themeIds(dir).map((th) => [th, loadTheme(dir, th)]));
