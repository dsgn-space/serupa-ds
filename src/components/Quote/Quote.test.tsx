import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { Quote } from './Quote';

const el = (id: string) => document.getElementById(id) as HTMLElement;

describe('Quote', () => {
  test('renders a <figure>; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLElement>();
    await render(<Quote id="x" ref={ref} className="extra" data-x="y">Hello</Quote>);
    const e = el('x');
    expect([e.tagName, e.textContent, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['FIGURE', 'Hello', true, 'dk-quote extra', 'y', 'quote']);
  });

  test('the words are in a <blockquote> with cite; who said them is in a <figcaption> outside it', async () => {
    await render(<Quote id="q" cite="https://example.com/review" author="Ada Rahman" source="Lumen" avatar={<img alt="" id="pic" />}>Fast.</Quote>);
    const q = el('q');
    const bq = q.querySelector('blockquote')!;
    const cap = q.querySelector('figcaption')!;
    expect([bq.getAttribute('cite'), bq.innerHTML, bq.contains(cap), cap.textContent, cap.contains(el('pic'))])
      .toEqual(['https://example.com/review', '<p>Fast.</p>', false, 'Ada RahmanLumen', true]);
  });

  test('elements pass through as given; no author and no source means no figcaption', async () => {
    await render(<Quote id="q" author="" source={false}><p>One.</p><p>Two.</p></Quote>);
    expect([el('q').querySelectorAll('blockquote > p').length, el('q').querySelector('figcaption')]).toEqual([2, null]);
  });

  test('a source alone is shown without an author', async () => {
    await render(<Quote id="q" source="The Annual Report">Words.</Quote>);
    expect([el('q').querySelector('.dk-quote__author'), el('q').querySelector('.dk-quote__source')?.textContent]).toEqual([null, 'The Annual Report']);
  });

  test("'lg' sets the words larger than 'md'", async () => {
    await render(<><Quote id="m">Words.</Quote><Quote id="l" size="lg">Words.</Quote></>);
    const size = (id: string) => parseFloat(css(el(id).querySelector('blockquote')).fontSize);
    expect(size('l')).toBeGreaterThan(size('m'));
  });

  test('the rule sits on the start edge, so it moves to the right in right-to-left text', async () => {
    await render(<div dir="rtl"><Quote id="r">كلمات</Quote></div>);
    const s = css(el('r'));
    expect([parseFloat(s.borderRightWidth) > 0, parseFloat(s.borderLeftWidth)]).toEqual([true, 0]);
  });

  test('its words and its source read 4.5:1 on the page in all six themes', async () => {
    await render(<Quote id="c" author="Ada" source="Lumen">Text</Quote>);
    const src = el('c').querySelector('.dk-quote__source')!;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(el('c')).color, 'var(--surface)'), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(src).color, 'var(--surface)'), th).toBeGreaterThanOrEqual(4.5);
    }
  });
});
