// The package exactly as a release ships it, packed into a tarball (as in package-lint.mjs): the files package.json
// lists, and a package.json without scripts, devDependencies or devEngines (as tools/publish.mjs ships it: devEngines
// asks for the Node the repository builds with, and npm pack refuses to run on an older one). For consumer.mjs and
// frameworks.mjs. Only Node's own modules: on Node 22 the repository's dependencies aren't installed.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/** Packs the built package in `project` into `dest` and returns the tarball's path. */
export function packShipped(project, dest) {
  const pkg = JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8'));
  const dir = path.join(dest, 'package');
  for (const f of pkg.files) if (fs.existsSync(path.join(project, f))) fs.cpSync(path.join(project, f), path.join(dir, f), { recursive: true });
  const shipped = { ...pkg };
  delete shipped.scripts;
  delete shipped.devDependencies;
  delete shipped.devEngines;
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(shipped, null, 2) + '\n');
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const r = spawnSync(npm, ['pack', '--json', '--pack-destination', dest], { cwd: dir, encoding: 'utf8', shell: process.platform === 'win32' });
  if (r.status !== 0) { console.log(`FAIL  npm pack\n${r.stdout}${r.stderr}`); process.exit(1); }
  return path.join(dest, JSON.parse(r.stdout)[0].filename);
}
