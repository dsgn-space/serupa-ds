// The review skill's eval (PN6): does skills/serupa-review/SKILL.md make a coding agent find the problems in a UI
// change? Each case in reviews.json is a file with problems planted in it, or none (a clean change, where a good
// review finds nothing to stop it). It goes to Claude Code (`claude -p`, in an empty folder, with no tools) several
// times with the two Serupa skills as its instructions and as many times without, and each review is graded on:
//   found     the planted problems it names (each has a pattern a review that found it can't avoid: the component
//             that replaces a hand-built one, the quoted words, "placeholder")
//   placed    of those, the ones under the right heading (Must fix or Should fix), as the skill's format asks
//   verdict   a "Verdict:" line that says "Not ready" when anything was planted, and "Ready to merge" when not
//   no alarm  for a clean change: nothing under Must fix
// Reviews go to tools/skill-eval/results/<date>-review/{with,without}/<case>.<run>.md and the table to
// results/<date>-review.md.
//   node tools/skill-eval/review.mjs [--runs 5] [--jobs 4] [--model <name>] [--only invite-member]
//   node tools/skill-eval/review.mjs --grade <dir>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../..');
export const REVIEWS = JSON.parse(fs.readFileSync(path.join(HERE, 'reviews.json'), 'utf8'));
export const sourceOf = (c) => fs.readFileSync(path.join(HERE, 'reviews', c.file), 'utf8');

const HEADING = /^(?:#{1,6}\s*|\*\*)?\s*(Must fix|Should fix|Nice to have)\b.*$/gim;
/** Which heading each part of a review sits under: [{ at, level }] in order, level "must" | "should" | "nice". */
function sections(text) {
  return [...text.matchAll(HEADING)].map((m) => ({ at: m.index, level: m[1].toLowerCase().split(' ')[0] }));
}
const levelAt = (secs, i) => secs.filter((s) => s.at <= i).at(-1)?.level ?? null;

/** One review graded against its case: the planted problems it found and placed, its verdict, a false alarm. */
export function gradeReview(text, c) {
  const secs = sections(text);
  const found = [], placed = [];
  for (const p of c.planted) {
    const re = new RegExp(p.find, p.case ? 'g' : 'gi');
    // Only past the first heading when there is one, so a summary before the findings doesn't count as placed.
    const hits = [...text.matchAll(re)].map((m) => m.index);
    if (!hits.length) continue;
    found.push(p.id);
    if (hits.some((i) => levelAt(secs, i) === p.level)) placed.push(p.id);
  }
  const verdictLine = /^\W*Verdict\W*:?\W*(.*)$/im.exec(text)?.[1] ?? '';
  const verdict = c.planted.length ? /not ready/i.test(verdictLine) : /ready to merge/i.test(verdictLine) && !/not ready/i.test(verdictLine);
  const alarm = !c.planted.length && secs.some((s) => s.level === 'must');
  return { found, placed, verdict, alarm };
}

/** A folder of reviews (<case>.<run>.md) graded: one row per case. */
export function gradeDir(dir) {
  return REVIEWS.map((c) => {
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.startsWith(`${c.id}.`) && f.endsWith('.md')).sort() : [];
    return { c, runs: files.map((f) => gradeReview(fs.readFileSync(path.join(dir, f), 'utf8'), c)) };
  }).filter((r) => r.runs.length);
}

/** The Markdown table for one mode: a row per case, then each planted problem's find count. */
export function table(rows) {
  const out = ['| Case | Found | Placed | Verdict | No alarm |', '|---|---|---|---|---|'];
  let found = 0, total = 0;
  for (const { c, runs } of rows) {
    const n = runs.length, k = c.planted.length;
    const f = runs.reduce((s, r) => s + r.found.length, 0), p = runs.reduce((s, r) => s + r.placed.length, 0);
    found += f; total += n * k;
    out.push(`| ${c.id} | ${k ? `${f}/${n * k}` : '-'} | ${k ? `${p}/${n * k}` : '-'} | ${runs.filter((r) => r.verdict).length}/${n} | ${k ? '-' : `${runs.filter((r) => !r.alarm).length}/${n}`} |`);
  }
  const each = rows.filter((r) => r.c.planted.length).map(({ c, runs }) => `- ${c.id}: ${c.planted.map((p) => `${p.id} (${p.level}) ${runs.filter((r) => r.found.includes(p.id)).length}/${runs.length}`).join(', ')}`);
  return `${out.join('\n')}\n\n**${found} of ${total} planted problems found (${total ? Math.round((100 * found) / total) : 0}%).**\n\nEach planted problem, found in how many runs:\n\n${each.join('\n')}\n`;
}

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (arg('--grade')) { process.stdout.write(table(gradeDir(path.resolve(arg('--grade'))))); process.exit(0); }
  const model = arg('--model'), only = arg('--only')?.split(','), runs = Number(arg('--runs') ?? 5), jobs = Number(arg('--jobs') ?? 4);
  const date = new Date().toISOString().slice(0, 10);
  const out = path.join(HERE, 'results', `${date}-review`);
  const skills = ['serupa', 'serupa-review'].map((s) => fs.readFileSync(path.join(ROOT, 'skills', s, 'SKILL.md'), 'utf8'));
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-review-'));
  const ask = (c, withSkill) => (withSkill ? `Use these two skills:\n\n<skill>\n${skills[0]}\n</skill>\n\n<skill>\n${skills[1]}\n</skill>\n\n` : '')
    + `${c.prompt} The project uses serupa-ds. This is the new file:\n\n\`\`\`tsx\n${sourceOf(c)}\`\`\`\n\nReply with the review only.`;
  const review = (c, withSkill) => new Promise((resolve, reject) => {
    const args = ['-p', ask(c, withSkill), '--output-format', 'json', '--disallowedTools', 'Bash,Edit,Write,Read,Glob,Grep,WebFetch,WebSearch,Agent'];
    if (model) args.push('--model', model);
    execFile('claude', args, { cwd: empty, encoding: 'utf8', maxBuffer: 16 << 20, timeout: 600_000 }, (err, stdout) => (err ? reject(err) : resolve(String(JSON.parse(stdout).result ?? ''))));
  });
  const work = [];
  for (const mode of ['with', 'without']) {
    fs.mkdirSync(path.join(out, mode), { recursive: true });
    for (const c of REVIEWS) if (!only || only.includes(c.id)) for (let n = 1; n <= runs; n++) work.push({ mode, c, n });
  }
  let next = 0, finished = 0;
  const worker = async () => {
    while (next < work.length) {
      const { mode, c, n } = work[next++];
      fs.writeFileSync(path.join(out, mode, `${c.id}.${n}.md`), await review(c, mode === 'with'));
      console.log(`${++finished}/${work.length} ${mode} skills: ${c.id} #${n}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(jobs, work.length) }, worker));
  const version = execFileSync('claude', ['--version'], { encoding: 'utf8' }).trim();
  fs.writeFileSync(path.join(HERE, 'results', `${date}-review.md`), [`# Review skill eval, ${date}`, '',
    `Claude Code ${version}${model ? `, model ${model}` : ''}. ${runs} runs of each case per mode. Found: planted problems the review names, over all runs. Placed: of those, the ones under the right heading. Verdict: runs whose "Verdict:" line is right. No alarm: runs of the clean case with nothing under Must fix.`, '',
    '## With the skills', '', table(gradeDir(path.join(out, 'with'))), '## Without', '', table(gradeDir(path.join(out, 'without')))].join('\n'));
  console.log(`\nWrote tools/skill-eval/results/${date}-review.md`);
}
