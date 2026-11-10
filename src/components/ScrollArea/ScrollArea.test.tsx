import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { idLabels } from '../../internal/labels';
import { SerupaProvider } from '../../internal/provider';
import { ScrollArea } from './ScrollArea';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const rows = (n: number) => Array.from({ length: n }, (_, i) => <p key={i} style={{ margin: 0, height: 40 }}>Row {i + 1}</p>);

describe('ScrollArea', () => {
  test('renders a <div>; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<ScrollArea id="x" ref={ref} className="extra" data-x="y">Hello</ScrollArea>);
    const e = el('x');
    expect([e.tagName, e.textContent, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DIV', 'Hello', true, 'dk-scroll-area dk-scroll-area--vertical extra', 'y', 'scroll-area']);
  });

  test('while its content overflows it is a Tab stop and a region named by aria-label; when it fits, neither', async () => {
    const { rerender } = await render(<><button>Before</button><ScrollArea id="s" aria-label="Recent activity" style={{ maxHeight: 100 }}>{rows(10)}</ScrollArea></>);
    await expect.element(page.getByRole('region', { name: 'Recent activity' })).toBeInTheDocument();
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(document.activeElement === el('s')).toBe(true);
    await rerender(<><button>Before</button><ScrollArea id="s" aria-label="Recent activity" style={{ maxHeight: 100 }}>{rows(1)}</ScrollArea></>);
    await expect.poll(() => el('s').getAttribute('role')).toBe(null);
    expect([el('s').hasAttribute('tabindex'), el('s').hasAttribute('aria-label')]).toEqual([false, false]);
  });

  test('the arrow keys and Page Down scroll it once it has focus', async () => {
    await render(<ScrollArea id="s" aria-label="List" style={{ maxHeight: 100 }}>{rows(20)}</ScrollArea>);
    el('s').focus();
    await userEvent.keyboard('{PageDown}');
    await expect.poll(() => el('s').scrollTop).toBeGreaterThan(0);
  });

  test('with no name of its own it is named "Scrolling content", in the provider\'s language', async () => {
    const { rerender } = await render(<ScrollArea style={{ maxHeight: 100 }}>{rows(10)}</ScrollArea>);
    await expect.element(page.getByRole('region', { name: 'Scrolling content' })).toBeInTheDocument();
    await rerender(<SerupaProvider labels={idLabels}><ScrollArea style={{ maxHeight: 100 }}>{rows(10)}</ScrollArea></SerupaProvider>);
    await expect.element(page.getByRole('region', { name: 'Konten bergulir' })).toBeInTheDocument();
    await rerender(<><h2 id="h">Log</h2><ScrollArea aria-labelledby="h" style={{ maxHeight: 100 }}>{rows(10)}</ScrollArea></>);
    await expect.element(page.getByRole('region', { name: 'Log' })).toBeInTheDocument();
  });

  test('horizontal scrolls sideways only; both scrolls either way', async () => {
    const { rerender } = await render(<ScrollArea id="s" orientation="horizontal" aria-label="Row" style={{ width: 200 }}><div style={{ width: 600, height: 20 }} /></ScrollArea>);
    expect([css(el('s')).overflowX, css(el('s')).overflowY]).toEqual(['auto', 'hidden']);
    await expect.element(page.getByRole('region', { name: 'Row' })).toBeInTheDocument();
    await rerender(<ScrollArea id="s" orientation="both" aria-label="Row" style={{ width: 200 }}><div style={{ width: 600, height: 20 }} /></ScrollArea>);
    expect([css(el('s')).overflowX, css(el('s')).overflowY]).toEqual(['auto', 'auto']);
  });

  test('fade: masks the edge with more past it, and neither edge once it fits', async () => {
    const { rerender } = await render(<ScrollArea id="s" fade aria-label="List" style={{ maxHeight: 100 }}>{rows(10)}</ScrollArea>);
    const cls = () => [el('s').classList.contains('dk-scroll-area--more-start'), el('s').classList.contains('dk-scroll-area--more-end')];
    await expect.poll(cls).toEqual([false, true]);
    expect(css(el('s')).maskImage).toContain('linear-gradient');
    el('s').scrollTop = 120;
    await expect.poll(cls).toEqual([true, true]);
    el('s').scrollTop = 10000;
    await expect.poll(cls).toEqual([true, false]);
    await rerender(<ScrollArea id="s" fade aria-label="List" style={{ maxHeight: 100 }}>{rows(1)}</ScrollArea>);
    await expect.poll(cls).toEqual([false, false]);
    expect(css(el('s')).maskImage).toBe('none');
  });

  test('the scrollbar thumb reads 3:1 on the surface, and the focus ring too, in all six themes', async () => {
    await render(<div id="bg" style={{ background: 'var(--surface)' }}><ScrollArea id="s" aria-label="List" style={{ maxHeight: 100 }}>{rows(10)}</ScrollArea></div>);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const thumb = css(el('s')).scrollbarColor.split(/\s(?![^(]*\))/)[0];
      expect(contrast(thumb, css(el('bg')).backgroundColor), th + ' thumb').toBeGreaterThanOrEqual(3);
      el('s').focus();
      expect(contrast(css(el('s')).outlineColor, css(el('bg')).backgroundColor), th + ' ring').toBeGreaterThanOrEqual(3);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});
