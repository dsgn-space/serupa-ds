// The GitHub workflows and Dependabot, checked for the supply-chain rules in tools/README.md ("Workflows"):
// - every action is pinned to a full commit SHA, with its version as a comment (a tag can be moved to other code);
// - text a pull request's author controls (branch name, title, body…) never goes straight into a run: script,
//   only through env: (a branch called `x";curl …|sh;"` would run otherwise);
// - no checkout keeps a token in .git/config (persist-credentials: false): a push passes its token to that one git call;
// - a job that runs installed dependencies or the branch's own actions (npm ci, npx, uses: ./) gets no secrets and no
//   id-token: write, so a hijacked package or a pull request's code never runs beside a token that outlives the job
//   or can sign for the repository;
// - Dependabot waits 7 days before it offers a new release (cooldown).
// Also runs CI's test check on a held run.
//   node tools/test/workflows.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const GH = path.join(PROJECT, '.github');
const files = [
  ...fs.readdirSync(path.join(GH, 'workflows')).filter((f) => f.endsWith('.yml')).map((f) => 'workflows/' + f),
  ...fs.readdirSync(path.join(GH, 'actions')).map((d) => `actions/${d}/action.yml`).filter((f) => fs.existsSync(path.join(GH, f))),
];
// Expressions an outside contributor can fill: anything under github.event except numbers, SHAs and fixed names.
const UNTRUSTED = /\$\{\{\s*github\.(head_ref|event\.(?!(pull_request\.)?(number|base\.sha|head\.sha|workflow_run\.head_sha)\b|label\.name\b|pull_request\.head\.repo\.full_name\b)[\w.]+)/;

for (const f of files) {
  const lines = fs.readFileSync(path.join(GH, f), 'utf8').split('\n');
  const unpinned = [], injected = [], checkouts = [], headPipes = [];
  let inRun = -1, relaxed = false;
  lines.forEach((line, i) => {
    const indent = line.search(/\S/);
    if (inRun >= 0 && line.trim() && indent <= inRun) inRun = -1;
    // head closes its end of the pipe once it has its lines; with shell: bash's pipefail the writer's broken pipe (141)
    // then fails the step, so a script that cuts output short says set +o pipefail first.
    if (inRun >= 0 && /^\s*set \+o pipefail\b/.test(line)) relaxed = true;
    if (inRun >= 0 && !/^\s*#/.test(line) && /\|\s*head\b/.test(line) && !relaxed) headPipes.push(`${i + 1}`);
    const uses = line.match(/^\s*-?\s*uses:\s*(\S+)(.*)$/);
    if (uses && !uses[1].startsWith('./')) {
      if (!/@[0-9a-f]{40}$/.test(uses[1]) || !/#\s*v\d+\.\d+\.\d+/.test(uses[2])) unpinned.push(`${i + 1}: ${uses[1]}`);
      if (uses[1].startsWith('actions/checkout@')) {
        const step = []; for (let j = i + 1; j < lines.length && !/^\s*-\s/.test(lines[j]) && lines[j].search(/\S/) > indent; j++) step.push(lines[j]);
        checkouts.push({ line: i + 1, keeps: !step.some((l) => /persist-credentials:\s*false/.test(l)) });
      }
    }
    const run = line.match(/^(\s*)-?\s*run:\s*(.*)$/);
    if (run) { if (UNTRUSTED.test(run[2])) injected.push(`${i + 1}`); if (/^[|>]/.test(run[2].trim())) { inRun = indent; relaxed = false; } }
    else if (inRun >= 0 && UNTRUSTED.test(line)) injected.push(`${i + 1}`);
  });
  t(`${f}: every action is pinned to a commit SHA, with its version as a comment`, !unpinned.length, unpinned.join(', '));
  t(`${f}: no pull request text is pasted into a run: script (pass it through env:)`, !injected.length, `line ${injected.join(', ')}`);
  if (headPipes.length || lines.some((l) => /\|\s*head\b/.test(l))) t(`${f}: a run: script that pipes into head says set +o pipefail first`, !headPipes.length, `line ${headPipes.join(', ')}`);
  if (checkouts.length) {
    const keeps = checkouts.filter((c) => c.keeps).map((c) => c.line);
    t(`${f}: its checkouts keep no token (persist-credentials: false)`, !keeps.length, `line ${keeps.join(', ')}`);
  }
  // Each job: the lines from its name (two spaces in, under jobs:) to the next job's.
  const start = lines.findIndex((l) => /^jobs:/.test(l));
  if (start >= 0) {
    const heads = lines.map((l, i) => (i > start && /^ {2}[\w-]+:\s*$/.test(l) ? i : -1)).filter((i) => i >= 0);
    for (const [k, h] of heads.entries()) {
      const job = lines.slice(h, heads[k + 1] ?? lines.length).map((l) => (/^\s*#/.test(l) ? '' : l));   // comments don't count
      const runs = job.some((l) => /\bnpm (ci|install|i)\b|\bnpx\b|^\s*-?\s*uses:\s*\.\//.test(l));
      const secret = job.findIndex((l) => /\$\{\{\s*secrets\./.test(l));
      if (runs) t(`${f}: job ${lines[h].trim().slice(0, -1)} runs dependencies, so it gets no secrets`, secret < 0, `line ${h + secret + 1}`);
      // An OIDC token proves "this repository's workflow made it" to GitHub and other services (a build attestation,
      // a cloud login), so code that can ask for one is as trusted as a secret.
      const oidc = job.findIndex((l) => /^\s*id-token:\s*write\b/.test(l));
      if (runs) t(`${f}: job ${lines[h].trim().slice(0, -1)} runs dependencies, so it can't ask for an OIDC token (id-token: write)`, oidc < 0, `line ${h + oidc + 1}`);
    }
  }
}

// CI's required check, on a run plan held for Update baselines: it cancels the run (grey, not a red X) and still never
// passes, whether the cancel lands or not.
if (fs.existsSync(path.join(GH, 'workflows/ci.yml'))) {
  const lines = fs.readFileSync(path.join(GH, 'workflows/ci.yml'), 'utf8').split('\n');
  const job = lines.findIndex((l) => /^ {2}test:\s*$/.test(l));
  const run = lines.findIndex((l, i) => i > job && /^\s*run:\s*\|\s*$/.test(l));
  const indent = lines[run + 1]?.search(/\S/) ?? -1;
  const body = [];
  for (let i = run + 1; i < lines.length && (!lines[i].trim() || lines[i].search(/\S/) >= indent); i++) body.push(lines[i].slice(indent));
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'hold-'));
  const held = (ghStatus) => {
    fs.writeFileSync(path.join(bin, 'gh'), `#!/bin/sh\necho "$*" >> "${bin}/calls"\nexit ${ghStatus}\n`, { mode: 0o755 });
    fs.writeFileSync(path.join(bin, 'sleep'), '#!/bin/sh\n', { mode: 0o755 });
    fs.rmSync(path.join(bin, 'calls'), { force: true });
    const r = spawnSync('bash', ['-c', body.join('\n')], { env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, HOLD: '1', RUN_ID: '42', RESULTS: '{}' }, encoding: 'utf8' });
    return { status: r.status, calls: fs.existsSync(path.join(bin, 'calls')) ? fs.readFileSync(path.join(bin, 'calls'), 'utf8').trim() : '' };
  };
  const cancelled = held(0), refused = held(1);
  t('ci.yml: a held run cancels itself, and its test check still fails', job >= 0 && cancelled.calls === 'run cancel 42' && cancelled.status === 1, JSON.stringify(cancelled));
  t('ci.yml: a held run whose cancel is refused fails its test check', refused.status === 1, JSON.stringify(refused));
  // GitHub stops a running job on a cancel only when its condition then comes out false: always() kept the held job
  // running past its own cancel, to a red X (#1890, 14 Nov).
  const cond = lines.slice(job, run).find((l) => /^\s*if:/.test(l)) ?? '';
  // fix-proof diffs against the main the run's merge commit sits on, not the event's base.sha, which main can pass first.
  const proof = lines.slice(lines.findIndex((l) => l === '  fix-proof:'), lines.findIndex((l, i) => i > lines.findIndex((x) => x === '  fix-proof:') && /^ {2}[a-z][\w-]*:$/.test(l))).join('\n');
  t('ci.yml: fix proof takes its base from the merge commit, not the event', /git rev-parse HEAD\^1/.test(proof) && !/pull_request\.base\.sha/.test(proof));
  t('ci.yml: the test check is cancelled with a held run, and runs whatever else happens', /!cancelled\(\)/.test(cond) && /hold != '1'/.test(cond) && !/always\(\)/.test(cond), cond.trim());
  fs.rmSync(bin, { recursive: true, force: true });
}

const dependabot = fs.readFileSync(path.join(GH, 'dependabot.yml'), 'utf8');
const ecosystems = dependabot.split(/^\s*- package-ecosystem:/m).slice(1);
for (const e of ecosystems) {
  const days = Number((e.match(/default-days:\s*(\d+)/) || [])[1] || 0);
  t(`dependabot.yml: ${e.trim().split(/\s/)[0]} updates wait at least 7 days after a release (cooldown)`, days >= 7, `default-days: ${days}`);
}

// Every run: script parses as bash (bash -n), with each ${{ }} expression standing in as a word. A quote that doesn't
// close fails the step before any line runs: an apostrophe inside "${labeled:-isn't …}" kept Design QA from rerunning
// anything (15 Nov).
{
  const files = [...fs.readdirSync(path.join(GH, 'workflows')).filter((f) => /\.ya?ml$/.test(f)).map((f) => path.join(GH, 'workflows', f)),
    ...fs.readdirSync(path.join(GH, 'actions')).map((d) => path.join(GH, 'actions', d, 'action.yml')).filter((f) => fs.existsSync(f))];
  const bad = [];
  let scripts = 0;
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const m = /^(\s*)(?:- )?run: (.*)$/.exec(line);
      if (!m) return;
      let body;
      if (/^[|>][-+]?\s*$/.test(m[2])) {
        const block = [];
        let indent = null;
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() === '') { block.push(''); continue; }
          const n = lines[j].length - lines[j].trimStart().length;
          if (indent === null) indent = n;
          if (n < indent || n <= m[1].length) break;
          block.push(lines[j].slice(indent));
        }
        body = block.join('\n');
      } else body = m[2].replace(/^(['"])(.*)\1$/, '$2');
      body = body.replace(/\$\{\{[\s\S]*?\}\}/g, 'X');
      scripts++;
      const r = spawnSync('bash', ['-n'], { input: body, encoding: 'utf8' });
      if (r.status !== 0) bad.push(`${path.relative(PROJECT, file)}:${i + 1}: ${r.stderr.trim().split('\n')[0]}`);
    });
  }
  t(`every run: script in the workflows and actions parses as bash (${scripts})`, !bad.length && scripts > 50, bad.join('; '));
}

done(report('Workflows', R));
