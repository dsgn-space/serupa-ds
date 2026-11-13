import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast, css, settle } from '../../../tools/test/vitest/helpers';
import { HoverCard } from './HoverCard';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const isOpen = (id: string) => { const c = el(id); return !c.hidden && getComputedStyle(c).display !== 'none'; };
const rect = (e: Element) => e.getBoundingClientRect();
const near = (a: number, b: number) => Math.abs(a - b) <= 1;
const away = () => userEvent.hover(document.body, { position: { x: 600, y: 10 } });

function Card(props: Partial<React.ComponentProps<typeof HoverCard>>) {
  return (
    <div style={{ padding: '40px 120px 320px' }}>
      <button id="before">Before</button>{' '}
      <HoverCard id="hc" trigger={<a id="t" href="#dewi">@dewi</a>} {...props}>
        <strong>Dewi Lestari</strong> <a id="inside" href="#projects">Projects</a>
      </HoverCard>{' '}
      <button id="after">After</button>
    </div>
  );
}

describe('HoverCard', () => {
  test('closed: nothing inside rendered, inert; props, className and the ref reach the card; the trigger keeps its own props', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Card ref={ref} className="extra" data-x="y" />);
    const c = el('hc');
    expect([ref.current === c, c.className, c.dataset.x, c.dataset.component, c.dataset.state, c.hidden, c.inert, c.textContent]).toEqual([true, 'dk-hover-card extra', 'y', 'hover-card', 'closed', true, true, '']);
    expect(el('t').getAttribute('href')).toBe('#dewi');
  });

  test('hover: opens after the 500ms delay, 8px below the link in the top layer; leaving both closes it after a grace', async () => {
    const asks: string[] = [];
    await render(<Card onOpenChange={(v, d) => asks.push(v + ' ' + d.reason)} />);
    const t0 = performance.now();
    await userEvent.hover(el('t'));
    await expect.poll(() => isOpen('hc')).toBe(true);
    expect(performance.now() - t0).toBeGreaterThanOrEqual(500);
    const c = el('hc');
    expect([c.dataset.side, c.matches(':popover-open'), near(rect(c).top - rect(el('t')).bottom, 8)]).toEqual(['bottom', true, true]);
    await away();
    await settle(100);
    expect(isOpen('hc')).toBe(true);
    await expect.poll(() => isOpen('hc')).toBe(false);
    expect(asks).toEqual(['true hover', 'false hover']);
  });

  test('a pointer passing over the link without resting opens nothing', async () => {
    await render(<Card />);
    await userEvent.hover(el('t'));
    await away();
    await settle(700);
    expect(isOpen('hc')).toBe(false);
  });

  test('Escape during the open delay cancels the open, by hover or focus; leaving and coming back opens it again (GR88)', async () => {
    const asks: string[] = [];
    await render(<Card onOpenChange={(v, d) => asks.push(v + ' ' + d.reason)} />);
    await userEvent.hover(el('t'));
    await settle(200);
    await userEvent.keyboard('{Escape}');
    await settle(700);
    expect(isOpen('hc')).toBe(false);
    await away();
    await userEvent.hover(el('t'));
    await expect.poll(() => isOpen('hc')).toBe(true);
    await away();
    await expect.poll(() => isOpen('hc')).toBe(false);
    el('before').focus();
    await userEvent.tab();
    await settle(200);
    await userEvent.keyboard('{Escape}');
    await settle(700);
    expect([document.activeElement === el('t'), isOpen('hc')]).toEqual([true, false]);
    expect(asks).toEqual(['true hover', 'false hover']);
  });

  test('interest invokers (174): the link points at its card with interestfor; an interest the pointer or focus didn\'t bring (a long press on a touch screen) opens it at once, the browser\'s own showing cancelled; a tap outside closes it', async () => {
    const asks: string[] = [];
    await render(<><Card onOpenChange={(v, d) => asks.push(v + ' ' + d.reason)} /><p id="out">Page</p></>);
    const t = el('t'), c = el('hc');
    expect(t.getAttribute('interestfor')).toBe('hc');
    if ('interestForElement' in HTMLAnchorElement.prototype) expect((t as HTMLAnchorElement & { interestForElement: Element | null }).interestForElement).toBe(c);
    const ev = new Event('interest', { cancelable: true });
    c.dispatchEvent(ev);
    await expect.poll(() => isOpen('hc')).toBe(true);
    expect([ev.defaultPrevented, asks, c.matches(':popover-open')]).toEqual([true, ['true hover'], true]);
    const lose = new Event('loseinterest', { cancelable: true });
    c.dispatchEvent(lose);
    await settle(400);
    expect([lose.defaultPrevented, isOpen('hc')]).toEqual([true, true]);
    el('out').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
    el('out').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
    el('out').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await expect.poll(() => isOpen('hc')).toBe(false);
  });

  test('an interest while the pointer is over the link is the hover\'s: Escape during the delay still cancels the open (174, GR88); disabled: an interest opens nothing', async () => {
    const asks: string[] = [];
    await render(<><Card /><HoverCard id="hd" disabled onOpenChange={(v) => asks.push(String(v))} trigger={<a id="td" href="#x">@x</a>}>X</HoverCard></>);
    await userEvent.hover(el('t'));
    await settle(150);
    await userEvent.keyboard('{Escape}');
    el('hc').dispatchEvent(new Event('interest', { cancelable: true }));
    el('hd').dispatchEvent(new Event('interest', { cancelable: true }));
    await settle(700);
    expect([isOpen('hc'), isOpen('hd'), asks]).toEqual([false, false, []]);
  });

  test('the pointer can move onto the card and stay; Escape closes it while hovered', async () => {
    await render(<Card />);
    await userEvent.hover(el('t'));
    await expect.poll(() => isOpen('hc')).toBe(true);
    await userEvent.hover(el('inside'));
    await settle(500);
    expect(isOpen('hc')).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(isOpen('hc')).toBe(false);
  });

  test('keyboard: focus resting on the link opens it; Tab goes into the card, Shift+Tab back; Escape inside closes it and focus returns to the link', async () => {
    await render(<Card />);
    el('before').focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(el('t'));
    await expect.poll(() => isOpen('hc')).toBe(true);
    await userEvent.tab();
    expect(document.activeElement).toBe(el('inside'));
    await userEvent.tab({ shift: true });
    expect([document.activeElement === el('t'), isOpen('hc')]).toEqual([true, true]);
    await userEvent.tab();
    await userEvent.keyboard('{Escape}');
    expect([isOpen('hc'), document.activeElement === el('t')]).toEqual([false, true]);
  });

  test('keyboard: focus moving on past the card closes it; tabbing straight past the link opens nothing', async () => {
    await render(<Card />);
    el('before').focus();
    await userEvent.tab();
    await expect.poll(() => isOpen('hc')).toBe(true);
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(el('after'));
    await expect.poll(() => isOpen('hc')).toBe(false);
    el('before').focus();
    await userEvent.tab();
    await userEvent.tab();
    await settle(700);
    expect(isOpen('hc')).toBe(false);
  });

  test('every placement: the card opens on that side of the link, its start or end lined up with the link\'s', async () => {
    const all = ['bottom', 'bottom-start', 'bottom-end', 'top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'left', 'left-start', 'left-end'] as const;
    const at = (placement: typeof all[number]) => <div style={{ display: 'grid', placeItems: 'center', height: '700px' }}>
      <HoverCard key={placement} id="hp" open placement={placement} trigger={<a id="tp" href="#dewi">@dewi</a>}><strong>Dewi Lestari</strong></HoverCard>
    </div>;
    const r = await render(at(all[0]));
    for (const placement of all) {
      await r.rerender(at(placement));
      await expect.poll(() => isOpen('hp'), { message: placement }).toBe(true);
      const [side, align] = placement.split('-'), c = el('hp');
      await expect.poll(() => c.dataset.side, { message: placement }).toBe(side);
      // Polled: the side is set a frame before the card is moved to it, and a slow runner can read between the two.
      const across = side === 'top' || side === 'bottom';
      await expect.poll(() => { const a = rect(el('tp')), b = rect(c); return side === 'bottom' ? b.top >= a.bottom : side === 'top' ? b.bottom <= a.top : side === 'right' ? b.left >= a.right : b.right <= a.left; }, { message: placement }).toBe(true);
      if (align === 'start') await expect.poll(() => { const a = rect(el('tp')), b = rect(c); return near(across ? b.left : b.top, across ? a.left : a.top); }, { message: placement }).toBe(true);
      if (align === 'end') await expect.poll(() => { const a = rect(el('tp')), b = rect(c); return near(across ? b.right : b.bottom, across ? a.right : a.bottom); }, { message: placement }).toBe(true);
    }
  });

  test('controlled and disabled: open shows it; disabled never does', async () => {
    const s = await render(<Card open onOpenChange={() => {}} />);
    await expect.poll(() => isOpen('hc')).toBe(true);
    await s.rerender(<Card open disabled onOpenChange={() => {}} />);
    await expect.poll(() => isOpen('hc')).toBe(false);
  });

  test('its text reads 4.5:1 on its background in all six themes', async () => {
    await render(<Card open onOpenChange={() => {}} />);
    await expect.poll(() => isOpen('hc')).toBe(true);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(el('hc')).color, css(el('hc')).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('HoverCard: a web font arriving after it opens', () => {
  test('moves the trigger in its line, and the card follows it (an inline trigger never resizes for a ResizeObserver)', async () => {
    // The font's rule is added only once the card is placed, so nothing loads it sooner.
    const rule = document.createElement('style');
    rule.textContent = "@font-face { font-family: HcLate; src: url(/fonts/InterVariable-latin.woff2) format('woff2'); }";
    try {
      await render(<p style={{ margin: '40px', fontFamily: 'HcLate, monospace', fontSize: '20px' }}>Reviewed by an earlier reviewer, then{' '}
        <HoverCard id="hcf" open onOpenChange={() => {}} placement="bottom-start" trigger={<a id="tf" href="#dewi">@dewi</a>}>Dewi</HoverCard> on Monday.</p>);
      const before = rect(el('tf')).left;
      document.head.append(rule);
      await expect.poll(() => near(rect(el('tf')).left, before)).toBe(false);   // the font arrived and moved it
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      expect(near(rect(el('hcf')).left, rect(el('tf')).left)).toBe(true);
    } finally { rule.remove(); }
  });
});
