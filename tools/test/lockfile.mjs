// Lockfile: every package npm ci installs comes from the npm registry, over https, with an integrity hash, so a
// change to package-lock.json can't point a dependency at a tarball somewhere else (a fork, a git URL, a plain http
// host) without this failing. npm ci checks each tarball against its hash; this checks that each has one to check.
//   node tools/test/lockfile.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const lock = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package-lock.json'), 'utf8'));
const pkgs = Object.entries(lock.packages || {}).filter(([k, v]) => k && !v.link);
t('package-lock.json is lockfileVersion 3', lock.lockfileVersion === 3, `lockfileVersion ${lock.lockfileVersion}`);
t('package-lock.json lists the installed packages', pkgs.length > 100, `${pkgs.length} packages`);
const elsewhere = pkgs.filter(([, v]) => !v.resolved?.startsWith('https://registry.npmjs.org/'));
t('every package comes from https://registry.npmjs.org/', !elsewhere.length, elsewhere.slice(0, 5).map(([k, v]) => `${k}: ${v.resolved || 'no resolved URL'}`).join('; '));
const unhashed = pkgs.filter(([, v]) => !/^sha512-/.test(v.integrity || ''));
t('every package has a sha512 integrity hash', !unhashed.length, unhashed.slice(0, 5).map(([k]) => k).join(', '));
done(report('Lockfile', R));
