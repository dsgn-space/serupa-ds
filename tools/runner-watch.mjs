#!/usr/bin/env node
// Runner watch: the jobs of this repository that have waited too long for a self-hosted runner.
//
//   node tools/runner-watch.mjs --stuck 10    one line per job waiting over 10 minutes; nothing when none is, or
//                                             when a self-hosted runner started a job in those 10 minutes (busy,
//                                             not gone)
//   node tools/runner-watch.mjs --report 10   the same, kept in one issue ("Jobs waiting for a runner"): opened or
//                                             updated while jobs wait, closed once none does; and merges that stall
//                                             (nothing merged for 30 minutes while pull requests wait to, or an
//                                             armed one conflicted that long) in another ("Merges stalled")
//
// CI's plan job runs --stuck to send a run's x86 jobs to GitHub's runners when the project's machines look gone, and
// the Runner watch workflow runs --report every 10 minutes. On 14 Nov the burst runner was off for an hour and a queue
// run waited for it the whole time, with nothing to say so. It needs GH_TOKEN (actions: read; issues: write for
// --report) and GITHUB_REPOSITORY. It exits 2 when GitHub doesn't answer, so a caller can tell that from "none".
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const mode = process.argv[2];
const minutes = Number(process.argv[3] || 10);
if (!repo || !token || !['--stuck', '--report'].includes(mode) || !(minutes > 0)) {
  console.error('usage: GH_TOKEN=… GITHUB_REPOSITORY=owner/name node tools/runner-watch.mjs --stuck|--report <minutes>');
  process.exit(2);
}
const TITLE = 'Jobs waiting for a runner';
const STALL_TITLE = 'Merges stalled';
// On 15 Nov nothing merged for five hours: main's pictures had drifted, so the queue's Visual run failed every group,
// and the pull request that fixed them sat with a conflict. Nobody was told. Half an hour is the limit.
const STALL_MINUTES = 30;

async function api(path, init = {}) {
  const res = await fetch(`https://api.github.com/${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', ...init.headers },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path}: ${res.status}`);
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

/** Opens, updates or closes the one open issue with this title and label: open while there are lines. */
async function keepIssue(title, label, lines, text) {
  const open = await api(`repos/${repo}/issues?state=open&labels=${label}&per_page=10`);
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

async function report(lines) {
  console.log(`Waiting for a runner: ${await keepIssue(TITLE, 'runner-watch', lines, `${lines.length} job${lines.length === 1 ? '' : 's'} of this repository ${lines.length === 1 ? 'has' : 'have'} waited over ${minutes} minutes for a self-hosted runner, as of ${stamp()} UTC. The project's x86 machines may be off: see design-system/ibm-burst-runner-github/RUNBOOK.md in the project files. Meanwhile CI sends new runs' x86 jobs to GitHub's runners by itself (the plan job's "x86 jobs run on" line).`)}`);
  const stall = await stalled();
  console.log(`Merges stalled: ${await keepIssue(STALL_TITLE, 'runner-watch', stall, `Merges into main look stalled, as of ${stamp()} UTC.`)}`);
}

try {
  const lines = await stuckJobs(minutes, Date.now(), mode === '--stuck');
  if (mode === '--stuck') { if (lines.length) console.log(lines.join('\n')); } else await report(lines);
} catch (e) {
  console.error(`runner-watch: ${e.message}`);
  process.exit(2);
}
