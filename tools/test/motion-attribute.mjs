// An app's own "Reduce motion" setting (tools/build/motion-attribute.mjs): each prefers-reduced-motion rule also
// answers data-motion="reduce", at the same specificity, and the shipped CSS carries it.
//   node tools/test/motion-attribute.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, done, report } from './lib.mjs';
import { withMotionAttribute as w } from '../build/motion-attribute.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok, detail });
const flat = (css) => css.replace(/\s+/g, ' ').trim();

const reduce = flat(w('@media (prefers-reduced-motion: reduce) { .dk-a, .dk-b::after { transition: none; } }'));
t('a reduce rule gains a copy under :where([data-motion="reduce"]) for each selector, pseudo-elements kept',
  reduce.endsWith(':where([data-motion="reduce"]) .dk-a,:where([data-motion="reduce"]) .dk-b::after { transition: none; }'), reduce);
const both = flat(w('@media (hover: hover) and (prefers-reduced-motion: reduce) { .dk-a { scale: none; } }'));
t('a reduce rule with another condition keeps that condition on its copy',
  both.includes('@media (hover: hover) { :where([data-motion="reduce"]) .dk-a { scale: none; } }'), both);
const nope = flat(w('@media (prefers-reduced-motion: no-preference) { .dk-a > .dk-b::before { translate: 0 4px; } @starting-style { .dk-c { scale: 0.9; } } }'));
t('a no-preference rule is kept off inside the attribute, on the subject and before its pseudo-element, nested at-rules too',
  nope.includes('.dk-a > .dk-b:not(:where([data-motion="reduce"], [data-motion="reduce"] *))::before') && nope.includes('@starting-style { .dk-c:not(:where([data-motion="reduce"], [data-motion="reduce"] *))'), nope);
const root = flat(w('@media (prefers-reduced-motion: reduce) { :where(html) { scroll-behavior: auto; } ::view-transition-group(*) { animation-name: none; } }'));
t('a rule for the root puts the attribute on the root',
  root.includes(':where(:root[data-motion="reduce"]) { scroll-behavior: auto; }') && root.includes(':where(:root[data-motion="reduce"])::view-transition-group(*)'), root);
t('CSS with no motion query is left as it is', w('.dk-a { color: red; }') === '.dk-a { color: red; }', 'changed');

const dist = path.join(PROJECT, 'dist');
for (const f of ['components.css', 'bundle.css', 'base.css']) {
  const css = fs.existsSync(path.join(dist, f)) ? fs.readFileSync(path.join(dist, f), 'utf8') : '';
  const queries = (css.match(/prefers-reduced-motion:\s*reduce/g) || []).length;
  t(`dist/${f} answers data-motion="reduce" (run the build first)`, !!css && (queries === 0 || css.includes(':where([data-motion="reduce"])')), `${queries} reduce queries, no attribute copies`);
}

done(report('Motion attribute', R));
