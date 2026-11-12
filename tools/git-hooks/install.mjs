// npm install (the prepare script) points git at tools/git-hooks/, so every clone runs the pre-push check. Not on CI,
// not outside a git checkout (an installed package), and never over hooks someone set up on purpose.
import { execFileSync } from 'node:child_process';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
try {
  if (!process.env.CI && git('rev-parse', '--is-inside-work-tree') === 'true') {
    let current = '';
    try { current = git('config', 'core.hooksPath'); } catch { /* not set */ }
    if (!current) git('config', 'core.hooksPath', 'tools/git-hooks');
  }
} catch { /* no git here: nothing to set up */ }
