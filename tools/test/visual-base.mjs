// Main's Storybook for Visual to draw its pictures from (ADR-0016): no picture is committed, so Visual draws the
// commit a change starts from, then this tree, and compares the two. run.mjs runs this first, in its visual group:
//   node tools/test/visual-base.mjs <ref>     builds <ref>'s package and Storybook in a worktree beside this one
// The worktree is <this folder>-visual-base, kept between runs: a second run at the same commit builds nothing.
// Its dependencies are this tree's (a link) when the two lockfiles match, else its own (npm ci).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT } from './lib.mjs';

export const TREE = `${PROJECT}-visual-base`;
export const STORYBOOK = path.join(TREE, 'storybook-static');
const MARK = path.join(TREE, '.visual-base');

const git = (...a) => spawnSync('git', a, { cwd: PROJECT, encoding: 'utf8' });
/** The commit a ref names, or '' when there is none here. */
export const commitOf = (ref) => { const r = git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`); return r.status === 0 ? r.stdout.trim() : ''; };

/** The commit Visual compares with: SERUPA_VISUAL_REF, else where this branch left main, else this commit (on main,
 * or with no main to find): Visual then draws this tree twice, which finds the stories that don't draw the same twice. */
export function baseCommit() {
  const head = commitOf('HEAD');
  if (process.env.SERUPA_VISUAL_REF) return commitOf(process.env.SERUPA_VISUAL_REF) || head;
  for (const main of ['origin/main', 'main']) {
    if (!commitOf(main)) continue;
    const r = git('merge-base', 'HEAD', main);
    if (r.status === 0) return r.stdout.trim();
  }
  return head;
}

function sh(cmd, args, cwd) {
  console.log(`$ ${cmd} ${args.join(' ')}${cwd === PROJECT ? '' : `   (in ${cwd})`}`);
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (r.status !== 0) { console.error(`FAIL  ${cmd} ${args.join(' ')} exited with ${r.status}`); process.exit(1); }
}

/** Builds `sha`'s package and Storybook in TREE, unless they are built there already. */
export function build(sha) {
  if (fs.existsSync(MARK) && fs.readFileSync(MARK, 'utf8').trim() === sha && fs.existsSync(path.join(STORYBOOK, 'index.json'))) {
    console.log(`Main's Storybook at ${sha.slice(0, 9)} is built already (${STORYBOOK}).`);
    return;
  }
  fs.rmSync(TREE, { recursive: true, force: true });
  sh('git', ['worktree', 'prune'], PROJECT);
  sh('git', ['worktree', 'add', '--detach', TREE, sha], PROJECT);
  const same = (f) => fs.existsSync(path.join(TREE, f)) && fs.readFileSync(path.join(TREE, f), 'utf8') === fs.readFileSync(path.join(PROJECT, f), 'utf8');
  if (same('package-lock.json') && fs.existsSync(path.join(PROJECT, 'node_modules'))) fs.symlinkSync(path.join(PROJECT, 'node_modules'), path.join(TREE, 'node_modules'));
  else sh('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], TREE);
  sh('npm', ['run', 'build'], TREE);
  sh('npm', ['run', 'build-storybook'], TREE);
  fs.writeFileSync(MARK, `${sha}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const ref = process.argv[2];
  const sha = ref ? commitOf(ref) : '';
  if (!sha) { console.error(`node tools/test/visual-base.mjs <ref>: ${ref ? `no commit ${ref} here (fetch it first)` : 'which commit?'}`); process.exit(2); }
  build(sha);
}
