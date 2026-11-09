import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { DescriptionItem, DescriptionList } from './DescriptionList';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const box = (e: Element) => e.getBoundingClientRect();
const List = (p: React.ComponentProps<typeof DescriptionList> & { width?: number }) => (
  <div style={{ width: p.width ?? 600 }}>
    <DescriptionList id="dl" {...p}>
      <DescriptionItem id="a" term="Owner">Ayu Lestari</DescriptionItem>
      <DescriptionItem id="b" term="Created">14 March 2026</DescriptionItem>
    </DescriptionList>
  </div>
);
const parts = (id: string) => [el(id).querySelector('dt')!, el(id).querySelector('dd')!] as const;

describe('DescriptionList', () => {
  test('a <dl> of <div>s, each a <dt> and a <dd>; ref, className and other props reach the list and the item', async () => {
    const ref = React.createRef<HTMLDListElement>(), item = React.createRef<HTMLDivElement>();
    await render(<DescriptionList id="x" ref={ref} className="extra" data-x="y"><DescriptionItem ref={item} id="i" className="mine" term="T">D</DescriptionItem></DescriptionList>);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DL', true, 'dk-description-list dk-description-list--inline extra', 'y', 'description-list']);
    expect([...el('i').children].map((c) => c.tagName)).toEqual(['DT', 'DD']);
    expect([item.current === el('i'), el('i').className, el('i').textContent]).toEqual([true, 'dk-description-list__item mine', 'TD']);
    expect(css(el('i').querySelector('dd')).marginInlineStart).toBe('0px');
  });

  test('inline: the term in a third-wide column beside its details, at the same top', async () => {
    await render(<List />);
    const [dt, dd] = parts('a');
    expect(box(dd).left).toBeGreaterThan(box(dt).right);
    expect(Math.abs(box(dd).top - box(dt).top)).toBeLessThan(1);
    expect(Math.round(box(dt).width)).toBe(200);
  });

  test('inline stacks when the list is narrower than 480px; stacked always does', async () => {
    const { rerender } = await render(<List width={300} />);
    let [dt, dd] = parts('a');
    expect(box(dd).top).toBeGreaterThanOrEqual(box(dt).bottom);
    await rerender(<List layout="stacked" />);
    [dt, dd] = parts('a');
    expect(box(dd).top).toBeGreaterThanOrEqual(box(dt).bottom);
    expect(Math.abs(box(dd).left - box(dt).left)).toBeLessThan(1);
  });

  test('split: the details at the end of the term\'s row, and on their own line under it when both don\'t fit', async () => {
    await render(<List layout="split" />);
    const [dt, dd] = parts('a');
    expect(Math.abs(box(dd).right - box(el('dl')).right)).toBeLessThan(1);
    expect(box(dd).top).toBeLessThan(box(dt).bottom);
    await render(<div style={{ width: 160 }}><DescriptionList layout="split"><DescriptionItem id="w" term="A rather long term">and long details here</DescriptionItem></DescriptionList></div>);
    const [t2, d2] = parts('w');
    expect(box(d2).top).toBeGreaterThanOrEqual(box(t2).bottom - 1);
  });

  test('right to left: inline puts the term on the right, split puts the details on the left', async () => {
    await render(<div dir="rtl"><List /><DescriptionList layout="split" style={{ width: 600 }}><DescriptionItem id="s" term="T">D</DescriptionItem></DescriptionList></div>);
    const [dt, dd] = parts('a');
    expect(box(dt).left).toBeGreaterThan(box(dd).right);
    const [t2, d2] = parts('s');
    expect(box(d2).right).toBeLessThan(box(t2).left);
  });

  test('a long word or URL wraps inside the list instead of widening it', async () => {
    for (const layout of ['inline', 'stacked', 'split'] as const) {
      await render(<div style={{ width: 240 }}><DescriptionList id={layout} layout={layout}><DescriptionItem term="Donaudampfschifffahrtsgesellschaft">https://example.com/a/very/long/path/without/any/spaces/at/all</DescriptionItem></DescriptionList></div>);
      expect(el(layout).scrollWidth, layout).toBeLessThanOrEqual(240);
    }
  });

  test('dividers: a hairline between items, none above the first; emphasis makes a row semibold', async () => {
    await render(<DescriptionList dividers><DescriptionItem id="d1" term="A">1</DescriptionItem><DescriptionItem id="d2" term="B" emphasis>2</DescriptionItem></DescriptionList>);
    expect([css(el('d1')).borderTopWidth, css(el('d2')).borderTopWidth]).toEqual(['0px', '1px']);
    expect(css(el('d2').querySelector('dd')).fontWeight).toBe('600');
  });

  test('terms and details read 4.5:1 on the page in all six themes', async () => {
    await render(<List />);
    const [dt, dd] = parts('a');
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(document.body).backgroundColor;
      for (const e of [dt, dd]) expect(contrast(css(e).color, bg), th).toBeGreaterThanOrEqual(4.5);
    }
  });
});
