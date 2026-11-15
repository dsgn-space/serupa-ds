import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { TruncatedText } from './TruncatedText';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const LONG = 'quarterly-report-final-version-2-reviewed-by-finance.pdf';
// The full text beside the cut line: the tooltip, while it shows.
const tip = () => document.querySelector<HTMLElement>('[data-component="tooltip"][data-state="open"]');
const narrow = (children: React.ReactNode, width = 160) => <div style={{ width }}>{children}</div>;

describe('TruncatedText', () => {
  test('renders a <span> holding the whole text; ref, className and other props reach it, and as picks the element', async () => {
    const ref = React.createRef<HTMLElement>();
    await render(<><TruncatedText id="x" ref={ref} className="extra" data-x="y">Hello</TruncatedText><TruncatedText id="p" as="p">Hi</TruncatedText></>);
    const e = el('x');
    expect([e.tagName, e.textContent, ref.current === e, e.className, e.dataset.x, e.dataset.component, el('p').tagName]).toEqual(['SPAN', 'Hello', true, 'dk-truncated-text extra', 'y', 'truncated-text', 'P']);
  });

  test('text that fits is plain text: no tab stop, and nothing shows on hover', async () => {
    await render(narrow(<TruncatedText id="fit">a.pdf</TruncatedText>));
    expect([el('fit').hasAttribute('tabindex'), el('fit').hasAttribute('data-truncated')]).toEqual([false, false]);
    await userEvent.hover(el('fit'));
    await new Promise((r) => setTimeout(r, 500));
    expect(tip()).toBeNull();
  });

  test('cut text keeps one line with an ellipsis, takes a tab stop, and shows the whole text on keyboard focus until Escape', async () => {
    await render(narrow(<><button id="before">Before</button><TruncatedText id="cut">{LONG}</TruncatedText></>));
    const e = el('cut');
    await expect.poll(() => e.getAttribute('tabindex')).toBe('0');
    expect([css(e).textOverflow, css(e).whiteSpace, e.offsetWidth, e.textContent]).toEqual(['ellipsis', 'nowrap', 160, LONG]);
    el('before').focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(e);
    await expect.poll(() => tip()?.textContent).toBe(LONG);
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => tip()).toBeNull();
  });

  test('screen readers get the text once: nothing points at the tooltip, and the tooltip is hidden from them', async () => {
    await render(narrow(<TruncatedText id="sr">{LONG}</TruncatedText>));
    const e = el('sr');
    await expect.poll(() => e.getAttribute('tabindex')).toBe('0');
    e.focus({ focusVisible: true });
    await expect.poll(() => tip()?.textContent).toBe(LONG);
    expect([e.hasAttribute('aria-describedby'), e.hasAttribute('aria-labelledby'), tip()!.getAttribute('aria-hidden'), tip()!.hasAttribute('role'), tip()!.querySelector('[data-full]')]).toEqual([false, false, 'true', false, null]);
  });

  test('the pointer resting on cut text shows the whole text, and leaving hides it', async () => {
    await render(narrow(<><TruncatedText id="h">{LONG}</TruncatedText><p id="away" style={{ marginTop: 200 }}>Away</p></>));
    await expect.poll(() => el('h').getAttribute('tabindex')).toBe('0');
    await userEvent.hover(el('h'));
    await expect.poll(() => tip()?.textContent).toBe(LONG);
    await userEvent.hover(el('away'));
    await expect.poll(() => tip()).toBeNull();
  });

  test('a tap shows the whole text and the next tap hides it; a mouse click leaves it to the hover', async () => {
    await render(narrow(<TruncatedText id="t">{LONG}</TruncatedText>));
    const e = el('t');
    await expect.poll(() => e.getAttribute('tabindex')).toBe('0');
    const tap = (pointerType: string) => {
      e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType }));
      e.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    };
    tap('touch');
    await expect.poll(() => tip()?.textContent).toBe(LONG);
    tap('touch');
    await expect.poll(() => tip()).toBeNull();
    tap('mouse');
    await new Promise((r) => setTimeout(r, 50));
    expect(tip()).toBeNull();
  });

  test('lines allows that many lines before the cut (at most six), and text that fits them is not cut', async () => {
    const words = 'Checked against the March statement, with the two refunds from the supplier added back and the duplicate invoice taken out.';
    await render(narrow(<><TruncatedText id="two" lines={2}>{words}</TruncatedText><TruncatedText id="six" lines={9}>Short</TruncatedText></>));
    const two = el('two'), line = parseFloat(css(two).lineHeight);
    await expect.poll(() => two.getAttribute('tabindex')).toBe('0');
    expect([Math.round(two.offsetHeight / line), two.dataset.lines, el('six').dataset.lines, el('six').hasAttribute('tabindex')]).toEqual([2, '2', '6', false]);
  });

  test('it follows its box and its text: room to fit takes the tab stop away, and longer text brings it back', async () => {
    function Demo() {
      const [width, setWidth] = React.useState(160), [text, setText] = React.useState(LONG);
      return <><button id="wide" onClick={() => setWidth(900)}>Wide</button><button id="more" onClick={() => setText(LONG + LONG + LONG)}>More</button><div style={{ width }}><TruncatedText id="r">{text}</TruncatedText></div></>;
    }
    await render(<Demo />);
    const e = el('r');
    await expect.poll(() => e.getAttribute('tabindex')).toBe('0');
    await userEvent.click(el('wide'));
    await expect.poll(() => e.hasAttribute('tabindex')).toBe(false);
    await userEvent.click(el('more'));
    await expect.poll(() => e.getAttribute('tabindex')).toBe('0');
  });

  test("inside a link it adds no tab stop of its own: the link's keyboard focus shows the whole text, and its blur hides it", async () => {
    await render(narrow(<><button id="b">Before</button><a id="a" href="#file" style={{ display: 'block' }}><TruncatedText id="in">{LONG}</TruncatedText></a></>));
    await expect.poll(() => el('in').hasAttribute('data-truncated')).toBe(true);
    expect(el('in').hasAttribute('tabindex')).toBe(false);
    el('b').focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(el('a'));
    await expect.poll(() => tip()?.textContent).toBe(LONG);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await expect.poll(() => tip()).toBeNull();
  });

  test('your own onPointerDown and onClick still run', async () => {
    const seen: string[] = [];
    await render(narrow(<TruncatedText id="own" onPointerDown={() => seen.push('down')} onClick={() => seen.push('click')}>{LONG}</TruncatedText>));
    await userEvent.click(el('own'));
    expect(seen).toEqual(['down', 'click']);
  });

  test('its focus ring reads 3:1 on the surface in every theme', async () => {
    await render(narrow(<div id="bg" style={{ background: 'var(--surface)' }}><TruncatedText id="c">{LONG}</TruncatedText></div>));
    const e = el('c');
    await expect.poll(() => e.getAttribute('tabindex')).toBe('0');
    e.focus({ focusVisible: true });
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(css(e).outlineStyle, th).toBe('solid');
      expect(contrast(css(e).outlineColor, css(el('bg')).backgroundColor), th).toBeGreaterThanOrEqual(3);
    }
  });
});
