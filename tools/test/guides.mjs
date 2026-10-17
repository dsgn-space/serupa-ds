// Usage guides: every component's README.md has the sections docs/usage-guide-template.md requires, so each
// Storybook page says when to use the component, when not to, and how it meets accessibility.
//   node tools/test/guides.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report } from './lib.mjs';

const REQUIRED = ['When to use', 'When not to use', 'Usage', 'Accessibility', 'Props', 'Component tokens'];
// Guides still in the old outline. Each one moves to the template in its own docs pull request, which takes it
// off this list; a guide on the list that already has every section fails, so the list only shrinks.
// AvatarGroup and Carousel are in open pull requests with the old outline, so they're listed ahead of time.
const PENDING = new Set([
  'AvatarGroup', 'Carousel'
]);

const DIR = path.join(PROJECT, 'src', 'components');
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
for (const name of fs.readdirSync(DIR).sort()) {
  if (!fs.existsSync(path.join(DIR, name, `${name}.tsx`))) continue;
  const file = path.join(DIR, name, 'README.md');
  if (!fs.existsSync(file)) { t(`${name}: has a usage guide (README.md)`, false, 'missing'); continue; }
  const md = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  const headings = [...md.matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);
  const missing = REQUIRED.filter((h) => !headings.includes(h));
  const order = REQUIRED.filter((h) => headings.includes(h)).map((h) => headings.indexOf(h));
  const inOrder = order.every((v, i) => !i || v > order[i - 1]);
  if (PENDING.has(name)) t(`${name}: still in the old outline (listed in PENDING)`, missing.length > 0, 'it has every section now: take it off PENDING in tools/test/guides.mjs');
  else t(`${name}: the guide has ${REQUIRED.join(', ')}, in that order`, !missing.length && inOrder, missing.length ? `missing: ${missing.join(', ')}` : `order: ${headings.join(' · ')}`);
}
process.exit(report('Usage guides', R) ? 0 : 1);
