import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { CodeBlock } from './CodeBlock';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const CODE = 'const a = 1;\nconst b = 2;\nconst c = a + b;\n';
const pre = () => document.querySelector('pre') as HTMLPreElement;

describe('CodeBlock', () => {
  test('renders a <div>; ref, className and other props reach it; the code is in a <pre><code>', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<CodeBlock id="x" ref={ref} className="extra" data-x="y" code={CODE} language="js" />);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component, e.dataset.language]).toEqual(['DIV', true, 'dk-code-block extra', 'y', 'code-block', 'js']);
    expect(pre().textContent).toBe('const a = 1;\nconst b = 2;\nconst c = a + b;');   // the last line break left out
    expect(pre().querySelector('code')!.className).toBe('dk-code-block__code language-js');
  });

  test('the copy button copies the whole code, and is named', async () => {
    let copied = '';
    const was = navigator.clipboard.writeText;
    navigator.clipboard.writeText = async (t: string) => { copied = t; };
    try {
      await render(<CodeBlock code={CODE} />);
      await userEvent.click(page.getByRole('button', { name: 'Copy code' }));
      await expect.poll(() => copied).toBe('const a = 1;\nconst b = 2;\nconst c = a + b;');
    } finally { navigator.clipboard.writeText = was; }
  });

  test('copyable={false} has no button; without a title the language shows in the header', async () => {
    await render(<><CodeBlock id="a" code={CODE} copyable={false} /><CodeBlock id="b" code={CODE} language="sh" /></>);
    expect(el('a').querySelector('button')).toBeNull();
    expect(el('a').firstElementChild!.tagName).toBe('PRE');   // no header above the code
    expect(el('b').firstElementChild!.textContent).toBe('sh');
  });

  test('a box that scrolls is a named region in the tab order; one that fits is neither', async () => {
    await render(<div style={{ width: 200 }}><CodeBlock id="w" title="App.tsx" code={'x'.repeat(200)} /><CodeBlock id="n" code="ok" /></div>);
    const wide = el('w').querySelector('pre')!, small = el('n').querySelector('pre')!;
    await expect.poll(() => wide.getAttribute('tabindex')).toBe('0');
    await expect.element(page.getByRole('region', { name: 'App.tsx' })).toBeInTheDocument();
    expect([small.getAttribute('tabindex'), small.getAttribute('role')]).toEqual([null, null]);
    wide.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    await expect.poll(() => wide.scrollLeft).toBeGreaterThan(0);
  });

  test('a scrolling box with no title is named by its language, or "Code"', async () => {
    await render(<div style={{ width: 160 }}><CodeBlock language="sql" code={'y'.repeat(200)} /><CodeBlock code={'z'.repeat(200)} /></div>);
    await expect.element(page.getByRole('region', { name: 'sql' })).toBeInTheDocument();
    await expect.element(page.getByRole('region', { name: 'Code' })).toBeInTheDocument();
  });

  test('line numbers count from startLine, out of the copied text; highlight marks lines and ranges', async () => {
    await render(<CodeBlock code={'a\nb\nc\nd\ne'} lineNumbers startLine={9} highlight={[9, [11, 12], 40]} />);
    const lines = [...pre().querySelector('code')!.children];
    expect(lines.map((l) => getComputedStyle(l, '::before').content)).toEqual(Array(5).fill('counter(dk-code-line)'));
    expect(lines.map((l) => l.tagName)).toEqual(['MARK', 'SPAN', 'MARK', 'MARK', 'SPAN']);
    expect(pre().textContent).toBe('a\nb\nc\nd\ne');
    // The numbers are counters: 9 to 13, the gutter two digits wide.
    expect(pre().style.counterReset).toBe('dk-code-line 8');
    expect(pre().style.getPropertyValue('--dk-code-digits')).toBe('2');
  });

  test('copied by hand, the code keeps its blank lines and indents, with line numbers or without (GR114)', async () => {
    const code = 'a = 1\n\n\nb = 2\n  c\n';
    await render(<><CodeBlock id="n" code={code} lineNumbers /><CodeBlock id="p" code={code} /><CodeBlock id="h" code={code} lineNumbers highlight={[2]} /></>);
    const copied = (id: string) => {
      const r = document.createRange();
      r.selectNodeContents(el(id).querySelector('code')!);
      const sel = getSelection()!;
      sel.removeAllRanges(); sel.addRange(r);
      // Safari ends a selection that runs to the end of a block line with a line break; code ends with one anyway.
      const text = sel.toString().replace(/\n$/, '');
      sel.removeAllRanges();
      return text;
    };
    expect(['n', 'p', 'h'].map(copied)).toEqual(Array(3).fill('a = 1\n\n\nb = 2\n  c'));
  });

  test('wrap breaks long lines instead of scrolling', async () => {
    await render(<div style={{ width: 200 }}><CodeBlock code={'word '.repeat(40)} wrap /></div>);
    expect(pre().scrollWidth).toBeLessThanOrEqual(pre().clientWidth + 1);
    expect(pre().getAttribute('tabindex')).toBeNull();
  });

  test('code reads left to right on a right-to-left page', async () => {
    await render(<div dir="rtl"><CodeBlock code="run();" /></div>);
    expect(css(pre()).direction).toBe('ltr');
  });

  test('its text, the muted words and marked lines read 4.5:1 in all six themes', async () => {
    await render(<CodeBlock id="c" code={'a\nb'} language="ts" lineNumbers highlight={[2]} />);
    const mark = el('c').querySelector('mark')!, lang = el('c').firstElementChild!.firstElementChild!;   // the header's language
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(el('c')).backgroundColor;
      expect(contrast(css(el('c')).color, bg), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(lang).color, bg), th + ' language').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(mark).color, css(mark).backgroundColor), th + ' marked').toBeGreaterThanOrEqual(4.5);
      expect(contrast(getComputedStyle(mark, '::before').color, css(mark).backgroundColor), th + ' marked number').toBeGreaterThanOrEqual(4.5);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});
