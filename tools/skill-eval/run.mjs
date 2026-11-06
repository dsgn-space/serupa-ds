// Runs the skill eval: each task in tasks.json goes to a coding agent (Claude Code's `claude -p`, in an empty folder,
// with no tools) several times with the Serupa skill (skills/serupa/SKILL.md) as its instructions and as many times
// without, and grade.mjs scores every answer. One sample per task can't tell a better skill from a worse one: a check
// that passes 3 times in 5 is a different result from 5 in 5, where one run would show either as a pass or a fail.
// Writes the answers to tools/skill-eval/results/<date>/{with,without}/<task>.<run>.tsx, each run's cost, tokens and
// time to meta.json beside them, and the two tables to tools/skill-eval/results/<date>.md. Run it again when the skill
// changes, and commit the results: an edit that makes agents worse shows up as lower pass counts.
//   node tools/skill-eval/run.mjs [--runs 5] [--jobs 4] [--model <name>] [--only sign-in,filters]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { TASKS, gradeDir, lines, startOf, table } from './grade.mjs';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const model = arg('--model');
const only = arg('--only')?.split(',');
const runs = Number(arg('--runs') ?? 5);
const jobs = Number(arg('--jobs') ?? 4);
const date = new Date().toISOString().slice(0, 10);
const out = path.join(HERE, 'results', date);
const skill = fs.readFileSync(path.join(ROOT, 'skills/serupa/SKILL.md'), 'utf8');
const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-eval-'));

const ASK = 'Write it as one React component in TypeScript (TSX), in a project that has serupa-ds installed and its CSS loaded. '
  + 'Reply with the code only, in one ```tsx block.';
const CHANGE = 'Reply with the whole changed file, code only, in one ```tsx block.';
/** One answer, with what it cost: { code, cost (USD), tokens (in and out), ms }. */
function answer(task, withSkill) {
  const start = startOf(task);
  const ask = start ? `This is the file as it is now, in a project that has serupa-ds installed and its CSS loaded:\n\n\`\`\`tsx\n${start}\`\`\`\n\n${CHANGE}` : ASK;
  const prompt = (withSkill ? `Use this skill:\n\n<skill>\n${skill}\n</skill>\n\n` : '') + `${task.prompt}\n\n${ask}`;
  const args = ['-p', prompt, '--output-format', 'json', '--disallowedTools', 'Bash,Edit,Write,Read,Glob,Grep,WebFetch,WebSearch,Agent'];
  if (model) args.push('--model', model);
  return new Promise((resolve, reject) => {
    execFile('claude', args, { cwd: empty, encoding: 'utf8', maxBuffer: 16 << 20, timeout: 600_000 }, (err, stdout) => {
      if (err) return reject(err);
      const r = JSON.parse(stdout), u = r.usage ?? {};
      const reply = String(r.result ?? '');
      resolve({
        code: /```(?:tsx|jsx|typescript|ts)?\n([\s\S]*?)```/.exec(reply)?.[1] ?? reply,
        cost: r.total_cost_usd ?? 0,
        tokens: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.output_tokens ?? 0),
        ms: r.duration_ms ?? 0,
      });
    });
  });
}

const work = [];
for (const mode of ['with', 'without']) {
  fs.mkdirSync(path.join(out, mode), { recursive: true });
  for (const t of TASKS) if (!only || only.includes(t.id)) for (let n = 1; n <= runs; n++) work.push({ mode, t, n });
}
const meta = { with: {}, without: {} };
let next = 0, finished = 0;
async function worker() {
  while (next < work.length) {
    const { mode, t, n } = work[next++];
    const a = await answer(t, mode === 'with');
    fs.writeFileSync(path.join(out, mode, `${t.id}.${n}.tsx`), a.code);
    (meta[mode][t.id] ??= []).push({ run: n, cost: a.cost, tokens: a.tokens, ms: a.ms, lines: lines(a.code) });
    console.log(`${++finished}/${work.length} ${mode} skill: ${t.id} #${n}`);
  }
}
await Promise.all(Array.from({ length: Math.min(jobs, work.length) }, worker));

const version = execFileSync('claude', ['--version'], { encoding: 'utf8' }).trim();
const report = [`# Skill eval, ${date}`, '', `Claude Code ${version}${model ? `, model ${model}` : ''}. ${runs} run${runs === 1 ? '' : 's'} of each task per mode. `
  + 'A cell is how many runs passed that check; a bold one failed at least once. Lines, cost, tokens and seconds are means per answer: '
  + 'reuse should make answers shorter as well as better.', ''];
for (const mode of ['with', 'without']) {
  for (const id of Object.keys(meta[mode])) meta[mode][id].sort((x, y) => x.run - y.run);
  fs.writeFileSync(path.join(out, mode, 'meta.json'), JSON.stringify(meta[mode], null, 2) + '\n');
  report.push(`## ${mode === 'with' ? 'With' : 'Without'} the skill`, '', table(gradeDir(path.join(out, mode)).filter((r) => !only || only.includes(r.id))));
}
fs.writeFileSync(path.join(HERE, 'results', date + '.md'), report.join('\n'));
console.log(`\nWrote tools/skill-eval/results/${date}.md`);
