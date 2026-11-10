// Changesets the release can read: tools/changesets.mjs, which both the pull request check (changeset-check.mjs) and
// the release (version.mjs) use, reads each kind of changeset right, and every pending .changeset/*.md parses, so a
// changeset that names the package wrong or lost its front matter fails here rather than on main in the release.
//   node tools/test/changesets.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { PROJECT, read, report, done } from './lib.mjs';
import { entriesOf, parseChangeset } from '../changesets.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const name = 'serupa-ds';
const cases = [
  ['double quotes', '---\n"serupa-ds": minor\n---\n\n- Added: x.\n', 'minor'],
  ['single quotes', "---\n'serupa-ds': major\n---\n\n- Changed: x.\n", 'major'],
  ['no quotes', '---\nserupa-ds: patch\n---\n\n- Fixed: x.\n', 'patch'],
  ['Windows line ends', '---\r\n"serupa-ds": minor\r\n---\r\n\r\n- Added: x.\r\n', 'minor'],
];
for (const [label, text, want] of cases) {
  const got = parseChangeset(text, name);
  t(`reads a ${want} bump (${label})`, got.bump === want && got.body.includes('x.'), JSON.stringify(got));
}
const bad = [
  ['no front matter', '- Fixed: x.\n', 'front matter'],
  ['another package', '---\n"serupa": minor\n---\n\n- Added: x.\n', 'no bump'],
  ['a longer name that starts the same', '---\n"serupa-ds-extra": minor\n---\n\n- Added: x.\n', 'no bump'],
  ['an unknown bump', '---\n"serupa-ds": huge\n---\n\n- Added: x.\n', 'no bump'],
];
for (const [label, text, word] of bad) {
  const got = parseChangeset(text, name);
  t(`refuses a changeset with ${label}`, got.error?.includes(word), JSON.stringify(got));
}
// The name is matched as text: a dot in a future scoped name doesn't stand for any character.
t('matches a scoped name literally', parseChangeset('---\n"@diki/serupa.ds": minor\n---\n', '@diki/serupa.ds').bump === 'minor'
  && !!parseChangeset('---\n"@diki/serupaXds": minor\n---\n', '@diki/serupa.ds').error, 'escape the name');

const dir = path.join(PROJECT, '.changeset');
const pkg = JSON.parse(read('package.json')).name;
const pending = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md') : [];
const unreadable = pending.map((f) => [f, parseChangeset(fs.readFileSync(path.join(dir, f), 'utf8'), pkg).error]).filter(([, e]) => e);
t(`every pending changeset has a bump for ${pkg} (${pending.length})`, !unreadable.length, unreadable.map(([f, e]) => `.changeset/${f}: ${e}`).join('; '));

// GR195: a lead sentence with bullets stays one entry, the bullets nested; bullets alone are one entry each.
t('a lead sentence keeps its bullets nested under it', JSON.stringify(entriesOf('Four mistakes warn.\n\n- Select: a.\n- NumberInput: b.\n')) === JSON.stringify(['Four mistakes warn.\n  - Select: a.\n  - NumberInput: b.']), JSON.stringify(entriesOf('Four mistakes warn.\n\n- Select: a.\n- NumberInput: b.\n')));
t('bullets alone are one entry each, and plain text is one', JSON.stringify(entriesOf('- Fixed: a.\n- Added: b.')) === JSON.stringify(['Fixed: a.', 'Added: b.']) && JSON.stringify(entriesOf('One\nline.')) === JSON.stringify(['One line.']));

// changeset-check.mjs: which changes need a changeset. Each case is a commit on a scratch repository holding a copy of
// the check, compared with the commit before it.
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-changeset-check-'));
  const git = (...a) => execFileSync('git', ['-C', dir, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
  const put = (f, text) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), text); };
  for (const f of ['tools/changeset-check.mjs', 'tools/changesets.mjs']) put(f, read(f));
  const pkg = { name, version: '1.0.0', scripts: { test: 'a' }, devDependencies: { vitest: '1.0.0' }, dependencies: {} };
  put('package.json', JSON.stringify(pkg));
  git('init', '-q'); git('add', '-A'); git('commit', '-qm', 'base');
  const needs = (label, change) => {
    const base = git('rev-parse', 'HEAD').trim();
    change(); git('add', '-A'); git('commit', '-qm', label);
    const r = spawnSync(process.execPath, [path.join(dir, 'tools/changeset-check.mjs'), base], { cwd: dir, encoding: 'utf8' });
    return r.status !== 0;
  };
  t('a devDependency or script update needs no changeset', !needs('dev', () => put('package.json', JSON.stringify({ ...pkg, scripts: { test: 'b' }, devDependencies: { vitest: '2.0.0' } }))));
  t('a new dependency needs one (package.json reaches every project)', needs('dep', () => put('package.json', JSON.stringify({ ...pkg, dependencies: { x: '1.0.0' } }))));
  t('a change to tools/tokens/ needs one (the build writes it into tokens.css and debug.js)', needs('tokens', () => put('tools/tokens/contrast-pairs.mjs', 'export const PAIRS = [];')));
  t('a change to tools/lint/a11y-components.mjs needs one (the build writes it into eslint.js)', needs('lint', () => put('tools/lint/a11y-components.mjs', 'export const a = 1;')));
  t('a change to another lint rule needs none', !needs('rule', () => put('tools/lint/no-literal-words.mjs', 'export const b = 1;')));
  fs.rmSync(dir, { recursive: true, force: true });
}

done(report('Changesets', R));
