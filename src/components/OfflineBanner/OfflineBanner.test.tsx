import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css, withMotion } from '../../../tools/test/vitest/helpers';
import { Navbar, NavbarLink } from '../Navbar/Navbar';
import { OfflineBanner } from './OfflineBanner';

const q = (s: string) => document.querySelector<HTMLElement>(s);
const bar = () => q('.dk-offline-banner');
// Everything the shared polite live region says from now on (each time its text changes to something).
function listen() {
  const said: string[] = [];
  let last = '';
  const seen = new MutationObserver(() => { const t = document.querySelector('[data-dk-announcer]')?.textContent || ''; if (t && t !== last) said.push(t); last = t; });
  seen.observe(document.body, { subtree: true, childList: true, characterData: true });
  return { said, stop: () => seen.disconnect() };
}
// The browser's connection, as navigator.onLine and its events say it.
function network(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => online });
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}
const real = () => { delete (navigator as unknown as Record<string, unknown>).onLine; };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Where the browser leaves a focused field under the bar (Safari), the page moves it on the next frame.
const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

describe('OfflineBanner', () => {
  test('online it renders nothing; offline a <div> with the words, and ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = await render(<OfflineBanner id="x" online ref={ref} />);
    expect(bar()).toBe(null);
    await rerender(<OfflineBanner id="x" online={false} ref={ref} className="extra" data-x="y" placement="inline">Changes are kept.</OfflineBanner>);
    const e = document.getElementById('x')!;
    expect([e.tagName, e.textContent, ref.current === e, e.className, e.dataset.x, e.dataset.component, e.dataset.state])
      .toEqual(['DIV', "You’re offline Changes are kept.", true, 'dk-offline-banner dk-offline-banner--inline extra', 'y', 'offline-banner', 'offline']);
    expect(e.getAttribute('role')).toBe(null);   // said through the live region once, not read again as a live region
  });

  test('it follows the browser: the offline and online events, and "Back online" for a moment before it goes', async () => {
    const heard = listen();
    const onOnlineChange = vi.fn();
    try {
      await render(<OfflineBanner onOnlineChange={onOnlineChange} />);
      expect(bar()).toBe(null);
      await React.act(async () => network(false));
      expect([bar()?.dataset.state, bar()?.textContent]).toEqual(['offline', "You’re offline"]);
      await React.act(() => wait(700));   // the live region's turn ends (a quick drop and return is said as one)
      await React.act(async () => network(true));
      expect([bar()?.dataset.state, bar()?.textContent]).toEqual(['back', 'Back online']);
      await React.act(() => wait(2400));
      await expect.poll(() => bar()).toBe(null);
      await expect.poll(() => heard.said).toEqual(["You’re offline", 'Back online']);
      expect(onOnlineChange.mock.calls).toEqual([[false], [true]]);
    } finally { heard.stop(); real(); }
  });

  test('online, the prop, wins over the browser', async () => {
    try {
      await render(<OfflineBanner online />);
      await React.act(async () => network(false));
      expect(bar()).toBe(null);
    } finally { real(); }
  });

  // GR166: onChange was the only callback not named for its state; it still works until 15.0.0.
  test('the deprecated onChange is called as onOnlineChange is, and onOnlineChange wins when both are given', async () => {
    const old = vi.fn(), both = vi.fn(), next = vi.fn();
    try {
      await render(<><OfflineBanner placement="inline" onChange={old} /><OfflineBanner placement="inline" onChange={both} onOnlineChange={next} /></>);
      await React.act(async () => network(false));
      await React.act(async () => network(true));
      expect([old.mock.calls, both.mock.calls, next.mock.calls]).toEqual([[[false], [true]], [], [[false], [true]]]);
    } finally { real(); }
  });

  test('offline from the start, it shows and says so; online from the start it says nothing', async () => {
    const heard = listen();
    try {
      const { rerender } = await render(<OfflineBanner online />);
      await React.act(() => wait(700));
      expect(heard.said).toEqual([]);
      await rerender(<></>);
      await render(<OfflineBanner online={false} />);
      expect(bar()?.dataset.state).toBe('offline');
      await expect.poll(() => heard.said).toEqual(["You’re offline"]);
    } finally { heard.stop(); }
  });

  test('placement: fixed to the bottom by default, or the top, in the middle; inline stays in the page', async () => {
    await render(<><OfflineBanner id="b" online={false} /><OfflineBanner id="t" online={false} placement="top" /><OfflineBanner id="i" online={false} placement="inline" /></>);
    const [b, t, i] = ['b', 't', 'i'].map((id) => document.getElementById(id)!);
    expect([css(b).position, css(t).position, css(i).position]).toEqual(['fixed', 'fixed', 'static']);
    const rb = b.getBoundingClientRect(), rt = t.getBoundingClientRect();
    expect(Math.abs(innerHeight - rb.bottom - 16)).toBeLessThan(1);
    expect(Math.abs(rt.top - 16)).toBeLessThan(1);
    expect(Math.abs((rb.left + rb.right) / 2 - innerWidth / 2)).toBeLessThan(1);
  });

  test('its words read 4.5:1 and its icons 3:1 on its background in all six themes', async () => {
    const { rerender } = await render(<OfflineBanner id="c" online={false} placement="inline" />);
    const icon = () => q('#c .dk-offline-banner__icon')!;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(document.getElementById('c')).backgroundColor;
      expect(contrast(css(document.getElementById('c')).color, bg), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(icon()).color, bg), `${th} offline icon`).toBeGreaterThanOrEqual(3);
    }
    await rerender(<OfflineBanner id="c" online placement="inline" />);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      await expect.poll(() => contrast(css(icon()).color, css(document.getElementById('c')).backgroundColor)).toBeGreaterThanOrEqual(3);
    }
  });
  test('GR122: a field Tab moves to scrolls into view clear of the bar, not under it (WCAG 2.4.11); the room goes when the bar does', async () => {
    const screen = await render(<>
      {Array.from({ length: 40 }, (_, i) => <input key={i} id={'f' + i} aria-label={'Field ' + i} style={{ display: 'block', height: 40, margin: 8 }} />)}
      <OfflineBanner online={false}>Changes are kept and sent when you're back.</OfflineBanner>
    </>);
    const banner = document.querySelector<HTMLElement>('[data-component=offline-banner]')!;
    document.getElementById('f0')!.focus();
    const covered: string[] = [];
    for (let i = 1; i < 40; i++) {
      await userEvent.tab(); await frame();
      const f = document.activeElement as HTMLElement, r = f.getBoundingClientRect(), b = banner.getBoundingClientRect();
      if (r.bottom > b.top && r.top < b.bottom) covered.push(f.id);
    }
    expect([covered, document.activeElement!.id]).toEqual([[], 'f39']);
    expect(document.documentElement.style.getPropertyValue('--dk-offline-banner-space')).toMatch(/^\d+px$/);
    await screen.rerender(<OfflineBanner online />);
    await expect.poll(() => document.querySelector('[data-component=offline-banner]')).toBe(null);
    expect([document.documentElement.style.getPropertyValue('--dk-offline-banner-space'), getComputedStyle(document.documentElement).scrollPaddingBottom, document.body.style.paddingBlockEnd]).toEqual(['', 'auto', '']);
  });
  test('GR124: the room is measured where the bar comes to rest, not where it is as it slides in', async () => withMotion(async () => {
    const screen = await render(<OfflineBanner online />);
    await screen.rerender(<OfflineBanner online={false}>Changes are kept and sent when you're back.</OfflineBanner>);
    const banner = document.querySelector<HTMLElement>('[data-component=offline-banner]')!;
    const space = () => parseFloat(document.documentElement.style.getPropertyValue('--dk-offline-banner-space'));
    const early = space();
    await wait(600);
    const settled = Math.ceil(window.innerHeight - banner.getBoundingClientRect().top + 8);
    expect([early, space()]).toEqual([settled, settled]);
  }));
  test('GR125: a top bar keeps the first fields clear at the top of the page too; nothing is added when it goes', async () => {
    const screen = await render(<>
      {Array.from({ length: 30 }, (_, i) => <input key={i} id={'t' + i} aria-label={'Field ' + i} style={{ display: 'block', height: 40, margin: 8 }} />)}
      <OfflineBanner online={false} placement="top">Changes are kept and sent when you're back.</OfflineBanner>
    </>);
    const banner = document.querySelector<HTMLElement>('[data-component=offline-banner]')!;
    document.getElementById('t29')!.focus();
    const covered: string[] = [];
    for (let i = 28; i >= 0; i--) {
      await userEvent.tab({ shift: true }); await frame();
      const f = document.activeElement as HTMLElement, r = f.getBoundingClientRect(), b = banner.getBoundingClientRect();
      if (r.top < b.bottom && r.bottom > b.top) covered.push(f.id);
    }
    expect([covered, document.activeElement!.id]).toEqual([[], 't0']);
    await screen.rerender(<OfflineBanner online placement="top" />);
    await expect.poll(() => document.querySelector('[data-component=offline-banner]'), { timeout: 5000 }).toBe(null);
    expect(document.body.style.paddingBlockStart).toBe('');
  });
  test.each([390, 900])('GR134: at %ipx a top bar sits below a sticky Navbar, so its brand, links, actions and Menu button stay reachable, and the first fields still scroll clear of both', async (w) => {
    await page.viewport(w, 700);
    await expect.poll(() => window.innerWidth).toBe(w);
    try {
      await render(<>
        <Navbar sticky brand={<a href="#home">Acme</a>} actions={<button type="button">Sign in</button>}>
          <NavbarLink href="#dash" active>Dashboard</NavbarLink>
          <NavbarLink href="#projects">Projects</NavbarLink>
        </Navbar>
        {Array.from({ length: 30 }, (_, i) => <input key={i} id={'n' + i} aria-label={'Field ' + i} style={{ display: 'block', height: 40, margin: 8 }} />)}
        <OfflineBanner online={false} placement="top">Changes are kept and sent when you're back.</OfflineBanner>
      </>);
      const banner = bar()!, nav = q('.dk-navbar')!;
      await expect.poll(() => Math.round(banner.getBoundingClientRect().top) >= Math.round(nav.getBoundingClientRect().bottom)).toBe(true);
      // Each control in the Navbar that shows is what a tap on its middle reaches.
      const shown = [...nav.querySelectorAll<HTMLElement>('a, button')].filter((e) => e.getClientRects().length && e.getBoundingClientRect().width > 0);
      expect(shown.length).toBeGreaterThan(1);
      const hidden = shown.filter((e) => { const r = e.getBoundingClientRect(), at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !at || !e.contains(at); }).map((e) => e.textContent || e.getAttribute('aria-label'));
      expect(hidden).toEqual([]);
      document.getElementById('n29')!.focus();
      const covered: string[] = [];
      for (let i = 28; i >= 0; i--) {
        await userEvent.tab({ shift: true }); await frame();
        const f = document.activeElement as HTMLElement, r = f.getBoundingClientRect();
        if (![banner, nav].every((o) => { const b = o.getBoundingClientRect(); return r.top >= b.bottom || r.bottom <= b.top; })) covered.push(f.id);
      }
      expect([covered, document.activeElement!.id]).toEqual([[], 'n0']);
    } finally { await page.viewport(900, 700); }
  });

  test('GR172: two bottom bars at once: the page gets the larger room, keeps it while one shows, and gets its own padding back after both, in either order', async () => {
    const room = () => Number(/^calc\((\d+)px\)$/.exec(document.body.style.paddingBlockEnd)?.[1] ?? 0);
    const space = () => document.documentElement.style.getPropertyValue('--dk-offline-banner-space');
    const A = <OfflineBanner key="a" online={false}>Changes are kept.</OfflineBanner>, B = <OfflineBanner key="b" online={false} />;
    document.body.style.paddingBlockEnd = '3px';
    try {
      const { rerender } = await render(<>{A}{B}</>);
      expect(room()).toBeGreaterThan(40);
      await rerender(<>{null}{B}</>);
      expect([room() > 40, /^\d+px$/.test(space())], 'a went first').toEqual([true, true]);
      await rerender(<>{null}{null}</>);
      expect([document.body.style.paddingBlockEnd, space()], 'a went first').toEqual(['3px', '']);
      await rerender(<>{A}{B}</>);
      await rerender(<>{A}{null}</>);
      expect([room() > 40, /^\d+px$/.test(space())], 'b went first').toEqual([true, true]);
      await rerender(<>{null}{null}</>);
      expect([document.body.style.paddingBlockEnd, space()], 'b went first').toEqual(['3px', '']);
    } finally { document.body.style.paddingBlockEnd = ''; }
  });
});
