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
    expect([e.tagName, e.textContent, ref.current === e, e.className, e.dataset.x, e.dataset.component, el('p').tagName]).toEqual(['SPAN', 'Hello', true, 'srp-truncated-text extra', 'y', 'truncated-text', 'P']);
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

  test("inside a button a tap is the button's: it runs, and the whole text doesn't cover what it opens", async () => {
    let pressed = 0;
    await render(narrow(<button type="button" id="b" style={{ display: 'block', width: '100%' }} onClick={() => { pressed++; }}><TruncatedText id="tb">{LONG}</TruncatedText></button>));
    const e = el('tb');
    await expect.poll(() => e.hasAttribute('data-truncated')).toBe(true);
    e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
    e.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 50));
    expect([pressed, tip()]).toEqual([1, null]);
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

  test('text a late web font cuts is marked cut and takes its tab stop, in every engine (WebKit sends no "loadingdone")', async () => {
    // TruncatedText is as wide as its container, so a wider font doesn't change its box and only the font's loading
    // says so. The rule is added once the text is laid out in the fallback, so nothing loads it sooner, and the font is
    // drawn half as large again, so it's wider than any engine's fallback serif.
    const rule = document.createElement('style');
    rule.textContent = "@font-face { font-family: CutLate; src: url(/fonts/InterVariable-latin.woff2) format('woff2'); size-adjust: 150%; }";
    try {
      await render(<div style={{ width: 200, fontFamily: 'CutLate, serif' }}><TruncatedText id="late">Notification settings</TruncatedText></div>);
      const e = el('late');
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      expect([e.scrollWidth <= e.clientWidth, e.hasAttribute('data-truncated')]).toEqual([true, false]);
      document.head.append(rule);
      await expect.poll(() => e.scrollWidth > e.clientWidth, { timeout: 3000 }).toBe(true);   // the font came and cut it
      await expect.poll(() => [e.hasAttribute('data-truncated'), e.tabIndex], { message: JSON.stringify({ status: document.fonts.status, scroll: e.scrollWidth, client: e.clientWidth }) }).toEqual([true, 0]);
    } finally { rule.remove(); }
  });

  test('mode="middle" keeps the end in view and cuts the start with an ellipsis; screen readers, copy and the tooltip get the whole text once', async () => {
    const name = 'quarterly-report-final-version-2026.pdf';
    await render(narrow(<TruncatedText id="mid" mode="middle">{name}</TruncatedText>));
    const e = el('mid');
    await expect.poll(() => e.getAttribute('tabindex')).toBe('0');
    const start = e.firstElementChild as HTMLElement, end = getComputedStyle(e, '::after');
    expect([e.children.length, start.textContent, e.dataset.end]).toEqual([1, name, 'n-2026.pdf']);
    expect(end.content).toMatch(/^"n-2026\.pdf" \/ ""$/);   // drawn with empty alternative text
    expect([css(start).textOverflow, start.scrollWidth > start.clientWidth]).toEqual(['ellipsis', true]);
    // The end is drawn whole, after the cut start, inside the box.
    expect(Math.round(start.getBoundingClientRect().width + parseFloat(end.width))).toBe(160);
    expect(e.offsetWidth).toBe(160);
    // Screen readers and a copy get the whole text once: it's all in one run, and the end drawn again is left out.
    const range = document.createRange();
    range.selectNodeContents(e);
    getSelection()!.removeAllRanges();
    getSelection()!.addRange(range);
    expect(getSelection()!.toString()).toBe(name);
    getSelection()!.removeAllRanges();
    e.focus({ focusVisible: true });
    await expect.poll(() => tip()?.textContent).toBe(name);
  });

  test('mode="middle" is plain text while it fits, and goes back to plain text once its box has room', async () => {
    function Demo() {
      const [width, setWidth] = React.useState(160);
      return <><button id="wider" onClick={() => setWidth(900)}>Wide</button><div style={{ width }}><TruncatedText id="mw" mode="middle">{LONG}</TruncatedText></div>
        <TruncatedText id="ms" mode="middle">a.pdf</TruncatedText></>;
    }
    await render(<Demo />);
    await expect.poll(() => el('mw').children.length).toBe(1);
    expect([el('ms').children.length, el('ms').textContent, el('ms').hasAttribute('tabindex')]).toEqual([0, 'a.pdf', false]);
    await userEvent.click(el('wider'));
    await expect.poll(() => el('mw').children.length).toBe(0);
    expect([el('mw').textContent, el('mw').hasAttribute('tabindex')]).toEqual([LONG, false]);
  });

  test('mode="middle" lays the text out in its own direction: a right-to-left name keeps its end on the left', async () => {
    const name = 'דוח רבעוני סופי לאחר בדיקה של מחלקת הכספים 2026';
    await render(narrow(<TruncatedText id="rtl" mode="middle">{name}</TruncatedText>));
    const e = el('rtl');
    await expect.poll(() => e.children.length).toBe(1);
    const start = (e.firstElementChild as HTMLElement).getBoundingClientRect(), box = e.getBoundingClientRect();
    expect([e.dir, getComputedStyle(e).direction, e.dataset.end]).toEqual(['auto', 'rtl', 'ם 2026']);
    // The start sits on the right, so the end drawn after it is on the left.
    expect([Math.abs(start.right - box.right) < 0.5, start.left - box.left > 20]).toEqual([true, true]);
  });

  test('with lines, mode="middle" cuts at the end', async () => {
    await render(narrow(<TruncatedText id="ml" mode="middle" lines={2}>{LONG + ' ' + LONG}</TruncatedText>));
    await expect.poll(() => el('ml').hasAttribute('data-truncated')).toBe(true);
    expect([el('ml').children.length, el('ml').hasAttribute('dir')]).toEqual([0, false]);
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
