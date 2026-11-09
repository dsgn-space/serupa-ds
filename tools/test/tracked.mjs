// What git tracks: no symbolic links and nothing from node_modules. #506 committed the node_modules symlink a
// worktree had (mode 120000), which a checkout then turns into a broken link where npm ci wants a folder.
//   node tools/test/tracked.mjs
import { spawnSync } from 'node:child_process';
import { PROJECT, done, report } from './lib.mjs';

// spawnSync keeps 1 MB of output by default, and the stage listing passed that with the Firefox and WebKit visual
// baselines (about 11,500 files): git then "fails". Room for many times as many.
const git = spawnSync('git', ['ls-files', '--stage', '-z'], { cwd: PROJECT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const files = git.status === 0 ? git.stdout.split('\0').filter(Boolean).map((l) => { const [meta, name] = l.split('\t'); return { mode: meta.split(' ')[0], name }; }) : null;
const links = (files || []).filter((f) => f.mode === '120000').map((f) => f.name);
const modules = (files || []).filter((f) => /(^|\/)node_modules(\/|$)/.test(f.name)).map((f) => f.name);
done(report('Tracked files', [
  { name: 'git lists the tracked files', ok: !!files, detail: git.stderr },
  { name: 'no symbolic link is committed', ok: !links.length, detail: `${links.slice(0, 10).join(', ')}: git rm --cached each one` },
  { name: 'nothing from node_modules is committed', ok: !modules.length, detail: `${modules.slice(0, 10).join(', ')}: git rm --cached -r node_modules` },
]));
