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
import { migrate, packageNameChange, TOKENS_15, TRANSFORMS, transformsAfter } from '../../bin/serupa-migrate.mjs';
import { majorsIn, nextMajor, upcomingMajor } from '../../docs/upgrades.ts';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });

// The RFC for the next major.
const version = JSON.parse(read('package.json')).version;
const next = `${Number(version.split('.')[0]) + 1}.0.0`;
const dir = path.join(PROJECT, '.changeset');
const changesets = Object.fromEntries(fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').map((f) => [f, fs.readFileSync(path.join(dir, f), 'utf8')]));
const majors = Object.keys(changesets).filter((f) => parseChangeset(changesets[f], 'serupa-ds').bump === 'major');
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
one('15.0.0 renames: Tooltip delay, Switch pending, Field layout, Splitter direction, Fab and Toaster position, OfflineBanner onChange', '<Tooltip delay={300} /><Switch pending /><Field layout="horizontal" /><Splitter direction="vertical" /><Fab position="top-start" /><Toaster position="top-center" /><OfflineBanner onChange={f} />', '<Tooltip openDelay={300} /><Switch loading /><Field orientation="horizontal" /><Splitter orientation="vertical" /><Fab placement="top-start" /><Toaster placement="top-center" /><OfflineBanner onOnlineChange={f} />');
one('15.0.0 renames: Drawer and NotificationCenter side, Table, DataGrid and List busy, Button and Badge loadingText', '<Drawer side="end" /><NotificationCenter side="start" /><Table busy /><DataGrid busy={x} /><List busy /><Button loadingText="Saving" /><Badge loadingText="Syncing" />', '<Drawer placement="end" /><NotificationCenter placement="start" /><Table loading /><DataGrid loading={x} /><List loading /><Button loadingLabel="Saving" /><Badge loadingLabel="Syncing" />');
one('15.0.0: variant="default" is "plain" on Checkbox, CheckboxGroup, Radio and RadioGroup, in quotes or braces', '<Checkbox variant="default" /><CheckboxGroup variant={\'default\'} /><Radio variant = "default" /><RadioGroup variant="card" />', '<Checkbox variant="plain" /><CheckboxGroup variant={\'plain\'} /><Radio variant = "plain" /><RadioGroup variant="card" />');
one('a rename leaves a tag that already has the new name (a wrapper passing both through)', '<Drawer placement={p.placement} side={p.side} />', '<Drawer placement={p.placement} side={p.side} />');
one('15.0.0: component tokens put the state last, in CSS and in a style object', '.x { --button-disabled-bg: red; color: var(--stepper-active-text); --button-disabled-bg-extra: 1; }', '.x { --button-bg-disabled: red; color: var(--stepper-text-active); --button-disabled-bg-extra: 1; }', 'a.css');
one('15.0.0: a file that already names the new token keeps the old one beside it (a fallback chain)', 'a { background: var(--button-bg-disabled, var(--button-disabled-bg, gray)); }', 'a { background: var(--button-bg-disabled, var(--button-disabled-bg, gray)); }', 'a.css');
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
  t(`serupa-migrate renames each of the ${due.length} tokens deprecated for 15.0.0`, due.length === Object.keys(TOKENS_15).length && due.every((n) => to.has(n)), `missing: ${due.filter((n) => !to.has(n)).join(', ')}`);
  const css = comps.map((c) => path.join(PROJECT, 'src', 'components', c, `${c}.css`)).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const unread = Object.entries(TOKENS_15).filter(([a, b]) => !css.includes(`var(${b}, var(${a},`));
  t('each old token name is its new one\'s fallback in the component CSS', !unread.length, unread.map(([a, b]) => `${a} to ${b}`).join(', '));
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
t('14.0.0: moved mask and gradient classes and the removed moreResults label are listed with their lines', p14.notes.length === 2 && p14.notes.some((n) => n.id === 'utilities-extra' && n.line === 3 && n.message.includes('utilities-extra.css') && n.message.includes('bg-linear-to-r')) && p14.notes.some((n) => n.id === 'combobox-more-results' && n.line === 2) && !Object.keys(p14.counts).length, JSON.stringify(p14.notes));
t('14.0.0: a file that imports utilities-extra.css, a mask-image property and words like to-do are left', !fix('import "serupa-ds/utilities-extra.css";\n<div className="mask-t-from-0" />', 'a.tsx').notes.length && !fix('<div style="mask-image: url(a.svg)" class="go-to-top">Things to-do from-here</div>', 'a.html').notes.length);
t('14.0.0: a removed .dk-combobox__more rule is listed in a stylesheet', fix('.dk-combobox__more { color: red }', 'app.css').notes.some((n) => n.id === 'combobox-more-results'));
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
  t('a 13.x project is told what to check by hand and where the rest is, not just "Nothing to change."', on13.status === 0 && on13.stdout.includes('To check by hand (2)') && /src\/Old\.tsx:2: .*utilities-extra/.test(on13.stdout) && /src\/Old\.tsx:1: .*moreResults/.test(on13.stdout) && /Upgrading page/.test(on13.stdout) && on13.stdout.includes('since 13.x'), on13.stdout);
  const list13 = cli('--list', '--from', '13.0.0');
  t('--list --from 13.0.0 prints the 14.0.0 changes', list13.status === 0 && list13.stdout.includes('utilities-extra') && list13.stdout.includes('combobox-more-results'), list13.stdout);
  const list = cli('--list');
  t('--list prints every change with its version', list.status === 0 && TRANSFORMS.every((x) => list.stdout.includes(x.id)), list.stdout);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
const own = spawnSync(process.execPath, [path.join(PROJECT, 'bin', 'serupa-migrate.mjs'), 'src', 'docs', 'skills', '.storybook'], { cwd: PROJECT, encoding: 'utf8' });
t('this repository\'s code and docs use only the current names', own.status === 0 && own.stdout.trim().startsWith('Nothing to change.'), own.stdout.slice(0, 600));

done(report('Upgrades', R));
