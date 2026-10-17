// npm run release: after a Release pull request is merged, tags the version and makes a GitHub release
// with its CHANGELOG.md notes and the package (npm pack) attached. Does nothing if the tag already exists.
// The Release workflow runs it on main; GH_TOKEN (or GITHUB_TOKEN) must allow writing to the repository.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const P = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: P, encoding: 'utf8', ...opts }).trim();
const pkg = JSON.parse(fs.readFileSync(path.join(P, 'package.json'), 'utf8'));
const tag = `v${pkg.version}`;

if (run('git', ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`])) { console.log(`${tag} is already released.`); process.exit(0); }
const log = fs.readFileSync(path.join(P, 'CHANGELOG.md'), 'utf8');
const m = new RegExp(`^## \\[${pkg.version.replace(/\./g, '\\.')}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[)`, 'm').exec(log);
if (!m) { console.log(`CHANGELOG.md has no ${pkg.version} section yet: nothing to release.`); process.exit(0); }

run('npm', ['run', 'build'], { stdio: 'inherit' });
const tarball = path.join(P, run('npm', ['pack', '--silent']).split('\n').pop());
const notes = path.join(P, '.release-notes.md');
fs.writeFileSync(notes, m[1].trim() + '\n');
run('git', ['tag', tag]);
run('git', ['push', 'origin', tag], { stdio: 'inherit' });
run('gh', ['release', 'create', tag, tarball, '--title', `${pkg.version}`, '--notes-file', notes], { stdio: 'inherit' });
fs.rmSync(notes);
// Publishing to a registry comes later: GitHub Packages needs the package named after the account
// (@diki-stwn/...), so it waits on that decision. Until then projects install from the release.
console.log(`Released ${tag}.`);
