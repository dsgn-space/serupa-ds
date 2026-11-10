#!/usr/bin/env node
// Takes the Firefox and WebKit pictures a pipeline's cross-browser visual jobs drew into
// tools/test/baseline-visual-firefox/ and -webkit/, for a merge request whose pictures changed on purpose:
//   GITLAB_TOKEN=… node tools/take-cross-baselines.mjs <pipeline id>
// Each failing story leaves <story>.actual.png in its job's artifacts; this downloads the two jobs' artifacts (one
// call each), puts every .actual.png in place of its baseline and lists what it wrote, to review and commit. The token
// goes in a header, never in a URL or a file; GitLab sends the archive itself from a signed link, fetched without it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = `${process.env.CI_API_V4_URL || 'https://gitlab.com/api/v4'}/projects/${encodeURIComponent(process.env.SERUPA_GITLAB_PROJECT || 'diki-stwn/serupa-ds')}`;
const pipeline = process.argv[2];
if (!/^\d+$/.test(pipeline || '') || !process.env.GITLAB_TOKEN) {
  console.error('Usage: GITLAB_TOKEN=… node tools/take-cross-baselines.mjs <pipeline id>  (the pipeline whose cross-browser visual jobs failed)');
  process.exit(2);
}
const headers = { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN };
const get = async (p, opts = {}) => {
  const r = await fetch(`${API}${p}`, { headers, ...opts });
  if (r.status >= 400) throw new Error(`GitLab answered ${r.status} for ${p}`);
  return r;
};

const jobs = await (await get(`/pipelines/${pipeline}/jobs?per_page=100&include_retried=false`)).json();
let wrote = 0;
for (const browser of ['firefox', 'webkit']) {
  const job = jobs.find((j) => j.name === `cross-browser: [${browser}, visual]`);
  if (!job) { console.log(`${browser}: no visual job in pipeline ${pipeline}`); continue; }
  if (job.status === 'success') { console.log(`${browser}: job ${job.id} passed; nothing to take`); continue; }
  // The archive comes from a signed CDN link: follow it by hand, so the token isn't sent to that host.
  let r = await get(`/jobs/${job.id}/artifacts`, { redirect: 'manual' });
  if (r.status >= 300 && r.status < 400) r = await fetch(r.headers.get('location'));
  if (!r.ok) throw new Error(`${browser}: the artifacts of job ${job.id} answered ${r.status}`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `serupa-${browser}-`));
  fs.writeFileSync(path.join(dir, 'a.zip'), Buffer.from(await r.arrayBuffer()));
  const base = `tools/test/baseline-visual-${browser}`;
  const unzip = spawnSync('unzip', ['-q', '-o', path.join(dir, 'a.zip'), `${base}/*.actual.png`, '-d', path.join(dir, 'out')], { encoding: 'utf8' });
  // 11: no .actual.png in the archive (the job failed for another reason).
  if (unzip.error || ![0, 11].includes(unzip.status)) throw new Error(`unzip ${unzip.error ? 'is missing' : `failed: ${unzip.stderr}`}`);
  const from = path.join(dir, 'out', base);
  const files = fs.existsSync(from) ? fs.readdirSync(from, { recursive: true }).map(String).filter((f) => f.endsWith('.actual.png')) : [];
  for (const f of files.sort()) {
    const to = path.join(PROJECT, base, f.replace(/\.actual\.png$/, '.png'));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(from, f), to);
    console.log(`${browser}: ${path.relative(PROJECT, to)}`);
  }
  if (!files.length) console.log(`${browser}: job ${job.id} failed with no picture to take; read its log`);
  wrote += files.length;
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log(wrote ? `\nWrote ${wrote} pictures. Look at them, then commit them with the change that moved them.` : '\nNothing written.');
