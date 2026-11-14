#!/usr/bin/env node
// Runner watch: the jobs of this repository that have waited too long for a self-hosted runner.
//
//   node tools/runner-watch.mjs --stuck 10    one line per job waiting over 10 minutes; nothing when none is
//   node tools/runner-watch.mjs --report 10   the same, kept in one issue ("Jobs waiting for a runner"): opened or
//                                             updated while jobs wait, closed once none does
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

async function api(path, init = {}) {
  const res = await fetch(`https://api.github.com/${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', ...init.headers },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path}: ${res.status}`);
  return res.json();
}

/** Every job of a queued or running run that waits for a self-hosted runner for longer than `limit` minutes. */
export async function stuckJobs(limit, now = Date.now()) {
  const out = [];
  for (const status of ['queued', 'in_progress']) {
    const { workflow_runs: runs } = await api(`repos/${repo}/actions/runs?status=${status}&per_page=50`);
    for (const run of runs) {
      const { jobs } = await api(`repos/${repo}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`);
      for (const job of jobs) {
        if (job.status !== 'queued' || !job.labels.includes('self-hosted')) continue;
        const since = Date.parse(job.created_at || job.started_at);
        const waited = Math.floor((now - since) / 60_000);
        if (waited > limit) out.push({ waited, line: `${job.name} (${run.name}, ${run.head_branch}) has waited ${waited} minutes for [${job.labels.join(', ')}]: ${job.html_url}` });
      }
    }
  }
  return out.sort((a, b) => b.waited - a.waited).map((j) => j.line);
}

async function report(lines) {
  const open = await api(`repos/${repo}/issues?state=open&labels=runner-watch&per_page=10`);
  const issue = open.find((i) => i.title === TITLE && !i.pull_request);
  const body = `${lines.length} job${lines.length === 1 ? '' : 's'} of this repository ${lines.length === 1 ? 'has' : 'have'} waited over ${minutes} minutes for a self-hosted runner, as of ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC. The project's x86 machines may be off: see design-system/ibm-burst-runner-github/RUNBOOK.md in the project files. Meanwhile CI sends new runs' x86 jobs to GitHub's runners by itself (the plan job's "x86 jobs run on" line).\n\n${lines.slice(0, 30).map((l) => `- ${l}`).join('\n')}${lines.length > 30 ? `\n- and ${lines.length - 30} more` : ''}\n\nRunner watch (\`tools/runner-watch.mjs\`) updates this issue every 10 minutes and closes it once no job waits.`;
  if (lines.length && issue) await api(`repos/${repo}/issues/${issue.number}`, { method: 'PATCH', body: JSON.stringify({ body }) });
  else if (lines.length) await api(`repos/${repo}/issues`, { method: 'POST', body: JSON.stringify({ title: TITLE, body, labels: ['runner-watch'] }) });
  else if (issue) {
    await api(`repos/${repo}/issues/${issue.number}/comments`, { method: 'POST', body: JSON.stringify({ body: 'No job waits for a runner any more. Closing.' }) });
    await api(`repos/${repo}/issues/${issue.number}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed', state_reason: 'completed' }) });
  }
  console.log(lines.length ? `${lines.length} waiting; issue ${issue ? 'updated' : 'opened'}` : `none waiting${issue ? '; issue closed' : ''}`);
}

try {
  const lines = await stuckJobs(minutes);
  if (mode === '--stuck') { if (lines.length) console.log(lines.join('\n')); } else await report(lines);
} catch (e) {
  console.error(`runner-watch: ${e.message}`);
  process.exit(2);
}
