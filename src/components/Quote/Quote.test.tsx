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
    expect([e.tagName, e.textContent, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['FIGURE', 'Hello', true, 'srp-quote extra', 'y', 'quote']);
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
    expect(el('q').querySelector('figcaption')?.textContent).toBe('The Annual Report');
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

  test('its words and its source read 4.5:1 on the page in every theme', async () => {
    await render(<Quote id="c" author="Ada" source="Lumen">Text</Quote>);
    const src = [...el('c').querySelectorAll('figcaption span')].find((s) => s.textContent === 'Lumen')!;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(el('c')).color, 'var(--surface)'), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(src).color, 'var(--surface)'), th).toBeGreaterThanOrEqual(4.5);
    }
  });
  test('the words keep a reading measure: about 65 characters a line in a wide column, at both sizes', async () => {
    const long = 'Every screen we shipped this year started from these parts, and nobody had to ask which shade of grey a border should be again.';
    await render(<div style={{ width: 1600 }}>
      <Quote id="md">{long}</Quote><Quote id="lg" size="lg">{long}</Quote>
    </div>);
    const words = (id: string) => el(id).querySelector('blockquote')!;
    // One ch of the words' own face and size: the width of a 0.
    const ch = (id: string) => { const z = document.createElement('span'); z.textContent = '0'; words(id).append(z); const w = z.getBoundingClientRect().width; z.remove(); return w; };
    for (const id of ['md', 'lg']) expect(Math.round(words(id).getBoundingClientRect().width / ch(id)), id).toBe(65);
  });
});
