// The GitLab merge gate in SERUPA_CI_MODE=local, the fallback for when the project's runner is gone (GitLab's shared
// runners have 400 minutes a month for every lane): a merge request merges only when its description holds a tools/ci.mjs report that passed on the
// commit the pipeline runs, from a clean tree, with nothing left out.
//   node tools/local-checks-gate.mjs            in GitLab CI (reads CI_MERGE_REQUEST_DESCRIPTION and CI_COMMIT_SHA)
//   node tools/local-checks-gate.mjs <file> <commit>    the same check on a saved description
// Make the report with npm run check -- --clean --since origin/main --report local-checks.md, put it in the merge
// request's description, then push (or start a new pipeline). The suite itself still runs on GitLab when a pipeline
// is started by hand (Build > Pipelines > Run pipeline) or with SERUPA_FULL_CI=1.
import fs from 'node:fs';

const [file, sha] = process.argv.slice(2);
const description = file ? fs.readFileSync(file, 'utf8') : process.env.CI_MERGE_REQUEST_DESCRIPTION ?? '';
const commit = (sha ?? process.env.CI_COMMIT_SHA ?? '').slice(0, 9);
if (!commit) { console.error('No commit to check: pass one, or run in GitLab CI.'); process.exit(2); }

/** @type {(cond: unknown, msg: string) => void} */
const need = (cond, msg) => { if (!cond) { console.log(`Local checks gate: ${msg}`); fail = true; } };
let fail = false;
const at = description.lastIndexOf('## Local checks');
const report = at < 0 ? '' : description.slice(at);
need(report, 'the description has no "## Local checks" report (npm run check -- --clean --since origin/main --report local-checks.md).');
if (report) {
  const head = /\*\*(All passed|FAILED)\*\* on `([0-9a-f]{7,})`/.exec(report);
  need(head, 'the report has no result line.');
  if (head) {
    need(head[1] === 'All passed', `the report says ${head[1]}.`);
    need(commit.startsWith(head[2]) || head[2].startsWith(commit), `the report is for ${head[2]}, but this pipeline runs ${commit}: run the checks again on this commit.`);
  }
  need(!/with uncommitted changes/.test(report), 'the report was made with uncommitted changes.');
  need(/--clean/.test(report), 'the report was not made from a clean install (--clean).');
  // With --since, as a merge request is checked: the narrowing and the changeset step depend on it. The changeset step
  // may be left out only with the "no-changeset" label (the job's own changeset check honours it too).
  need(/--since\b/.test(report), 'the report was not made with --since (npm run check -- --clean --since origin/main …).');
  const noChangeset = `,${process.env.CI_MERGE_REQUEST_LABELS ?? ''},`.includes(',no-changeset,');
  const leftOut = /^Left out: (.+)\.$/m.exec(report)?.[1].split(', ').filter((s) => !(s === 'changeset' && noChangeset)) ?? [];
  need(!leftOut.length, `the report left out ${leftOut.join(', ')}.`);
}
if (fail) process.exit(1);
console.log(`Local checks gate: the description's report passed on ${commit}.`);
