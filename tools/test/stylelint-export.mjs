// serupa-ds/stylelint, as a project uses it (npm run build first): `extends: ["serupa-ds/stylelint"]` turns on four
// rules that flag a color, a spacing length, a radius or a duration or easing written out where a token belongs, and pass the same CSS
// written with tokens, var() fallbacks and calc() over tokens included.
//   node tools/test/stylelint-export.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import stylelint from 'stylelint';
import { PROJECT, done, fail, report } from './lib.mjs';

const file = path.join(PROJECT, 'dist', 'stylelint.js');
if (!fs.existsSync(file)) fail('no dist/stylelint.js: run npm run build first');
const config = (await import(pathToFileURL(file).href)).default;
const R = [];
const found = async (code) => (await stylelint.lint({ code, codeFilename: path.join(PROJECT, 'app.css'), config: { extends: [file] } })).results[0].warnings.map((w) => `${w.rule} ${w.text.split(' in ')[0]}`);
const t = async (name, code, want) => {
  const got = await found(code);
  R.push({ name, ok: JSON.stringify(got) === JSON.stringify(want), detail: `flagged ${JSON.stringify(got)}, expected ${JSON.stringify(want)}` });
};

R.push({ name: 'the config turns on the four rules it ships, and nothing else', ok: JSON.stringify(Object.keys(config.rules).sort()) === JSON.stringify(['serupa/no-raw-color', 'serupa/no-raw-motion', 'serupa/no-raw-radius', 'serupa/no-raw-spacing']) && config.plugins.length === 4, detail: Object.keys(config.rules).join(', ') });
await t('CSS written with tokens passes', `.card { color: var(--text); background: var(--surface-raised, #fff); border: var(--border-width-1, 1px) solid var(--border);
  padding: var(--spacing-4) calc(var(--spacing-4) * 2); margin: 0 auto; gap: var(--spacing-2); inset: 0; border-radius: var(--rounded-md);
  outline-color: currentcolor; fill: transparent; background-image: url("data:image/svg+xml;utf8,<svg fill='red'/>"); width: 320px;
  --brand-ink: #123456; font-family: "Gray Sans", sans-serif; }
.avatar { border-radius: var(--rounded-full); border-top-left-radius: 0; }`, []);
await t('no-raw-color: a hex, rgb(), oklch() and a named color', '.a { color: #333; background: rgb(0 0 0 / 50%); border-color: oklch(70% 0.1 250); outline-color: Red; }',
  ['serupa/no-raw-color #333', 'serupa/no-raw-color rgb()', 'serupa/no-raw-color oklch()', 'serupa/no-raw-color Red']);
await t('no-raw-color: a raw color next to a token in a shorthand', '.a { border: 1px solid #ddd; box-shadow: 0 1px 2px black, var(--shadow-sm); }',
  ['serupa/no-raw-color #ddd', 'serupa/no-raw-color black']);
await t('no-raw-spacing: px and rem in padding, margin, gap and inset (0 passes)', '.a { padding: 12px 0; margin-inline-start: -0.5rem; gap: 10px; inset-block-start: 4px; padding-top: 0px; }',
  ['serupa/no-raw-spacing 12px', 'serupa/no-raw-spacing -0.5rem', 'serupa/no-raw-spacing 10px', 'serupa/no-raw-spacing 4px']);
await t('no-raw-color: a named color is a name outside the properties that take a color', '.a { grid-area: tan; animation-name: orange; font-family: Gold, serif; view-transition-name: red; -webkit-text-stroke-color: red; }',
  ['serupa/no-raw-color red']);
await t('no-raw-spacing: a percentage, viewport or container unit has no token and passes', '.a { inset: 50%; padding: max(var(--spacing-2), 1vw); margin-block: 2dvh 5cqi; gap: 3px 10%; }',
  ['serupa/no-raw-spacing 3px']);
await t('no-raw-radius: a length or percentage in border-radius and its longhands', '.a { border-radius: 6px; border-end-start-radius: 50%; }',
  ['serupa/no-raw-radius 6px', 'serupa/no-raw-radius 50%']);
await t('no-raw-motion: tokens, none, 0s, a sub-millisecond off switch, linear and step-end pass', `.a { transition: opacity var(--motion-enter-sm) var(--ease-enter), translate var(--motion-exit-md, 150ms) var(--ease-exit, ease-out); }
.b { animation: spin var(--motion-loop-spinner) linear infinite; transition: none; transition-delay: 0s; }
@media (prefers-reduced-motion: reduce) { .c { animation-duration: 0.01ms; transition-duration: 0.0001s; animation-timing-function: step-end; } }
.d { --my-ease: cubic-bezier(0.2, 0, 0, 1); --my-time: 250ms; transition-property: opacity, translate; }`, []);
await t('no-raw-motion: durations, delays and easings written out, and all', `.a { transition: all 0.3s ease; }
.b { animation: pop 250ms cubic-bezier(0.34, 1.56, 0.64, 1) 50ms both; }
.c { transition-property: all; transition-timing-function: linear(0, 1.1 60%, 1); animation-duration: 2s; }`,
  ['serupa/no-raw-motion all', 'serupa/no-raw-motion 0.3s', 'serupa/no-raw-motion ease', 'serupa/no-raw-motion 250ms', 'serupa/no-raw-motion cubic-bezier()', 'serupa/no-raw-motion 50ms', 'serupa/no-raw-motion all', 'serupa/no-raw-motion linear()', 'serupa/no-raw-motion 2s']);
R.push({ name: 'no-raw-motion is a warning, so an app\'s lint still passes on upgrade', ok: (await stylelint.lint({ code: '.a { transition: all 0.3s ease; }', codeFilename: path.join(PROJECT, 'app.css'), config: { extends: [file] } })).results[0].warnings.every((w) => w.severity === 'warning'), detail: 'severity' });
await t('a stylelint-disable comment with a reason turns a rule off for that line', '.a {\n  /* stylelint-disable-next-line serupa/no-raw-color -- the brand file asks for this exact ink */\n  color: #0a2540;\n}', []);

done(report('serupa-ds/stylelint', R));
