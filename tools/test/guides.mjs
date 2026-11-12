// Usage guides: every component's README.md has the sections docs/usage-guide-template.md requires, so each
// Storybook page says when to use the component, when not to, and how it meets accessibility; and every test or
// tool file a guide names (`tools/test/menu.mjs`, `Menu.test.tsx`) exists; and every class the docs name exists in
// dist/bundle.css (npm run build first), so a page never recommends one that does nothing.
//   node tools/test/guides.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';

const REQUIRED = ['When to use', 'When not to use', 'Usage', 'Accessibility', 'Props', 'Component tokens'];
const DIR = path.join(PROJECT, 'src', 'components');
const COMPONENTS = new Set(fs.readdirSync(DIR).map((n) => n.toLowerCase()));
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
  // Other names (LG1): an optional "**Also called:**" line right under the first paragraph, which Guides/Choose a
  // component lists. A name another component has (Stepper, Calendar) would send the reader to the wrong page.
  const also = /^\*\*Also called:\*\* (.+)$/m.exec(md);
  if (also) {
    const intro = md.split(/^## /m)[0], names = also[1].replace(/\.\s*$/, '').split(/,\s*/);
    const taken = names.filter((n) => n.toLowerCase().replace(/\s+/g, '') !== name.toLowerCase() && COMPONENTS.has(n.toLowerCase().replace(/\s+/g, '')));
    t(`${name}: "Also called" sits in the intro and names no other component`, intro.includes(also[0]) && !taken.length && names.every(Boolean), taken.length ? `another component's name: ${taken.join(', ')}` : 'move it under the first paragraph');
  }
  // Where an id lands (BC2): the root, the native field inside, or nowhere. A reader needs to know before pointing a
  // <label htmlFor>, aria-describedby or a link at it. A `| \`id\` |` row, or `id` named in prose, under Props.
  const props = (md.split(/^## Props\s*$/m)[1] || '').split(/^## /m)[0];
  t(`${name}: the Props section says where \`id\` goes`, /`id`/.test(props), 'add an `id` row: the root element, the native field inside, or not a prop');
  // What the keyboard does, under Accessibility: a "### Keyboard" part or a "**Keyboard:**" line ("none: it isn't
  // focusable" is an answer). A component that handles keys itself (keydown in its source) needs a | Key | … | table.
  const a11y = (md.split(/^## Accessibility\s*$/m)[1] || '').split(/^## /m)[0];
  const said = /^### Keyboard\b|\*\*Keyboard:\*\*/m.test(a11y);
  const table = /^\s*\| Key \|/m.test(a11y);
  const keys = /onKeyDown|keydown/.test(fs.readFileSync(path.join(DIR, name, `${name}.tsx`), 'utf8'));
  const ok = said && (!keys || table);
  const why = !said ? 'no "### Keyboard" part or "**Keyboard:**" line under Accessibility' : 'it handles keys: add a | Key | Does | table';
  t(`${name}: the guide says what the keyboard does`, ok, why);
  // Do and don't (docs/doDont.tsx): each Do followed by its Don't, and every story they name exported from the stories file.
  const dd = (md.split(/^### Do and don't\s*$/m)[1] || '').split(/^##+ /m)[0];
  if (dd) {
    const items = [...dd.matchAll(/^- \*\*(Do|Don't):\*\* .+? \(`(\w+)`\)\s*$/gm)].map((m) => ({ kind: m[1], story: m[2] }));
    const bullets = (dd.match(/^- /gm) || []).length;
    const paired = items.length > 0 && items.length === bullets && items.length % 2 === 0 && items.every((it, i) => it.kind === (i % 2 ? "Don't" : 'Do'));
    t(`${name}: each Do has its Don't, and each names its story`, paired, 'write "- **Do:** <rule> (`Story`)" then "- **Don\'t:** <rule> (`Story`)"');
    const storiesFile = path.join(DIR, name, `${name}.stories.tsx`);
    const src = fs.existsSync(storiesFile) ? fs.readFileSync(storiesFile, 'utf8') : '';
    const missingStories = items.filter((it) => !new RegExp(`^export const ${it.story}\\b`, 'm').test(src)).map((it) => it.story);
    t(`${name}: the Do and don't stories exist`, !missingStories.length, `not exported: ${missingStories.join(', ')}`);
  }
}
// The classes the docs name: each word of a class="…" in an example, and each prefixed class in backticks
// (`md:gap-12`). Utilities have only breakpoint prefixes, so `hover:scale-105` or `focus:not-sr-only` would silently
// do nothing. A bare `scale-105` in backticks is left alone: a token has the same name.
const bundle = path.join(PROJECT, 'dist', 'bundle.css');
if (!fs.existsSync(bundle)) t('the classes the docs name exist in dist/bundle.css', false, 'npm run build first');
else {
  const css = fs.readFileSync(bundle, 'utf8');
  const exists = (c) => css.includes('.' + c.replace(/[:/.[\]%]/g, (m) => '\\' + m));
  const docs = ['README.md', ...fs.readdirSync(path.join(PROJECT, 'docs')).filter((f) => /\.mdx?$/.test(f)).map((f) => `docs/${f}`),
    ...fs.readdirSync(DIR).map((n) => `src/components/${n}/README.md`).filter((f) => fs.existsSync(path.join(PROJECT, f)))];
  const unknown = [];
  for (const f of docs) {
    const text = fs.readFileSync(path.join(PROJECT, f), 'utf8');
    const named = [
      ...[...text.matchAll(/class(?:Name)?="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => /^[a-z-]/.test(c)),
      ...[...text.matchAll(/`([^`\n]+)`/g)].flatMap((m) => m[1].split(/\s+/)).filter((w) => /^[a-z0-9]+:[a-z-][\w\-/.[\]%]*$/.test(w)),
    ];
    for (const c of new Set(named)) if (!exists(c)) unknown.push(`${f}: ${c}`);
  }
  t('the classes the docs name exist in dist/bundle.css', !unknown.length, unknown.slice(0, 12).join(', '));
}
// Choose a component (docs/ChooseAComponent.mdx) places every component next to the ones it can be mistaken for, so a
// new one is placed when it merges. A component with nothing alike can be listed here instead; adding one is a
// decision. Since 11 Nov 2026 every component is on the page, the ones for showing text and values included.
const ALONE = [];
const choose = fs.readFileSync(path.join(PROJECT, 'docs', 'ChooseAComponent.mdx'), 'utf8');
const unplaced = fs.readdirSync(DIR).filter((n) => fs.existsSync(path.join(DIR, n, `${n}.tsx`)) && !ALONE.includes(n) && !choose.includes(`-${n.toLowerCase()}--docs)`));
t('Choose a component: every component is on the page, or on the nothing-alike list in tools/test/guides.mjs', !unplaced.length, `not placed: ${unplaced.join(', ')}`);
const placedAlone = ALONE.filter((n) => choose.includes(`-${n.toLowerCase()}--docs)`) || !fs.existsSync(path.join(DIR, n, `${n}.tsx`)));
t('Choose a component: the nothing-alike list names only components that exist and are not on the page', !placedAlone.length, `take off the list: ${placedAlone.join(', ')}`);
// Every docs page link in docs/ (?path=/docs/<id>--docs) goes to a page that exists: a component's stories or an
// MDX page, by its title as Storybook makes the id ("Guides/Choose a component" → guides-choose-a-component).
const storyId = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const titles = new Set();
const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'generated') walk(p); } else if (/\.(stories\.tsx|mdx)$/.test(e.name)) for (const m of fs.readFileSync(p, 'utf8').matchAll(/(?:^\s*title: |<Meta title=)['"]([^'"]+)['"]/gm)) titles.add(storyId(m[1])); } };
walk(path.join(PROJECT, 'src')); walk(path.join(PROJECT, 'docs'));
const broken = [];
for (const f of fs.readdirSync(path.join(PROJECT, 'docs')).filter((n) => n.endsWith('.mdx'))) {
  for (const m of fs.readFileSync(path.join(PROJECT, 'docs', f), 'utf8').matchAll(/\?path=\/docs\/([a-z0-9-]+)--docs/g)) if (!titles.has(m[1])) broken.push(`${f}: ${m[1]}`);
}
t('every docs page link in docs/*.mdx goes to a page that exists', !broken.length, broken.slice(0, 12).join(', '));
// Patterns and blocks (PT0, BL0): each docs page says when to use it before what each part is for, as a component's
// guide does, so nobody copies a whole screen for a job it isn't meant for.
for (const group of ['patterns', 'blocks']) {
  const root = path.join(PROJECT, 'src', group);
  for (const name of fs.readdirSync(root).sort()) {
    const file = path.join(root, name, `${name}.mdx`);
    if (!fs.existsSync(file)) continue;
    const headings = [...fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '').matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);
    const when = headings.findIndex((h) => /^(When to use|Which one to use)/.test(h)), parts = headings.indexOf('What each part is for');
    t(`${group}/${name}: the page says when to use it, before what each part is for`, when >= 0 && (parts < 0 || when < parts), `headings: ${headings.join(' · ')}`);
  }
}
done(report('Usage guides', R));
