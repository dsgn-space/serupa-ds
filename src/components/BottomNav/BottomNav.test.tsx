import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css, color, press, withMotion } from '../../../tools/test/vitest/helpers';
import { BottomNav, BottomNavLink } from './BottomNav';
import { OfflineBanner } from '../OfflineBanner/OfflineBanner';
import { Badge } from '../Badge/Badge';

const nav = () => document.querySelector('[data-component="bottom-nav"]') as HTMLElement;
const links = () => [...nav().querySelectorAll('a')] as HTMLElement[];
const Bar = (p: Partial<React.ComponentProps<typeof BottomNav>>) => (
  <BottomNav aria-label="Main" {...p}>
    <BottomNavLink href="#home" icon="home">Home</BottomNavLink>
    <BottomNavLink href="#inbox" icon="inbox" current>Inbox</BottomNavLink>
    <BottomNavLink href="#me" icon="person">Account</BottomNavLink>
  </BottomNav>
);

afterEach(async () => { await page.viewport(414, 800); });

describe('BottomNav', () => {
  test("a label cut short shows whole on hover; the link's name is the whole label", async () => {
    await page.viewport(320, 640);
    await render(<div style={{ width: 320 }}><BottomNav aria-label="Main"><BottomNavLink href="#a" icon="home">Donaudampfschifffahrtsgesellschaft</BottomNavLink><BottomNavLink href="#b" icon="search">Search</BottomNavLink><BottomNavLink href="#c" icon="person">Account settings</BottomNavLink></BottomNav></div>);
    const t = document.querySelector<HTMLElement>('a[href="#a"] [data-component="truncated-text"]')!;
    await expect.poll(() => t.hasAttribute('data-truncated')).toBe(true);
    await userEvent.hover(t);
    await expect.poll(() => document.querySelector<HTMLElement>('[data-component="tooltip"][data-state="open"]')?.textContent).toBe('Donaudampfschifffahrtsgesellschaft');
    await expect.element(page.getByRole('link', { name: 'Donaudampfschifffahrtsgesellschaft' })).toBeInTheDocument();
  });

  test('a <nav> named by label, a list of links, the current one with aria-current="page"; ref, className and props reach the nav', async () => {
    await page.viewport(414, 800);
    const ref = React.createRef<HTMLElement>();
    await render(<Bar ref={ref} className="extra" data-x="y" />);
    const n = nav();
    expect([n.tagName, n.getAttribute('aria-label'), ref.current === n, n.dataset.x, n.classList.contains('extra')]).toEqual(['NAV', 'Main', true, 'y', true]);
    expect([...n.querySelectorAll('li > a')].map((a) => [a.textContent, a.getAttribute('aria-current')])).toEqual([['Home', null], ['Inbox', 'page'], ['Account', null]]);
    expect(n.querySelector('a > span')!.getAttribute('aria-hidden')).toBe('true');
  });

  test('fixed to the bottom edge, full width, links in equal columns at least 48px tall', async () => {
    await page.viewport(414, 800);
    await render(<Bar />);
    const r = nav().getBoundingClientRect(), w = links().map((l) => Math.round(l.getBoundingClientRect().width));
    expect([css(nav()).position, Math.round(r.bottom), Math.round(r.width)]).toEqual(['fixed', 800, 414]);
    expect(new Set(w).size).toBe(1);
    for (const l of links()) expect(l.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  });

  test('while it shows, the page gets room at its end and scroll padding; from 768px it hides and gives both back', async () => {
    await page.viewport(414, 800);
    await render(<Bar />);
    const spacer = nav().previousElementSibling as HTMLElement;   // the spacer, just before the bar
    expect(spacer.getBoundingClientRect().height).toBe(64);
    expect(css(document.documentElement).scrollPaddingBottom).toBe('64px');
    await page.viewport(1024, 800);
    expect([css(nav()).display, spacer.getBoundingClientRect().height, css(document.documentElement).scrollPaddingBottom]).toEqual(['none', 0, 'auto']);
  });

  test('hideFrom={false} keeps it at every width; hideFrom="lg" up to 1024px, "sm" up to 640px', async () => {
    await page.viewport(1100, 800);
    const { rerender } = await render(<Bar hideFrom={false} />);
    expect(css(nav()).display).not.toBe('none');
    await rerender(<Bar hideFrom="lg" />);
    expect(css(nav()).display).toBe('none');
    await page.viewport(900, 800);
    expect(css(nav()).display).not.toBe('none');
    await rerender(<Bar hideFrom="sm" />);
    expect(css(nav()).display).toBe('none');
    await page.viewport(600, 800);
    expect(css(nav()).display).not.toBe('none');
  });

  test('badge: a count on the icon\'s top-end corner, read after the link\'s name; the link keeps its name and size', async () => {
    await render(<BottomNav aria-label="Main" hideFrom={false}>
      <BottomNavLink href="#home" icon="home">Home</BottomNavLink>
      <BottomNavLink href="#inbox" icon="inbox" badge={<Badge count={4} />} aria-describedby="hint">Inbox</BottomNavLink>
    </BottomNav>);
    const inbox = page.getByRole('link', { name: 'Inbox' });
    await expect.element(inbox).toHaveAccessibleDescription(/\p{Nd}/u);
    expect(inbox.element().getAttribute('aria-describedby')).toMatch(/^hint /);
    // The icon's pill is the link's first child, and the badge sits inside it, last.
    const pill = inbox.element().firstElementChild!, icon = pill.getBoundingClientRect(), badge = pill.lastElementChild!.getBoundingClientRect();
    // Over the icon's top-end quarter: starts past the pill's middle (on the left in a right-to-left page), its top
    // at the pill's top.
    const rtl = getComputedStyle(inbox.element()).direction === 'rtl', mid = icon.left + icon.width / 2;
    expect(rtl ? badge.right < mid : badge.left > mid).toBe(true);
    expect(Math.round(badge.top)).toBe(Math.round(icon.top));
    expect(Math.round(links()[1]!.getBoundingClientRect().height)).toBe(Math.round(links()[0]!.getBoundingClientRect().height));
  });

  test('a bottom OfflineBanner sits above the bar', async () => {
    await page.viewport(414, 800);
    await render(<><Bar /><OfflineBanner online={false} /></>);
    await new Promise((r) => setTimeout(r, 50));
    const b = document.querySelector('[data-component="offline-banner"]') as HTMLElement;
    expect(b.getBoundingClientRect().bottom).toBeLessThanOrEqual(nav().getBoundingClientRect().top);
  });

  test('labels and the current page read 4.5:1 on the bar in every theme', async () => {
    await page.viewport(414, 800);
    await render(<Bar />);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(nav()).backgroundColor;
      for (const l of links()) expect(contrast(css(l).color, bg), th).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('BottomNav held state', () => {
  test('held down: an item\'s icon pill fills one step past its hover (--bottom-nav-icon-bg-pressed), and its text or icon keeps 3:1 on it in every theme', async () => {
    await page.viewport(414, 800);
    await render(<Bar />);
    const b = links()[0]!;
    const f = () => b.firstElementChild;
    const low = await press(b, async () => {
      await expect.poll(() => css(f()).backgroundColor).toBe(color('var(--secondary-hover)'));
      const out: string[] = [];
      for (const th of THEMES) {
        document.documentElement.setAttribute('data-theme', th);
        const r = contrast(css(f()).color, css(f()).backgroundColor);
        if (r < 3) out.push(`${th}: ${r.toFixed(2)}`);
      }
      document.documentElement.removeAttribute('data-theme');
      return out;
    });
    expect(low).toEqual([]);
  });

  test('under the pointer the current item keeps its own color and fill, and another item takes the hover ones (GR414)', async () => {
    await page.viewport(414, 800);
    await render(<Bar />);
    const [other, current] = links() as [HTMLElement, HTMLElement];
    const look = (a: HTMLElement) => [css(a).color, css(a.firstElementChild).backgroundColor];
    await userEvent.hover(current);
    expect(current.matches(':hover')).toBe(true);
    expect(look(current)).toEqual([color('var(--primary-text)'), color('var(--primary-subtle)')]);
    await userEvent.hover(other);
    expect(look(other)).toEqual([color('var(--text)'), color('var(--secondary)')]);
    expect(look(current)).toEqual([color('var(--primary-text)'), color('var(--primary-subtle)')]);
    await userEvent.unhover(other);
  });
});

describe('BottomNav motion', () => {
  test('an item\'s label and icon pill fade to their hover colors over motion-hover (150ms) as the controls beside them do, and the pill fills at once while held', async () => {
    await page.viewport(414, 800);
    await render(<Bar />);
    const a = links()[0]!, pill = a.firstElementChild!;
    await withMotion(async () => {
      expect([css(a).transitionProperty, css(a).transitionDuration, css(pill).transitionProperty, css(pill).transitionDuration]).toEqual(['color', '0.15s', 'background-color', '0.15s']);
      const held = await press(a, () => css(pill).transitionDuration);
      expect(held).toBe('0s');
    });
  });
});
