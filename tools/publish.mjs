// npm run release: after a Release pull request is merged, tags the version and makes a GitHub release
// with its CHANGELOG.md notes and the package (npm pack) attached. Does nothing once the tag and its release
// both exist; when the tag was pushed but making the release failed, a re-run makes the release from the tag.
// The Release workflow runs it on main and on a maintenance branch (14.x); GH_TOKEN (or GITHUB_TOKEN) must allow writing to the repository.
//
// The tag is prebuilt: it points at a release commit made off main (never on it) that adds dist/ and drops the
// scripts and devDependencies from package.json. Installing the tag from GitHub then copies files; nothing
// builds on the project's machine.
//
// It releases the commit that brought this version (the Release pull request's merge), not the commit it runs
// on. On a busy main the run that gets here can be several merges later, and those merges' code belongs to the
// next version.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { isLatest, previousTag, screenshotNotes } from './release-screenshots.mjs';
import { diffRefs, releaseNotes } from './api-diff.mjs';

const P = path.resolve(import.meta.dirname, '..');
const run = (cmd, args, opts = {}) => (execFileSync(cmd, args, { cwd: P, encoding: 'utf8', ...opts }) ?? '').trim();   // null when stdio is inherited
// The Release workflow's checkout keeps no token in .git/config, so the git calls that reach GitHub get GH_TOKEN
// for themselves only, through the environment. Not when git already has a token for GitHub (a second one would
// make the request fail) or when there is no GH_TOKEN (a local run, which has its own credentials).
const hasAuth = (() => { try { return !!run('git', ['config', '--get-regexp', '^http\\..*extraheader$'], { stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return false; } })();
const remote = process.env.GH_TOKEN && !hasAuth ? { env: { ...process.env, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
  GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${process.env.GH_TOKEN}`).toString('base64')}` } } : {};
let pkg = JSON.parse(fs.readFileSync(path.join(P, 'package.json'), 'utf8'));
const tag = `v${pkg.version}`;

const tagged = !!run('git', ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`], remote);
const released = () => { try { execFileSync('gh', ['release', 'view', tag], { cwd: P, stdio: 'ignore' }); return true; } catch { return false; } };
if (tagged && released()) { console.log(`${tag} is already released.`); process.exit(0); }
const back = run('git', ['rev-parse', 'HEAD']);
// The first-parent commit whose package.json first said this version.
const own = run('git', ['log', '--first-parent', '--format=%H', '-1', '-S', `"version": "${pkg.version}"`, 'HEAD', '--', 'package.json']);
if (!tagged && own && own !== back) {
  console.log(`${tag} came in with ${own.slice(0, 8)}: releasing that commit, not ${back.slice(0, 8)}.`);
  const lock = run('git', ['diff', '--name-only', own, back, '--', 'package-lock.json']);
  run('git', ['checkout', '--detach', '--quiet', own]);
  if (lock) run('npm', ['ci', '--ignore-scripts'], { stdio: 'inherit' });
  pkg = JSON.parse(fs.readFileSync(path.join(P, 'package.json'), 'utf8'));
}
// Back to the commit the workflow checked out, with its own dependencies, for the steps after this one.
const home = () => {
  run('git', ['checkout', '--quiet', back]);
  if (own !== back && run('git', ['diff', '--name-only', own, back, '--', 'package-lock.json'])) run('npm', ['ci', '--ignore-scripts'], { stdio: 'inherit' });
};
const log = fs.readFileSync(path.join(P, 'CHANGELOG.md'), 'utf8');
// Every regex character in the version escaped, not just the dots (a build suffix like 1.0.0+abc has a +).
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const m = new RegExp(`^## \\[${escape(pkg.version)}\\][^\\n]*\\n([\\s\\S]*?)(?=^## )`, 'm').exec(log);
if (!m) { console.log(`CHANGELOG.md has no ${pkg.version} section yet: nothing to release.`); home(); process.exit(0); }

if (tagged) {
  // The tag is already the prebuilt commit: pack the release from it, as the first run would have.
  console.log(`${tag} is tagged but has no GitHub release yet: making it from the tag.`);
  run('git', ['fetch', '--quiet', 'origin', 'tag', tag], remote);
  run('git', ['checkout', '--detach', '--quiet', tag]);
} else {
  run('npm', ['run', 'build'], { stdio: 'inherit' });

  // The release commit: main's tree plus dist/, with a package.json that has nothing to run on install.
  const prebuilt = { ...pkg };
  delete prebuilt.scripts;
  delete prebuilt.devDependencies;
  delete prebuilt.devEngines;   // the Node this repo builds with, not what a project needs (engines says that)
  let named = false;
  try { named = !!run('git', ['config', 'user.name'], { stdio: ['ignore', 'pipe', 'ignore'] }); } catch { /* not set */ }
  const who = named ? [] : ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com'];
  run('git', ['checkout', '--detach', '--quiet']);
  fs.writeFileSync(path.join(P, 'package.json'), JSON.stringify(prebuilt, null, 2) + '\n');
  run('git', ['add', '--force', 'dist', 'package.json']);
  run('git', [...who, 'commit', '--quiet', '-m', `Release ${tag} (prebuilt)`]);
}
const tarball = path.join(P, run('npm', ['pack', '--silent']).split('\n').pop());
const notes = path.join(P, '.release-notes.md');
// The file's SHA-256 under the notes, so a download can be checked against the release page. The Release workflow's
// attest job signs the same file (build provenance); the README's install section has the gh attestation verify line.
const sha = createHash('sha256').update(fs.readFileSync(tarball)).digest('hex');
// The stories that look different since the last release, before and after (94). Never in the way of a release.
let shots = '';
try {
  const prev = previousTag(run('git', ['tag', '--list', 'v*']).split('\n'), pkg.version);
  const repo = process.env.GITHUB_REPOSITORY || /github\.com[:/](.+?)(?:\.git)?$/.exec(run('git', ['remote', 'get-url', 'origin']))?.[1];
  if (prev && repo) shots = screenshotNotes({ status: run('git', ['diff', '--name-status', '--no-renames', prev, own || back, '--', 'tools/test/baseline-visual']), prev, tag, repo });
} catch (e) { console.log(`No screenshots in the notes: ${e.message.split('\n')[0]}`); }
// What changed in the exported types since the last release, folded under one line (tools/api-diff.mjs). Never in the
// way of a release either.
let api = '';
try {
  const prev = previousTag(run('git', ['tag', '--list', 'v*']).split('\n'), pkg.version);
  if (prev) api = releaseNotes(diffRefs(prev, own || back, P), prev);
} catch (e) { console.log(`No API report in the notes: ${e.message.split('\n')[0]}`); }
fs.writeFileSync(notes, `${m[1].trim()}\n\n${api ? api + '\n' : ''}${shots ? shots + '\n' : ''}**${path.basename(tarball)}** SHA-256: \`${sha}\`\n`);
// Tell the workflow which file was released, for its attest job (nothing to attest when this run released nothing).
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `tarball=${path.basename(tarball)}\n`);
if (!tagged) {
  run('git', ['tag', tag]);
  run('git', ['push', 'origin', tag], { stdio: 'inherit', ...remote });
}
home();
// A patch on the previous major's branch (14.x after 15.0.0) leaves "Latest" on the new major.
const latest = isLatest(run('git', ['tag', '--list', 'v*']).split('\n'), pkg.version);
run('gh', ['release', 'create', tag, tarball, '--title', `${pkg.version}`, '--notes-file', notes, '--verify-tag', `--latest=${latest}`], { stdio: 'inherit' });
fs.rmSync(notes);
// The Release workflow's publish job sends the same tarball to the private registry once the name is scoped (15.0.0).
console.log(`Released ${tag}.`);
