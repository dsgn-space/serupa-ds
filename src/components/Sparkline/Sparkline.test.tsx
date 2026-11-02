import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { Sparkline } from './Sparkline';
import { SerupaProvider } from '../../internal/provider';

const el = (id: string) => document.getElementById(id) as unknown as SVGSVGElement;
// The parts, by the class each <path> carries (the drawing has no roles inside to find them by).
const part = (svg: Element, kind: string) => [...svg.querySelectorAll('path')].find((p) => p.getAttribute('class') === 'dk-sparkline__' + kind);
const points = (d: string) => [...d.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);

describe('Sparkline', () => {
  test('renders an <svg>; ref, className and other props reach it', async () => {
    const ref = React.createRef<SVGSVGElement>();
    await render(<Sparkline id="x" ref={ref} className="extra" data-x="y" data={[1, 2]} label="Visits" />);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.getAttribute('class'), e.dataset.x, e.dataset.component]).toEqual(['svg', true, 'dk-sparkline extra', 'y', 'sparkline']);
  });

  test('is an image named by its label and its first, last, low and high values', async () => {
    await render(<Sparkline data={[12, 9, 21, 18]} label="Revenue" format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} />);
    await expect.element(page.getByRole('img', { name: 'Revenue: from $12 to $18, low $9, high $21' })).toBeInTheDocument();
  });

  test('speaks the provider’s language and number format', async () => {
    await render(<SerupaProvider locale="de"><Sparkline data={[1200.5, 900]} label="Umsatz" /></SerupaProvider>);
    await expect.element(page.getByRole('img', { name: 'Umsatz: from 1.200,5 to 900, low 900, high 1.200,5' })).toBeInTheDocument();
  });

  test('draws oldest to newest, highest at the top, with a dot on the latest', async () => {
    await render(<Sparkline id="s" data={[0, 10, 5]} label="x" />);
    expect(points(part(el('s'), 'line')!.getAttribute('d')!)).toEqual([[0, 26], [50, 4], [100, 15]]);
    expect(points(part(el('s'), 'dot')!.getAttribute('d')!)).toEqual([[100, 15]]);
    expect(part(el('s'), 'area')).toBeUndefined();
  });

  test('min and max set a shared scale, and values outside it stay in the box', async () => {
    await render(<Sparkline id="s" data={[-5, 10, 30]} label="x" min={0} max={20} />);
    expect(points(part(el('s'), 'line')!.getAttribute('d')!).map((p) => p[1])).toEqual([26, 15, 4]);
  });

  test('area fills under the line; flat, single and empty data draw without NaN', async () => {
    await render(<>
      <Sparkline id="a" data={[1, 3, 2]} label="a" area />
      <Sparkline id="f" data={[5, 5, 5]} label="f" />
      <Sparkline id="o" data={[7]} label="o" />
      <Sparkline id="e" data={[]} label="Nothing yet" />
      <Sparkline id="n" data={[1, NaN, Infinity, 3]} label="n" />
    </>);
    expect(part(el('a'), 'area')!.getAttribute('d')).toMatch(/L100 30L0 30Z$/);
    expect(points(part(el('f'), 'line')!.getAttribute('d')!).map((p) => p[1])).toEqual([15, 15, 15]);
    expect([part(el('o'), 'line'), points(part(el('o'), 'dot')!.getAttribute('d')!)]).toEqual([undefined, [[50, 15]]]);
    expect([el('e').querySelectorAll('path').length, el('e').getAttribute('aria-label')]).toEqual([0, 'Nothing yet']);
    expect(el('n').getAttribute('aria-label')).toBe('n: from 1 to 3, low 1, high 3');
    expect(document.body.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  test('is 80 × 20px and its line keeps 2px whatever the stretch', async () => {
    await render(<Sparkline id="s" data={[1, 2, 3]} label="x" />);
    const r = el('s').getBoundingClientRect();
    expect([r.width, r.height, part(el('s'), 'line')!.getAttribute('vector-effect'), css(part(el('s'), 'line')!).strokeWidth]).toEqual([80, 20, 'non-scaling-stroke', '2px']);
  });

  test('its line reads 3:1 on the surface in all six themes', async () => {
    await render(<div id="bg" style={{ background: 'var(--surface)' }}><Sparkline id="c" data={[1, 2]} label="x" /></div>);
    const line = part(el('c'), 'line')!;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(line).stroke, css(document.getElementById('bg')).backgroundColor), th).toBeGreaterThanOrEqual(3);
    }
  });
});
