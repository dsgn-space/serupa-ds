// The visual review of a pull request (ADR-0016): what its Visual jobs found different from main's pictures, drawn on
// the spot from the commit it merges into, as a sheet in the job summary, and the gate on the design-qa label.
//   node tools/visual-review.mjs <dir>   <dir> holds the Visual jobs' reports (changes-<shard>.json, before and after)
// With nothing different it passes. Otherwise it publishes the pictures on the branch visual-review/pr-<number> (the
// summary can show only pictures with a URL), writes the sheet, and passes only when the pull request carries the
// design-qa label, added after its last commit that isn't a merge: whoever owns the pull request looks at every
// changed picture, then adds the label. A merge of main alone doesn't ask for it again.
// Env: GITHUB_REPOSITORY, PR (its number), GH_TOKEN, GITHUB_STEP_SUMMARY; PUBLISH=0 leaves the pictures unpublished
// (a fork's pull request, whose token can't push).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// A picture's name: Component/Story-theme-state, Component/Story-axes, Component/Story-forced-colors, a Foundations
// sheet, or a story file's own folder (src/internal's playground.stories.tsx/Element-blue-light-rest). Two parts, each
// starting with a letter or digit, so neither can be "." or "..". Anything else in a report is refused: the report
// comes from a run of the branch's code.
const NAME = /^[A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*$/;
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Every change the shards reported, checked and sorted. */
export function readChanges(dir) {
  const all = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^changes-\d+\.json$/.test(f)) : [];
  const out = all.flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  for (const c of out) {
    if (!NAME.test(c.name) || !['changed', 'added', 'removed'].includes(c.kind)) throw new Error(`Not a picture's change: ${JSON.stringify(c).slice(0, 200)}`);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** The files a change has: after (this branch) unless removed, before (main) unless added. */
export const filesOf = (c) => [...(c.kind !== 'removed' ? [`${c.name}.png`] : []), ...(c.kind !== 'added' ? [`${c.name}.before.png`] : [])];

/** A change's detail as plain text in a table cell. It comes from a run of the branch's code, like the name, so no
 *  HTML, link, picture or new row of its own reaches the summary: 200 characters, on one line, with the characters
 *  HTML and Markdown read as markup written as entities. */
const plain = (text) => String(text).replace(/\s+/g, ' ').slice(0, 200).replace(/[&<>|[\]()`*_~!\\]/g, (ch) => `&#${ch.charCodeAt(0)};`);

/** The sheet in Markdown: each changed picture before and after. url(file) is where a picture is published. */
export function sheet(changes, url, max = 40) {
  if (!changes.length) return '## Visual review\n\nEvery picture matches main\'s: nothing to review.\n';
  const out = ['## Visual review', '',
    `${changes.length} ${changes.length === 1 ? 'picture differs' : 'pictures differ'} from main's, drawn from the commit this pull request merges into. `
    + 'Look at each: the change is the one meant, it reads in the theme, and nothing is cut off, overlaps or lost its contrast. '
    + 'Then add the **design-qa** label. A new commit (other than a merge of main) needs the label again.', '',
    '| Picture | Main | This pull request |', '| --- | --- | --- |'];
  const img = (f, alt) => (url ? `<img src="${url(f)}" width="280" alt="${alt}">` : `\`${f}\``);
  for (const c of changes.slice(0, max)) {
    const before = c.kind === 'added' ? 'new story' : img(`${c.name}.before.png`, 'main');
    const after = c.kind === 'removed' ? 'story removed' : img(`${c.name}.png`, 'this pull request');
    out.push(`| ${c.name}${c.detail ? `<br><sub>${plain(c.detail)}</sub>` : ''} | ${before} | ${after} |`);
  }
  if (changes.length > max) out.push('', `And ${changes.length - max} more: the visual-review artifacts of this run hold them all.`);
  return `${out.join('\n')}\n`;
}

/** Whether the label counts: added after the last commit that isn't a merge. Dates are ISO strings. */
export function approved(labeledAt, lastCommitAt) {
  return Boolean(labeledAt) && Date.parse(labeledAt) >= Date.parse(lastCommitAt);
}

const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 << 20 });

// The pictures, only, on an orphan branch of their own, replaced at each run: no history, and nothing of the branch's
// code. A push with the workflow's token starts no workflow.
function publish(dir, changes, repo, pr) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-review-'));
  for (const c of changes) {
    for (const f of filesOf(c)) {
      const data = fs.readFileSync(path.join(dir, f));
      if (!data.subarray(0, 8).equals(PNG)) throw new Error(`${f} is not a PNG`);
      fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true });
      fs.writeFileSync(path.join(tmp, f), data);
    }
  }
  const git = (...a) => execFileSync('git', ['-C', tmp, '-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', ...a], { encoding: 'utf8' });
  git('init', '-q', '-b', 'review');
  git('add', '-A');
  git('commit', '-q', '-m', `Visual review of #${pr}`);
  const auth = Buffer.from(`x-access-token:${process.env.GH_TOKEN}`).toString('base64');
  git('-c', `http.https://github.com/.extraheader=AUTHORIZATION: basic ${auth}`, 'push', '-q', '--force', `https://github.com/${repo}.git`, `HEAD:refs/heads/visual-review/pr-${pr}`);
  const sha = git('rev-parse', 'HEAD').trim();
  fs.rmSync(tmp, { recursive: true, force: true });
  return (f) => `https://github.com/${repo}/blob/${sha}/${f.split('/').map(encodeURIComponent).join('/')}?raw=true`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2] || '.visual-review';
  const { GITHUB_REPOSITORY: repo, PR: pr, GITHUB_STEP_SUMMARY: summary } = process.env;
  const changes = readChanges(dir);
  // A push the token is refused (403 on #2038's reruns, 16 Nov) costs the summary its pictures, not the review: the
  // pictures stay in this run's visual-review artifacts, and the label is still read below.
  let url = null;
  if (changes.length && process.env.PUBLISH !== '0') {
    try { url = publish(dir, changes, repo, pr); } catch (e) { console.log(`::warning title=Visual review::The pictures couldn't be published on visual-review/pr-${pr} (${String(e.message).split('\n').find((l) => /fatal|denied|error/i.test(l)) ?? e.message}); this run's visual-review artifacts hold them.`); }
  }
  const text = sheet(changes, url);
  if (summary) fs.appendFileSync(summary, text);
  if (!changes.length) { console.log('Every picture matches main\'s.'); process.exit(0); }
  for (const c of changes) console.log(`${c.kind.padEnd(8)}${c.name}${c.detail ? `: ${c.detail}` : ''}`);
  const labels = JSON.parse(gh('api', `repos/${repo}/issues/${pr}/labels`)).map((l) => l.name);
  const labeledAt = labels.includes('design-qa')
    ? JSON.parse(gh('api', '--paginate', '--slurp', `repos/${repo}/issues/${pr}/events?per_page=100`)).flat()
      .filter((e) => e.event === 'labeled' && e.label?.name === 'design-qa').pop()?.created_at
    : null;
  const commits = JSON.parse(gh('api', '--paginate', '--slurp', `repos/${repo}/pulls/${pr}/commits?per_page=100`)).flat();
  const own = commits.filter((c) => c.parents.length === 1).pop() ?? commits.at(-1);
  if (approved(labeledAt, own.commit.committer.date)) { console.log(`Reviewed: design-qa added ${labeledAt}, after the last commit.`); process.exit(0); }
  console.log(`::error title=Visual review::${changes.length} pictures differ from main's. Look at them in this job's summary, then add the design-qa label${labeledAt ? ' again (a commit came after it)' : ''}.`);
  process.exit(1);
}
