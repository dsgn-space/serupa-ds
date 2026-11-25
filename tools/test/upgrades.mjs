// Upgrades (93, 40, 205, I8): the RFC for the next major covers every major changeset waiting for a release, each
// with a migration note; the upgrade guide (docs/upgrades.ts) finds the breaking entries of each major; and
// serupa-migrate makes its renames on the tags and nowhere else, says what it can't make, stops on a wrong command,
// and finds nothing to change in this repository's own code and docs, which use only the current names.
//   node tools/test/upgrades.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, read, report, done } from './lib.mjs';
import { parseChangeset } from '../changesets.mjs';
import { COMPONENT_TOKENS_REMOVED_16, DEPTH_TOKENS_16, EASINGS_16, EASINGS_NEAREST_16, migrate, MOTION_TOKENS_16, packageNameChange, TOKENS_15, TRANSFORMS, transformsAfter } from '../../bin/serupa-migrate.mjs';
import { majorsIn, nextMajor, upcomingMajor } from '../../docs/upgrades.ts';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });

// The RFC for the next major.
const version = JSON.parse(read('package.json')).version;
const next = `${Number(version.split('.')[0]) + 1}.0.0`;
const dir = path.join(PROJECT, '.changeset');
const changesets = Object.fromEntries(fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').map((f) => [f, fs.readFileSync(path.join(dir, f), 'utf8')]));
const pkgName = JSON.parse(read('package.json')).name;
const majors = Object.keys(changesets).filter((f) => parseChangeset(changesets[f], pkgName).bump === 'major');
const rfcFile = path.join(PROJECT, 'docs', 'rfcs', `${next}.md`);
if (majors.length) {
  const rfc = fs.existsSync(rfcFile) ? fs.readFileSync(rfcFile, 'utf8') : '';
  t(`docs/rfcs/${next}.md is there for the ${majors.length} major changesets waiting`, rfc, 'add it from the shape in docs/rfcs/README.md');
  if (rfc) {
    t(`the ${next} RFC has a status`, /^\*\*Status:\*\* \S/m.test(rfc));
    const missing = majors.filter((f) => !rfc.includes(`.changeset/${f}`));
    t(`the ${next} RFC has a section for each major changeset`, !missing.length, `add a section naming .changeset/<file>.md for: ${missing.join(', ')}`);
  }
}
const noNote = majors.filter((f) => !/migration/i.test(changesets[f]));
t('every major changeset says how to migrate', !noNote.length, `add "**Migration:** …" to: ${noNote.join(', ')}`);
for (const f of fs.readdirSync(path.join(PROJECT, 'docs', 'rfcs')).filter((x) => /^\d+\.0\.0\.md$/.test(x))) {
  const text = fs.readFileSync(path.join(PROJECT, 'docs', 'rfcs', f), 'utf8');
  t(`docs/rfcs/${f} starts with its title and a status`, text.startsWith(`# RFC: ${f.replace(/\.md$/, '')}\n`) && /^\*\*Status:\*\* /m.test(text));
  // Once its major is in the changelog, the RFC says so, rather than asking for comments on what already shipped (GR131).
  const v = f.replace(/\.md$/, '');
  if (read('CHANGELOG.md').includes(`\n## [${v}]`)) t(`docs/rfcs/${f}: ${v} has shipped, so its status says "Released in ${v}"`, new RegExp(`^\\*\\*Status:\\*\\* Released in ${v.replace(/[\\^$.*+?()[\]{}|/-]/g, '\\$&')}\\b`, 'm').test(text), `set the status line to "**Status:** Released in ${v} (<date>)."`);
}

// The upgrade guide.
const changelog = read('CHANGELOG.md');
const guide = majorsIn(changelog);
const at = (v) => guide.find((m) => m.version === v);
t('the guide lists the majors, newest first', guide.length >= 10 && guide.every((m, i) => !i || Number(m.version.split('.')[0]) < Number(guide[i - 1].version.split('.')[0])), guide.map((m) => m.version).join(' '));
t('12.0.0: the Badge ripple, and RelativeTime (a migration note, no "Breaking" mark)', at('12.0.0')?.entries.some((e) => e.includes('dk-badge__ripples')) && at('12.0.0')?.entries.some((e) => e.includes('absoluteAfter={false}')), JSON.stringify(at('12.0.0')?.entries.map((e) => e.slice(0, 60))));
t('11.0.0: the four breaking entries', at('11.0.0')?.entries.length === 4, JSON.stringify(at('11.0.0')?.entries.map((e) => e.slice(0, 60))));
t('10.0.0: an entry with a migration note but no "Breaking" mark, with its note', at('10.0.0')?.entries.some((e) => e.includes("Link's and BreadcrumbItem's `as`") && e.includes('**Migration.**')));
t('3.0.0: the entries under "Changed (breaking)", with their table', at('3.0.0')?.entries.some((e) => e.includes('Spinner is now **Loader**') && e.includes('| Before (2.x) |')));
t('a minor release is not a major', !at('12.0.0')?.entries.some((e) => e.includes('Badge: letting go of a press')) && !guide.some((m) => m.version === '10.1.0'));
const pending = nextMajor(version, changesets);
t(`the next major (${next}) comes from the major changesets`, majors.length ? pending?.version === next && pending.entries.length >= majors.length : pending === null, JSON.stringify(pending?.entries.map((e) => e.slice(0, 50))));
t('a changeset with single quotes or Windows line ends counts', nextMajor('1.0.0', { a: "---\r\n'serupa-ds': major\r\n---\r\n\r\n- **Breaking.** x.\r\n" })?.entries[0] === '- **Breaking.** x.');
t('with no major changeset, the guide still shows the next major while serupa-migrate has changes for it, with no entries', JSON.stringify(upcomingMajor('14.3.0', {}, ['13.0.0', '15.0.0'])) === JSON.stringify({ version: '15.0.0', date: '', next: true, entries: [] }) && upcomingMajor('14.3.0', {}, ['13.0.0', '14.0.0']) === null && upcomingMajor('14.3.0', { a: "---\n'serupa-ds': major\n---\n\n- **Breaking.** x.\n" }, ['15.0.0'])?.entries.length === 1);
const known = new Set([...guide.map((m) => m.version), next]);
t('each serupa-migrate change belongs to a major in the guide', TRANSFORMS.every((x) => known.has(x.version)), TRANSFORMS.filter((x) => !known.has(x.version)).map((x) => x.id).join(', '));

// The renames.
const fix = (src, file = 'a.tsx', from = null) => migrate(src, file, transformsAfter(from));
const one = (label, src, want, file) => { const r = fix(src, file); t(label, r.text === want, `got: ${r.text}`); };
one('IconButton noTitle → hideTitle, also with a value', '<IconButton icon="x" noTitle label="Close" /><IconButton noTitle={!wide} />', '<IconButton icon="x" hideTitle label="Close" /><IconButton hideTitle={!wide} />');
one('a > or quote inside a value doesn\'t end the tag', `<IconButton label={a > b ? "x>y" : 'it\\'s'} onClick={() => { if (a > 1) go(); }}\n  noTitle\n/>`, `<IconButton label={a > b ? "x>y" : 'it\\'s'} onClick={() => { if (a > 1) go(); }}\n  hideTitle\n/>`);
one('the same word in a value or in another component is left', '<IconButton label="noTitle" /><IconButtonGroup noTitle /><Button noTitle />', '<IconButton label="noTitle" /><IconButtonGroup noTitle /><Button noTitle />');
one('Table captionHidden → hideCaption', '<Table caption="Orders" captionHidden>', '<Table caption="Orders" hideCaption>');
one('15.0.0 renames: Tooltip delay, Switch pending, Field layout, Splitter direction, Fab and Toaster position (and 18.0.0 top for top-center), OfflineBanner onChange', '<Tooltip delay={300} /><Switch pending /><Field layout="horizontal" /><Splitter direction="vertical" /><Fab position="top-start" /><Toaster position="top-center" /><OfflineBanner onChange={f} />', '<Tooltip openDelay={300} /><Switch loading /><Field orientation="horizontal" /><Splitter orientation="vertical" /><Fab placement="top-start" /><Toaster placement="top" /><OfflineBanner onOnlineChange={f} />');
one('15.0.0 renames: Drawer and NotificationCenter side, Table, DataGrid and List busy, Button and Badge loadingText', '<Drawer side="end" /><NotificationCenter side="start" /><Table busy /><DataGrid busy={x} /><List busy /><Button loadingText="Saving" /><Badge loadingText="Syncing" />', '<Drawer placement="end" /><NotificationCenter placement="start" /><Table loading /><DataGrid loading={x} /><List loading /><Button loadingLabel="Saving" /><Badge loadingLabel="Syncing" />');
one('15.0.0: variant="default" is "plain" on Checkbox, CheckboxGroup, Radio and RadioGroup, in quotes or braces', '<Checkbox variant="default" /><CheckboxGroup variant={\'default\'} /><Radio variant = "default" /><RadioGroup variant="card" />', '<Checkbox variant="plain" /><CheckboxGroup variant={\'plain\'} /><Radio variant = "plain" /><RadioGroup variant="card" />');
one('a rename leaves a tag that already has the new name (a wrapper passing both through)', '<Drawer placement={p.placement} side={p.side} />', '<Drawer placement={p.placement} side={p.side} />');
one('15.0.0: component tokens put the state last, in CSS and in a style object', '.x { --button-disabled-bg: red; color: var(--stepper-active-text); --button-disabled-bg-extra: 1; }', '.x { --button-bg-disabled: red; color: var(--stepper-text-active); --button-disabled-bg-extra: 1; }', 'a.css');
one('15.0.0: a file that already names the new token keeps the old one beside it (a fallback chain)', 'a { background: var(--button-bg-disabled, var(--button-disabled-bg, gray)); }', 'a { background: var(--button-bg-disabled, var(--button-disabled-bg, gray)); }', 'a.css');
one('15.0.0: border-raised is border, as a variable, a token reference and a utility class; a longer name is left', '.x { border-color: var(--border-raised); --my-border-raised: 1; } <div className="bg-border-raised hover:border-x-border-raised" /> {"$value": "{color.border-raised}"}', '.x { border-color: var(--border); --my-border-raised: 1; } <div className="bg-border hover:border-x-border" /> {"$value": "{color.border}"}');
one('15.0.0: a migration note naming `--border-raised` in its own code span keeps it', 'Rename `--border-raised` and `bg-border-raised` to `--border`.', 'Rename `--border-raised` and `bg-border-raised` to `--border`.');
{
  const r = fix('<Button icon="settings" aria-label="Settings" />\n<Button leftIcon="add">Add</Button>\n<IconButton icon="x" label="Close" />');
  t('15.0.0: an icon-only Button is listed to make an IconButton, and nothing else is', r.text.includes('<Button icon=') && r.notes.filter((n) => n.id === 'button-icon').map((n) => n.line).join() === '1', JSON.stringify(r.notes));
}
// Every token deprecated for 15.0.0 has its rename, to the name its $deprecated note gives, and 14.x reads the old
// name as the new one's fallback, so the rename changes nothing on 14.x.
{
  const due = [];
  const comps = fs.readdirSync(path.join(PROJECT, 'src', 'components'));
  for (const c of comps) {
    for (const f of fs.readdirSync(path.join(PROJECT, 'src', 'components', c)).filter((x) => x.endsWith('.tokens.json'))) {
      const walk = (o) => { for (const v of Object.values(o)) if (v && typeof v === 'object') { if (typeof v.$deprecated === 'string' && /removed in 15\.0\.0/.test(v.$deprecated)) due.push(/Use (--[\w-]+)/.exec(v.$deprecated)?.[1]); else walk(v); } };
      walk(JSON.parse(fs.readFileSync(path.join(PROJECT, 'src', 'components', c, f), 'utf8')));
    }
  }
  const to = new Set(Object.values(TOKENS_15));
  const css = comps.map((c) => path.join(PROJECT, 'src', 'components', c, `${c}.css`)).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  if (due.length) {
    t(`serupa-migrate renames each of the ${due.length} tokens deprecated for 15.0.0`, due.length === Object.keys(TOKENS_15).length && due.every((n) => to.has(n)), `missing: ${due.filter((n) => !to.has(n)).join(', ')}`);
    const unread = Object.entries(TOKENS_15).filter(([a, b]) => !css.includes(`var(${b}, var(${a},`));
    t('each old token name is its new one\'s fallback in the component CSS', !unread.length, unread.map(([a, b]) => `${a} to ${b}`).join(', '));
  } else {
    // 15.0.0 removed them: the component CSS reads only the new names.
    const left = Object.keys(TOKENS_15).filter((a) => new RegExp(`${a}(?![\\w-])`).test(css));
    t(`the ${Object.keys(TOKENS_15).length} old token names serupa-migrate renames are gone from the component CSS (15.0.0)`, Object.keys(TOKENS_15).length === 20 && !left.length, left.join(', '));
  }
}
// 16.0.0: the tactile look is removed. A removed motion role read through var() takes what it always was in the flat
// brands; what can't be rewritten (a depth token, a declaration of one, data-depth) is listed, one note a line.
one('16.0.0: motion-toggle, ease-toggle and motion-draw read through var() take the tokens they were', '.x { transition: translate var(--motion-toggle) var( --ease-toggle); animation-duration: var(--motion-draw, 0s); --motion-toggle-mine: 1; }', '.x { transition: translate var(--motion-press) var( --ease-move); animation-duration: var(--duration-0, 0s); --motion-toggle-mine: 1; }', 'a.css');
one('16.0.0: the ease-toggle class and token reference are ease-move; the name in its own code span is left', '<div className="hover:ease-toggle ease-toggles" /> {"$value": "{transitions.ease-toggle}"} `ease-toggle`', '<div className="hover:ease-move ease-toggles" /> {"$value": "{transitions.ease-move}"} `ease-toggle`');
{
  const r = fix('.a { --button-depth: none; }\n.b { box-shadow: var(--depth-card), var(--shadow-sm); }\n<div data-depth="tactile" style={{ "--toc-depth": 1 }} />\n.c { --motion-draw: 0s; --card-depth-hovered: 0; }', 'a.css');
  t('16.0.0: a depth token, a declaration of a removed role and data-depth are each listed, and look-alikes are left', r.notes.filter((n) => n.id === 'theme-looks-removed').map((n) => n.line).join() === '1,2,4,3', JSON.stringify(r.notes));
}
{
  // None of the removed names is a token any more, in tokens.json or in a component's tokens, and no component CSS reads one.
  const tokens = JSON.parse(fs.readFileSync(path.join(PROJECT, 'tokens.json'), 'utf8'));
  const global = new Set(Object.values(tokens).flatMap((g) => (g && Array.isArray(g.tokens) ? g.tokens.map((x) => `--${x.name}`) : [])));
  const comps = fs.readdirSync(path.join(PROJECT, 'src', 'components'));
  const read = (c, f) => { const p = path.join(PROJECT, 'src', 'components', c, f); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; };
  const own = comps.map((c) => fs.readdirSync(path.join(PROJECT, 'src', 'components', c)).filter((x) => x.endsWith('.tokens.json')).map((f) => read(c, f)).join('\n')).join('\n');
  const css = comps.map((c) => read(c, `${c}.css`)).join('\n');
  const all = [...DEPTH_TOKENS_16, ...COMPONENT_TOKENS_REMOVED_16, ...Object.keys(MOTION_TOKENS_16)];
  const left = all.filter((n) => global.has(n) || own.includes(`"${n}"`) || new RegExp(`${n}(?![\\w-])`).test(css));
  t(`the ${all.length} tokens removed with the tactile look are gone from the tokens and the component CSS (16.0.0)`, all.length === 62 && !left.length, left.join(', '));
  t('each removed motion role\'s replacement is a token', Object.values(MOTION_TOKENS_16).every((n) => global.has(n)), '');
  t('no theme says it is tactile, and tokens.css has no depth axis', !tokens.color.themes.some((x) => 'depth' in x) && !/data-depth|--depth-/.test(fs.readFileSync(path.join(PROJECT, 'tokens.css'), 'utf8')), '');
}
// 16.0.0: every accent color has a theme. The brand called emerald drew in teal; it draws in emerald now, and teal is
// a brand of its own. Both exist, so each place that names emerald is listed and nothing is rewritten.
{
  const src = `<html data-brand="emerald" data-theme='emerald-dark'>\n<div {...{ 'data-brand': 'emerald' }} />\n[data-brand="emerald"] { color: var(--emerald-600) }\nthemes: ['emerald-light']\nSerupa.theme.set({ brand: 'emerald' });\nnpm create serupa my-app --brand emerald\n<Badge color="emerald" /> data-brand="emeralds" emerald-lights var(--emerald-50)`;
  const r = fix(src, 'a.tsx');
  t('16.0.0: each place that names the emerald brand or its themes is listed, and nothing is rewritten; a palette step and a Badge color are left', r.text === src && r.notes.filter((n) => n.id === 'emerald-is-emerald').map((n) => n.line).join() === '1,1,2,3,4,5,6', JSON.stringify(r.notes.map((n) => [n.id, n.line])));
  const themes = JSON.parse(fs.readFileSync(path.join(PROJECT, 'tokens.json'), 'utf8')).color.themes.map((x) => x.id);
  // tokens.css has blue; every other brand is in brands/ (17.0.0).
  const css = ['tokens.css', 'brands/all.css'].map((f) => fs.readFileSync(path.join(PROJECT, f), 'utf8')).join('\n');
  t('teal and emerald are both themes, each in its own ramp', 'teal-light teal-dark emerald-light emerald-dark'.split(' ').every((id) => themes.includes(id)) && /\[data-theme="teal-light"\][^}]*--primary: var\(--teal-700\)/.test(css) && /\[data-theme="emerald-light"\][^}]*--primary: var\(--emerald-700\)/.test(css), '');
}
// 16.0.0: the easing tokens are the roles. Each raw curve becomes the role with its curve, or the one that does its
// job (listed, since the curve changes); a bare ease-in-out is the CSS keyword in a style file and prose elsewhere.
{
  const css = fix('.a { transition: opacity var(--motion-enter-sm) var(--ease-out-quart), color 1s ease-in-out; }\n.b { animation-timing-function: var(--ease-in); --x: var(--ease-elastic); }\n/* `--ease-out` was here */', 'a.css');
  t('16.0.0: the raw easing variables become their roles; the CSS keyword and a code span about the change are left', css.text === '.a { transition: opacity var(--motion-enter-sm) var(--ease-enter), color 1s ease-in-out; }\n.b { animation-timing-function: var(--ease-exit); --x: var(--ease-celebrate); }\n/* `--ease-out` was here */' && css.notes.filter((n) => n.id === 'easing-roles').map((n) => n.line).join() === '2', JSON.stringify(css));
  const tsx = fix('<div className="transition ease-in-out hover:ease-out-back" />\n<p>It eases in and out: ease-in-out.</p>\nconst t = { $value: "{transitions.ease-spring-soft}" };', 'a.tsx');
  t('16.0.0: the easing utility classes and token references become their roles; a word of prose is left', tsx.text === '<div className="transition ease-move hover:ease-pop" />\n<p>It eases in and out: ease-in-out.</p>\nconst t = { $value: "{transitions.ease-spring}" };' && tsx.notes.filter((n) => n.id === 'easing-roles').map((n) => n.line).join() === '3', JSON.stringify(tsx));
  const tokens = JSON.parse(fs.readFileSync(path.join(PROJECT, 'tokens.json'), 'utf8')).transitions.tokens;
  const names = new Set(tokens.map((x) => x.name));
  const removed = [...Object.keys(EASINGS_16), ...Object.keys(EASINGS_NEAREST_16)];
  t(`the ${removed.length} raw easing curves are gone from the tokens, and each one's role is a token`, removed.length === 16 && removed.every((n) => !names.has(n)) && [...Object.values(EASINGS_16), ...Object.values(EASINGS_NEAREST_16)].every((n) => names.has(n)), removed.filter((n) => names.has(n)).join(', '));
  const value = (n) => tokens.find((x) => x.name === n)?.value;
  const was = { 'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)', 'ease-in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)', 'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)', 'ease-out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)', 'ease-out-back': 'cubic-bezier(0.34, 1.36, 0.64, 1)' };
  t('each role keeps the curve of the raw easing it replaces', Object.entries(was).every(([raw, curve]) => value(EASINGS_16[raw]) === curve), JSON.stringify(Object.fromEntries(Object.keys(was).map((r) => [EASINGS_16[r], value(EASINGS_16[r])]))));
}
// The package's new name, made only by a serupa-migrate that ships under it.
{
  const [r] = packageNameChange('@diki-stwn/serupa-ds');
  const src = "import { Button } from 'serupa-ds';\nimport 'serupa-ds/tokens.css';\nconst x = await import(\"serupa-ds/icons\");\n@import 'serupa-ds/bundle.css';\n<script src=\"https://cdn.jsdelivr.net/npm/serupa-ds@15/dist/serupa.iife.js\"></script>\nimport y from 'serupa-ds-extra';\nimport z from '@other/serupa-ds';\n// serupa-ds is great";
  const want = "import { Button } from '@diki-stwn/serupa-ds';\nimport '@diki-stwn/serupa-ds/tokens.css';\nconst x = await import(\"@diki-stwn/serupa-ds/icons\");\n@import '@diki-stwn/serupa-ds/bundle.css';\n<script src=\"https://cdn.jsdelivr.net/npm/@diki-stwn/serupa-ds@15/dist/serupa.iife.js\"></script>\nimport y from 'serupa-ds-extra';\nimport z from '@other/serupa-ds';\n// serupa-ds is great";
  const got = r?.run(src).text;
  t('15.0.0: the package name changes in imports, CSS imports and CDN paths, and nowhere else', got === want, got);
  t('…and not while the package is still called serupa-ds', packageNameChange('serupa-ds').length === 0 && packageNameChange().length === (JSON.parse(read('package.json')).name === 'serupa-ds' ? 0 : 1));
}
one('15.0.0 renames leave look-alikes: ButtonGroup, ListItem, Combobox loadingText, a Button variant="default"', '<ButtonGroup loadingText="x" /><ListItem busy /><Combobox loadingText="Searching" /><Button variant="default" />', '<ButtonGroup loadingText="x" /><ListItem busy /><Combobox loadingText="Searching" /><Button variant="default" />');
one('15.0.0 renames leave the same words elsewhere: a style\'s position, an Input\'s onChange, a spread', '<div style={{ position: "relative" }} /><Input onChange={f} /><Toaster {...{ position: "top-center" }} />', '<div style={{ position: "relative" }} /><Input onChange={f} /><Toaster {...{ position: "top-center" }} />');
one('RadioGroup onChange → onValueChange; a Radio\'s own onChange stays', '<RadioGroup onChange={set}><Radio onChange={f} /></RadioGroup>', '<RadioGroup onValueChange={set}><Radio onChange={f} /></RadioGroup>');
one('Badge size goes, with its value and its line', '<Badge size="sm">A</Badge><Badge tone="x" size={big ? "lg" : \'sm\'}>B</Badge><Badge\n  size="md"\n  tone="x"\n>C</Badge>', '<Badge>A</Badge><Badge tone="x">B</Badge><Badge\n  tone="x"\n>C</Badge>');
one('CommonIconName → IconName, without importing it twice', "import { type CommonIconName, IconName } from 'serupa-ds';\nlet a: CommonIconName;", "import { type IconName, IconName } from 'serupa-ds';\nlet a: IconName;");
one('CommonIconName next to IconName in one import is one name', "import type { CommonIconName, IconName } from 'serupa-ds';", "import type { IconName } from 'serupa-ds';");
one('bundle.js → serupa.iife.js in a page; bundle.css stays', '<script src="node_modules/serupa-ds/dist/bundle.js"></script><link href="node_modules/serupa-ds/dist/bundle.css">', '<script src="node_modules/serupa-ds/dist/serupa.iife.js"></script><link href="node_modules/serupa-ds/dist/bundle.css">', 'index.html');
one('a file type it doesn\'t read is left', 'serupa-ds/bundle.js', 'serupa-ds/bundle.js', 'notes.txt');
const left = fix('const props = { noTitle: true };\nexport const X = () => <IconButton {...props} />;');
t('a noTitle it can\'t rename is listed with its line', left.notes.length === 1 && left.notes[0].line === 1 && left.notes[0].id === 'icon-button-hide-title', JSON.stringify(left.notes));
const css = fix('.x { --badge-ripple-opacity: 0; }\n.dk-btn__ripples { display: none }', 'app.css');
t('a removed ripple token or class is listed, not changed', css.notes.length === 2 && css.text.includes('--badge-ripple-opacity'), JSON.stringify(css.notes));
t('--from 12 runs only the changes of 13.0.0 and later', transformsAfter('12.3.1').every((x) => Number(x.version.split('.')[0]) >= 13) && transformsAfter(12).some((x) => x.version === '13.0.0'));
// 14.0.0 has nothing to rename, but a 13.x project that uses what it moved or removed is told where (GR130).
const p14 = fix('import "serupa-ds/bundle.css";\n<SerupaProvider labels={{ moreResults: (n) => `${n} more` }}>\n  <div className="bg-linear-to-r from-blue-500 mask-b-from-50%" />', 'App.tsx', '13.0.0');
t('14.0.0: moved mask and gradient classes and the removed moreResults label are listed with their lines', p14.notes.filter((n) => n.id !== 'utilities-trimmed').length === 2 && p14.notes.some((n) => n.id === 'utilities-extra' && n.line === 3 && n.message.includes('utilities-extra.css') && n.message.includes('bg-linear-to-r')) && p14.notes.some((n) => n.id === 'combobox-more-results' && n.line === 2) && !Object.keys(p14.counts).length, JSON.stringify(p14.notes));
t('14.0.0: a file that imports utilities-extra.css, a mask-image property and words like to-do are left', !fix('import "serupa-ds/utilities-extra.css";\n<div className="mask-t-from-0" />', 'a.tsx').notes.filter((n) => n.id === 'utilities-extra').length && !fix('<div style="mask-image: url(a.svg)" class="go-to-top">Things to-do from-here</div>', 'a.html').notes.length);
t('14.0.0: a removed .dk-combobox__more rule is listed in a stylesheet', fix('.dk-combobox__more { color: red }', 'app.css').notes.some((n) => n.id === 'combobox-more-results'));
const inner = fix('.dk-btn__label { color: red }\n.dk-btn--primary, [data-component="card"] { color: blue }\n.app-dk-btn__x, .dk-card__header .dk-card__title {}', 'app.css', '15.0.0');
t('16.0.0: each line that selects an inner part\'s class is listed once, and block, modifier and data selectors are left', inner.notes.length === 2 && inner.notes.every((n) => n.id === 'inner-classes-private') && inner.notes[0].line === 1 && inner.notes[1].line === 3 && /dk-card__header/.test(inner.notes[1].message) && inner.text.startsWith('.srp-btn__label'), JSON.stringify(inner.notes));
t('16.0.0: a querySelector for an inner part in code is listed too', fix("el.querySelector('.dk-tabs__panel')", 'a.ts', '15.0.0').notes.some((n) => n.id === 'inner-classes-private'));
const prefixed = fix('@layer reset, dk, app;\n.dk-btn { color: var(--dk-x) } [data-dk-announcer] {}\n.app-dk-btn, .sdk-x { }', 'app.css', '16.0.0');
t('17.0.0: the dk prefix is srp in classes, properties, data attributes and layers, and a dk inside another name stays', prefixed.text === '@layer reset, srp, app;\n.srp-btn { color: var(--srp-x) } [data-srp-announcer] {}\n.app-dk-btn, .sdk-x { }' && prefixed.counts['prefix-srp'] === 4, JSON.stringify(prefixed));
t('17.0.0: a country code or a word dk is left', fix("const c = { value: 'dk', label: 'Denmark' };", 'a.ts', '16.0.0').text.includes("'dk'"));
const b17 = fix('import "@diki-stwn/serupa-ds/tokens.css";\n<html data-brand="violet" data-mode="dark">\n<div data-theme="blue-dark" />\nSerupa.theme.set({ brand: "pink" });', 'index.html', '16.1.0');
t('17.0.0: each brand other than blue a page names is listed once, with the file to load, and blue is left', b17.notes.length === 2 && b17.notes.every((n) => n.id === 'brands-opt-in') && b17.notes[0].line === 2 && /brands\/violet\.css/.test(b17.notes[0].message) && b17.notes[1].line === 4 && /brands\/pink\.css/.test(b17.notes[1].message), JSON.stringify(b17.notes));
t('17.0.0: a file that loads brands/all.css or the brand\'s own file is left', !fix('import "@diki-stwn/serupa-ds/brands/all.css";\n<html data-brand="violet">', 'a.tsx', '16.1.0').notes.length && !fix('<link href="brands/violet.css"><html data-theme="violet-dark">', 'a.html', '16.1.0').notes.length);
const pal17 = fix('<div className="md:bg-red-500 text-slate-700/50 bg-primary blur-sm md:rotate-45 bg-linear-to-r from-primary" style={{ color: "var(--red-500)" }} />\nconst scale = 2; // blur the transform', 'a.tsx', '16.1.0');
t('17.0.0: the removed utility classes are listed (palette steps, gradients, filters, rotate); role classes, custom properties and the same words outside a class list are left', pal17.notes.length === 1 && pal17.notes[0].id === 'utilities-trimmed' && pal17.notes[0].line === 1 && /md:bg-red-500, text-slate-700\/50, bg-linear-to-r and 3 more are/.test(pal17.notes[0].message) && !/bg-primary|--red-500/.test(pal17.notes[0].message.split(' are no longer')[0]), JSON.stringify(pal17.notes));
const thin17 = fix('<div className="border-t border-t-danger md:-scroll-mt-2 scroll-mt-16 scroll-mb-4 translate-x-2 -translate-1/2 border-x-0 border-danger" />', 'a.tsx', '16.1.0');
t('17.0.0: the thinned scales are listed (a side\'s border color, negative or block scroll margins, translate on both axes); border widths, scroll-mt and translate-x are left', thin17.notes.length === 1 && /^border-t-danger, md:-scroll-mt-2, scroll-mb-4 and 1 more are/.test(thin17.notes[0].message), JSON.stringify(thin17.notes));
t('17.0.0: a file with only role classes is left', !fix('<div className="bg-surface text-text-muted border-border translate-x-2 shadow-md" />', 'a.tsx', '16.1.0').notes.length);
const api17 = fix('import { Button, SidebarItem, Text, Checkbox } from "@diki-stwn/serupa-ds";\n<Button leftIcon={<A />} rightIcon={<B />}>Go</Button>\n<SidebarItem active href="/">Home</SidebarItem>\n<Text tone="default">Hi</Text>\n<Checkbox onCheckedChange={(c, e) => f(e)} />\n<Thing leftIcon={x} active />', 'a.tsx', '16.1.0');
t('17.0.0: leftIcon, rightIcon, active and Text tone default take their new names on the components, and other tags are left', api17.text.includes('<Button startIcon={<A />} endIcon={<B />}>') && api17.text.includes('<SidebarItem current href') && api17.text.includes('<Text tone="neutral">') && api17.text.includes('<Thing leftIcon={x} active />'), api17.text);
t('17.0.0: a handler of a callback that now passes a details object is listed', api17.notes.some((n) => n.id === 'callback-details' && n.line === 5), JSON.stringify(api17.notes));
const n17b = fix('<Accordion type="multiple" />\n<ToggleGroup type="single" />\n<BottomNav label="Main" />\n<Carousel label="Photos" />\n<Switch labelPosition="start" />\n<MentionInput trigger="#" />\n<TableSelectCell header label="All" />\n<ListLoadingItems description />\n<Drawer placement="left" />\n<Drawer placement="right" />\n<button type="submit" />\n<Field label="Name" />', 'a.tsx', '16.1.0');
t('17.0.0: round two of the shared names is renamed on the tags, and the same props on other tags are left', n17b.text === '<Accordion selectionMode="multiple" />\n<ToggleGroup selectionMode="single" />\n<BottomNav aria-label="Main" />\n<Carousel aria-label="Photos" />\n<Switch labelPlacement="start" />\n<MentionInput triggerChar="#" />\n<TableSelectCell inHeader label="All" />\n<ListLoadingItems showDescription />\n<Drawer placement="start" />\n<Drawer placement="end" />\n<button type="submit" />\n<Field label="Name" />', n17b.text);
const r17 = fix('import type { TimelineStatus } from "@diki-stwn/serupa-ds";\n<TimelineItem status="warning" title="Late" />\n<Combobox onInputChange={f} />\n<PasswordInput visible={v} defaultVisible onVisibleChange={setV} />', 'a.tsx', '16.1.0');
t('17.0.0: the removed TimelineItem status, Combobox onInputChange and PasswordInput visible names are renamed', r17.text === 'import type { TimelineTone } from "@diki-stwn/serupa-ds";\n<TimelineItem tone="warning" title="Late" />\n<Combobox onInputValueChange={f} />\n<PasswordInput revealed={v} defaultRevealed onRevealedChange={setV} />', r17.text);
const a17 = fix('<Accordion>\n<Accordion type="multiple" defaultValue={["a"]}>\n<Accordion\n  headingLevel={2}\n>\n<Accordion {...props}>', 'a.tsx', '16.1.0');
t('17.0.0: an Accordion with no type gets selectionMode="single", one with a type keeps it as selectionMode, and one with spread props is noted', a17.text === '<Accordion selectionMode="single">\n<Accordion selectionMode="multiple" defaultValue={["a"]}>\n<Accordion selectionMode="single"\n  headingLevel={2}\n>\n<Accordion {...props}>'
  && a17.notes.length === 1 && a17.notes[0].line === 6, JSON.stringify(a17));
const n17 = fix('<Accordion>\n<Accordion selectionMode="single">', 'a.tsx');
t('17.0.0: with no --from (the code may be 17.0.0\'s already), an Accordion with no type is listed, not changed', n17.text === '<Accordion>\n<Accordion selectionMode="single">' && n17.notes.length === 1 && n17.notes[0].line === 1, JSON.stringify(n17));
// 18.0.0: the names 17.x deprecated are removed.
one('18.0.0: onMedia is surface on Button, Link, Divider and Fab', '<Button onMedia="dark">Go</Button><Link onMedia="light" href="#" /><Divider onMedia="dark" /><Fab onMedia="dark" />', '<Button surface="dark">Go</Button><Link surface="light" href="#" /><Divider surface="dark" /><Fab surface="dark" />');
one('18.0.0: empty is emptyText on TagGroup and NotificationCenter', '<TagGroup items={[]} empty="None" /><NotificationCenter empty="Zero" />', '<TagGroup items={[]} emptyText="None" /><NotificationCenter emptyText="Zero" />');
one('18.0.0: Toaster top-center and bottom-center are top and bottom', '<Toaster placement="top-center" /><Toaster placement="bottom-center" />', '<Toaster placement="top" /><Toaster placement="bottom" />');
one('18.0.0: ToasterPosition and FabPosition are ToasterPlacement and FabPlacement', 'let a: ToasterPosition; let b: FabPosition;', 'let a: ToasterPlacement; let b: FabPlacement;');
// 18.0.0: brand text is primary-text.
const p18 = fix('.a { color: var(--primary); background: var(--primary); border-color: var(--primary); }\n.a:hover { color: var(--primary-hover); accent-color: var(--primary); }\n.b { color: var(--my-link, var(--primary)); }\n.text-primary { color: var(--primary); }', 'a.css', '17.1.0');
t('18.0.0: a text color set from --primary or --primary-hover takes --primary-text; a fill, a border, accent-color, a fallback in another var() and a class named for the token are left', p18.text === '.a { color: var(--primary-text); background: var(--primary); border-color: var(--primary); }\n.a:hover { color: var(--primary-text-hover); accent-color: var(--primary); }\n.b { color: var(--my-link, var(--primary)); }\n.text-primary { color: var(--primary); }' && p18.counts['primary-text'] === 2, JSON.stringify(p18));
one('18.0.0: the text-primary classes are text-primary-text, with their variants; bg-primary, text-primary-text and the name in a code span are left', '<a className="text-primary hover:text-primary-hover bg-primary text-primary-text" /> `text-primary`', '<a className="text-primary-text hover:text-primary-text-hover bg-primary text-primary-text" /> `text-primary`');
const b18 = fix('[data-theme="acme-dark"] {\n  --primary: var(--acme-400);\n  --on-primary: var(--acme-950);\n}', 'acme.css', '17.1.0');
t('18.0.0: a theme that sets --primary and not --primary-text is listed once, to make again; one that sets both is left', b18.notes.length === 1 && b18.notes[0].id === 'primary-text' && b18.notes[0].line === 2 && /serupa-brand/.test(b18.notes[0].message) && !fix(':root { --primary: #123456; --primary-text: #123456; }', 'acme.css', '17.1.0').notes.length, JSON.stringify(b18.notes));
const fa17 = fix('<span className="text-field-action">Apply</span>\n.apply { color: var(--field-action); }', 'a.tsx', '17.1.0');
t('19.0.0: field-action is primary-text, in a class and a token', fa17.text === '<span className="text-primary-text">Apply</span>\n.apply { color: var(--primary-text); }', JSON.stringify(fa17));
const tr17 = fix('<div className="rounded p-2" style={{ borderRadius: "var(--rounded)", transition: "opacity var(--motion-ripple-fade)" }}><Image rounded={false} /></div>\n.x { color: var(--stone-500); }', 'a.tsx', '17.1.0');
t('19.0.0: --rounded and the rounded class are rounded-sm, the ripple tokens their durations, a stone shade is listed', tr17.text === '<div className="rounded-sm p-2" style={{ borderRadius: "var(--rounded-sm)", transition: "opacity var(--duration-300)" }}><Image rounded={false} /></div>\n.x { color: var(--stone-500); }' && tr17.notes.some((n) => /stone ramps/.test(n.message)), JSON.stringify(tr17));
// 19.0.0: VirtualList is a List with ListVirtualItems inside.
const vl = fix("import { VirtualList, ListItem } from '@diki-stwn/serupa-ds';\n<VirtualList variant=\"card\" aria-label=\"Members\" count={people.length}\n  itemKey={(i) => people[i].id} renderItem={(i) => <ListItem title={people[i].name} />} />\n.panel { --virtual-list-height: 20rem; }", 'a.tsx', '18.2.0');
t('19.0.0: a VirtualList is a List of its own props with ListVirtualItems of the rows\' inside, the import names both, and --virtual-list-height is --list-virtual-height', vl.text === "import { List, ListVirtualItems, ListItem } from '@diki-stwn/serupa-ds';\n<List variant=\"card\" aria-label=\"Members\"><ListVirtualItems count={people.length} itemKey={(i) => people[i].id} renderItem={(i) => <ListItem title={people[i].name} />} /></List>\n.panel { --list-virtual-height: 20rem; }" && !vl.notes.length, JSON.stringify(vl));
const vs = fix("import { VirtualList } from '@diki-stwn/serupa-ds';\n<VirtualList {...props} />\nconst p: VirtualListProps = x;", 'a.tsx', '18.2.0');
t('19.0.0: a VirtualList with spread props, VirtualListProps and the import left for them are listed once each', vs.text.startsWith('import { VirtualList }') && vs.notes.map((n) => n.line).sort().join() === '1,2,3', JSON.stringify(vs));
// 19.0.0: Loader is a ring, dots or text.
one('19.0.0: a skeleton Loader is a Skeleton (its primary tone gone), spokes and pixel are the ring without pattern or glow, dots stay, and the import takes Skeleton', "import { Loader } from '@diki-stwn/serupa-ds';\n<Loader variant=\"skeleton\" shape=\"circle\" tone=\"primary\" label=\"\" />\n<Loader variant={'pixel'} pattern=\"random\" glow tone=\"primary\" />\n<Loader variant=\"spokes\" />\n<Loader variant=\"dots\" />\nlet s: LoaderShape;", "import { Loader, Skeleton } from '@diki-stwn/serupa-ds';\n<Skeleton shape=\"circle\" label=\"\" />\n<Loader tone=\"primary\" />\n<Loader />\n<Loader variant=\"dots\" />\nlet s: SkeletonShape;");
one('19.0.0: a file whose only Loader was a skeleton imports Skeleton in its place', "import { Loader } from '@diki-stwn/serupa-ds';\n<Loader variant=\"skeleton\" lines={3} />", "import { Skeleton } from '@diki-stwn/serupa-ds';\n<Skeleton lines={3} />");
const lt = fix('.a { --loader-skeleton-fill: var(--opacity-20); --loader-pixel-dim: 0.1; }', 'a.css', '18.2.0');
t('19.0.0: --loader-skeleton-* is --skeleton-*, and a pixel token is listed', lt.text === '.a { --skeleton-fill: var(--opacity-20); --loader-pixel-dim: 0.1; }' && lt.notes.length === 1 && /pixel and spokes/.test(lt.notes[0].message), JSON.stringify(lt));
const twice = fix(fix('<IconButton noTitle /><Table captionHidden />').text);
t('running it twice changes nothing more', !Object.keys(twice.counts).length);

// The command.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-migrate-'));
const cli = (...args) => spawnSync(process.execPath, [path.join(PROJECT, 'bin', 'serupa-migrate.mjs'), ...args], { cwd: tmp, encoding: 'utf8' });
try {
  for (const [label, args, word] of [
    ['no sources', [], 'no source files or folders given'],
    ['--from with no version', ['src', '--from'], '--from needs a version'],
    ['--from that isn\'t a version', ['src', '--from', 'latest'], '--from takes a version'],
    ['an unknown option', ['src', '--force'], 'unknown option --force'],
    ['a source that isn\'t there', ['missing'], 'no such file or folder: missing'],
  ]) {
    const r = cli(...args);
    t(`stops on ${label}, saying so`, r.status === 2 && String(r.stderr).includes(String(word)) && String(r.stderr).includes('usage:') && !/\n\s+at /.test(String(r.stderr)), `exit ${r.status}: ${String(r.stderr).slice(0, 200)}`);
  }
  fs.mkdirSync(path.join(tmp, 'src', 'node_modules'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'src', 'App.tsx'), '<IconButton noTitle />');
  fs.writeFileSync(path.join(tmp, 'src', 'node_modules', 'x.tsx'), '<IconButton noTitle />');
  const dry = cli('src');
  t('without --write it says what it would change and changes nothing', dry.status === 0 && /would change src\/App\.tsx: icon-button-hide-title ×1/.test(dry.stdout) && fs.readFileSync(path.join(tmp, 'src', 'App.tsx'), 'utf8') === '<IconButton noTitle />', dry.stdout + dry.stderr);
  const wet = cli('src', '--from', '12', '--write');
  t('--write changes the file and leaves node_modules alone', wet.status === 0 && fs.readFileSync(path.join(tmp, 'src', 'App.tsx'), 'utf8') === '<IconButton hideTitle />' && fs.readFileSync(path.join(tmp, 'src', 'node_modules', 'x.tsx'), 'utf8').includes('noTitle'), wet.stdout + wet.stderr);
  fs.writeFileSync(path.join(tmp, 'src', 'Old.tsx'), '<SerupaProvider labels={{ moreResults: f }}>\n<p className="bg-linear-to-r from-blue-500" />');
  const on13 = cli('src', '--from', '13.0.0');
  t('a 13.x project is told what to check by hand and where the rest is, not just "Nothing to change."', on13.status === 0 && on13.stdout.includes('To check by hand (3)') && /src\/Old\.tsx:2: .*utilities-extra/.test(on13.stdout) && /src\/Old\.tsx:1: .*moreResults/.test(on13.stdout) && /Upgrading page/.test(on13.stdout) && on13.stdout.includes('since 13.x'), on13.stdout);
  const list13 = cli('--list', '--from', '13.0.0');
  t('--list --from 13.0.0 prints the 14.0.0 changes', list13.status === 0 && list13.stdout.includes('utilities-extra') && list13.stdout.includes('combobox-more-results'), list13.stdout);
  const list = cli('--list');
  t('--list prints every change with its version', list.status === 0 && TRANSFORMS.every((x) => list.stdout.includes(x.id)), list.stdout);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
// docs/generated/ is build output that quotes the changesets word for word, front matter and all, so it is left out.
const docs = fs.readdirSync(path.join(PROJECT, 'docs')).filter((f) => f !== 'generated').map((f) => path.join('docs', f));
const own = spawnSync(process.execPath, [path.join(PROJECT, 'bin', 'serupa-migrate.mjs'), 'src', ...docs, 'skills', '.storybook'], { cwd: PROJECT, encoding: 'utf8' });
t('this repository\'s code and docs use only the current names', own.status === 0 && own.stdout.trim().startsWith('Nothing to change.'), own.stdout.slice(0, 600));

done(report('Upgrades', R));
