// The pre-push hook (tools/git-hooks/pre-push) hands the checks an environment with no GIT_* variable pointing at the
// repository being pushed: git sets GIT_DIR for a hook, and a check that makes a throwaway repository would otherwise
// commit into the branch. No network: node, gh and timeout are stand-ins that record what they were given.
//   node tools/test/git-hooks.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-hook-'));
const clean = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
const repo = path.join(tmp, 'repo');
fs.mkdirSync(repo);
const git = (...a) => execFileSync('git', ['-C', repo, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8', env: clean }).trim();
git('init', '-q');
fs.writeFileSync(path.join(repo, 'a'), '1'); git('add', '-A'); git('commit', '-qm', 'one');
const first = git('rev-parse', 'HEAD');
fs.writeFileSync(path.join(repo, 'a'), '2'); git('commit', '-qam', 'two');
const second = git('rev-parse', 'HEAD');

// Stand-ins: node records its environment and arguments, gh lists no labels, timeout runs what it's given.
const bin = path.join(tmp, 'bin');
fs.mkdirSync(bin);
const seen = path.join(tmp, 'seen');
const stub = (name, body) => { fs.writeFileSync(path.join(bin, name), `#!/bin/sh\n${body}\n`); fs.chmodSync(path.join(bin, name), 0o755); };
stub('node', `env | grep '^GIT_' > '${seen}.env'; echo "$@" > '${seen}.args'; exit 0`);
stub('gh', 'exit 0');
stub('timeout', 'shift; exec "$@"');

let status = 0;
try {
  execFileSync('sh', [path.join(PROJECT, 'tools', 'git-hooks', 'pre-push'), 'origin', 'url'], {
    cwd: repo,
    input: `refs/heads/x ${second} refs/heads/x ${first}\n`,
    env: { ...clean, PATH: `${bin}:${process.env.PATH}`, GIT_DIR: path.join(repo, '.git'), GIT_WORK_TREE: repo, GIT_INDEX_FILE: path.join(repo, '.git', 'index') },
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
} catch (e) { status = e.status ?? 1; }
const env = fs.existsSync(`${seen}.env`) ? fs.readFileSync(`${seen}.env`, 'utf8').trim() : null;
const args = fs.existsSync(`${seen}.args`) ? fs.readFileSync(`${seen}.args`, 'utf8').trim() : '';
t('the hook runs the checks', status === 0 && env !== null, `exit ${status}`);
t('the checks get no GIT_DIR, GIT_WORK_TREE or GIT_INDEX_FILE from the hook', env === '', env || '(none)');
t('they test what the push adds: since the branch\'s last push', args.includes(`--since ${first}`) && args.includes('--only tokens,build,typecheck,lint,components'), args);
fs.rmSync(tmp, { recursive: true, force: true });

done(report('Git hooks', R));
