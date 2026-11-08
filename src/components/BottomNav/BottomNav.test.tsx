import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { BottomNav, BottomNavLink } from './BottomNav';
import { OfflineBanner } from '../OfflineBanner/OfflineBanner';

const nav = () => document.querySelector('.dk-bottom-nav') as HTMLElement;
const links = () => [...document.querySelectorAll('.dk-bottom-nav__link')] as HTMLElement[];
const Bar = (p: Partial<React.ComponentProps<typeof BottomNav>>) => (
  <BottomNav label="Main" {...p}>
    <BottomNavLink href="#home" icon="home">Home</BottomNavLink>
    <BottomNavLink href="#inbox" icon="inbox" active>Inbox</BottomNavLink>
    <BottomNavLink href="#me" icon="person">Account</BottomNavLink>
  </BottomNav>
);

afterEach(async () => { await page.viewport(414, 800); });

describe('BottomNav', () => {
  test('a <nav> named by label, a list of links, the current one with aria-current="page"; ref, className and props reach the nav', async () => {
    await page.viewport(414, 800);
    const ref = React.createRef<HTMLElement>();
    await render(<Bar ref={ref} className="extra" data-x="y" />);
    const n = nav();
    expect([n.tagName, n.getAttribute('aria-label'), ref.current === n, n.dataset.x, n.classList.contains('extra')]).toEqual(['NAV', 'Main', true, 'y', true]);
    expect([...n.querySelectorAll('li > a')].map((a) => [a.textContent, a.getAttribute('aria-current')])).toEqual([['Home', null], ['Inbox', 'page'], ['Account', null]]);
    expect(n.querySelector('.dk-bottom-nav__icon')!.getAttribute('aria-hidden')).toBe('true');
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
    const spacer = document.querySelector('.dk-bottom-nav__spacer') as HTMLElement;
    expect(spacer.getBoundingClientRect().height).toBe(64);
    expect(css(document.documentElement).scrollPaddingBottom).toBe('64px');
    await page.viewport(1024, 800);
    expect([css(nav()).display, spacer.getBoundingClientRect().height, css(document.documentElement).scrollPaddingBottom]).toEqual(['none', 0, 'auto']);
  });

  test('hideFrom={false} keeps it at every width; hideFrom="lg" up to 1024px', async () => {
    await page.viewport(1100, 800);
    const { rerender } = await render(<Bar hideFrom={false} />);
    expect(css(nav()).display).not.toBe('none');
    await rerender(<Bar hideFrom="lg" />);
    expect(css(nav()).display).toBe('none');
    await page.viewport(900, 800);
    expect(css(nav()).display).not.toBe('none');
  });

  test('a bottom OfflineBanner sits above the bar', async () => {
    await page.viewport(414, 800);
    await render(<><Bar /><OfflineBanner online={false} /></>);
    await new Promise((r) => setTimeout(r, 50));
    const b = document.querySelector('.dk-offline-banner') as HTMLElement;
    expect(b.getBoundingClientRect().bottom).toBeLessThanOrEqual(nav().getBoundingClientRect().top);
  });

  test('labels and the current page read 4.5:1 on the bar in all six themes', async () => {
    await page.viewport(414, 800);
    await render(<Bar />);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(nav()).backgroundColor;
      for (const l of links()) expect(contrast(css(l).color, bg), th).toBeGreaterThanOrEqual(4.5);
    }
  });
});
