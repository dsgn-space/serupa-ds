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
    await render(<Chart title="One" categories={CATS} series={[TWO[1]]} />);
    expect(document.querySelectorAll('figure[data-component="chart"]')[1].querySelector('g[role="group"] > [role="img"]')!.getAttribute('aria-label')).toBe('Jan: 1');
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
    const pts = [...document.querySelectorAll('svg[aria-describedby] g[role="group"]')[0].querySelectorAll('g[role="group"] > [role="img"]')].map((p) => p.getBoundingClientRect().x);
    expect(pts[0]).toBeGreaterThan(pts[1]);
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
    const [up, down] = [bars[0].getBoundingClientRect(), bars[1].getBoundingClientRect()];
    expect(Math.abs(up.bottom - base)).toBeLessThan(1.5);
    expect(Math.abs(down.top - base)).toBeLessThan(1.5);
    expect([bars[0].getAttribute('fill'), bars[2].getAttribute('fill')?.startsWith('url(#')]).toEqual([null, true]);
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
});
