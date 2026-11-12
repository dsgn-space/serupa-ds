// Component contract: every folder in src/components/ ships what the project standard asks for, so a new
// component can't pass CI with something missing. No browser needed.
//   node tools/test/contract.mjs
// Each component needs: <Name>.tsx, index.ts (what the package exports from it), <Name>.css, <name>.tokens.json,
// <Name>.stories.tsx, <Name>.mdx, README.md, preview.html, a test next to it (<Name>.test.tsx, Vitest), visual
// baselines of its stories in every theme, and a stress story (G14): one exported as Long…, Stress… or Overflow…
// that fills it with long words, long labels and more items than fit, so the visual baselines show how it wraps,
// truncates or scrolls.
import fs from 'node:fs';
import path from 'node:path';
import { HERE, PROJECT, kebab, tokensCss, report, done } from './lib.mjs';
import { componentIndex } from '../build/registry.mjs';

const SKIP = [];
// Parts a component doesn't need, and why. Keep the reason: an exemption without one is a gap.
const EXEMPT = {
  FormattedNumber: { tokens: 'inline text in the surrounding font and color; no visual values of its own' },
  Icon: { tokens: 'draws in currentColor at 1em; no visual values of its own', stress: 'one glyph at 1em: no text to grow or wrap' },
  RelativeTime: { tokens: 'inline text in the surrounding font and color; no visual values of its own' },
  TimeZonePicker: { tokens: 'a Combobox: its tokens set its look, and it adds no visual values of its own' },
  TabNav: { tokens: 'drawn with Tabs\' classes and --tabs-* tokens, so it matches Tabs and adds no visual values of its own' },
  ToggleGroup: { tokens: 'a ButtonGroup of ToggleButtons: their tokens set its look, and it adds no visual values of its own' },
  VisuallyHidden: { tokens: 'no visual values', preview: 'nothing to see', visual: 'nothing to see', stress: 'nothing to see' },
};
// Known gaps, to be fixed. The check fails when one is fixed, so the entry gets removed and can't come back.
const GAPS = {};
const COMP = path.join(PROJECT, 'src', 'components');
const comps = fs.readdirSync(COMP).filter((c) => fs.statSync(path.join(COMP, c)).isDirectory() && !SKIP.includes(c)).sort();
const { themes } = tokensCss();
// baseline-visual/<Name>/<Story>-<theme>-<state>.png (tools/test/visual.mjs).
const baselines = (c) => { const d = path.join(HERE, 'baseline-visual', c); return fs.existsSync(d) ? fs.readdirSync(d) : []; };

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

for (const c of comps) {
  const has = (f) => fs.existsSync(path.join(COMP, c, f));
  const parts = {
    code: has(`${c}.tsx`),
    index: has('index.ts'),
    css: has(`${c}.css`),
    tokens: fs.readdirSync(path.join(COMP, c)).some((f) => f.endsWith('.tokens.json')),
    stories: has(`${c}.stories.tsx`),
    docs: has(`${c}.mdx`),
    guide: has('README.md'),
    preview: has('preview.html'),
    test: has(`${c}.test.tsx`),
    visual: themes.every((th) => baselines(c).some((f) => f.endsWith(`-${th}-rest.png`))),
    stress: has(`${c}.stories.tsx`) && /^export const (Long|Stress|Overflow)\w*\b/m.test(fs.readFileSync(path.join(COMP, c, `${c}.stories.tsx`), 'utf8')),
  };
  const missing = [], fixed = [];
  for (const [part, ok] of Object.entries(parts)) {
    if (EXEMPT[c]?.[part]) continue;
    if (GAPS[c]?.[part]) { if (ok) fixed.push(part); continue; }
    if (!ok) missing.push(part);
  }
  const what = { code: `${c}.tsx`, index: 'index.ts (its public exports)', css: `${c}.css`, tokens: `${kebab(c)}.tokens.json`, stories: `${c}.stories.tsx`, docs: `${c}.mdx`, guide: 'README.md', preview: 'preview.html', test: `${c}.test.tsx`, visual: `a visual baseline in each of the ${themes.length} themes (add the "update-visual-baselines" label)`, stress: 'a stress story (export const LongText, LongLabels, Overflow…): long words, long labels, more items than fit' };
  t(`${c} has everything a component ships with`, !missing.length && !fixed.length,
    [missing.length && `missing: ${missing.map((p) => what[p]).join(', ')}`, fixed.length && `known gap now fixed, remove it from GAPS in contract.mjs: ${fixed.join(', ')}`].filter(Boolean).join('; '));
}

// Tree-shaking: a component made with React.forwardRef(...) and a separate `X.displayName = "X"` statement can't be
// dropped by a bundler (the statement is a side effect), so every component goes through component() or named().
const unshakeable = comps.flatMap((c) => fs.readdirSync(path.join(COMP, c)).filter((f) => /^[A-Z]\w*\.tsx$/.test(f) && !/\.(test|stories)\.tsx$/.test(f))
  .filter((f) => /^\w+\.displayName = |= React\.forwardRef\b/m.test(fs.readFileSync(path.join(COMP, c, f), 'utf8'))).map((f) => `${c}/${f}`));
t('components are made with component() or named() (internal/component.ts), so unused ones drop out of a bundle', !unshakeable.length, unshakeable.join(', '));

// One focus-ring recipe (outline + outline-offset) is the Stylelint rule serupa/focus-ring-outline
// (tools/lint/stylelint-serupa.mjs), with the layer, raw-value and color rules.

// npm run new-component writes TODO(new-component) wherever a new component still needs its author's words; one left
// means it isn't finished.
const unfinished = comps.flatMap((c) => fs.readdirSync(path.join(COMP, c)).filter((f) => fs.readFileSync(path.join(COMP, c, f), 'utf8').includes('TODO(new-component)')).map((f) => `${c}/${f}`));
t('no TODO(new-component) is left from the component generator', !unfinished.length, unfinished.join(', '));
// A Directions story (npm run new-component -- <Name> --directions, in src/directions/) is for picking by looking,
// never for main.
const DIRS = path.join(PROJECT, 'src', 'directions');
const directions = fs.existsSync(DIRS) ? fs.readdirSync(DIRS).filter((f) => f.endsWith('.stories.tsx')) : [];
t('no Directions story is left: pick a take, write why in the pull request, then delete it', !directions.length, directions.map((f) => 'src/directions/' + f).join(', '));

// README.md's components index (tools/build/registry.mjs, rewritten on each release): every guide opens with a sentence
// it can show, and nothing it links to is gone, so a component renamed or removed since the release can't leave a
// dead link.
const index = componentIndex(PROJECT);
const unsaid = comps.filter((c) => !new RegExp(`^\\| \\[${c}\\]\\([^)]+\\)(?: \\([a-z]+\\))? \\| \\S`, 'm').test(index));
t('every guide opens with a sentence for the README components index', !unsaid.length, `no first paragraph under the heading: ${unsaid.join(', ')}`);
const readme = fs.readFileSync(path.join(PROJECT, 'README.md'), 'utf8');
const dead = [...readme.matchAll(/\]\((src\/components\/[^)#]+)\)/g)].map((m) => m[1]).filter((f) => !fs.existsSync(path.join(PROJECT, f)));
t('README.md links only to component files that exist', !dead.length, `${[...new Set(dead)].join(', ')}: run node tools/build/registry.mjs --readme`);

// Patterns (src/patterns/<Name>/, PT0) are whole screens for apps to copy; blocks (src/blocks/<Name>/, BL0) are
// sections of a screen. Each holds its stories, a test that proves it (keyboard, focus, what's said) and a guide
// (<Name>.mdx: when to use it and what stays the app's job), and is listed in its group's Introduction.
const groups = {};
for (const [dir, group] of [['patterns', 'Patterns'], ['blocks', 'Blocks']]) {
  const DIR = path.join(PROJECT, 'src', dir);
  const names = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((p) => fs.statSync(path.join(DIR, p)).isDirectory()).sort() : [];
  const intro = fs.existsSync(path.join(DIR, 'Introduction.mdx')) ? fs.readFileSync(path.join(DIR, 'Introduction.mdx'), 'utf8') : '';
  for (const p of names) {
    const lacks = ['stories.tsx', 'test.tsx', 'mdx'].filter((ext) => !fs.existsSync(path.join(DIR, p, `${p}.${ext}`))).map((ext) => `${p}.${ext}`);
    const title = (fs.existsSync(path.join(DIR, p, `${p}.stories.tsx`)) ? fs.readFileSync(path.join(DIR, p, `${p}.stories.tsx`), 'utf8') : '').match(new RegExp(`title: '(${group}/[^']+)'`));
    const listed = !!title && intro.includes(`?path=/docs/${title[1].toLowerCase().replace(/[^a-z0-9]+/g, '-')}--docs`);
    t(`${dir.slice(0, -1)} ${p}: stories, test and guide, listed in ${group}/Introduction`, !lacks.length && listed,
      [lacks.length && `missing: ${lacks.join(', ')}`, !listed && `add it to the table in src/${dir}/Introduction.mdx, linked to its docs page`].filter(Boolean).join('; '));
  }
  groups[dir] = names.length;
}

console.log(`(${comps.length} components, ${groups.patterns} patterns, ${groups.blocks} blocks)`);
done(report('Contract', R));
