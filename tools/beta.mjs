#!/usr/bin/env node
// Which beta components can leave beta: the four-week rule (CONTRIBUTING.md, "It starts as beta").
//   node tools/beta.mjs              the table, for a person or the Daily release's summary
//   node tools/beta.mjs --ready      only the names that meet the two rules a script can check
//
// A beta component is ready once (1) it has shipped in a release and (2) its public API hasn't changed for four weeks.
// The API's history is its baseline's (tools/test/baseline-api/<Name>.d.ts), which holds no comments, so a commit
// that takes a line away changed the API; one that only adds lines, or lets a prop take undefined, added to it.
// The other two rules, the bug bash done with nothing it found still open and a Do and don't pair, need a person:
// the table says so rather than guess.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WEEKS = 4;
const DAY = 86_400_000;

/** A baseline line with what EO1 (2 Nov) added taken out: `?: T | undefined` and its brackets round a function type. */
const plain = (line) => line.trim().replace(/ \| undefined;$/, ';').replace(/\?: \((.*)\);$/, '?: $1;');

/**
 * The date the API last changed, from `git log --format=%x00%cI -p --unified=0` of one baseline: the newest commit
 * that took a line away (a line it removed that isn't among the lines it added, once `| undefined` is set aside, so
 * widening a prop to take undefined doesn't count), or the baseline's first commit when no commit took one away.
 * @param {string} log
 * @returns {string | undefined} an ISO date
 */
export function apiSince(log) {
  const commits = log.split('\0').filter((c) => c.trim()).map((c) => {
    const [date, ...rest] = c.trim().split('\n');
    const lines = (sign) => rest.filter((l) => l.startsWith(sign) && !l.startsWith(sign.repeat(3))).map((l) => plain(l.slice(1)));
    const added = new Set(lines('+'));
    return { date: date.trim(), removed: lines('-').some((l) => !added.has(l)) };
  });
  return (commits.find((c) => c.removed) ?? commits.at(-1))?.date;
}

/**
 * @param {{ shipped: string | undefined, since: string | undefined }} c the first release with it, and apiSince's date
 * @param {Date} now
 * @returns {{ ready: boolean, days: number | undefined, why: string }}
 */
export function verdict({ shipped, since }, now) {
  const days = since ? Math.floor((now.getTime() - Date.parse(since)) / DAY) : undefined;
  if (!shipped) return { ready: false, days, why: 'not in a release yet' };
  if (days === undefined) return { ready: false, days, why: 'no API baseline' };
  if (days < WEEKS * 7) return { ready: false, days, why: `API changed ${days} days ago` };
  return { ready: true, days, why: 'ready, once its bug bash is done with nothing open' };
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  process.chdir(root);
  const status = readFileSync('docs/generated/status.ts', 'utf8');
  const betas = [...status.matchAll(/(\w+): 'beta'/g)].map((m) => m[1]).sort();
  // Releases oldest first, so the first that holds a component is the one that shipped it.
  const tags = git('tag', '--list', 'v*', '--sort=v:refname').split('\n').filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
  const has = (tag, dir) => { try { git('cat-file', '-e', `${tag}:${dir}`); return true; } catch { return false; } };
  const now = new Date();
  const rows = betas.map((name) => {
    const dir = `src/components/${name}`;
    const shipped = has(tags.at(-1) ?? 'HEAD', dir) ? tags.find((t) => has(t, dir)) : undefined;
    const since = apiSince(git('log', '--format=%x00%cI', '-p', '--unified=0', '--', `tools/test/baseline-api/${name}.d.ts`));
    return { name, shipped, since, ...verdict({ shipped, since }, now) };
  });
  if (process.argv.includes('--ready')) {
    for (const r of rows.filter((r) => r.ready)) console.log(r.name);
    return;
  }
  const ready = rows.filter((r) => r.ready).length;
  console.log(`## Beta components (${rows.length}), ${ready} ready to leave beta\n`);
  console.log(`Ready: shipped in a release, and no API change for ${WEEKS} weeks. Promote each with a patch changeset once its`);
  console.log('bug bash is done with nothing open, or say in the release which open bug holds it back.\n');
  console.log('| Component | First release | API unchanged since | Verdict |\n|---|---|---|---|');
  for (const r of rows) console.log(`| ${r.name} | ${r.shipped ?? '-'} | ${r.since ? `${r.since.slice(0, 10)} (${r.days} days)` : '-'} | ${r.why} |`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
