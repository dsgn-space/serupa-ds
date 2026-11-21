/// <reference types="vite/client" />
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { commands, userEvent } from 'vitest/browser';
import { storiesToRun } from '../../tools/test/vitest/stories';

// Forced colors (Windows high contrast) for every component: the browser replaces each color with a few system
// colors and drops shadows, so a state shown only by a background or a shadow disappears. In every story, each
// element in a state that ARIA names (selected, checked, pressed, current, expanded) must still look different, with
// forced colors on, from a peer of the same kind that isn't in it: in a color, a border, an outline, a text
// decoration, the weight, or a part it shows or hides. Natives (<input>, <option>) are left out: the browser draws
// their states itself.
// What fails today is in KNOWN, with the reason; a line no longer needed fails too, so the list only shrinks.
const KNOWN: Record<string, string> = {
};

const STATES = ['aria-selected', 'aria-checked', 'aria-pressed', 'aria-current'] as const;
const on = (el: Element, a: string) => { const v = el.getAttribute(a); return v != null && v !== 'false'; };
const NATIVE = /^(INPUT|OPTION|SELECT|TEXTAREA)$/;
// What forced colors leave a person to see on one element.
const PROPS = ['color', 'background-color', 'border-top-color', 'border-top-width', 'border-top-style', 'border-bottom-color', 'border-bottom-width',
  'border-bottom-style', 'border-inline-start-color', 'border-inline-start-width', 'border-inline-start-style', 'border-inline-end-width',
  'outline-style', 'outline-width', 'outline-color', 'text-decoration-line', 'font-weight', 'visibility', 'display', 'opacity', 'forced-color-adjust'];
const look = (el: Element, pseudo?: string) => { const s = getComputedStyle(el, pseudo); return PROPS.map((p) => s.getPropertyValue(p)).join('|') + (pseudo ? `|${s.content}` : ''); };
// The element and everything in it, by position, without the words: a selected tab and another tab differ in their
// label, which says nothing about which one is selected.
const print = (root: Element) => [root, ...root.querySelectorAll('*')].map((el) => `${el.tagName}:${look(el)}:${look(el, '::before')}:${look(el, '::after')}`).join('\n');
// The element with its own wrappers: a List row marks its link current and draws the outline on the row around it.
// Each ancestor up to the one the two share counts, by its own look only.
const seenAs = (el: Element, other: Element) => {
  const wrap: string[] = [];
  for (let up = el.parentElement; up && !up.contains(other); up = up.parentElement) wrap.push(`${up.tagName}:${look(up)}:${look(up, '::before')}:${look(up, '::after')}`);
  return `${wrap.join('\n')}\n${print(el)}`;
};
// A peer: the nearest element of the same kind (role, or tag and first class) that isn't in the state.
const kind = (el: Element) => el.getAttribute('role') || `${el.tagName}.${(el.getAttribute('class') || '').split(' ')[0]}`;
function peer(el: Element, attr: string): Element | null {
  for (let up = el.parentElement; up && up !== document.body; up = up.parentElement) {
    const found = [...up.querySelectorAll('*')].find((x) => x !== el && !x.contains(el) && !el.contains(x) && kind(x) === kind(el) && !on(x, attr)
      && !x.hasAttribute('disabled') && x.getAttribute('aria-disabled') !== 'true');
    if (found) return found;
  }
  return null;
}

const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
let active = false;
beforeAll(async () => {
  await commands.forcedColors(true);
  active = matchMedia('(forced-colors: active)').matches && CSS.supports('forced-color-adjust', 'none');
});
afterAll(() => commands.forcedColors(false));

const seen = new Set<string>();
describe('states stay visible in forced colors', () => {
  for (const [name, list] of storiesToRun()) {
    test(`${name}: every selected, checked, pressed or current part looks different from one that isn't`, async ({ skip }) => {
      if (!active) skip();
      const problems: string[] = [];
      for (const [exportName, ui] of list) {
        await userEvent.hover(document.documentElement, { position: { x: 0, y: 0 }, force: true });
        const host = document.body.appendChild(document.createElement('div'));
        const root = createRoot(host);
        flushSync(() => root.render(ui));
        await frame();
        (document.activeElement as HTMLElement | null)?.blur?.();
        await frame();
        for (const attr of STATES) {
          for (const el of host.querySelectorAll(`[${attr}]`)) {
            if (!on(el, attr) || NATIVE.test(el.tagName)) continue;
            const other = peer(el, attr);
            if (!other || seenAs(el, other) !== seenAs(other, el)) continue;
            const key = `${name}:${kind(el)}:${attr}`;
            seen.add(key);
            if (!KNOWN[key]) problems.push(`${exportName}: ${kind(el)} with ${attr}="${el.getAttribute(attr)}" looks the same as one without it in forced colors`);
          }
        }
        root.unmount();
        host.remove();
      }
      expect([...new Set(problems)]).toEqual([]);
    });
  }
  test('every KNOWN line is still needed', ({ skip }) => {
    if (!active) skip();
    const ran = new Set(storiesToRun().map(([n]) => n));
    const stale = Object.keys(KNOWN).filter((k) => ran.has(k.split(':')[0]!) && !seen.has(k));
    expect(stale, 'remove these lines from KNOWN in src/internal/forcedColorStates.test.tsx').toEqual([]);
  });
});
