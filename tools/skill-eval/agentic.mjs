// The skill eval's agentic mode (PN2): the agent works as it would in a real project, and is graded on what it leaves
// behind rather than on its text. Each run makes a fresh app with serupa-create, with the package installed as a
// release ships it (npm pack of this build) and the rest of node_modules linked to the repository's, so nothing is
// downloaded. Claude Code (`claude -p`) then gets the task in that folder with its file tools and `npm run`, and either
// the app's AGENTS.md and CLAUDE.md (with: they send it to node_modules/serupa-ds/skills/serupa/SKILL.md) or neither
// (without). The checks it doesn't see:
//   typecheck  the app's `npm run typecheck`
//   lint       the app's `npm run lint`: jsx-a11y, serupa-ds/eslint and serupa-ds/stylelint
//   render     `vite build`, then the page in Chromium: something rendered, and no page error or console error
//   axe        no WCAG 2.2 A or AA violation from axe-core, in each of the six themes
//   tab        Tab from the top of the page reaches every visible control
//   task       the agent did the task: src/App.tsx is no longer the starter's, and it imports at least half of the
//              components the task expects (tasks.json, "A|B" for either) from serupa-ds
// The starter app already passes the other five, so a run whose agent failed (not signed in, timed out, no JSON)
// fails every check, with the error as the reason, rather than scoring the untouched starter.
// The code-reading grader (run.mjs, grade.mjs) stays the fast mode: these runs take minutes each.
// Results go to tools/skill-eval/results/<date>-agentic/{with,without}/<task>.<run>/ (the app's src/ and grade.json)
// and the table to results/<date>-agentic.md.
//   node tools/skill-eval/agentic.mjs [--runs 3] [--jobs 3] [--model <name>] [--only sign-in,filters]
//   node tools/skill-eval/agentic.mjs --grade <app dir>    grade one app folder (its node_modules in place)
// Needs the build (npm run build), the `claude` CLI signed in, and Playwright's Chromium.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile, execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { files } from '../../bin/serupa-create.mjs';
import { packShipped } from '../test/pack.mjs';
import { browser, serve } from '../test/lib.mjs';
import { TASKS } from './grade.mjs';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../..');
export const CHECKS = ['typecheck', 'lint', 'render', 'axe', 'tab', 'task'];
const THEMES = ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark'];
const AXE = fs.readFileSync(path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
const npm = (args, cwd) => spawnSync('npm', args, { cwd, encoding: 'utf8', timeout: 300_000 });
const tail = (s, n = 600) => s.trim().split('\n').slice(-8).join('\n').slice(-n);

/** A new app in dir: serupa-create's files, the packed serupa-ds unpacked into node_modules, the rest linked. */
export function makeApp(dir, unpacked, withSkill) {
  for (const [file, text] of Object.entries(files({ name: 'eval-app', serupa: 'file:serupa-ds.tgz', brand: 'blue' }))) {
    if (!withSkill && (file === 'AGENTS.md' || file === 'CLAUDE.md')) continue;
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  }
  const modules = path.join(dir, 'node_modules');
  fs.mkdirSync(modules);
  for (const name of fs.readdirSync(path.join(ROOT, 'node_modules'))) {
    if (!name.startsWith('.') && name !== 'serupa-ds') fs.symlinkSync(path.join(ROOT, 'node_modules', name), path.join(modules, name), 'junction');
  }
  fs.cpSync(unpacked, path.join(modules, 'serupa-ds'), { recursive: true });
  fs.mkdirSync(path.join(modules, '.bin'));
  // The repository's tools (tsc, eslint, stylelint, vite), as npm run finds them.
  const bins = path.join(ROOT, 'node_modules', '.bin');
  for (const bin of fs.readdirSync(bins)) fs.symlinkSync(fs.realpathSync(path.join(bins, bin)), path.join(modules, '.bin', bin));
}

/** Whether the app in dir (or a results folder with its src/) did the task: { ok, why }. */
export function didTask(dir, task) {
  const src = path.join(dir, 'src');
  const code = fs.existsSync(src) ? fs.readdirSync(src, { recursive: true }).filter((f) => /\.tsx?$/.test(String(f))).map((f) => fs.readFileSync(path.join(src, String(f)), 'utf8')) : [];
  const starter = files({ name: 'eval-app', serupa: 'file:serupa-ds.tgz', brand: 'blue' })['src/App.tsx'];
  const app = fs.existsSync(path.join(src, 'App.tsx')) ? fs.readFileSync(path.join(src, 'App.tsx'), 'utf8') : '';
  if (app.trim() === String(starter).trim()) return { ok: false, why: 'src/App.tsx is still the starter' };
  const used = new Set(code.flatMap((c) => [...c.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']serupa-ds["']/g)].flatMap((m) => m[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0]).filter(Boolean))));
  const expect = task?.expect ?? [];
  const missing = expect.filter((n) => !n.split('|').some((alt) => used.has(alt)));   // "Dialog|AlertDialog": either one
  return { ok: expect.length - missing.length >= Math.ceil(expect.length / 2), why: missing.length ? `doesn't use ${missing.join(', ')}` : '' };
}

/** The hidden checks on an app folder: { check: { ok, why } }. */
export async function gradeApp(dir) {
  const r = {};
  const tc = npm(['run', '-s', 'typecheck'], dir);
  r.typecheck = { ok: tc.status === 0, why: tail(tc.stdout + tc.stderr) };
  const lint = npm(['run', '-s', 'lint'], dir);
  r.lint = { ok: lint.status === 0, why: tail(lint.stdout + lint.stderr) };
  const build = npm(['run', '-s', 'build'], dir);
  if (build.status !== 0) {
    for (const c of ['render', 'axe', 'tab']) r[c] = { ok: false, why: `vite build failed: ${tail(build.stdout + build.stderr)}` };
    return r;
  }
  const { base, close } = serve(path.join(dir, 'dist'));
  const b = await browser();
  try {
    const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const text = await page.evaluate(() => (document.getElementById('root')?.innerText || '').trim().length);
    r.render = { ok: text > 0 && !errors.length, why: errors.length ? errors.slice(0, 3).join(' | ') : text > 0 ? '' : 'nothing rendered in #root' };

    await page.addScriptTag({ content: AXE });
    const found = [];
    for (const theme of THEMES) {
      const v = await page.evaluate(async (t) => {
        document.documentElement.setAttribute('data-theme', t);
        // The theme's colors change through transitions: wait them out, or axe measures a color halfway there.
        await new Promise((res) => setTimeout(res, 50));
        // Only finite ones, and at most 2 s: a spinner's animation never finishes.
        const finite = document.getAnimations().filter((x) => Number.isFinite(x.effect?.getComputedTiming().endTime));
        await Promise.race([Promise.all(finite.map((x) => x.finished.catch(() => undefined))), new Promise((res) => setTimeout(res, 2000))]);
        // @ts-expect-error axe is the script added above
        const out = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] });
        return out.violations.map((x) => `${x.id} (${x.nodes.length})`);
      }, theme);
      if (v.length) found.push(`${theme}: ${v.join(', ')}`);
    }
    r.axe = { ok: !found.length, why: found.slice(0, 3).join('; ') };

    // Every visible control, numbered, then Tab from the top until focus comes round or runs out.
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
    await page.reload({ waitUntil: 'networkidle' });
    const total = await page.evaluate(() => {
      const sel = 'a[href], button, input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable=true]';
      // tabindex="-1" is out of the Tab order on purpose: the other options of a roving group (SegmentedControl, Tabs).
      const els = [...document.querySelectorAll(sel)].filter((e) => e.getAttribute('tabindex') !== '-1' && !e.closest('[inert], [hidden]') && !(/** @type {any} */ (e).disabled)
        && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
      // A radio group is one Tab stop: count each group once.
      const seen = new Set();
      let n = 0;
      for (const e of els) {
        const radio = e instanceof HTMLInputElement && e.type === 'radio' && e.name ? e.name : null;
        if (radio && seen.has(radio)) continue;
        if (radio) seen.add(radio);
        const id = String(n++);
        e.setAttribute('data-eval-tab', id);
        if (radio) for (const o of els) if (o instanceof HTMLInputElement && o.type === 'radio' && o.name === radio) o.setAttribute('data-eval-tab', id);
      }
      return n;
    });
    const reached = new Set();
    for (let i = 0; i < total * 2 + 5; i++) {
      await page.keyboard.press('Tab');
      const at = await page.evaluate(() => document.activeElement?.closest('[data-eval-tab]')?.getAttribute('data-eval-tab') ?? null);
      if (at !== null) reached.add(at);
      if (reached.size === total) break;
    }
    const missed = await page.evaluate((got) => [...document.querySelectorAll('[data-eval-tab]')].filter((e) => !got.includes(e.getAttribute('data-eval-tab')))
      .map((e) => `${e.tagName.toLowerCase()}${e.getAttribute('aria-label') ? `[${e.getAttribute('aria-label')}]` : ''} "${(e.textContent || '').trim().slice(0, 20)}"`), [...reached]);
    r.tab = { ok: total > 0 && !missed.length, why: !total ? 'no controls on the page' : missed.length ? `not reached: ${[...new Set(missed)].slice(0, 4).join(', ')}` : '' };
  } finally {
    await b.close();
    close();
  }
  return r;
}

const PROMPT = (task) => `${task.prompt} Make it this app's page: src/App.tsx renders it.`;
/** One agent run in the app folder: { cost, ms }. */
function work(dir, task, model) {
  const args = ['-p', PROMPT(task), '--output-format', 'json', '--permission-mode', 'acceptEdits',
    '--allowedTools', 'Read,Edit,Write,Glob,Grep,Bash(npm run *),Bash(ls *),Bash(cat *)', '--disallowedTools', 'WebFetch,WebSearch,Agent'];
  if (model) args.push('--model', model);
  return new Promise((resolve) => {
    execFile('claude', args, { cwd: dir, encoding: 'utf8', maxBuffer: 32 << 20, timeout: 1_200_000 }, (err, stdout) => {
      try { const r = JSON.parse(stdout); resolve({ cost: r.total_cost_usd ?? 0, ms: r.duration_ms ?? 0, error: err ? String(err.message).slice(0, 200) : '' }); }
      catch { resolve({ cost: 0, ms: 0, error: String(err?.message ?? 'no output').slice(0, 200) }); }
    });
  });
}

/** A mode's results as a Markdown table: each check's passes over the runs, then why each failing check failed. */
export function table(rows) {
  const cols = [...CHECKS, 'Passed', 'Cost ($)', 'Minutes'];
  const body = rows.map(({ id, runs }) => {
    const cell = (c) => { const k = runs.filter((x) => x.grade[c]?.ok).length; return k === runs.length ? `${k}/${runs.length}` : `**${k}/${runs.length}**`; };
    const passed = runs.reduce((s, x) => s + CHECKS.filter((c) => x.grade[c]?.ok).length, 0);
    // The mean of the runs that recorded it (a run graded again later has no cost or time), or a dash.
    const mean = (k, d, digits) => { const v = runs.map((x) => x[k]).filter(Number.isFinite); return v.length ? (v.reduce((s, x) => s + x, 0) / v.length / d).toFixed(digits) : '–'; };
    return `| ${[id, ...CHECKS.map(cell), `${Math.round((100 * passed) / (runs.length * CHECKS.length))}%`, mean('cost', 1, 2), mean('ms', 60000, 1)].join(' | ')} |`;
  });
  const all = rows.flatMap((r) => r.runs), passed = all.reduce((s, x) => s + CHECKS.filter((c) => x.grade[c]?.ok).length, 0);
  const why = rows.flatMap(({ id, runs }) => CHECKS.map((c) => {
    const w = [...new Set(runs.filter((x) => !x.grade[c]?.ok).map((x) => (x.grade[c]?.why || '').replace(/\s+/g, ' ').slice(0, 240)))];
    return w.length ? `- ${id}, ${c}: ${w.join('; ').replace(/[\\|]/g, '\\$&')}` : '';
  })).filter(Boolean);
  return `| Task | ${cols.join(' | ')} |\n|---|${cols.map(() => '---').join('|')}|\n${body.join('\n')}\n\n`
    + `**${passed} of ${all.length * CHECKS.length} checks passed (${all.length ? Math.round((100 * passed) / (all.length * CHECKS.length)) : 0}%).**\n`
    + (why.length ? `\nWhy checks failed:\n\n${why.join('\n')}\n` : '');
}

/** A results folder read back: rows of { id, runs: [{ grade, cost, ms }] }. */
export function readDir(dir) {
  const byTask = new Map();
  for (const name of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
    const f = path.join(dir, name, 'grade.json');
    if (!fs.existsSync(f)) continue;
    const id = name.replace(/\.\d+$/, '');
    if (!byTask.has(id)) byTask.set(id, []);
    const run = JSON.parse(fs.readFileSync(f, 'utf8'));
    // A run graded before the task check (or before a failed agent run failed every check) is graded on its files.
    if (run.error) run.grade = Object.fromEntries(CHECKS.map((c) => [c, { ok: false, why: `the agent run failed: ${run.error}` }]));
    else if (!run.grade.task) run.grade.task = didTask(path.join(dir, name), TASKS.find((t) => t.id === id));
    byTask.get(id).push(run);
  }
  return [...byTask].map(([id, runs]) => ({ id, runs }));
}

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (arg('--grade')) { console.log(JSON.stringify(await gradeApp(path.resolve(arg('--grade'))), null, 2)); process.exit(0); }
  if (!fs.existsSync(path.join(ROOT, 'dist', 'index.js'))) { console.error('Nothing built: run npm run build first.'); process.exit(1); }
  const model = arg('--model'), only = arg('--only')?.split(','), runs = Number(arg('--runs') ?? 3), jobs = Number(arg('--jobs') ?? 3);
  const date = new Date().toISOString().slice(0, 10);
  const out = path.join(HERE, 'results', `${date}-agentic`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-agentic-'));
  const tarball = packShipped(ROOT, tmp);
  execFileSync('tar', ['-xzf', tarball, '-C', tmp]);
  const unpacked = path.join(tmp, 'package');
  const queue = [];
  for (const mode of ['with', 'without']) for (const t of TASKS) if (!t.start && (!only || only.includes(t.id))) for (let n = 1; n <= runs; n++) queue.push({ mode, t, n });
  let next = 0, finished = 0;
  const worker = async () => {
    while (next < queue.length) {
      const { mode, t, n } = queue[next++];
      const app = path.join(tmp, `${mode}-${t.id}-${n}`);
      makeApp(app, unpacked, mode === 'with');
      const a = await work(app, t, model);
      const grade = a.error ? Object.fromEntries(CHECKS.map((c) => [c, { ok: false, why: `the agent run failed: ${a.error}` }])) : { ...(await gradeApp(app)), task: didTask(app, t) };
      const dest = path.join(out, mode, `${t.id}.${n}`);
      fs.mkdirSync(dest, { recursive: true });
      fs.cpSync(path.join(app, 'src'), path.join(dest, 'src'), { recursive: true });
      fs.writeFileSync(path.join(dest, 'grade.json'), JSON.stringify({ grade, cost: a.cost, ms: a.ms, error: a.error }, null, 2) + '\n');
      console.log(`${++finished}/${queue.length} ${mode} skill: ${t.id} #${n}: ${CHECKS.filter((c) => grade[c].ok).length}/${CHECKS.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, worker));
  fs.rmSync(tmp, { recursive: true, force: true });
  const version = execFileSync('claude', ['--version'], { encoding: 'utf8' }).trim();
  fs.writeFileSync(path.join(HERE, 'results', `${date}-agentic.md`), [`# Skill eval, agentic mode, ${date}`, '',
    `Claude Code ${version}${model ? `, model ${model}` : ''}. ${runs} runs of each task per mode, each in a fresh serupa-create app with its tools. `
    + 'With: the app\'s AGENTS.md and CLAUDE.md send the agent to the skill. Without: the app has neither. A cell is how many runs passed that hidden check.', '',
    '## With the skill', '', table(readDir(path.join(out, 'with'))), '## Without the skill', '', table(readDir(path.join(out, 'without')))].join('\n'));
  console.log(`\nWrote tools/skill-eval/results/${date}-agentic.md`);
}
