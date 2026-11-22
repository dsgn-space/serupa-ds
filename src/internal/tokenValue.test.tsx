// tokenValue and useTokenValue: a token's value for code that draws without CSS (a canvas, a chart library),
// following the theme where it's read, and its changes.
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { tokenValue, useTokenValue } from './tokenValue';
import * as api from '../index';

const html = document.documentElement;
afterEach(() => { html.setAttribute('data-theme', 'blue-light'); });

// What CSS itself resolves the token to on an element: the value a canvas should paint with.
function resolved(el: Element, token: string): string {
  const probe = el.appendChild(document.createElement('i'));
  probe.style.color = 'var(--' + token + ')';
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe('tokenValue', () => {
  test('the package exports both', () => {
    expect([typeof api.tokenValue, typeof api.useTokenValue]).toEqual(['function', 'function']);
  });

  test('reads a token as the page resolves it, with or without the leading --; an unknown name is empty', () => {
    const v = tokenValue('primary');
    expect(v).not.toBe('');
    expect(v).toBe(resolved(html, 'primary'));
    expect(tokenValue('spacing-4')).toMatch(/^\d/);
    expect(tokenValue('--primary')).toBe(v);
    expect(tokenValue('space-not-a-token')).toBe('');
  });

  test('inside a section with its own mode, the section\'s value', () => {
    const light = document.body.appendChild(document.createElement('div')); light.setAttribute('data-mode', 'light');
    const dark = document.body.appendChild(document.createElement('div')); dark.setAttribute('data-mode', 'dark');
    try {
      expect(tokenValue('surface', dark)).toBe(resolved(dark, 'surface'));
      expect(tokenValue('surface', dark)).not.toBe(tokenValue('surface', light));
    } finally { light.remove(); dark.remove(); }
  });
});

describe('useTokenValue', () => {
  test('follows a theme switch on the page, without a remount', async () => {
    function Swatch() { return <p id="sw">{useTokenValue('surface')}</p>; }
    await render(<Swatch />);
    const p = () => document.getElementById('sw')!.textContent;
    const before = p();
    expect(before).toBe(resolved(html, 'surface'));
    html.setAttribute('data-theme', 'violet-dark');
    await expect.poll(p).not.toBe(before);
    expect(p()).toBe(resolved(html, 'surface'));
  });

  test('follows the shadow and type-scale settings too', async () => {
    function Read() { return <p id="sh">{useTokenValue('shadow-md')}|{useTokenValue('text-3xl')}</p>; }
    await render(<Read />);
    const p = () => document.getElementById('sh')!.textContent;
    const before = p();
    try {
      html.setAttribute('data-shadow', 'brand');
      html.setAttribute('data-type-scale', 'fluid');
      await expect.poll(p).not.toBe(before);
      const [shadow, size] = p().split('|');
      expect([shadow, size]).toEqual([tokenValue('shadow-md'), tokenValue('text-3xl')]);
      expect([shadow === before.split('|')[0], size === before.split('|')[1]]).toEqual([false, false]);
    } finally { html.removeAttribute('data-shadow'); html.removeAttribute('data-type-scale'); }
  });

  test('with a ref, the value where that element sits, and its section\'s own switch', async () => {
    function Panel({ mode }: { mode: 'light' | 'dark' }) {
      const ref = React.useRef<HTMLDivElement>(null);
      const v = useTokenValue('surface', ref);
      return <div data-mode={mode} ref={ref}><p id="pv">{v}</p></div>;
    }
    const r = await render(<Panel mode="dark" />);
    const box = document.getElementById('pv')!.parentElement!;
    await expect.poll(() => document.getElementById('pv')!.textContent).toBe(resolved(box, 'surface'));
    const dark = resolved(box, 'surface');
    await r.rerender(<Panel mode="light" />);
    await expect.poll(() => document.getElementById('pv')!.textContent).not.toBe(dark);
    expect(document.getElementById('pv')!.textContent).toBe(resolved(box, 'surface'));
  });

  test('server HTML has an empty value, and hydration fills it in without a mismatch', async () => {
    function Peek() { return <b>{useTokenValue('primary') || 'none'}</b>; }
    expect(renderToString(<Peek />)).toBe('<b>none</b>');
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = renderToString(<Peek />);
    const errors: unknown[] = [];
    const root = hydrateRoot(host, <Peek />, { onRecoverableError: (e) => errors.push(e) });
    await expect.poll(() => host.textContent).toBe(tokenValue('primary'));
    expect(errors).toEqual([]);
    root.unmount(); host.remove();
  });
});
