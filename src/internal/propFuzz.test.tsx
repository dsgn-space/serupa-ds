// Prop fuzzing (J3): each component drawn with random combinations of its own props, a few at a time, as a crowd
// using every combination would. The props come from its public types (tools/test/baseline-api/<Component>.d.ts,
// which api.mjs keeps equal to dist/): each option prop (a union of strings) gets one of its values, each boolean
// true or false, and each text the story passes becomes empty or very long, sometimes right to left and in any of
// the six themes. A combination fails on a throw, a console.error, or an axe violation (WCAG 2.2 AA).
// The values come from a seeded generator, so a failure names its combination and the same ones come back on the
// next run. A boolean that is one half of a controlled pair (open with onOpenChange, checked with defaultChecked)
// is left as the story sets it: set alone, it is a controlled value nobody updates, which React rightly warns about.
import * as React from 'react';
import axe from 'axe-core';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { describe, expect, inject, test, vi } from 'vitest';
import { THEMES } from '../../tools/test/vitest/helpers';
import { files, storyElement, type Args, type Meta, type Story } from '../../tools/test/vitest/stories';

const SEED = 20261102;
const COMBOS = 6;
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];
// Props that retype a native attribute (the browser handles their values), as in tools/test/prop-values.mjs, and
// ones that only move where something is drawn in the page, not what it is.
const NATIVE = new Set(['as', 'type', 'role', 'popoverTargetAction', 'dir', 'hidden', 'inert']);
const URLS = /^(src|srcSet|href|action)$/;
const NAMES = /label|children|content|title|^name$/i;
const LONG = 'Pemberitahuan pembayaran yang sangat panjang sekali untuk tagihan bulan ini, dengan rincian lengkap '.repeat(3)
  + 'Supercalifragilisticexpialidocious-without-any-space-to-break-at-all';
// ErrorBoundary's stories throw on purpose, as in stories.tsx.
const SKIP = new Set(['ErrorBoundary']);
// What still fails here, until its fix lands (none now): "<Component>" or "<Component>: <reason's start>". Measured
// but not held to it, so the fix's pull request can take its line out without this file going red first.
const KNOWN = new Set<string>([]);

function random(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = <T,>(r: () => number, list: readonly T[]): T => list[Math.floor(r() * list.length)];

// A component's own props from its public types: the option props with their values, and the booleans.
const api = import.meta.glob<string>('../../tools/test/baseline-api/*.d.ts', { eager: true, query: '?raw', import: 'default' });
type Shape = { options: Map<string, string[]>; booleans: Set<string> };
function shape(name: string): Shape {
  const text = Object.entries(api).find(([f]) => f.endsWith(`/${name}.d.ts`))?.[1] || '';
  // type ButtonSize = "lg" | "md" | "sm";
  const aliases = new Map<string, string[]>();
  for (const m of text.matchAll(/^type (\w+) = ((?:"[^"]*"(?: \| )?)+);$/gm)) aliases.set(m[1], [...m[2].matchAll(/"([^"]*)"/g)].map((v) => v[1]));
  const literals = (t: string) => {
    const parts = t.split(' | ').filter((p) => p !== 'undefined');
    const out: string[] = [];
    for (const p of parts) {
      if (/^"[^"]*"$/.test(p)) out.push(p.slice(1, -1));
      else if (aliases.has(p)) out.push(...aliases.get(p)!);
      else return null;
    }
    return out.length >= 2 ? out : null;
  };
  const options = new Map<string, string[]>(), booleans = new Set<string>(), all = new Set<string>();
  // The component's own Props interfaces (ButtonProps, ButtonOwnProps, ButtonAsLinkProps), not its parts' (MenuItemProps
  // on Menu), each to its closing brace at the start of a line.
  for (const block of text.matchAll(new RegExp(`^interface ${name}(?:Own|Base|As\\w+)?Props\\b[^{]*\\{\\n([\\s\\S]*?)^\\}`, 'gm'))) {
    for (const m of block[1].matchAll(/^ {4}"?([\w-]+)"?\??: (.+);$/gm)) {
      const [, prop, type] = m as unknown as [string, string, string];
      all.add(prop);
      if (NATIVE.has(prop)) continue;
      if (/^boolean( \| undefined)?$/.test(type)) booleans.add(prop);
      else { const v = literals(type); if (v) options.set(prop, v); }
    }
  }
  const cap = (p: string) => p[0].toUpperCase() + p.slice(1);
  for (const b of booleans) if (all.has(`on${cap(b)}Change`) || all.has(`default${cap(b)}`)) booleans.delete(b);
  return { options, booleans };
}

// The story a component's fuzzing starts from: Playground, or else the first by name that draws the component from
// its args (no render of its own, but the file's render or component). By name, since the browser lists a module's
// exports in another order than Node. null when every story draws something of its own.
function base(mod: Record<string, Meta | Story>): { meta: Meta; story: Story; args: Args } | null {
  const meta = (mod.default || {}) as Meta;
  for (const [exportName, story] of Object.entries(mod).sort(([a], [b]) => (a === 'Playground' ? -1 : b === 'Playground' ? 1 : a.localeCompare(b)))) {
    if (exportName === 'default' || !story || typeof story !== 'object') continue;
    const s = story;
    if (s.render || !(meta.render || meta.component)) continue;
    return { meta, story: s, args: { ...meta.args, ...s.args } };
  }
  return null;
}

// One combination from the story's args: about half the props changed.
function combination(r: () => number, args: Args, { options, booleans }: Shape): { args: Args; rtl: boolean; theme: string; changed: string[] } {
  const out = { ...args }, changed: string[] = [];
  for (const [p, values] of options) if (r() < 0.5) { const v = pick(r, values); out[p] = v; changed.push(`${p}="${v}"`); }
  for (const p of booleans) if (r() < 0.5) { const v = r() < 0.5; out[p] = v; changed.push(`${p}={${v}}`); }
  // Only text people read (a capital or a space: not "bottom" or an id), and only what isn't the name: an empty label
  // is the app's mistake, which axe would rightly report, not the component's.
  for (const [p, v] of Object.entries(args)) {
    if (typeof v !== 'string' || options.has(p) || URLS.test(p) || !/[A-Z\s]/.test(v)) continue;
    const x = r();
    if (x < 0.15 && !NAMES.test(p)) { out[p] = ''; changed.push(`${p}=""`); } else if (x < 0.35) { out[p] = LONG; changed.push(`${p}={LONG}`); }
  }
  const rtl = r() < 0.3, theme = pick(r, THEMES);
  return { args: out, rtl, theme, changed };
}

const frames = (n: number) => new Promise<void>((res) => { const f = () => (n-- > 0 ? requestAnimationFrame(f) : res()); f(); });

// Draws one combination and returns what went wrong with it.
async function attempt(el: React.ReactElement, rtl: boolean, theme: string): Promise<string[]> {
  const problems: string[] = [];
  const error = vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => { problems.push(`console.error: ${a.map(String).join(' ').slice(0, 200)}`); });
  const host = document.createElement('div');
  if (rtl) host.dir = 'rtl';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.appendChild(host);
  const root = createRoot(host, { onUncaughtError: (e) => problems.push(`throws: ${String((e as Error)?.message ?? e).slice(0, 200)}`) });
  try {
    try { flushSync(() => root.render(el)); } catch (e) { problems.push(`throws: ${String((e as Error)?.message ?? e).slice(0, 200)}`); }
    await frames(2);
    if (!problems.length) {
      const result = await axe.run(document, { runOnly: { type: 'tag', values: TAGS } });
      // WCAG 1.4.3 exempts text that is part of an inactive control, as tools/test/storybook.mjs does: inside a
      // disabled control, or in a Field or Input whose control is disabled (a dimmed label or hint).
      const inactive = (n: axe.NodeResult) => {
        const el = document.querySelector(n.target.join(' '));
        if (el?.closest(':disabled, [aria-disabled="true"]')) return true;
        const around = el?.closest('[data-component="field"], [data-component="input"]');
        return !!around && (around.matches(':disabled') || !!around.querySelector(':disabled'));
      };
      for (const v of result.violations) {
        const nodes = v.id === 'color-contrast' ? v.nodes.filter((n) => !inactive(n)) : v.nodes;
        if (nodes.length) problems.push(`axe ${v.id}: ${nodes.slice(0, 2).map((n) => n.target.join(' ') + (v.id === 'color-contrast' ? ` ${JSON.stringify(n.any[0]?.data)}` : '')).join(', ')}`);
      }
    }
  } finally {
    root.unmount();
    host.remove();
    error.mockRestore();
    document.documentElement.setAttribute('data-theme', 'blue-light');
  }
  return problems;
}

// Every component, and the ones this run covers (SERUPA_ONLY, set by run.mjs --since, or all of them).
const only = inject('only');
const everyone = Object.entries(files)
  .map(([file, mod]) => [file.split('/').at(-2)!, mod] as const)
  .filter(([name]) => !SKIP.has(name))
  .sort(([a], [b]) => a.localeCompare(b));
const list = everyone.filter(([name]) => only === null || only.split(',').includes(name));

describe(`random prop combinations draw without a throw, a console.error or an axe violation (seed ${SEED})`, () => {
  for (const [name, mod] of list) {
    const from = base(mod), s = shape(name);
    if (!from || (!s.options.size && !s.booleans.size)) continue;
    test(`${name}: ${COMBOS} combinations`, async () => {
      // One generator per component, so adding a component doesn't change another's combinations.
      const r = random(SEED + [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0));
      const bad: string[] = [];
      for (let i = 0; i < COMBOS; i++) {
        const c = combination(r, from.args, s);
        const problems = await attempt(storyElement(from.meta, from.story, c.args), c.rtl, c.theme);
        const known = (p: string) => KNOWN.has(name) || [...KNOWN].some((k) => k.startsWith(`${name}: `) && p.startsWith(k.slice(name.length + 2)));
        for (const p of problems.filter((p) => !known(p))) bad.push(`${p}\n    with ${c.changed.join(' ') || 'the story as it is'}${c.rtl ? ', dir="rtl"' : ''}, ${c.theme}`);
      }
      expect(bad.slice(0, 5), `${bad.length} problems`).toEqual([]);
    }, 120_000);
  }
});

// The parse above stays honest: if the baseline's format changes and it finds nothing, the fuzzing would quietly
// test nothing.
test('the props are read from the public types', () => {
  const b = shape('Button');
  expect(b.options.get('variant')).toEqual(['ghost', 'link', 'outline', 'primary', 'secondary']);
  expect(b.options.get('size')).toEqual(['lg', 'md', 'sm']);
  expect(b.booleans.has('loading')).toBe(true);
  // Controlled halves are left out (Switch's checked has defaultChecked and onCheckedChange).
  expect(shape('Switch').booleans.has('checked')).toBe(false);
  // All of them, whichever this run covers.
  expect(everyone.filter(([name, mod]) => base(mod) && shape(name).options.size + shape(name).booleans.size > 0).length).toBeGreaterThan(60);
});
