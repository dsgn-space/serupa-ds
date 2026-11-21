import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { css, flexAlign } from '../../../tools/test/vitest/helpers';
import { Stack } from './Stack';

const el = (id: string) => document.getElementById(id) as HTMLElement;
// Grey boxes, each 5px taller than the one before, optionally a fixed width.
const boxes = (n: number, w?: string) => Array.from({ length: n }, (_, i) => <div key={i} style={{ background: '#ccc', width: w, height: `${10 + i * 5}px` }} />);
// Each child's box, relative to the stack's top-left corner.
const kids = (id: string) => {
  const o = el(id).getBoundingClientRect();
  return [...el(id).children].map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left - o.left), y: Math.round(r.top - o.top), w: Math.round(r.width), h: Math.round(r.height) }; });
};
const Wide = ({ children }: { children: React.ReactNode }) => <div style={{ width: '600px' }}>{children}</div>;

describe('Stack', () => {
  test('defaults: a <div>; ref, className and props reach it', async () => {
    const r = React.createRef<HTMLElement>();
    await render(<Wide><Stack id="sdef" ref={r} className="extra" data-x="y">{boxes(3)}</Stack></Wide>);
    const e = el('sdef');
    expect([e.tagName, e.className, e.dataset.component, r.current === e, e.dataset.x]).toEqual(['DIV', 'srp-stack srp-stack--align-stretch extra', 'stack', true, 'y']);
  });

  test('a column, 16px apart (spacing-4), children stretched', async () => {
    await render(<Wide><Stack id="sdef">{boxes(3)}</Stack></Wide>);
    const s = css(el('sdef')), k = kids('sdef');
    expect([s.display, s.flexDirection, s.rowGap, s.alignItems]).toEqual(['flex', 'column', '16px', 'stretch']);
    expect([k[1]!.y - (k[0]!.y + k[0]!.h), k[0]!.w]).toEqual([16, 600]);
  });

  test('gap={1.5}: 6px (spacing-1.5, the dot escaped)', async () => {
    await render(<Wide><Stack id="sgap" gap={1.5}>{boxes(2)}</Stack></Wide>);
    expect(css(el('sgap')).rowGap).toBe('6px');
  });

  test('row: side by side, centered, justify between', async () => {
    await render(<Wide><Stack id="srow" direction="row" gap={2} justify="between">{boxes(3, '20px')}</Stack></Wide>);
    const s = css(el('srow')), k = kids('srow');
    expect([s.flexDirection, s.columnGap, s.alignItems, s.justifyContent]).toEqual(['row', '8px', 'center', 'space-between']);
    expect(k[2]!.x + k[2]!.w).toBe(600);
    expect(k[0]!.y).toBeGreaterThan(k[2]!.y);
  });

  test('unknown as, gap, align, justify and direction fall back', async () => {
    await render(<Wide><Stack id="sbad" as={'table' as never} gap={7.7 as never} align={'up' as never} justify={'around' as never} direction={'diag' as never}>{boxes(2)}</Stack></Wide>);
    const e = el('sbad');
    expect([e.tagName, e.className, css(e).rowGap].join(' ')).toBe('DIV srp-stack srp-stack--align-stretch 16px');
  });

  test('as ul: no bullets, padding or margin', async () => {
    await render(<Stack id="sul" as="ul"><li>a</li><li>b</li></Stack>);
    const s = css(el('sul'));
    expect([s.listStyleType, s.paddingLeft, s.marginTop]).toEqual(['none', '0px', '0px']);
  });

  test('wrap: a row that wraps onto more lines', async () => {
    await render(<div style={{ width: '50px' }}><Stack id="swrap" direction="row" wrap gap={0}>{boxes(4, '20px')}</Stack></div>);
    const k = kids('swrap');
    expect(k[2]!.y).toBeGreaterThan(k[0]!.y);
  });

  test('the --stack-gap token sets the default gap', async () => {
    await render(<Stack id="stok" style={{ '--stack-gap': '3px' } as React.CSSProperties}>{boxes(2)}</Stack>);
    expect(css(el('stok')).rowGap).toBe('3px');
  });

  describe('per screen width', () => {
    afterEach(async () => { await page.viewport(414, 800); });

    test('direction={{ base: "column", md: "row" }}: stacked on a phone, side by side from 768px; align follows each width\'s direction', async () => {
      await render(<Stack id="sresp" direction={{ base: 'column', md: 'row' }} gap={{ base: 2, lg: 6 }}>{boxes(2, '20px')}</Stack>);
      const at = async (w: number) => { await page.viewport(w, 800); const s = css(el('sresp')); return [s.flexDirection, s.alignItems, s.rowGap]; };
      expect(await at(414)).toEqual(['column', 'stretch', '8px']);
      expect(await at(700)).toEqual(['column', 'stretch', '8px']);
      expect(await at(800)).toEqual(['row', 'center', '8px']);
      expect(await at(1100)).toEqual(['row', 'center', '24px']);
    });

    test('align per width, and the server markup carries every width: classes for the changes, the gaps as variables', async () => {
      await page.viewport(414, 800);
      await render(<Stack id="salign" direction="row" align={{ base: 'start', sm: 'end' }} gap={{ sm: 3 }}>{boxes(2)}</Stack>);
      expect(el('salign').className).toBe('srp-stack srp-stack--row srp-stack--align-start srp-stack--sm-align-end srp-stack--gaps');
      expect(flexAlign(css(el('salign')).alignItems)).toBe('flex-start');
      expect(css(el('salign')).columnGap).toBe('16px');   // no base: the default gap
      await page.viewport(700, 800);
      expect([flexAlign(css(el('salign')).alignItems), css(el('salign')).columnGap]).toEqual(['flex-end', '12px']);
    });
  });
});
