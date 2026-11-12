/// <reference types="vite/client" />
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { describe, expect, inject, test } from 'vitest';
import { commands } from 'vitest/browser';
import { storiesToRun } from '../../tools/test/vitest/stories';

// How long each story takes to mount (F9), as React's Profiler counts it: the render and commit of the first mount,
// the fastest of five so a slow tick of the machine doesn't count. A story that takes longer than BUDGET to mount
// fails. This is React's development build, slower than an app's production one: the slowest story here took about
// 9 ms on 25 Oct 2026 (NumberInput/Currency), most take under 4, and 20 leaves room for a slower CI machine.
// The nightly Benchmarks run keeps each time (SERUPA_BENCH, tools/test/bench.mjs), so a story that slowly gets
// slower shows long before it reaches its budget.
const BUDGET = 20;
// Each PhoneInput lists every country (244 options) and takes about 7 to 9 ms to mount here, so its stories get a
// budget of their own until the list is made cheaper. A pull request's CI run measured one PhoneInput at 21 to 28 ms
// on 30 Oct 2026, three times the local time, so each budget is about five times what it takes here: one PhoneInput
// 40 ms, States (four of them, 23 ms here) 120 and ByArea (six, 57 ms here) 280.
const OWN_BUDGET: Record<string, number> = {
  'PhoneInput/Controlled': 40, 'PhoneInput/InAField': 40, 'PhoneInput/LongValue': 40, 'PhoneInput/Playground': 40,
  'PhoneInput/States': 120, 'PhoneInput/ByArea': 280,
};
// The nightly Benchmarks run takes the fastest of more, so a night's time moves less with the machine.
const RUNS = inject('bench') ? 15 : 5;
// With coverage on (CI's full runs), every line counts itself as it runs, which made VirtualList's Playground take
// 20.8 ms against 20 on a busy runner (8 Nov 2026). Twice the budget there; the narrowed pull request runs and the
// nightly Benchmarks run have no coverage and keep the budget as it is, so a slow story still fails there.
const SLOWER = inject('coverage') ? 2 : 1;
const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

async function mountTime(ui: React.ReactElement): Promise<number> {
  let best = Infinity;
  for (let i = 0; i < RUNS; i++) {
    let took = 0;
    const host = document.body.appendChild(document.createElement('div'));
    const root = createRoot(host);
    flushSync(() => root.render(<React.Profiler id="m" onRender={(_id, phase, actual) => { if (phase === 'mount') took += actual; }}>{ui}</React.Profiler>));
    root.unmount();
    host.remove();
    best = Math.min(best, took);
    await frame();
  }
  return best;
}

describe('mount time', () => {
  for (const [name, list] of storiesToRun()) {
    test(`${name} stories each mount within their budget`, async () => {
      const slow: string[] = [], times: Record<string, number> = {};
      for (const [exportName, ui] of list) {
        // Over budget: measure again after a pause, up to four times with longer pauses (0.5, 1, 2 and 4 s), and keep the
        // fastest. Noise only ever makes a mount slower, so the fastest is the honest number, and it stops at the first
        // time under budget, so a story within it costs nothing more. On a shared CI machine another job's burst can slow
        // all five runs at once, and two short pauses weren't always enough (Kanban/LongText measured 20.6 ms against 20
        // on 8 Nov 2026, and 20.4 ms after both pauses that night); a story that is really too slow is still too slow
        // after 7.5 s of pauses.
        const budget = (OWN_BUDGET[`${name}/${exportName}`] ?? BUDGET) * SLOWER;
        let ms = await mountTime(ui);
        for (let again = 0; again < 4 && ms > budget; again++) {
          await new Promise((r) => setTimeout(r, 500 * 2 ** again));
          ms = Math.min(ms, await mountTime(ui));
        }
        times[`${name}/${exportName}`] = ms;
        if (ms > budget) slow.push(`${exportName}: ${ms.toFixed(1)} ms (budget ${budget})`);
      }
      await commands.recordBench('mount', times);
      expect(slow).toEqual([]);
    }, 120_000);   // the pauses above, when a busy machine slows several of a component's stories
  }
});
