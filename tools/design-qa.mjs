// Design QA (96): before a pull request that changes how components look merges, someone looks at each changed
// story in all six themes. This writes that review sheet, for the Design QA workflow's summary: for every story with
// a changed picture, its six themes at rest, before (the base) and after (this branch), and whether each changed.
//   node tools/design-qa.mjs <base-sha> [head]       Markdown on stdout; GITHUB_REPOSITORY names the repository
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const P = path.resolve(import.meta.dirname, '..');
const DIR = 'tools/test/baseline-visual/';
export const THEMES = ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark'];

/** The stories whose pictures changed, from git diff --name-status: { "Badge/Extras": Set of the changed files }. */
export function changedStories(status) {
  const out = new Map();
  for (const [s, f] of status.split('\n').map((l) => l.split('\t'))) {
    if (!s || !f?.startsWith(DIR) || !f.endsWith('.png')) continue;
    const m = /^([^/]+)\/(.+?)-(?:(?:blue|violet|emerald)-(?:light|dark)-(?:rest|hover|focus)|axes|forced-colors)\.png$/.exec(f.slice(DIR.length));
    if (!m) continue;
    const key = `${m[1]}/${m[2]}`;
    if (!out.has(key)) out.set(key, new Map());
    out.get(key).set(f, s[0]);
  }
  return out;
}

/** The review sheet in Markdown. */
export function sheet({ status, base, head, repo, required, max = 20 }) {
  const stories = changedStories(status);
  if (!stories.size) return '## Design QA\n\nNo picture changed: nothing to review.\n';
  const url = (ref, f) => `https://github.com/${repo}/blob/${ref}/${f}?raw=true`;
  const img = (ref, f, alt) => `<img src="${url(ref, f)}" width="240" alt="${alt}">`;
  const out = ['## Design QA', '',
    `${stories.size} ${stories.size === 1 ? 'story looks' : 'stories look'} different. Look at each in all six themes: it reads in every one, nothing is cut off, overlaps or lost its contrast, and the change is the one meant.`,
    required ? 'Then add the **design-qa** label. A push that changes pictures again needs the label again.' : 'This step isn\'t required on this repository yet (the DESIGN_QA variable turns it on), so the check passes; the sheet is here to look at.', ''];
  for (const [key, files] of [...stories].slice(0, max)) {
    const [c, story] = key.split('/');
    const other = [...files.keys()].filter((f) => !/-rest\.png$/.test(f) || !THEMES.some((th) => f.endsWith(`-${th}-rest.png`)));
    out.push(`### ${c} / ${story}`, '', '| Theme | Before | After |', '| --- | --- | --- |');
    for (const th of THEMES) {
      const f = `${DIR}${c}/${story}-${th}-rest.png`, s = files.get(f);
      const before = s === 'A' ? 'new' : img(base, f, `${key}, ${th}, before`);
      const after = s === 'D' ? 'removed' : img(head, f, `${key}, ${th}, after`);
      out.push(`| ${th}${s ? ' (changed)' : ''} | ${before} | ${after} |`);
    }
    if (other.length) out.push('', `Also changed: ${other.map((f) => path.basename(f, '.png').slice(story.length + 1)).join(', ')}.`);
    out.push('');
  }
  if (stories.size > max) out.push(`And ${stories.size - max} more: ${[...stories.keys()].slice(max).join(', ')}. See Files changed.`);
  return out.join('\n') + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const [base, head = 'HEAD'] = process.argv.slice(2);
  if (!base) { console.error('node tools/design-qa.mjs <base-sha> [head]'); process.exit(2); }
  const git = (...a) => execFileSync('git', a, { cwd: P, encoding: 'utf8' }).trim();
  const from = git('merge-base', base, head), to = git('rev-parse', head);
  const repo = process.env.GITHUB_REPOSITORY || /github\.com[:/](.+?)(?:\.git)?$/.exec(git('remote', 'get-url', 'origin'))?.[1] || 'owner/repo';
  process.stdout.write(sheet({ status: git('diff', '--name-status', '--no-renames', from, to, '--', DIR), base: from, head: to, repo, required: process.env.DESIGN_QA === 'required' }));
}
