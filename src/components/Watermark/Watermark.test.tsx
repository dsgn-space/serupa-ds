import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { THEMES, color, contrast, css, forcedColors } from '../../../tools/test/vitest/helpers';
import { Watermark, tile } from './Watermark';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const markOf = (root: HTMLElement) => root.querySelector<HTMLElement>('.srp-watermark__mark');
const rgb = (c: string) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
// The mark's color laid over the page at the mark's opacity: the darkest (or, in dark mode, the lightest) it gets.
const blend = (mark: HTMLElement, page: string) => {
  const a = Number(css(mark).opacity);
  const [m, p] = [rgb(css(mark).backgroundColor), rgb(color(page))];
  return `rgb(${p.map((v, i) => Math.round(v * (1 - a) + m[i]! * a)).join(', ')})`;
};

describe('Watermark', () => {
  test('renders a <div> round its content; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Watermark id="x" ref={ref} className="extra" data-x="y" text="Draft"><p>Hello</p></Watermark>);
    const e = el('x');
    expect([e.tagName, e.textContent, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DIV', 'Hello', true, 'srp-watermark extra', 'y', 'watermark']);
  });

  test('the mark is hidden from screen readers and holds no text to read, find or copy', async () => {
    await render(<Watermark id="x" text={['Ada Lovelace', 'ada@example.com']}><p>Body text</p></Watermark>);
    const mark = markOf(el('x'))!;
    expect([mark.getAttribute('aria-hidden'), mark.textContent, mark.children.length]).toEqual(['true', '', 0]);
    const range = document.createRange();
    range.selectNodeContents(el('x'));
    getSelection()!.removeAllRanges();
    getSelection()!.addRange(range);
    expect(getSelection()!.toString().trim()).toBe('Body text');
  });

  test('clicks and focus pass through the mark to the content under it', async () => {
    let clicked = 0;
    await render(<Watermark id="x" text="Draft"><button type="button" style={{ width: 200, height: 80 }} onClick={() => clicked++}>Sign</button></Watermark>);
    const button = el('x').querySelector('button')!;
    const r = button.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    expect(hit).toBe(button);
    (hit as HTMLElement).click();
    expect(clicked).toBe(1);
    expect(css(markOf(el('x'))).pointerEvents).toBe('none');
  });

  test('the mark covers the content box and lies over it', async () => {
    await render(<Watermark id="x" text="Draft"><div style={{ height: 300 }} /></Watermark>);
    const [box, mark] = [el('x').getBoundingClientRect(), markOf(el('x'))!.getBoundingClientRect()];
    expect([mark.top, mark.left, mark.width, mark.height]).toEqual([box.top, box.left, box.width, box.height]);
    expect(css(markOf(el('x'))).maskImage).toMatch(/^url\("data:image\/svg\+xml,/);
  });

  test('body text over the mark keeps 4.5:1 in every theme', async () => {
    await render(<Watermark id="x" text="Confidential"><p id="p">Body text</p></Watermark>);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const under = blend(markOf(el('x'))!, 'var(--surface)');
      expect(contrast(css(el('p')).color, under), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast('var(--text-muted)', under), `${th} muted`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('fullPage covers the window, above the page, and stays put on scroll', async () => {
    await render(<Watermark id="x" text="Shared screen" fullPage><p>Body</p></Watermark>);
    const mark = markOf(el('x'))!;
    const r = mark.getBoundingClientRect();
    expect([css(mark).position, r.width, r.height]).toEqual(['fixed', innerWidth, innerHeight]);
    expect(Number(css(mark).zIndex)).toBeGreaterThan(Number(getComputedStyle(document.documentElement).getPropertyValue('--z-toast')));
  });

  test('it prints, and goes under forced colors', async () => {
    await render(<Watermark id="x" text="Draft"><p>Body</p></Watermark>);
    // Every rule on the page, inside layers and media blocks too, with the media it applies under.
    const walk = (rules: CSSRuleList, media: string): Array<[CSSRule, string]> => [...rules].flatMap((r) =>
      r instanceof CSSMediaRule ? walk(r.cssRules, r.media.mediaText) : r instanceof CSSGroupingRule ? walk(r.cssRules, media) : [[r, media] as [CSSRule, string]]);
    const print = [...document.styleSheets].flatMap((sheet) => { try { return walk(sheet.cssRules, ''); } catch { return []; } })
      .some(([r, media]) => media === 'print' && r instanceof CSSStyleRule && r.selectorText === '.srp-watermark__mark' && r.style.printColorAdjust === 'exact');
    expect(print).toBe(true);
    await forcedColors((active) => {
      if (active) expect(css(markOf(el('x'))).display).toBe('none');
    });
  });

  test('no words, no mark', async () => {
    await render(<Watermark id="x" text={['', '  ']}><p>Body</p></Watermark>);
    expect(markOf(el('x'))).toBeNull();
  });

  test('each line is drawn, and markup in the text stays text', async () => {
    const { url } = tile(['Ada <b>&', 'ada@example.com'], 3, -22);
    const svg = decodeURIComponent(url.slice('url("data:image/svg+xml,'.length, -2));
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    expect([...doc.querySelectorAll('tspan')].map((t) => t.textContent)).toEqual(['Ada <b>&', 'ada@example.com']);
    expect(doc.querySelector('b')).toBeNull();
  });

  test("gap 'lg' spreads the marks out, and rotate turns them", async () => {
    const md = tile(['Draft'], 3, -22), lg = tile(['Draft'], 6, -22), flat = tile(['Draft'], 3, 0);
    expect([lg.w > md.w, lg.h > md.h]).toEqual([true, true]);
    expect(flat.h < md.h).toBe(true);
    await render(<Watermark id="x" text="Draft" gap="lg" rotate={500}><p>Body</p></Watermark>);
    const style = markOf(el('x'))!.style;
    expect(Number(style.getPropertyValue('--srp-watermark-w'))).toBe(tile(['Draft'], 6, 90).w);
  });

  test('wide scripts get room: a CJK mark is wider than the same number of Latin letters', () => {
    expect(tile(['机密文件'], 3, 0).w).toBeGreaterThan(tile(['abcd'], 3, 0).w);
  });
});
