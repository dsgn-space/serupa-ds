// useMediaQuery, useBreakpoint and useReducedMotion: the package's hooks for a project's own components, at the
// widths of the screen-* tokens, safe in server HTML.
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { BREAKPOINTS, prefersReducedMotion, useBreakpoint, useMediaQuery, useReducedMotion } from './media';
import * as api from '../index';

afterEach(async () => { await page.viewport(1280, 800); });

function Width() {
  const md = useBreakpoint('md'), xl = useBreakpoint('xl');
  return <p id="w">{(md ? 'md' : 'base') + (xl ? ' xl' : '')}</p>;
}

describe('media hooks', () => {
  test('the package exports them', () => {
    expect([typeof api.useMediaQuery, typeof api.useBreakpoint, typeof api.useReducedMotion]).toEqual(['function', 'function', 'function']);
  });

  test('the breakpoints are the screen-* tokens', () => {
    const root = getComputedStyle(document.documentElement);
    for (const [name, px] of Object.entries(BREAKPOINTS)) expect([name, root.getPropertyValue('--screen-' + name).trim()]).toEqual([name, px + 'px']);
  });

  test('useBreakpoint follows the window as it is resized', async () => {
    await page.viewport(700, 800);
    await render(<Width />);
    expect(document.getElementById('w')!.textContent).toBe('base');
    await page.viewport(800, 800);
    await expect.poll(() => document.getElementById('w')!.textContent).toBe('md');
    await page.viewport(1300, 800);
    await expect.poll(() => document.getElementById('w')!.textContent).toBe('md xl');
  });

  test('useMediaQuery takes any query and stops listening when unmounted', async () => {
    const seen: boolean[] = [];
    function Peek({ q }: { q: string }) { seen.push(useMediaQuery(q)); return null; }
    const r = await render(<Peek q="(min-width: 1px)" />);
    expect(seen.at(-1)).toBe(true);
    await r.rerender(<Peek q="(max-width: 1px)" />);
    expect(seen.at(-1)).toBe(false);
    const m = window.matchMedia('(max-width: 1px)');
    const off = vi.spyOn(MediaQueryList.prototype, 'removeEventListener');
    await r.unmount();
    expect(off).toHaveBeenCalled();
    off.mockRestore();
    expect(m.matches).toBe(false);
  });

  test('server HTML uses serverValue, and hydration matches it before the browser\'s answer follows', async () => {
    function Wide({ server }: { server?: boolean }) { return <b>{useMediaQuery('(min-width: 1px)', { serverValue: server }) ? 'wide' : 'narrow'}</b>; }
    expect([renderToString(<Wide />), renderToString(<Wide server />)]).toEqual(['<b>narrow</b>', '<b>wide</b>']);
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = renderToString(<Wide />);
    const errors: unknown[] = [];
    const root = hydrateRoot(host, <Wide />, { onRecoverableError: (e) => errors.push(e) });
    await expect.poll(() => host.textContent).toBe('wide');
    expect(errors).toEqual([]);
    root.unmount(); host.remove();
  });

  test('useReducedMotion says whether the visitor asked for less motion', async () => {
    const seen: boolean[] = [];
    function Peek() { seen.push(useReducedMotion()); return null; }
    await render(<Peek />);
    expect(seen.at(-1)).toBe(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  });
});

describe('the app\'s own Reduce motion setting', () => {
  test('prefersReducedMotion and useReducedMotion follow data-motion="reduce" on <html>, and a section around an element', async () => {
    const html = document.documentElement;
    const system = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen: boolean[] = [];
    function Peek() { seen.push(useReducedMotion()); return null; }
    const view = await render(<Peek />);
    const section = document.body.appendChild(document.createElement('section'));
    const inner = section.appendChild(document.createElement('b'));
    try {
      expect([prefersReducedMotion(), seen.at(-1)]).toEqual([system, system]);
      html.setAttribute('data-motion', 'reduce');
      await expect.poll(() => seen.at(-1)).toBe(true);
      expect(prefersReducedMotion()).toBe(true);
      html.removeAttribute('data-motion');
      await expect.poll(() => seen.at(-1)).toBe(system);
      section.setAttribute('data-motion', 'reduce');
      expect([prefersReducedMotion(inner), prefersReducedMotion(document.body)]).toEqual([true, system]);
      inner.remove();
      expect(prefersReducedMotion(inner)).toBe(system);   // a detached element reads the page
    } finally { html.removeAttribute('data-motion'); section.remove(); await view.unmount(); }
  });
});
