import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { css, lowContrast } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { StatusTracker, type StatusDay, type StatusState } from './StatusTracker';

/** 90 days ending 6 Nov 2026, mostly up, for the stories and tests: degraded on days 20 and 61, down on day 47, no data for the first 5. */
function sampleDays(count = 90): StatusDay[] {
  const end = new Date(2026, 10, 6);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (count - 1 - i));
    const state: StatusState = i < 5 ? 'none' : i === 20 || i === 61 ? 'degraded' : i === 47 ? 'down' : 'up';
    return { date, state, note: state === 'down' ? 'Outage, 42 minutes' : state === 'degraded' ? 'Slow responses' : undefined };
  });
}

const Days = (props: Partial<React.ComponentProps<typeof StatusTracker>>) => <SerupaProvider locale="en-US"><div style={{ width: '600px' }}><StatusTracker id="st" label="API" days={sampleDays()} {...props} /></div></SerupaProvider>;
const bars = () => [...page.getByRole('list', { name: 'API' }).element().children] as HTMLElement[];
const bar = (i: number) => bars()[i]!;
const root = () => document.getElementById('st')!;

let errors: MockInstance<typeof console.error>;
beforeEach(() => { errors = vi.spyOn(console, 'error'); });
afterEach(() => { expect(errors).not.toHaveBeenCalled(); errors.mockRestore(); });

describe('StatusTracker', () => {
  test('a list named by label with a bar a day, each named with its date, state and note; props reach the root', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Days ref={ref} className="extra" data-x="y" />);
    expect([root().dataset.component, root().className, root().dataset.x, ref.current === root()]).toEqual(['status-tracker', 'dk-status-tracker extra', 'y', true]);
    expect(bars().length).toBe(90);
    expect([bar(0).getAttribute('aria-label'), bar(20).getAttribute('aria-label'), bar(47).getAttribute('aria-label'), bar(89).getAttribute('aria-label')])
      .toEqual(['Aug 9, 2026: No data', 'Aug 29, 2026: Degraded. Slow responses', 'Sep 25, 2026: Down. Outage, 42 minutes', 'Nov 6, 2026: Up']);
  });

  test('a summary worked out from the days: the share of days with data that were up, and how many were not', async () => {
    await render(<Days />);
    await expect.element(page.getByText('96.5% up over 90 days, 3 incidents')).toBeVisible();
    await render(<Days id="b" days={sampleDays(5)} />);
    await expect.element(page.getByText('100% up over 5 days, no incidents')).toBeVisible();
  });

  test('summary replaces the line or, null, leaves it out; legend={false} leaves out the key', async () => {
    await render(<Days summary="Last incident 16 days ago" legend={false} />);
    await expect.element(page.getByText('Last incident 16 days ago')).toBeVisible();
    expect(page.getByText('Degraded', { exact: true }).query()).toBe(null);
  });

  test('one tab stop, on the last day; arrows, Home and End move between days, and the caption says the focused one', async () => {
    await render(<><button>before</button><Days /></>);
    await userEvent.click(page.getByRole('button', { name: 'before' }));
    await userEvent.tab();
    expect(document.activeElement).toBe(bar(89));
    expect(bars().filter((b) => b.tabIndex === 0).length).toBe(1);
    await expect.element(page.getByText('Nov 6, 2026: Up', { exact: true })).toBeVisible();
    await userEvent.keyboard('{Escape}');   // hides the caption; focus stays
    await expect.element(page.getByText('Nov 6, 2026: Up', { exact: true })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(bar(89));
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(bar(88));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(bar(0));
    await userEvent.keyboard('{End}{ArrowRight}');
    expect(document.activeElement).toBe(bar(89));
    await userEvent.tab();
    expect(bars().includes(document.activeElement as HTMLElement)).toBe(false);
  });

  test('right to left: Left moves to the next day', async () => {
    await render(<div dir="rtl"><Days /></div>);
    bar(10).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(bar(11));
  });

  test('pointing at a bar shows its day in the caption', async () => {
    await render(<Days />);
    await userEvent.hover(bar(47));
    await expect.element(page.getByText('Sep 25, 2026: Down. Outage, 42 minutes', { exact: true })).toBeVisible();
  });

  test('states differ by shape, not color alone: down is half as tall, degraded striped, no data an outline', async () => {
    await render(<Days />);
    const h = (i: number) => bar(i).getBoundingClientRect().height;
    expect(h(47)).toBeCloseTo(h(89) / 2, 0);
    expect(css(bar(20)).backgroundImage).toContain('repeating-linear-gradient');
    expect([css(bar(0)).borderTopWidth, css(bar(0)).backgroundColor]).toEqual(['1px', 'rgba(0, 0, 0, 0)']);
  });

  test('more days than fit: the strip scrolls in its own box, starting at the latest day, and the page doesn\'t', async () => {
    await render(<div style={{ width: '240px' }}><StatusTracker id="n" label="Year" days={sampleDays(365)} /></div>);
    const n = document.getElementById('n')!, strip = page.getByRole('list', { name: 'Year' }).element();
    expect([n.scrollWidth <= 240, strip.scrollWidth > strip.clientWidth, strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1]).toEqual([true, true, true]);
  });

  test('its words come from the labels', async () => {
    await render(<SerupaProvider labels={idLabels} locale="id-ID"><StatusTracker label="API" days={sampleDays(10)} /></SerupaProvider>);
    await expect.element(page.getByText('100% aktif selama 10 hari, tanpa insiden')).toBeVisible();
    await expect.element(page.getByText('Terganggu')).toBeVisible();
  });

  test('bars 3:1 on the page, the caption, summary and legend 4.5:1, in all six themes', () => {
    expect(lowContrast([
      ['up', 'var(--success)', 'var(--surface)', 3],
      ['degraded', 'var(--warning)', 'var(--surface)', 3],
      ['down', 'var(--danger)', 'var(--surface)', 3],
      ['no data', 'var(--field-border)', 'var(--surface)', 3],
      ['caption', 'var(--text)', 'var(--surface)', 4.5],
      ['summary', 'var(--text-muted)', 'var(--surface)', 4.5],
      ['focus', 'var(--focus-ring)', 'var(--surface)', 3],
    ])).toEqual([]);
  });
});
