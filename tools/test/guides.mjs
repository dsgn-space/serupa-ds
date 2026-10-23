// Usage guides: every component's README.md has the sections docs/usage-guide-template.md requires, so each
// Storybook page says when to use the component, when not to, and how it meets accessibility; and every test or
// tool file a guide names (`tools/test/menu.mjs`, `Menu.test.tsx`) exists.
//   node tools/test/guides.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report } from './lib.mjs';

const REQUIRED = ['When to use', 'When not to use', 'Usage', 'Accessibility', 'Props', 'Component tokens'];
const DIR = path.join(PROJECT, 'src', 'components');
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
for (const name of fs.readdirSync(DIR).sort()) {
  if (!fs.existsSync(path.join(DIR, name, `${name}.tsx`))) continue;
  const file = path.join(DIR, name, 'README.md');
  if (!fs.existsSync(file)) { t(`${name}: has a usage guide (README.md)`, false, 'missing'); continue; }
  const raw = fs.readFileSync(file, 'utf8'), md = raw.replace(/```[\s\S]*?```/g, '');
  const named = [...raw.matchAll(/`(tools\/[\w./-]+\.\w+|\w+\.test\.tsx)`/g)].map((m) => m[1]);
  const gone = named.filter((f) => !fs.existsSync(f.startsWith('tools/') ? path.join(PROJECT, f) : path.join(DIR, name, f)));
  if (named.length) t(`${name}: the files the guide names exist`, !gone.length, `not found: ${gone.join(', ')}`);
  const headings = [...md.matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);
  const missing = REQUIRED.filter((h) => !headings.includes(h));
  const order = REQUIRED.filter((h) => headings.includes(h)).map((h) => headings.indexOf(h));
  const inOrder = order.every((v, i) => !i || v > order[i - 1]);
  t(`${name}: the guide has ${REQUIRED.join(', ')}, in that order`, !missing.length && inOrder, missing.length ? `missing: ${missing.join(', ')}` : `order: ${headings.join(' · ')}`);
}
process.exit(report('Usage guides', R) ? 0 : 1);
