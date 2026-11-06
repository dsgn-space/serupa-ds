// Benchmarks over time (F9, 89): the mount-time and INP tests (src/internal/mountTime.test.tsx, inp.test.tsx) each
// have a budget that fails a story several times too slow, but a story that gets 10% slower each month passes them
// for a year. With SERUPA_BENCH=<folder> those tests also write every time they measure; this gathers them into one
// file and compares it with the previous night's, so a slow drift shows up as a change on one night.
//   SERUPA_BENCH=.bench npx vitest run --project components --no-file-parallelism src/internal/{mountTime,inp}.test.tsx
// Run that twice into the one folder: each time counts as the faster of the two, and the test files run one at a
// time so they don't share the processor.
//   node tools/test/bench.mjs .bench --json bench.json                         gather them
//   node tools/test/bench.mjs .bench --json bench.json --previous last.json    and compare with an earlier run
// It fails when a component's stories together take half as long again to mount as before (and 3 ms more), when every
// story together takes a fifth longer, or when an answer takes half as long again (and two frames more). Mount
// times are compared a component at a time, not a story at a time: on one machine, two such nights an hour apart
// had 2 of 626 stories two or three times slower, each with another story of the same component that much faster
// (VirtualList's Links and MixedHeights swapped 1.1 and 3.5 ms), while no component's total moved by more than 35%.
// Each story's change is still listed. Without a folder (the checks project) it tests the comparison itself.
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';

const RATIO = 1.5, TOTAL_RATIO = 1.2;
const FLOOR = { mount: 3, inp: 32 };
// Event Timing reports nothing under 16 ms, which inp.test.tsx writes as 0: count it as 16.
const LEAST = { mount: 0, inp: 16 };

/** The times a SERUPA_BENCH folder holds: { mount: { "Button/Playground": ms }, inp: { … } }. */
export function gather(dir) {
  const out = { mount: {}, inp: {} };
  for (const suite of Object.keys(out)) {
    const file = path.join(dir, `${suite}.jsonl`);
    if (!fs.existsSync(file)) continue;
    // A folder can hold several runs of the tests: the fastest of them counts.
    for (const line of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
      for (const [name, ms] of Object.entries(JSON.parse(line))) out[suite][name] = Math.min(out[suite][name] ?? Infinity, ms);
    }
  }
  return out;
}

const change = (suite, name, was, now) => {
  const a = Math.max(was, LEAST[suite]), b = Math.max(now, LEAST[suite]);
  return { suite, name, was, now, ratio: a ? b / a : 1, past: b > a * RATIO && b - a > FLOOR[suite] };
};

/** What changed from `before` to `now`: what got slower past the noise (components, all stories, answers), and
 *  each story's and answer's change, largest first. Only what both runs measured is compared. */
export function compare(before, now) {
  const changes = [], slower = [];
  const components = new Map();
  for (const [name, ms] of Object.entries(now.mount || {})) {
    const was = before.mount?.[name];
    if (was === undefined) continue;
    changes.push(change('mount', name, was, ms));
    const c = name.split('/')[0], sum = components.get(c) || { was: 0, now: 0 };
    components.set(c, { was: sum.was + was, now: sum.now + ms });
  }
  for (const [c, { was, now: ms }] of components) { const x = change('mount', `${c} (its stories together)`, was, ms); if (x.past) slower.push(x); }
  const all = [...components.values()].reduce((s, v) => ({ was: s.was + v.was, now: s.now + v.now }), { was: 0, now: 0 });
  if (all.was && all.now > all.was * TOTAL_RATIO) slower.push({ ...change('mount', 'every story together', all.was, all.now), past: true });
  for (const [name, ms] of Object.entries(now.inp || {})) {
    const was = before.inp?.[name];
    if (was === undefined) continue;
    const x = change('inp', name, was, ms);
    changes.push(x);
    if (x.past) slower.push(x);
  }
  changes.sort((x, y) => y.ratio - x.ratio);
  return { slower, changes, all };
}

const line = (c) => `${c.suite === 'mount' ? 'mount' : 'INP  '}  ${c.name}: ${c.was.toFixed(1)} → ${c.now.toFixed(1)} ms (×${c.ratio.toFixed(2)})`;

const args = process.argv.slice(2);
const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : null);
const dir = !process.env.VITEST && args[0] && !args[0].startsWith('--') ? args[0] : null;

if (dir) {
  const now = gather(dir);
  const count = Object.keys(now.mount).length + Object.keys(now.inp).length;
  if (!count) { console.log(`FAIL  ${dir} holds no times: run the tests with SERUPA_BENCH=${dir}`); process.exit(1); }
  if (value('--json')) fs.writeFileSync(value('--json'), JSON.stringify(now, null, 2) + '\n');
  console.log(`${Object.keys(now.mount).length} mount times, ${Object.keys(now.inp).length} INP times`);
  const prevFile = value('--previous');
  if (!prevFile || !fs.existsSync(prevFile)) { console.log('No earlier run to compare with: this one is the first.'); process.exit(0); }
  const result = compare(JSON.parse(fs.readFileSync(prevFile, 'utf8')), now), { slower, changes } = result;
  for (const c of slower) console.log(`FAIL  ${line(c)}`);
  console.log('\nLargest changes:');
  for (const c of [...changes.slice(0, 10), ...changes.slice(-5).reverse()]) console.log(`      ${line(c)}`);
  console.log(`\nEvery story together: ${result.all.was.toFixed(0)} → ${result.all.now.toFixed(0)} ms`);
  process.exit(slower.length ? 1 : 0);
}

// The checks project: the comparison, on times made up for it.
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const before = { mount: { 'A/x': 4, 'A/y': 2, 'B/x': 1, 'C/x': 10, 'E/x': 1, 'E/y': 4 }, inp: { 'Menu: open': 0, 'Dialog: open': 24 } };
const { slower } = compare(before, { mount: { 'A/x': 7, 'A/y': 3, 'B/x': 2.5, 'C/x': 12, 'D/x': 50, 'E/x': 4, 'E/y': 1 }, inp: { 'Menu: open': 40, 'Dialog: open': 80 } });
const names = slower.map((c) => c.name).sort();
t('a component whose stories together take half as long again and 3 ms more is slower (6 → 10 ms)', names.includes('A (its stories together)'), JSON.stringify(names));
t('a component that grows inside the noise is not (1 → 2.5 ms)', !names.includes('B (its stories together)'), JSON.stringify(names));
t('a component 20% slower is not (10 → 12 ms)', !names.includes('C (its stories together)'), JSON.stringify(names));
t('two stories of one component that swap times are not (1 and 4 → 4 and 1 ms)', !names.includes('E (its stories together)'), JSON.stringify(names));
t('a story with no earlier time is not compared', !names.includes('D (its stories together)'), JSON.stringify(names));
t('every story together a fifth slower is (22 → 29.5 ms)', names.includes('every story together'), JSON.stringify(names));
t('an answer under 16 ms counts as 16, so 0 → 40 ms is inside two frames', !names.includes('Menu: open'), JSON.stringify(names));
t('an answer that goes from 24 to 80 ms is slower', names.includes('Dialog: open'), JSON.stringify(names));
t('the same times are never slower', !compare(before, before).slower.length);
const twice = fs.mkdtempSync(path.join(PROJECT, '.bench-test-'));
try {
  fs.writeFileSync(path.join(twice, 'mount.jsonl'), '{"A/x":9,"B/x":1}\n{"A/x":4}\n');
  const g = gather(twice);
  t('of two runs in one folder, the faster time counts', g.mount['A/x'] === 4 && g.mount['B/x'] === 1 && !Object.keys(g.inp).length, JSON.stringify(g));
} finally { fs.rmSync(twice, { recursive: true, force: true }); }

done(report('Benchmarks over time', R));
