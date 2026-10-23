import * as React from 'react';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { css } from '../../../tools/test/vitest/helpers';
import { Fab } from './Fab';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const box = (id: string) => { const r = el(id).getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); };

const warns: string[] = [];
beforeAll(async () => {
  vi.spyOn(console, 'warn').mockImplementation((m) => { warns.push(String(m)); });
  await page.viewport(800, 600);   // the screen the corners are measured against
});
afterAll(() => { vi.restoreAllMocks(); });

let clicks = 0;
function Fabs({ fabRef }: { fabRef?: React.Ref<HTMLButtonElement> }) {
  return <div style={{ padding: '120px 120px 16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
    <Fab id="fab" icon="add" label="New project" onClick={() => { clicks++; }} ref={fabRef} />
    <Fab id="fbs" icon="add" label="Add" size="sm" position="top-start" />
    <Fab id="fext" icon="edit" label="Compose" extended position="bottom-start" />
    <Fab id="fst" icon="add" label="Static" position="static" />
    {/* @ts-expect-error: an unknown position */}
    <Fab id="fbad" icon="add" label="Bad" position="middle" style={{ '--fab-size': '50px', '--fab-offset': '10px' } as React.CSSProperties} />
    <div dir="rtl"><Fab id="frtl" icon="add" label="RTL" position="top-end" /></div>
  </div>;
}

describe('Fab', () => {
  test('a primary <button> named by label, fixed, z-index 30, round, raised (shadow-lg), with a 24px icon', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    await render(<Fabs fabRef={ref} />);
    const e = el('fab'), s = css(e);
    expect([e.getAttribute('aria-label'), e.title, e.dataset.variant, s.position, s.zIndex, css(e.querySelector('.dk-icon')).fontSize]).toEqual(['New project', 'New project', 'primary', 'fixed', '30', '24px']);
    expect(parseFloat(s.borderTopLeftRadius)).toBeGreaterThanOrEqual(28);
    expect(s.boxShadow).toMatch(/10px 15px -3px/);
    expect(ref.current).toBe(e);
  });

  test('56×56, 24px from the bottom-end corner; size sm at top-start: 40×40, 24px from the top-left corner', async () => {
    await render(<Fabs />);
    const [w, h] = [window.innerWidth, window.innerHeight], f = box('fab');
    expect([f[2], f[3], f[0] + 56, f[1] + 56]).toEqual([56, 56, w - 24, h - 24]);
    expect(box('fbs')).toEqual([24, 24, 40, 40]);
  });

  test('extended: the label shows next to the icon (no aria-label needed), 56px tall, wider than square, 20px side padding, bottom-start', async () => {
    await render(<Fabs />);
    const e = el('fext'), [left, , w, h] = box('fext');
    expect([e.querySelector('.dk-btn__label')!.textContent, e.getAttribute('aria-label'), h, left, css(e).paddingLeft]).toEqual(['Compose', null, 56, 24, '20px']);
    expect(w).toBeGreaterThan(56);
  });

  test('position static stays in the flow; an unknown position falls back to bottom-end; --fab-size and --fab-offset override one', async () => {
    await render(<Fabs />);
    expect(css(el('fst')).position).not.toBe('fixed');
    const b = box('fbad');
    expect([b[2], b[0] + 50, b[1] + 50]).toEqual([50, window.innerWidth - 10, window.innerHeight - 10]);
  });

  test('the corner follows the text direction (top-end is top-left in right-to-left)', async () => {
    await render(<Fabs />);
    expect(box('frtl').slice(0, 2)).toEqual([24, 24]);
  });

  test('hover: a deeper shadow (shadow-xl)', async () => {
    await render(<Fabs />);
    await userEvent.hover(el('fst'));
    await expect.poll(() => css(el('fst')).boxShadow).toMatch(/20px 25px -5px/);
  });

  test('keyboard: Tab reaches the Fab, Enter and Space press it, and it shows its focus ring (focus-visible, the ring color, a 2px outline for forced-colors mode)', async () => {
    await render(<Fabs />);
    (document.activeElement as HTMLElement | null)?.blur();
    const order: string[] = [];
    for (let i = 0; i < 12 && !order.includes('fab'); i++) { await userEvent.tab(); order.push(document.activeElement!.id); }
    expect(order).toContain('fab');
    clicks = 0;
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(clicks).toBe(2);
    const e = el('fab');
    await Promise.all(e.getAnimations().map((a) => a.finished));   // the ring fades in
    const probe = document.createElement('span');
    probe.style.color = 'var(--dk-btn-ring)';
    e.appendChild(probe);
    const ring = getComputedStyle(probe).color;
    probe.remove();
    const s = css(e);
    expect(e.matches(':focus-visible')).toBe(true);
    expect(s.boxShadow).toContain(ring);
    expect([s.outlineStyle, s.outlineWidth]).toEqual(['solid', '2px']);
  });

  test('no warnings about missing labels', () => {
    expect(warns.filter((m) => /aria-label/.test(m))).toEqual([]);
  });
});
