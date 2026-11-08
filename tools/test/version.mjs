// The release's changelog step (tools/version.mjs) on a scratch copy: each changeset's lines go under [Unreleased]
// in their sections, with the notes already there kept, the changesets deleted and tools/release.mjs called with the
// biggest bump; a hand-written note it has nowhere to put stops it instead of vanishing (T8). No network: npm and
// release.mjs are stand-ins here.
//   node tools/test/version.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

function scratch(changelog, changesets) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-version-'));
  fs.mkdirSync(path.join(dir, 'tools'));
  fs.mkdirSync(path.join(dir, '.changeset'));
  fs.mkdirSync(path.join(dir, 'bin'));
  for (const f of ['version.mjs', 'changesets.mjs']) fs.copyFileSync(path.join(PROJECT, 'tools', f), path.join(dir, 'tools', f));
  fs.writeFileSync(path.join(dir, 'tools', 'release.mjs'), "import fs from 'node:fs';\nfs.writeFileSync(new URL('../released.txt', import.meta.url), process.argv[2]);\n");
  fs.writeFileSync(path.join(dir, 'bin', 'npm'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'serupa-ds', version: '1.0.0' }));
  fs.writeFileSync(path.join(dir, 'CHANGELOG.md'), changelog);
  fs.writeFileSync(path.join(dir, '.changeset', 'README.md'), 'not a changeset\n');
  for (const [f, text] of Object.entries(changesets)) fs.writeFileSync(path.join(dir, '.changeset', f), text);
  const run = spawnSync(process.execPath, [path.join(dir, 'tools', 'version.mjs')], { cwd: dir, encoding: 'utf8', env: { ...process.env, PATH: `${path.join(dir, 'bin')}${path.delimiter}${process.env.PATH}` } });
  const read = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : null);
  const out = { status: run.status, stderr: run.stderr, log: read('CHANGELOG.md'), released: read('released.txt'), left: fs.readdirSync(path.join(dir, '.changeset')) };
  fs.rmSync(dir, { recursive: true, force: true });
  return out;
}

const HEAD = '# Changelog\n\n## [Unreleased]\n\n';
const TAIL = '## [1.0.0] - 2026-01-01\n\n### Added\n\n- The first version.\n';
const ok = scratch(`${HEAD}### Fixed\n\n- A note written by hand,\n  over two lines.\n\n${TAIL}`, {
  'a.md': '---\n"serupa-ds": patch\n---\n\n- Fixed (Combobox): the list closes on Escape.\n',
  'b.md': '---\n"serupa-ds": minor\n---\n\n- Added: Rating.\n',
});
t('it runs', ok.status === 0, ok.stderr);
if (ok.status === 0) {
  const u = ok.log.slice(ok.log.indexOf('## [Unreleased]'), ok.log.indexOf('## [1.0.0]'));
  t('a hand-written note under [Unreleased] is kept, with its second line', u.includes('- A note written by hand,\n  over two lines.'), u);
  t('each changeset line goes in its section, a scope as "Scope: …"', u.includes('### Added\n\n- Rating.') && u.includes('- Combobox: the list closes on Escape.'), u);
  t('the sections keep their order (Added before Fixed)', u.indexOf('### Added') < u.indexOf('### Fixed'), u);
  t('the released versions below are untouched', ok.log.endsWith(TAIL));
  t('the changesets are deleted, README.md stays', JSON.stringify(ok.left) === '["README.md"]', ok.left.join(', '));
  t('release.mjs gets the biggest bump (minor over patch)', ok.released === 'minor', ok.released);
}
const CS = { 'a.md': '---\n"serupa-ds": patch\n---\n\n- Fixed: x.\n' };
const loose = scratch(`${HEAD}- A note with no section.\n\n${TAIL}`, CS);
t('a note outside any "### Section" stops it, naming the note, instead of being dropped', loose.status !== 0 && loose.stderr.includes('A note with no section') && loose.stderr.includes('outside'), loose.stderr.slice(-300));
t('and leaves CHANGELOG.md and the changesets as they were', loose.log.includes('- A note with no section.') && loose.left.includes('a.md') && loose.released === null);
const lead = scratch(`${HEAD}### Fixed\n\nA paragraph before the first note.\n- A note.\n\n${TAIL}`, CS);
t('text before a section\'s first "- " note stops it too', lead.status !== 0 && lead.stderr.includes('before its first'), lead.stderr.slice(-300));

done(report('Changelog step of the release (version.mjs)', R));
