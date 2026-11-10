// Every command line answers --help the same way and stops on an option it doesn't know (GR275): the six bins a
// product runs and the icon builder. --help prints the usage line and exits 0; an unknown option says which one and
// exits 2 with the usage, before reading or writing anything. The icon builder also stops on a folder that isn't
// there, which it used to read as no icons and so emptied src/icons.ts. Needs no build.
//   node tools/test/cli-flags.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-cli-flags-'));
const run = (file, ...args) => spawnSync(process.execPath, [path.join(PROJECT, file), ...args], { cwd: dir, encoding: 'utf8', timeout: 20000 });
const said = (r) => `exit ${r.status}, stdout ${JSON.stringify(r.stdout.slice(0, 200))}, stderr ${JSON.stringify(r.stderr.slice(0, 300))}`;
const CLIS = [
  ...['agents', 'brand', 'create', 'migrate', 'purge', 'usage'].map((n) => [`serupa-${n}`, `bin/serupa-${n}.mjs`]),
  ['the icon builder', 'tools/icons/build.mjs'],
];
const icons = path.join(PROJECT, 'src', 'icons.ts');
const iconsBefore = fs.readFileSync(icons, 'utf8');
try {
  for (const [name, file] of CLIS) {
    for (const flag of ['--help', '-h']) {
      const r = run(file, flag);
      t(`${name} ${flag} prints the usage and exits 0`, r.status === 0 && /usage:/i.test(r.stdout) && !r.stderr, said(r));
    }
    const r = run(file, 'x', '--bogus');
    t(`${name} stops on an unknown option, naming it`, r.status === 2 && r.stderr.includes('--bogus') && /usage:/i.test(r.stderr) && !/\n\s+at /.test(r.stderr), said(r));
  }
  const r = run('tools/icons/build.mjs', 'no-such-folder');
  t('the icon builder stops on a folder that isn\'t there', r.status === 2 && r.stderr.includes('no-such-folder'), said(r));
  t('src/icons.ts is untouched by any of it', fs.readFileSync(icons, 'utf8') === iconsBefore, 'src/icons.ts changed');
  t('nothing was written to the working folder', fs.readdirSync(dir).length === 0, fs.readdirSync(dir).join(', '));
} finally {
  if (fs.readFileSync(icons, 'utf8') !== iconsBefore) fs.writeFileSync(icons, iconsBefore);
  fs.rmSync(dir, { recursive: true, force: true });
}
done(report('Command-line flags', R));
