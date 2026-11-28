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

const reduce = flat(w('@media (prefers-reduced-motion: reduce) { .srp-a, .srp-b::after { transition: none; } }'));
t('a reduce rule gains a copy under :where([data-motion="reduce"]) for each selector, pseudo-elements kept',
  reduce.endsWith(':where([data-motion="reduce"]) .srp-a,:where([data-motion="reduce"]) .srp-b::after { transition: none; }'), reduce);
const both = flat(w('@media (hover: hover) and (prefers-reduced-motion: reduce) { .srp-a { scale: none; } }'));
t('a reduce rule with another condition keeps that condition on its copy',
  both.includes('@media (hover: hover) { :where([data-motion="reduce"]) .srp-a { scale: none; } }'), both);
const nope = flat(w('@media (prefers-reduced-motion: no-preference) { .srp-a > .srp-b::before { translate: 0 4px; } @starting-style { .srp-c { scale: 0.9; } } }'));
t('a no-preference rule is kept off inside the attribute, on the subject and before its pseudo-element, nested at-rules too',
  nope.includes('.srp-a > .srp-b:not(:where([data-motion="reduce"], [data-motion="reduce"] *))::before') && nope.includes('@starting-style { .srp-c:not(:where([data-motion="reduce"], [data-motion="reduce"] *))'), nope);
const root = flat(w('@media (prefers-reduced-motion: reduce) { :where(html) { scroll-behavior: auto; } ::view-transition-group(*) { animation-name: none; } }'));
t('a rule for the root puts the attribute on the root',
  root.includes(':where(:root[data-motion="reduce"]) { scroll-behavior: auto; }') && root.includes(':where(:root[data-motion="reduce"])::view-transition-group(*)'), root);
const middle = flat(w('@media screen and (prefers-reduced-motion: reduce) and (min-width: 1px) { .srp-a { scale: none; } }'));
t('a reduce condition between two others leaves a query that still parses: "screen and (min-width: 1px)"',
  middle.includes('@media screen and (min-width: 1px) { :where([data-motion="reduce"]) .srp-a'), middle);
const notReduce = flat(w('@media not (prefers-reduced-motion: reduce) { .srp-a { scale: 1.1; } }'));
t('"not (prefers-reduced-motion: reduce)" is kept off inside the attribute, like no-preference, and its query stays whole',
  notReduce === '@media not (prefers-reduced-motion: reduce) { .srp-a:not(:where([data-motion="reduce"], [data-motion="reduce"] *)) { scale: 1.1; } }', notReduce);
const oldElement = flat(w('@media (prefers-reduced-motion: no-preference) { .srp-a:after { translate: 0 4px; } }'));
t('a pseudo-element written with one colon (":after") keeps the guard before it',
  oldElement.includes('.srp-a:not(:where([data-motion="reduce"], [data-motion="reduce"] *)):after'), oldElement);
const nested = flat(w('.srp-a { animation: spin 1s; @media (prefers-reduced-motion: reduce) { animation: none; } }'));
t('declarations of a media block nested in a rule keep to the attribute, not on everywhere',
  nested === '.srp-a { animation: spin 1s; @media (prefers-reduced-motion: reduce) { animation: none; } :where([data-motion="reduce"]) & { animation: none; } }', nested);
const nestedOn = flat(w('.srp-a { @media (prefers-reduced-motion: no-preference) { animation: spin 1s; } }'));
t('a nested no-preference block\'s own declarations are kept off inside the attribute',
  nestedOn === '.srp-a { @media (prefers-reduced-motion: no-preference) { &:not(:where([data-motion="reduce"], [data-motion="reduce"] *)) { animation: spin 1s } } }', nestedOn);
t('CSS with no motion query is left as it is', w('.srp-a { color: red; }') === '.srp-a { color: red; }', 'changed');

const dist = path.join(PROJECT, 'dist');
for (const f of ['components.css', 'bundle.css', 'base.css']) {
  const css = fs.existsSync(path.join(dist, f)) ? fs.readFileSync(path.join(dist, f), 'utf8') : '';
  const queries = (css.match(/prefers-reduced-motion:\s*reduce/g) || []).length;
  t(`dist/${f} answers data-motion="reduce" (run the build first)`, !!css && (queries === 0 || css.includes(':where([data-motion="reduce"])')), `${queries} reduce queries, no attribute copies`);
}

done(report('Motion attribute', R));
