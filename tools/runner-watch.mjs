#!/usr/bin/env node
// Runner watch: the jobs of this repository that have waited too long for a self-hosted runner.
//
//   node tools/runner-watch.mjs --stuck 10    one line per job waiting over 10 minutes; nothing when none is, or
//                                             when a self-hosted runner started a job in those 10 minutes (busy,
//                                             not gone)
//   node tools/runner-watch.mjs --report 10   the same, kept in one issue ("Jobs waiting for a runner"): opened or
//                                             updated while jobs wait, closed once none does; and merges that stall
//                                             (nothing merged for 30 minutes while pull requests wait to, or an
//                                             armed one conflicted that long) in another ("Merges stalled"); and,
//                                             at the first run of each hour, the merge queue's numbers in a third
//                                             that stays open ("Merge queue throughput")
//
// CI's plan job runs --stuck to send a run's x86 jobs to GitHub's runners when the project's machines look gone, and
// the Runner watch workflow runs --report every 10 minutes. On 14 Nov the burst runner was off for an hour and a queue
// run waited for it the whole time, with nothing to say so. It needs GH_TOKEN (actions: read; issues: write for
// --report) and GITHUB_REPOSITORY. It exits 2 when GitHub doesn't answer, so a caller can tell that from "none".
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const mode = process.argv[2];
const minutes = Number(process.argv[3] || 10);
const main = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (main && (!repo || !token || !['--stuck', '--report', '--pick'].includes(mode) || !(minutes > 0))) {
  console.error('usage: GH_TOKEN=… GITHUB_REPOSITORY=owner/name node tools/runner-watch.mjs --stuck|--report|--pick <minutes>');
  process.exit(2);
}
const GITHUB_RUNNER = '"ubuntu-24.04"';
const TITLE = 'Jobs waiting for a runner';
const STALL_TITLE = 'Merges stalled';
const THROUGHPUT_TITLE = 'Merge queue throughput';
// On 15 Nov nothing merged for five hours: main's pictures had drifted, so the queue's Visual run failed every group,
// and the pull request that fixed them sat with a conflict. Nobody was told. Half an hour is the limit.
const STALL_MINUTES = 30;

async function api(path, init = {}) {
  const res = await fetch(`https://api.github.com/${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', ...init.headers },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw Object.assign(new Error(`${init.method || 'GET'} ${path}: ${res.status}`), { status: res.status });
  return res.json();
}

/**
 * Every job of a queued or running run that waits for a self-hosted runner for longer than `limit` minutes. With
 * `goneOnly`, none while a self-hosted runner has started a job in the last `limit` minutes: then the machines are
 * there and only busy, and sending jobs to GitHub's runners would only queue them there (15 Nov: a queue run's 17
 * x86 jobs went to GitHub's runners while those were starved, and the burst slots sat idle).
 */
export async function stuckJobs(limit, now = Date.now(), goneOnly = false) {
  const out = [];
  let alive = false;
  for (const status of ['queued', 'in_progress']) {
    const { workflow_runs: runs } = await api(`repos/${repo}/actions/runs?status=${status}&per_page=50`);
    for (const run of runs) {
      const { jobs } = await api(`repos/${repo}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`);
      for (const job of jobs) {
        if (job.labels.includes('self-hosted') && job.started_at && job.runner_name && now - Date.parse(job.started_at) < limit * 60_000) alive = true;
        if (job.status !== 'queued' || !job.labels.includes('self-hosted')) continue;
        const since = Date.parse(job.created_at || job.started_at);
        const waited = Math.floor((now - since) / 60_000);
        if (waited > limit) out.push({ waited, line: `${job.name} (${run.name}, ${run.head_branch}) has waited ${waited} minutes for [${job.labels.join(', ')}]: ${job.html_url}` });
      }
    }
  }
  if (goneOnly && alive) return [];
  return out.sort((a, b) => b.waited - a.waited).map((j) => j.line);
}

/**
 * Where x86 jobs go (a runs-on value, JSON): `x86` when it is set, the pull request isn't a fork's, and a
 * self-hosted runner started a job in the last `window` minutes (`lastStart`, ms, or null for none seen);
 * GitHub's runners otherwise.
 */
export function pickRunner({ x86, fork = false, lastStart, now = Date.now(), window = 100 }) {
  if (!x86 || fork) return GITHUB_RUNNER;
  return lastStart != null && now - lastStart <= window * 60_000 ? x86 : GITHUB_RUNNER;
}

/** When a self-hosted runner last started a job of this repository within `limit` minutes (ms), or null. */
async function lastSelfHostedStart(limit, now = Date.now()) {
  const from = new Date(now - limit * 60_000).toISOString();
  // Newest first, and stop at the first hit: in a busy hour the newest run has one.
  const { workflow_runs: runs } = await api(`repos/${repo}/actions/runs?created=>=${from}&per_page=100`);
  for (const run of runs) {
    const { jobs } = await api(`repos/${repo}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`);
    const starts = jobs.filter((j) => j.labels.includes('self-hosted') && j.runner_name && j.started_at).map((j) => Date.parse(j.started_at));
    if (starts.length) return Math.max(...starts);
  }
  return null;
}

/** The lines in the run's summary, for when the repository has Issues off. */
function toSummary(title, lines, text) {
  const out = `### ${title}\n\n${text}\n\n${lines.map((l) => `- ${l}`).join('\n')}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, out);
  for (const l of lines) console.log(`::warning title=${title}::${l}`);
  return lines.length ? `${lines.length} listed in the run's summary (Issues are off)` : 'none';
}

/** Opens, updates or closes the one open issue with this title and label: open while there are lines. */
export async function keepIssue(title, label, lines, text) {
  let open;
  try {
    open = await api(`repos/${repo}/issues?state=open&labels=${label}&per_page=10`);
  } catch (e) {
    if (e.status === 410) return toSummary(title, lines, text);
    throw e;
  }
  const issue = open.find((i) => i.title === title && !i.pull_request);
  const body = `${text}\n\n${lines.slice(0, 30).map((l) => `- ${l}`).join('\n')}${lines.length > 30 ? `\n- and ${lines.length - 30} more` : ''}\n\nRunner watch (\`tools/runner-watch.mjs\`) updates this issue every 10 minutes and closes it once this is over.`;
  if (lines.length && issue) await api(`repos/${repo}/issues/${issue.number}`, { method: 'PATCH', body: JSON.stringify({ body }) });
  else if (lines.length) await api(`repos/${repo}/issues`, { method: 'POST', body: JSON.stringify({ title, body, labels: [label] }) });
  else if (issue) {
    await api(`repos/${repo}/issues/${issue.number}/comments`, { method: 'POST', body: JSON.stringify({ body: 'Over now. Closing.' }) });
    await api(`repos/${repo}/issues/${issue.number}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed', state_reason: 'completed' }) });
  }
  return lines.length ? `${lines.length} listed; issue ${issue ? 'updated' : 'opened'}` : `none${issue ? '; issue closed' : ''}`;
}

const stamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

/**
 * Why merges have stalled, one line each: nothing has reached main for `limit` minutes while the queue builds or
 * pull requests wait with auto-merge on, and each armed pull request with a conflict (the queue can't take it).
 */
export async function stalled(limit = STALL_MINUTES, now = Date.now()) {
  const out = [];
  const since = (t) => Math.floor((now - Date.parse(t)) / 60_000);
  const { workflow_runs: [push] } = await api(`repos/${repo}/actions/runs?event=push&branch=main&per_page=1`);
  const quiet = push ? since(push.created_at) : Infinity;
  const groups = (await api(`repos/${repo}/git/matching-refs/heads/gh-readonly-queue/main`)).length;
  const armed = (await api(`repos/${repo}/pulls?state=open&base=main&per_page=100`)).filter((p) => p.auto_merge && !p.draft);
  if (quiet > limit && (groups || armed.length)) out.push(`Nothing has merged into main for ${quiet} minutes, while ${groups} merge-queue group${groups === 1 ? ' builds' : 's build'} and ${armed.length} pull request${armed.length === 1 ? ' waits' : 's wait'} with auto-merge on. Look at the newest merge-queue run of CI: a job that fails every group (a picture main drew differently, a test main broke) needs a fix on main first.`);
  for (const p of armed) {
    const pull = await api(`repos/${repo}/pulls/${p.number}`);
    if (pull.mergeable_state !== 'dirty') continue;
    const age = since(pull.updated_at);
    if (age > limit) out.push(`#${p.number} (${p.head.ref}) has auto-merge on and a conflict with main, and hasn't changed for ${age} minutes: merge main into it. Update baselines heals a conflict in pictures alone by itself.`);
  }
  return out;
}

const pct = (xs, p) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(p * xs.length))] : null);

/**
 * The merge queue's numbers over the last hour and day, one line each: merges, the time from entering the queue to
 * merging (median and 90th percentile, in minutes), and the queue runs that failed, by the job that failed them.
 * `merged`: [{ queued, merged }] (ISO times); `failed`: [{ at, jobs: [names] }].
 */
export function throughputLines(merged, failed, now = Date.now()) {
  const out = [];
  for (const [label, hours] of /** @type {[string, number][]} */ ([['Last hour', 1], ['Last 24 hours', 24]])) {
    const from = now - hours * 3_600_000;
    const m = merged.filter((x) => Date.parse(x.merged) >= from);
    const waits = m.filter((x) => x.queued).map((x) => Math.round((Date.parse(x.merged) - Date.parse(x.queued)) / 60_000));
    const f = failed.filter((x) => Date.parse(x.at) >= from);
    /** @type {Map<string, number>} */
    const by = new Map();
    for (const x of f) for (const j of x.jobs.length ? x.jobs : ['(no job failed: cancelled)']) by.set(j, (by.get(j) || 0) + 1);
    const reasons = [...by].sort((a, b) => b[1] - a[1]).map(([j, n]) => `${j} ${n}`).join(', ');
    out.push(`**${label}:** ${m.length} merged (${(m.length / hours).toFixed(1)} an hour); in the queue ${waits.length ? `${pct(waits, 0.5)} minutes median, ${pct(waits, 0.9)} at the 90th percentile` : 'no data'}; ${f.length} queue run${f.length === 1 ? '' : 's'} failed${f.length ? ` (${reasons})` : ''}.`);
  }
  return out;
}

async function throughput(now = Date.now()) {
  const day = now - 86_400_000;
  const pulls = await api(`repos/${repo}/pulls?state=closed&base=main&sort=updated&direction=desc&per_page=100`);
  const merged = [];
  for (const p of pulls.filter((x) => x.merged_at && Date.parse(x.merged_at) >= day)) {
    // With Issues off the timeline may answer 410: then the time in the queue is unknown, the merge still counts.
    const events = await api(`repos/${repo}/issues/${p.number}/timeline?per_page=100`).catch((e) => (e.status === 410 ? [] : Promise.reject(e)));
    const queued = events.filter((e) => e.event === 'added_to_merge_queue' && e.created_at <= p.merged_at).pop()?.created_at;
    merged.push({ queued, merged: p.merged_at });
  }
  const failed = [];
  // A failed job stops the rest of its run (stop), so a failed queue run ends cancelled; one the queue cancelled
  // itself (its group re-formed behind another's failure) has no failed job and isn't counted.
  const { workflow_runs: runs } = await api(`repos/${repo}/actions/workflows/ci.yml/runs?event=merge_group&status=completed&per_page=100&created=>${new Date(day).toISOString()}`);
  for (const run of runs.filter((r) => r.conclusion !== 'success')) {
    const { jobs } = await api(`repos/${repo}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`);
    const names = [...new Set(jobs.filter((j) => j.conclusion === 'failure' && j.name !== 'test' && j.name !== 'stop').map((j) => j.name.replace(/ \d+\/\d+\)$/, ')')))];
    if (names.length) failed.push({ at: run.created_at, jobs: names });
  }
  return throughputLines(merged, failed, now);
}

/** Writes the reports; true when jobs wait or merges stall. */
async function report(lines) {
  console.log(`Waiting for a runner: ${await keepIssue(TITLE, 'runner-watch', lines, `${lines.length} job${lines.length === 1 ? '' : 's'} of this repository ${lines.length === 1 ? 'has' : 'have'} waited over ${minutes} minutes for a self-hosted runner, as of ${stamp()} UTC. The project's x86 machines may be off: see design-system/ibm-burst-runner-github/RUNBOOK.md in the project files. Meanwhile CI sends new runs' x86 jobs to GitHub's runners by itself (the plan job's "x86 jobs run on" line).`)}`);
  const stall = await stalled();
  console.log(`Merges stalled: ${await keepIssue(STALL_TITLE, 'runner-watch', stall, `Merges into main look stalled, as of ${stamp()} UTC.`)}`);
  // Once an hour (the watch runs every 10 minutes): the numbers take a call per merged pull request.
  if (new Date().getUTCMinutes() < 10) {
    console.log(`Throughput: ${await keepIssue(THROUGHPUT_TITLE, 'runner-watch', await throughput(), `The merge queue as of ${stamp()} UTC. This issue stays open and is rewritten every hour.`)}`);
  }
  return lines.length > 0 || stall.length > 0;
}

if (main) {
  try {
    if (mode === '--pick') {
      const x86 = process.env.X86 ?? process.env.SERUPA_X86_RUNNER ?? '';
      const fork = process.env.FORK === 'true';
      const lastStart = x86 && !fork ? await lastSelfHostedStart(minutes) : null;
      console.log(pickRunner({ x86, fork, lastStart, window: minutes }).replace(/\s+/g, ''));
    } else {
      const lines = await stuckJobs(minutes, Date.now(), mode === '--stuck');
      if (mode === '--stuck') { if (lines.length) console.log(lines.join('\n')); } else if (await report(lines)) process.exitCode = 1;
    }
  } catch (e) {
    console.error(`runner-watch: ${e.message}`);
    process.exit(2);
  }
}
