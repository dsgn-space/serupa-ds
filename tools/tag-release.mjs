// Tags released versions that have no tag yet, the way tools/publish.mjs tags one: a prebuilt release commit made
// off main (main's tree at the version's commit, plus dist/, with no scripts, devDependencies or devEngines in
// package.json), so installing the tag from git copies files and builds nothing.
//   node tools/tag-release.mjs                 list the versions in CHANGELOG.md that have no tag on origin
//   node tools/tag-release.mjs --make          make those tags locally (each in its own worktree, from a clean install)
//   node tools/tag-release.mjs --make --push   and push them to origin
//   node tools/tag-release.mjs 14.0.0 --make   just that version
// A version's commit is the first-parent commit of origin/main whose package.json first says it (the Release pull
// request's merge). It never moves or replaces a tag that exists, and makes no registry or GitHub release: on the
// GitLab interim that is all a release is. Run it with the Node devEngines asks for.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const P = path.resolve(import.meta.dirname, '..');
/** @type {(cmd: string, args: string[], opts?: import('node:child_process').ExecFileSyncOptions) => string} */
const run = (cmd, args, opts = {}) => String(execFileSync(cmd, args, { cwd: P, encoding: 'utf8', ...opts }) ?? '').trim();
const make = process.argv.includes('--make');
const push = process.argv.includes('--push');
const asked = process.argv.slice(2).filter((a) => /^\d+\.\d+\.\d+/.test(a));

run('git', ['fetch', '--quiet', 'origin', 'main', '--tags']);
const remoteTags = new Set(run('git', ['ls-remote', '--tags', 'origin']).split('\n').map((l) => l.split('\t')[1]?.replace('refs/tags/', '')).filter(Boolean));
const versions = [...fs.readFileSync(path.join(P, 'CHANGELOG.md'), 'utf8').matchAll(/^## \[(\d+\.\d+\.\d+[^\]]*)\]/gm)].map((m) => m[1]);
const todo = (asked.length ? asked : versions.filter((v) => !remoteTags.has(`v${v}`))).reverse();

// The first-parent commit of origin/main where package.json's version became v.
const commits = run('git', ['rev-list', '--first-parent', '--reverse', 'origin/main', '--', 'package.json']).split('\n');
/** @type {(v: string) => string | undefined} */
const own = (v) => {
  for (const c of commits) {
    try { if (JSON.parse(run('git', ['show', `${c}:package.json`])).version === v) return c; } catch { /* no package.json */ }
  }
};

if (!todo.length) { console.log('Every version in CHANGELOG.md has its tag.'); process.exit(0); }
// The tag's dist/ is built here, by this Node: one older than devEngines asks for could build it differently from CI.
if (make) {
  const want = /^>=\s*(\d+)/.exec(JSON.parse(fs.readFileSync(path.join(P, 'package.json'), 'utf8')).devEngines?.runtime?.version || '')?.[1];
  if (want && Number(process.versions.node.split('.')[0]) < Number(want)) {
    console.error(`This is Node ${process.versions.node}; devEngines asks for ${want} or newer. Run node tools/setup.mjs and put the Node it names on PATH.`);
    process.exit(1);
  }
}
for (const v of todo) {
  const tag = `v${v}`;
  const c = own(v);
  if (!c) { console.log(`${tag}: no commit on origin/main says ${v}, skipped.`); continue; }
  if (remoteTags.has(tag)) { console.log(`${tag}: already on origin, left as it is.`); continue; }
  console.log(`${tag}: ${run('git', ['log', '-1', '--format=%h %s', c])}`);
  if (!make) continue;
  let local = '';
  try { local = run('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`], { stdio: ['ignore', 'pipe', 'ignore'] }); } catch { /* none */ }
  if (!local) {
    const wt = fs.mkdtempSync(path.join(os.tmpdir(), `serupa-${tag}-`));
    try {
      run('git', ['worktree', 'add', '--detach', '--quiet', wt, c]);
      const here = { cwd: wt, stdio: /** @type {const} */ ('inherit') };
      run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], here);
      run('npm', ['run', 'build'], here);
      // The package as a project installs it, on the dist/ just built: every export there, the components import and
      // render on the server, the types build. A failure throws here, before anything is committed or tagged.
      run(process.execPath, ['tools/test/package.mjs'], here);
      const pkg = JSON.parse(fs.readFileSync(path.join(wt, 'package.json'), 'utf8'));
      delete pkg.scripts;
      delete pkg.devDependencies;
      delete pkg.devEngines;
      fs.writeFileSync(path.join(wt, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
      run('git', ['add', '--force', 'dist', 'package.json'], { cwd: wt });
      run('git', ['commit', '--quiet', '-m', `Release ${tag} (prebuilt)`], { cwd: wt });
      run('git', ['tag', tag], { cwd: wt });
    } finally {
      try { run('git', ['worktree', 'remove', '--force', wt]); } catch { fs.rmSync(wt, { recursive: true, force: true }); }
    }
    console.log(`${tag}: tagged ${run('git', ['rev-parse', '--short', tag])} (prebuilt on ${c.slice(0, 9)})`);
  }
  if (push) run('git', ['push', '--quiet', 'origin', `refs/tags/${tag}`], { stdio: 'inherit' });
}
