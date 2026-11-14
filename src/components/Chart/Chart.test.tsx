import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render as draw } from 'vitest-browser-react';
import { SerupaProvider } from '../../internal/provider';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css, withMotion } from '../../../tools/test/vitest/helpers';
import { Chart, markerPath, niceTicks } from './Chart';

// The tests read the numbers as en-US writes them; the second-language runs (ar-EG's digits) would write them otherwise.
const EnUS = ({ children }: { children: React.ReactNode }) => <SerupaProvider locale="en-US">{children}</SerupaProvider>;
const render = (ui: React.ReactNode) => draw(ui, { wrapper: EnUS });
const el = (id: string) => document.getElementById(id) as HTMLElement;
const CATS = ['Jan', 'Feb', 'Mar', 'Apr'];
const TWO = [{ name: 'Visitors', values: [10, 20, null, 40] }, { name: 'Sign-ups', values: [1, 2, 3, 4] }];
const focused = () => document.activeElement?.getAttribute('aria-label');
// Tab into the chart from a button just before it (tabTo's stand-in can't go inside an SVG).
async function tabIn(chart: Element = document.querySelector('figure[data-component="chart"]')!) {
  const from = document.createElement('button');
  chart.before(from);
  try { from.focus(); await userEvent.tab(); await userEvent.tab(); } finally { from.remove(); }   // the button, then the plot
}

describe('Chart', () => {
  test('the key sets a numeric series name (a year) in tabular figures, so keys of years line up', async () => {
    await render(<Chart title="Visitors" categories={CATS} series={[{ name: '2025', values: [1, 2, 3, 4] }, { name: '2026', values: [2, 3, 4, 5] }]} />);
    expect([...document.querySelectorAll('li')].filter((li) => /^202[56]/.test(li.textContent)).map((k) => css(k).fontVariantNumeric)).toEqual(['tabular-nums', 'tabular-nums']);
  });

  test('a <figure> named by its title; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLElement>();
    await render(<Chart id="c" ref={ref} className="extra" data-x="y" title="Visitors" categories={CATS} series={TWO} />);
    const e = el('c');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component, e.dataset.type]).toEqual(['FIGURE', true, 'dk-chart dk-chart--line extra', 'y', 'chart', 'line']);
    await expect.element(page.getByRole('figure', { name: 'Visitors' })).toBeInTheDocument();
  });

  test('the plot is a group named by its kind, described by a summary of the series', async () => {
    await render(<Chart title="Visitors" categories={CATS} series={TWO} />);
    const plot = page.getByRole('group', { name: 'Line chart' });
    await expect.element(plot).toHaveAccessibleDescription('Line chart, 2 series, 4 points from Jan to Apr. Visitors: lowest 10 in Jan, highest 40 in Apr. Sign-ups: lowest 1 in Jan, highest 4 in Apr.');
  });

  test('every point with a value is named with its series, category and value; a missing one has none', async () => {
    await render(<Chart title="Visitors" categories={CATS} series={TWO} />);
    const names = [...document.querySelectorAll('g[role="group"] > [role="img"]')].map((p) => [p.getAttribute('role'), p.getAttribute('aria-label')].join(' '));
    expect(names).toEqual(['img Visitors, Jan: 10', 'img Visitors, Feb: 20', 'img Visitors, Apr: 40', 'img Sign-ups, Jan: 1', 'img Sign-ups, Feb: 2', 'img Sign-ups, Mar: 3', 'img Sign-ups, Apr: 4']);
    await render(<Chart title="One" categories={CATS} series={[TWO[1]!]} />);
    expect(document.querySelectorAll('figure[data-component="chart"]')[1]!.querySelector('g[role="group"] > [role="img"]')!.getAttribute('aria-label')).toBe('Jan: 1');
  });

  test('one tab stop; arrows move along a series and across series, skipping gaps; Home and End', async () => {
    await render(<><button>before</button><Chart title="Visitors" categories={CATS} series={TWO} /><button>after</button></>);
    expect(document.querySelectorAll('g[role="group"] > [tabindex="0"]').length).toBe(1);
    await userEvent.click(page.getByRole('button', { name: 'before' }));
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement?.textContent).toBe('Show as table');
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe('Visitors, Jan: 10');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(focused()).toBe('Visitors, Apr: 40');   // Mar has no value
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('Sign-ups, Apr: 4');
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('Sign-ups, Mar: 3');
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe('Sign-ups, Mar: 3');    // Visitors has no Mar
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe('Sign-ups, Jan: 1');
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('Sign-ups, Apr: 4');
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement?.textContent).toBe('after');
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(focused()).toBe('Sign-ups, Apr: 4');     // back to the point it left
  });

  test('right to left: the first category is on the right, and ArrowLeft moves on', async () => {
    await render(<div dir="rtl"><Chart title="Visitors" categories={CATS} series={TWO} /></div>);
    const pts = [...document.querySelectorAll('svg[aria-describedby] g[role="group"]')[0]!.querySelectorAll('g[role="group"] > [role="img"]')].map((p) => p.getBoundingClientRect().x);
    expect(pts[0]).toBeGreaterThan(pts[1]!);
    await tabIn();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('Visitors, Feb: 20');
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('Visitors, Jan: 10');
  });

  test('a focused point shows its category\'s values beside it, and the focus ring', async () => {
    // A control after the chart, so Tab lands in the page: off the end of the test's frame, Firefox keeps the point
    // focused in its own document and nothing blurs.
    await render(<><Chart title="Visitors" categories={CATS} series={TWO} /><button type="button" id="after">After</button></>);
    const first = document.querySelector('g[role="group"] > [tabindex="0"]') as HTMLElement;
    await tabIn();
    expect(document.activeElement).toBe(first);
    const tip = document.querySelector('svg[aria-describedby] + div') as HTMLElement;
    expect([tip.getAttribute('aria-hidden'), tip.textContent]).toEqual(['true', 'JanVisitors10Sign-ups1']);
    const probe = document.body.appendChild(document.createElement('span'));
    probe.style.color = 'var(--focus-ring)';
    const ring = document.querySelector('svg[aria-describedby] > :is(circle, rect)') as SVGElement;
    expect([css(ring).stroke, css(ring).strokeWidth]).toEqual([css(probe).color, '3px']);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(document.getElementById('after'));
    expect(document.querySelector('svg[aria-describedby] > :is(circle, rect)')).toBeNull();
    probe.remove();
  });

  test('right to left: the tip sits beside the point, not stretched to the right edge (GR145)', async () => {
    await render(<div dir="rtl" style={{ width: 390 }}><Chart title="Visitors" categories={CATS} series={TWO} /></div>);
    const frame = (document.querySelector('svg[aria-describedby]') as SVGElement).parentElement!.getBoundingClientRect();
    await tabIn();
    for (const key of ['', '{End}']) {
      if (key) await userEvent.keyboard(key);
      const point = (document.activeElement as Element).getBoundingClientRect();
      const tip = (document.querySelector('svg[aria-describedby] + div') as HTMLElement).getBoundingClientRect();
      // Beside it: wholly on one side of the point, and not reaching to the frame's right edge unless it must.
      expect(tip.right <= point.left || tip.left >= point.right).toBe(true);
      expect(tip.width).toBeLessThan(frame.width / 2);
    }
  });

  test('a narrow chart: long names and values wrap inside the tip, which never covers the point (GR146)', async () => {
    const eur = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v);
    const series = [{ name: 'Besucherinnen und Besucher', values: [1200000, 1500000, 900000, 1100000] }, { name: 'Sign-ups', values: [1200, 900, 1500, 1300] }];
    await render(<div style={{ width: 320 }}><Chart title="Visitors" categories={CATS} series={series} formatValue={eur} /></div>);
    await tabIn();
    for (const key of ['', '{ArrowRight}', '{End}']) {
      if (key) await userEvent.keyboard(key);
      const point = (document.activeElement as Element).getBoundingClientRect();
      const el = document.querySelector('svg[aria-describedby] + div') as HTMLElement;
      const tip = el.getBoundingClientRect();
      expect(el.scrollWidth).toBeLessThanOrEqual(el.clientWidth);
      const apart = tip.right <= point.left || tip.left >= point.right || tip.bottom <= point.top || tip.top >= point.bottom;
      expect(apart).toBe(true);
    }
  });

  test('Escape hides the tip, focused or hovered, without moving focus; the next point shows it again (GR156)', async () => {
    await render(<Chart title="Visitors" categories={CATS} series={TWO} />);
    const tip = () => document.querySelector('svg[aria-describedby] + div');
    await tabIn();
    expect([focused(), tip() != null]).toEqual(['Visitors, Jan: 10', true]);
    await userEvent.keyboard('{Escape}');
    expect([focused(), tip()]).toEqual(['Visitors, Jan: 10', null]);
    await userEvent.keyboard('{ArrowRight}');
    expect([focused(), tip()?.textContent]).toEqual(['Visitors, Feb: 20', 'FebVisitors20Sign-ups2']);
    (document.activeElement as HTMLElement).blur();
    const pt = document.querySelectorAll('g[role="group"] > [role="img"]')[2] as SVGElement;   // Visitors, Apr (Mar has none)
    await userEvent.hover(pt);
    await expect.poll(() => tip()?.textContent).toBe('AprVisitors40Sign-ups4');
    await userEvent.keyboard('{Escape}');
    expect(tip()).toBeNull();
  });

  test('the pointer over a category shows its values and a line there; leaving hides them', async () => {
    await render(<Chart title="Visitors" categories={CATS} series={TWO} />);
    const pt = document.querySelectorAll('g[role="group"] > [role="img"]')[1] as SVGElement;
    await userEvent.hover(pt);
    await expect.poll(() => document.querySelector('svg[aria-describedby] + div')?.textContent).toBe('FebVisitors20Sign-ups2');
    expect(document.querySelector('svg[aria-describedby] > line')).not.toBeNull();
    await userEvent.unhover(pt);
    await userEvent.hover(page.getByRole('figure').element().querySelector('figcaption')!);
    await expect.poll(() => document.querySelector('svg[aria-describedby] + div')).toBeNull();
  });

  test('the pointer moving across the plot draws the tip and marks the category\'s markers, without drawing every point again', async () => {
    // formatValue is asked for each point drawn (its name says its value), each tick and each row of the tip: with
    // 100 categories in two series, drawing the points again would ask it 200 times more.
    const formatValue = vi.fn((v: number) => String(v));
    const cats = Array.from({ length: 100 }, (_, i) => 'D' + i);
    const two = [{ name: 'A', values: cats.map((_, i) => i) }, { name: 'B', values: cats.map((_, i) => 100 - i) }];
    await render(<Chart title="Daily" categories={cats} series={two} formatValue={formatValue} />);
    const marks = () => [...document.querySelectorAll<SVGElement>('g[role="group"] > [role="img"]')];
    formatValue.mockClear();
    await userEvent.hover(marks()[10]!);
    await expect.poll(() => document.querySelector('svg[aria-describedby] + div')?.textContent).toBe('D10A10B90');
    expect(formatValue.mock.calls.length).toBeLessThan(30);
    expect(marks().filter((m) => m.hasAttribute('data-active')).map((m) => m.getAttribute('aria-label'))).toEqual(['A, D10: 10', 'B, D10: 90']);
    await userEvent.hover(marks()[40]!);
    await expect.poll(() => marks().filter((m) => m.hasAttribute('data-active')).map((m) => m.getAttribute('aria-label'))).toEqual(['A, D40: 40', 'B, D40: 60']);
  });

  test('each series has its own marker shape, in the legend too', async () => {
    await render(<Chart title="Eight" categories={['a', 'b']} series={Array.from({ length: 8 }, (_, s) => ({ name: 'S' + s, values: [s, s + 1] }))} />);
    const shapes = new Set(Array.from({ length: 8 }, (_, s) => markerPath(s, 0, 0, 4)));
    expect(shapes.size).toBe(8);
    const legend = [...document.querySelectorAll('figure ul svg path:last-child')].map((m) => m.getAttribute('d'));
    expect(new Set(legend).size).toBe(8);
    expect(document.querySelector('figure ul')!.getAttribute('aria-hidden')).toBe('true');
  });

  test('bars: one per value, from zero, a pattern on every series after the first; negative bars go down', async () => {
    await render(<Chart type="bar" title="Profit" categories={['Q1', 'Q2']} series={[{ name: 'A', values: [10, -5] }, { name: 'B', values: [4, 8] }]} />);
    const bars = [...document.querySelectorAll('g[role="group"] > rect')] as SVGRectElement[];
    expect(bars.length).toBe(4);
    const base = document.querySelector('svg[aria-describedby] > g[aria-hidden] > line')!.getBoundingClientRect().y;
    const [up, down] = [bars[0]!.getBoundingClientRect(), bars[1]!.getBoundingClientRect()];
    expect(Math.abs(up.bottom - base)).toBeLessThan(1.5);
    expect(Math.abs(down.top - base)).toBeLessThan(1.5);
    expect([bars[0]!.getAttribute('fill'), bars[2]!.getAttribute('fill')?.startsWith('url(#')]).toEqual([null, true]);
  });

  test('area: a line with the space under it filled down to zero, a filled shape per series, named "Area chart"', async () => {
    await render(<Chart type="area" title="Visits" categories={CATS} series={TWO} />);
    await expect.element(page.getByRole('group', { name: 'Area chart' })).toBeInTheDocument();
    expect(document.querySelector('figure')!.dataset.type).toBe('area');
    const marks = [...document.querySelectorAll('[role="img"]')].map((m) => m.getAttribute('aria-label'));
    expect(marks).toContain('Visitors, Feb: 20');
    // The filled shapes come before the series, so the lines and markers are drawn over them.
    const groups = [...document.querySelectorAll('svg[aria-describedby] > g[aria-hidden]')];
    const fills = [...groups[groups.length - 1]!.querySelectorAll('path')];
    expect(fills).toHaveLength(2);
    // A missing value breaks the first series' shape in two.
    expect(fills[0]!.getAttribute('d')!.match(/M/g)).toHaveLength(2);
    const base = groups[1]!.querySelector('line')!.getBoundingClientRect().y;
    expect(Math.abs(fills[1]!.getBoundingClientRect().bottom - base)).toBeLessThan(1.5);
  });

  test('area, stacked: each series stands on the one before it, and its points still say their own value', async () => {
    const two = [{ name: 'Shop', values: [10, 10] }, { name: 'App', values: [5, 5] }];
    const y = (name: string) => { const r = page.getByRole('img', { name }).element().getBoundingClientRect(); return r.top + r.height / 2; };
    const { rerender } = await render(<Chart type="area" title="Orders" categories={['Jan', 'Feb']} series={two} />);
    expect(y('App, Jan: 5')).toBeGreaterThan(y('Shop, Jan: 10'));   // unstacked, 5 is lower than 10
    await rerender(<EnUS><Chart type="area" stacked title="Orders" categories={['Jan', 'Feb']} series={two} /></EnUS>);
    expect(y('App, Jan: 5')).toBeLessThan(y('Shop, Jan: 10'));   // stacked, App's line is at 15, above Shop's
    const groups = [...document.querySelectorAll('svg[aria-describedby] > g[aria-hidden]')];
    expect([...groups[0]!.querySelectorAll('text')].map((t) => t.textContent)).toContain('15');
  });

  const SOURCES = ['Search', 'Direct', 'Social', 'Email', 'Referral'];
  const VISITS = [{ name: 'Visits', values: [4200, 2600, 1800, 900, 500] }];
  test('donut: a slice per category, named with its value and share; the summary gives the total', async () => {
    await render(<Chart type="donut" title="Traffic" categories={SOURCES} series={VISITS} />);
    const plot = page.getByRole('group', { name: 'Donut chart' });
    await expect.element(plot).toBeInTheDocument();
    expect([...document.querySelectorAll('[role="img"]')].map((m) => m.getAttribute('aria-label')))
      .toEqual(['Search: 4,200 (42%)', 'Direct: 2,600 (26%)', 'Social: 1,800 (18%)', 'Email: 900 (9%)', 'Referral: 500 (5%)']);
    expect(plot.element().querySelector('desc')!.textContent).toBe('Donut chart, 1 series, 5 points from Search to Referral. Total: 10,000 Visits: lowest 500 (5%) in Referral, highest 4,200 (42%) in Search.');
    // The legend names each slice with its share, so they're told apart in words; a pattern on every slice after the first.
    expect([...document.querySelectorAll('figure ul li')].map((li) => li.textContent)).toEqual(['Search4,200 (42%)', 'Direct2,600 (26%)', 'Social1,800 (18%)', 'Email900 (9%)', 'Referral500 (5%)']);
    expect([...document.querySelectorAll('[role="img"]')].map((m) => !!m.getAttribute('fill'))).toEqual([false, true, true, true, true]);
    await expect.element(page.getByText('Total: 10,000')).toBeInTheDocument();
  });

  test('donut: one tab stop; arrows go round the slices, Home and End; the focused slice shows its share', async () => {
    await render(<Chart type="donut" title="Traffic" categories={SOURCES} series={VISITS} />);
    expect([...document.querySelectorAll('[role="img"]')].map((m) => m.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1', '-1']);
    await tabIn();
    expect(focused()).toBe('Search: 4,200 (42%)');
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    expect(focused()).toBe('Social: 1,800 (18%)');
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('Direct: 2,600 (26%)');
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('Referral: 500 (5%)');
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('Referral: 500 (5%)');
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe('Search: 4,200 (42%)');
    await expect.element(page.getByText('4,200 (42%)', { exact: true }).first()).toBeInTheDocument();
  });

  test('donut: past seven categories the rest are one "Other" slice; zero, negative and missing values have none', async () => {
    const cats = Array.from({ length: 10 }, (_, i) => 'C' + (i + 1));
    await render(<Chart type="donut" title="Many" categories={[...cats, 'Zero', 'Less', 'None']} series={[{ name: 'N', values: [...cats.map(() => 10), 0, -5, null] }]} />);
    const names = [...document.querySelectorAll('[role="img"]')].map((m) => m.getAttribute('aria-label'));
    expect(names).toHaveLength(8);
    expect(names[6]).toBe('C7: 10 (10%)');
    expect(names[7]).toBe('Other: 30 (30%)');
    // The table still lists every category.
    await userEvent.click(page.getByRole('button', { name: 'Show as table' }));
    expect(page.getByRole('row').elements()).toHaveLength(14);
  });

  test('donut, right to left: the slices go round the other way, and ArrowLeft moves on', async () => {
    await render(<div dir="rtl"><Chart type="donut" title="Traffic" categories={SOURCES} series={VISITS} /></div>);
    const first = page.getByRole('img', { name: 'Search: 4,200 (42%)' }).element().getBoundingClientRect();
    const plot = document.querySelector('svg[aria-describedby]')!.getBoundingClientRect();
    expect(first.left + first.width / 2).toBeLessThan(plot.left + plot.width / 2);   // the first slice is on the left
    await tabIn();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('Direct: 2,600 (26%)');
  });

  test('"Show as table" shows the same numbers as a sortable table, and back', async () => {
    const onViewChange = vi.fn();
    await render(<Chart title="Visitors" categories={CATS} series={TWO} onViewChange={onViewChange} />);
    await userEvent.click(page.getByRole('button', { name: 'Show as table' }));
    expect(onViewChange).toHaveBeenCalledWith('table');
    const table = page.getByRole('table', { name: 'Visitors' });
    await expect.element(table).toBeInTheDocument();
    const rows = () => [...table.element().querySelectorAll('tbody tr')].map((r) => r.textContent);
    expect(rows()).toEqual(['Jan101', 'Feb202', 'MarNo value3', 'Apr404']);
    await userEvent.click(page.getByRole('button', { name: 'Visitors' }));
    expect(rows()).toEqual(['Jan101', 'Feb202', 'Apr404', 'MarNo value3']);
    await userEvent.click(page.getByRole('button', { name: 'Visitors' }));
    expect(rows()).toEqual(['Apr404', 'Feb202', 'Jan101', 'MarNo value3']);
    expect(document.querySelector('svg[aria-describedby]')).toBeNull();
    await userEvent.click(page.getByRole('button', { name: 'Show as chart' }));
    await expect.element(page.getByRole('group', { name: 'Line chart' })).toBeInTheDocument();
  });

  test('view is controlled when given', async () => {
    const r = await render(<Chart title="V" categories={CATS} series={TWO} view="table" />);
    await userEvent.click(page.getByRole('button', { name: 'Show as chart' }));
    await expect.element(page.getByRole('table')).toBeInTheDocument();
    await r.rerender(<Chart title="V" categories={CATS} series={TWO} view="chart" />);
    await expect.element(page.getByRole('group', { name: 'Line chart' })).toBeInTheDocument();
  });

  test('takes its box\'s width, and follows it', async () => {
    await render(<div id="box" style={{ width: 300 }}><Chart title="V" categories={CATS} series={TWO} /></div>);
    const svg = () => document.querySelector('svg[aria-describedby]') as SVGSVGElement;
    expect(svg().getAttribute('width')).toBe('300');
    el('box').style.width = '500px';
    await expect.poll(() => svg().getAttribute('width')).toBe('500');
  });

  test('formatValue reaches the axis, the points and the summary; labels change the words', async () => {
    await render(<Chart title="V" categories={['a', 'b']} series={[{ name: 'S', values: [1000, 2000] }]} formatValue={(v) => `$${v / 1000}k`} />);
    expect(document.querySelector('g[role="group"] > [role="img"]')!.getAttribute('aria-label')).toBe('a: $1k');
    expect([...document.querySelectorAll('svg[aria-describedby] > g[aria-hidden] > g > text')].map((t) => t.textContent)).toContain('$2k');
  });

  test('ticks are round numbers that cover the values', () => {
    expect(niceTicks(0, 330, 4)).toEqual([0, 100, 200, 300, 400]);
    expect(niceTicks(-8, 18, 4)).toEqual([-10, 0, 10, 20]);
    expect(niceTicks(0, 0, 4)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(niceTicks(0.1, 0.9, 4)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  test('the line draws in once and the bars grow, unless motion is reduced (CSS)', async () => {
    await render(<><Chart title="L" categories={CATS} series={TWO} /><Chart type="bar" title="B" categories={CATS} series={TWO} /></>);
    await withMotion(async () => {
      expect(css(document.querySelector('svg[aria-describedby] g[role="group"] > path[aria-hidden]')).animationName).toBe('dk-chart-draw');
      expect(css(document.querySelector('figure[data-type="bar"] g[role="group"] > [role="img"]')).animationName).toBe('dk-chart-grow');
    });
    const sheet = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } });
    const text = sheet.map((r) => r.cssText).join('\n');
    expect(text).toMatch(/prefers-reduced-motion: no-preference\)[^@]*dk-chart-draw/);
  });

  test('labels, title and table text read 4.5:1 on the surface in all six themes', async () => {
    await render(<div id="bg" style={{ background: 'var(--surface)' }}><Chart id="c" title="V" categories={CATS} series={TWO} /></div>);
    const label = document.querySelector('svg[aria-describedby] > g[aria-hidden] > g > text') as SVGElement;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(el('bg')).backgroundColor;
      expect(contrast(css(label).fill, bg), th + ' label').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(el('c')).color, bg), th + ' title').toBeGreaterThanOrEqual(4.5);
    }
    document.documentElement.removeAttribute('data-theme');
  });

  test('loading: before the first numbers, a placeholder as tall as the plot that is said once; with numbers, they stay', async () => {
    const { rerender } = await render(<Chart id="c" title="Visitors" categories={[]} series={[]} loading loadingLabel="Loading visitors" height={200} />);
    const e = el('c');
    expect(e.getAttribute('aria-busy')).toBe('true');
    // The title, the table button (disabled), the placeholder and the legend's empty line: no plot, and nothing a
    // screen reader reads.
    const toggle = page.getByRole('button').all();
    expect([toggle.length, toggle[0] && (toggle[0].element() as HTMLButtonElement).disabled, e.querySelector('svg'), page.getByRole('progressbar').all().length]).toEqual([1, true, null, 0]);
    const tall = e.getBoundingClientRect().height;
    const art = e.querySelector('[data-component="loader"]') as HTMLElement;
    expect(art.getAttribute('aria-hidden')).toBe('true');
    await expect.poll(() => document.querySelector('[data-dk-announcer]')?.textContent || '', { timeout: 3000 }).toContain('Loading visitors');
    const block = art.getBoundingClientRect().height;
    await rerender(<Chart id="c" title="Visitors" categories={CATS} series={TWO} height={200} />);
    expect([block, (e.querySelector('svg') as SVGElement).getBoundingClientRect().height, e.hasAttribute('aria-busy')]).toEqual([200, 200, false]);
    // Nothing below the chart moves when the numbers arrive: the button and the legend's line were already there.
    expect(e.getBoundingClientRect().height).toBe(tall);
    // Refreshing numbers already shown: the chart stays, busy.
    await rerender(<Chart id="c" title="Visitors" categories={CATS} series={TWO} loading />);
    expect([e.getAttribute('aria-busy'), !!e.querySelector('svg'), e.querySelector('[data-component="loader"]')]).toEqual(['true', true, null]);
    // Without a loadingLabel it says the shared "Loading…".
    await rerender(<Chart id="d" aria-label="Orders" categories={[]} series={[]} loading />);
    await expect.poll(() => document.querySelector('[data-dk-announcer]')?.textContent || '', { timeout: 3000 }).toContain('Loading…');
  });
});
