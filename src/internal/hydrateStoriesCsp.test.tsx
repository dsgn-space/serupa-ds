import * as React from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterEach, beforeEach, describe, expect, inject, test, vi } from 'vitest';
import { storiesToRun } from '../../tools/test/vitest/stories';
import { fiberOf, fromRenderProp, fromStory } from '../../tools/test/vitest/storyOwner';
import { getIcon } from '../icons';

// Every story's server HTML, hydrated on a page with a strict Content Security Policy, has to lay out as the same
// HTML hydrated on a page without one (GR16). Under style-src-attr 'none' the browser ignores the style attributes in
// server HTML, and React's hydration keeps them as they are rather than setting them again, so a component whose look
// rests on an inline style (a fill's width, a row's indent, a pane's size) stays wrong until something re-renders it,
// unless it applies its styles again through the CSSOM (src/internal/serverStyles.ts). This file's page has the
// policy from the start; serverStyles.test.tsx covers the mechanism itself. The page without the policy is the same
// HTML with every style attribute set through the CSSOM before hydrating, which the policy allows: both sides hydrate
// the same markup, so text that depends on the time (RelativeTime) and what effects measure match.
const meta = document.createElement('meta');
meta.httpEquiv = 'Content-Security-Policy';
meta.content = "style-src-attr 'none'";
document.head.appendChild(meta);

const html = inject('serverStories');
const frames = (n: number) => new Promise<void>((r) => { const f = () => (n-- > 0 ? requestAnimationFrame(f) : r()); f(); });

// Each element's box, from the host's corner, rounded to the pixel, in document order. A weight first used by this
// story (ErrorSummary's medium links) starts loading at layout, so wait for it: measured in the fallback font, a link
// came out a few pixels narrower on one side only.
// In a full run, with the machine busy, an element an effect adds after mount (an icon drawn once its data loads)
// could land after one hydration was measured and before the other, so the lists came out shifted by one ("53
// elements differ", each want the got before it). So wait for a frame in which nothing is added or removed (at most
// about half a second) before measuring.
// A story that opens something once it has mounted (Tour's step, an open Popover) can, on a busy machine, open it
// during that wait or just after, and an entrance then running was measured mid-way (a popover at 12x13). So the
// wait also counts attribute changes (open, popover, data-state) and entrances: each frame, every running animation
// and transition is finished, and a frame that had one to finish isn't a quiet one either.
async function boxes(host: HTMLElement) {
  await frames(2);
  await document.fonts.ready;
  // A loop (a spinner, a ping) has no end to finish at, and finish() throws on one: those are left running.
  const settle = () => {
    let ran = false;
    for (const a of document.getAnimations()) {
      if (a.playState === 'finished' || a.effect?.getComputedTiming().endTime === Infinity) continue;
      a.finish();
      ran = true;
    }
    return ran;
  };
  for (let tries = 0, changed = true; changed && tries < 30; tries++) {
    const seen = new MutationObserver(() => {});
    seen.observe(host, { childList: true, subtree: true, attributes: true });
    await frames(1);
    changed = settle();
    changed = seen.takeRecords().length > 0 || changed;
    seen.disconnect();
    // An icon drawn by name that this page has loaded is still empty right after hydrating: React draws it in a render
    // of its own, which on a busy runner can come after a frame with nothing to see. Measured before it, every
    // element after the icon was one place off from the other hydration's.
    changed = changed || [...host.querySelectorAll<HTMLElement>('span[data-icon]')].some((s) => !s.firstElementChild && !!getIcon(s.dataset.icon!));
  }
  settle();
  const o = host.getBoundingClientRect();
  return [...host.querySelectorAll('*')].map((e) => {
    const r = e.getBoundingClientRect();
    return { el: `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/)[0] : ''}`, box: [r.left - o.left, r.top - o.top, r.width, r.height].map(Math.round) };
  });
}

// Each element's style attribute as the server sent it, in document order. Read from an inert parse with no policy,
// since a blocked attribute's text isn't kept everywhere (Firefox empties it).
const styleTexts = (serverHtml: string) => [...new DOMParser().parseFromString(serverHtml, 'text/html').body.querySelectorAll('*')].map((e) => e.getAttribute('style') || '');
function setStyle(el: Element, text: string) {
  // One declaration at a time; a ; inside parentheses (url(data:…;base64,…)) doesn't end one.
  for (const d of text.split(/;(?![^(]*\))/)) {
    const at = d.indexOf(':');
    if (at > 0) (el as HTMLElement).style.setProperty(d.slice(0, at).trim(), d.slice(at + 1).trim());
  }
}

// Some styles in server HTML are the app's, not the component's, and an app has them under the policy some other way
// (a class, a stylesheet, 'unsafe-inline' for them), so the strict side gets them before hydrating too:
// - what a story file wrote itself (a wrapper's max-width), found from where React's development build says the
//   element was made;
// - a style a story passes to a component that hands it on as it is (<Card style>, Table's containerProps.style): the
//   same object all the way up to the element the story wrote, which the getting-started page says needs
//   'unsafe-inline' (or a class);
// - Grid's and Stack's: they're Server Components, which don't hydrate, so their columns and gaps need
//   'unsafe-inline' in server HTML (docs/GettingStarted.mdx).
// Where the element was made is tools/test/vitest/storyOwner.ts, shared with the digits check.
const sources = import.meta.glob<string>('../components/*/*.stories.tsx', { eager: true, query: '?raw', import: 'default' });
const storySource = (name: string) => Object.entries(sources).find(([f]) => f.split('/').at(-2) === name)?.[1] || '';
const SERVER_ONLY = '[data-component="grid"], [data-component="stack"]';
function appStyled(el: Element, source: string) {
  if (el.matches(SERVER_ONLY)) return true;
  let f = fiberOf(el);
  if (!f) return false;
  const style = f.memoizedProps?.style;
  for (let up = f.return; style && up; up = up.return) if (Object.values(up.memoizedProps || {}).some((v) => v === style || (!!v && typeof v === 'object' && (v as { style?: unknown }).style === style))) f = up;
  return fromStory(f) || fromRenderProp(f, source);
}

/** Whether a message is React's attribute-mismatch warning with no attribute changed but style (a + or - line is a
    style entry, the style prop itself, or text shown for context). */
function styleOnly(message: string): boolean {
  if (!/didn't match the client properties/.test(message)) return false;
  // The tree diff comes after React's link; the - lines above it are its list of usual causes.
  const at = message.indexOf('react.dev/link/hydration-mismatch');
  if (at < 0) return false;
  const changed = message.slice(at).split('\n').filter((l) => /^\s*[+-]\s/.test(l)).map((l) => l.replace(/^\s*[+-]\s+/, ''));
  // A changed attribute is a line like name="…" or name={…}; the rest are style entries (padding: …) and the text the
  // tree shows for context.
  return changed.length > 0 && changed.every((l) => /^style=\{\{.*\}\}$/.test(l) || !/^[\w:-]+=/.test(l));
}

// Hydrates the server HTML, with the style attributes at the indexes given (all of them, for the page without the
// policy) set through the CSSOM first. Returns the boxes and which elements' styles are the app's.
async function hydrate(ui: React.ReactElement, serverHtml: string, source: string, apply: (i: number) => boolean) {
  // React's development build records where an element was made for only 10,000 elements a second, and a story
  // with many (PhoneInput's country list), straight after others, gets "unknown" past that, so the count starts again.
  const internals = Reflect.get(React, '__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE') as { recentlyCreatedOwnerStacks?: number } | undefined;
  if (internals) internals.recentlyCreatedOwnerStacks = 0;
  const host = document.createElement('div');
  host.style.width = '800px';
  document.body.appendChild(host);
  host.innerHTML = serverHtml;
  const texts = styleTexts(serverHtml);
  const els = [...host.querySelectorAll('*')];
  els.forEach((el, i) => { if (texts[i] && apply(i)) setStyle(el, texts[i]); });
  let root: Root | undefined;
  const errors: string[] = [];
  // The style attributes set through the CSSOM above read back in another form ("padding-top: 56px; …" for
  // "padding: 56px 120px"), and the ones the policy blocks don't count at all, so React's development build warns of a
  // mismatch in style alone on nearly every story. That is this page's doing, not the component's, and 1,500 of them
  // filled a CI log past GitLab's 4 MB cap, hiding the test that failed. So a mismatch whose every changed line is a
  // style is left out; any other mismatch is still printed.
  const error = console.error;
  const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => { if (!styleOnly(args.map(String).join(' '))) error(...args); });
  try {
    flushSync(() => { root = hydrateRoot(host, ui, { onRecoverableError: (e) => errors.push(String(e)) }); });
  } finally { spy.mockRestore(); }
  const app = new Set(els.flatMap((el, i) => (texts[i] && appStyled(el, source) ? [i] : [])));
  const out = await boxes(host);
  root?.unmount();
  host.remove();
  return { out, app, errors };
}

// What still lays out wrong here, until its fix lands (none now): a component, or one story as
// "<Component>/<Story>". Measured but not held to it, so the fix's pull request can take its name out without this
// file going red first.
const KNOWN = new Set<string>([]);

// The clock stands still through each story's three hydrations, so a RelativeTime can't cross into its next minute
// between them.
beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'], now: Date.now() }); });
afterEach(() => { vi.useRealTimers(); });

test('a mismatch in style alone is left out of the log, any other is kept', () => {
  const warn = (diff: string) => `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.\n\n- Invalid HTML tag nesting.\n\nhttps://react.dev/link/hydration-mismatch\n\n  <Inner>\n    <div\n${diff}\n    >`;
  expect([
    styleOnly(warn('      style={{\n+       padding: "56px 120px"\n-       padding-top: "56px"\n      }}')),
    styleOnly(warn('-     style={{max-width:"20rem"}}')),
    styleOnly(warn('      style={{\n+         gap: 16\n-         row-gap: "16px"\n      }}')),
    styleOnly(warn('+     aria-expanded="true"\n-     aria-expanded="false"')),
    styleOnly(warn('      style={{\n+       maxWidth: "20rem"\n      }}\n+     id="a"\n-     id="b"')),
    styleOnly('Some other error'),
  ]).toEqual([true, true, true, false, false, false]);
});

for (const [name, list] of storiesToRun()) {
  describe(`${name} stories hydrate under a strict CSP`, () => {
    for (const [exportName, ui] of list) {
      test(`${exportName} lays out as it does without the policy`, async () => {
        const serverHtml = html[`${name}/${exportName}`]!, source = storySource(name);
        expect(serverHtml, 'the server render in Node').not.toMatch(/^Error: /);
        // The first hydration loads what the story loads on demand (icons drawn by name) and finds the app's styles;
        // the two compared come after it, so both find the same things ready.
        const { app } = await hydrate(ui, serverHtml, source, () => true);
        const { out: got, errors } = await hydrate(ui, serverHtml, source, (i) => app.has(i));
        const { out: want } = await hydrate(ui, serverHtml, source, () => true);
        expect(errors, 'recoverable errors').toEqual([]);
        // Only the elements that differ, so a failure names them.
        const off = got.map((g, i) => ({ ...g, want: want[i]?.box })).filter((g, i) => !want[i] || want[i].el !== g.el || g.box.some((v, k) => Math.abs(v - want[i]!.box[k]!) > 1));
        if (KNOWN.has(name) || KNOWN.has(`${name}/${exportName}`)) return;
        expect(off.slice(0, 5), `${off.length} elements differ (x, y, width, height from the story's corner)`).toEqual([]);
        expect(got.length, 'elements').toBe(want.length);
      });
    }
  });
}
