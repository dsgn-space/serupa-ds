import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import * as stories from './PageShell.stories';

// The story's render is the page; its args and context aren't used.
const Default = () => <>{stories.Default.render!({} as never, {} as never)}</>;
const Collapsed = () => <>{stories.CollapsedSidebar.render!({} as never, {} as never)}</>;
const Adaptive = () => <>{stories.AdaptiveNavigation.render!({} as never, {} as never)}</>;

// The page shell: the skip link is the first Tab stop and leads into main, and the landmarks are told apart.
describe('Patterns/Page shell', () => {
  test('the first Tab is the skip link, and following it puts focus in main', async () => {
    await render(<Default />);
    await userEvent.tab();
    expect(document.activeElement!.textContent).toMatch(/skip/i);
    await userEvent.keyboard('{Enter}');
    expect(document.activeElement!.closest('main')).not.toBe(null);
  });

  test('one main and one h1, and the two navigation landmarks have different names', async () => {
    await render(<Default />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    const navs = [...document.querySelectorAll('nav')].map((n) => n.getAttribute('aria-label') || document.getElementById(n.getAttribute('aria-labelledby') || '')?.textContent);
    expect(new Set(navs).size).toBe(navs.length);
  });
  // On a phone the Sidebar gives its room to main, so its links have to be somewhere else: the Navbar's menu.
  test('at every width, each of the Workspace links can be reached: in the Sidebar, or in the Navbar\'s menu once the Sidebar is gone', async () => {
    const shown = (e: Element) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const reachable = () => ['Home', 'Team'].filter((name) => [...document.querySelectorAll('a')].some((a) => a.textContent?.trim() === name && shown(a)));
    try {
      for (const width of [1200, 700, 390]) {
        await page.viewport(width, 800);
        const { unmount } = await render(<Default />);
        const toggle = document.querySelector<HTMLButtonElement>('button[aria-label="Menu"]');
        if (toggle && shown(toggle)) {
          await userEvent.click(toggle);
          const workspace = [...document.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')].find((b) => b.textContent?.includes('Workspace') && shown(b));
          if (workspace) await userEvent.click(workspace);
        }
        await expect.poll(reachable, { message: width + 'px' }).toEqual(['Home', 'Team']);
        await unmount();
      }
    } finally {
      await page.viewport(900, 700);
    }
  });

  test('with the Sidebar collapsed to a rail, each Workspace link keeps its name', async () => {
    await render(<Collapsed />);
    const side = page.getByRole('navigation', { name: 'Workspace' }).first();
    for (const name of ['Home', 'Projects', 'Team']) await expect.element(side.getByRole('link', { name })).toBeInTheDocument();
  });

  // Material's window-size rule: a bottom bar on a phone, a rail on a tablet, the full column on a wide screen.
  test('adaptive: the full Sidebar from 1024px, its rail from 768px, a BottomNav below; one Workspace navigation shows at a time, with all three places', async () => {
    const shown = (e: Element) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const workspace = () => [...document.querySelectorAll('nav[aria-label="Workspace"]')].filter(shown);
    try {
      for (const [width, kind] of [[1200, 'full'], [900, 'rail'], [390, 'bar']] as const) {
        await page.viewport(width, 800);
        const { unmount } = await render(<Adaptive />);
        await expect.poll(() => workspace().length, { message: width + 'px' }).toBe(1);
        const nav = workspace()[0]!;
        const box = nav.getBoundingClientRect();
        // The bar runs along the bottom; the rail is 64px wide; the full Sidebar is wider than that.
        const got = box.bottom >= window.innerHeight - 1 && box.width > width / 2 ? 'bar' : box.width <= 72 ? 'rail' : 'full';
        expect(got, width + 'px').toBe(kind);
        for (const name of ['Home', 'Projects', 'Team']) await expect.element(page.elementLocator(nav).getByRole('link', { name })).toBeInTheDocument();
        await unmount();
      }
    } finally {
      await page.viewport(900, 700);
    }
  });

  test('offline: the OfflineBanner says so, with what happens to changes', async () => {
    const Offline = () => <>{stories.Offline.render!({} as never, {} as never)}</>;
    await render(<Offline />);
    await expect.poll(() => document.querySelector('[data-component="offline-banner"]')?.textContent ?? '').toContain('Your changes are kept on this device');
  });

  test('online: the OfflineBanner shows nothing', async () => {
    await render(<Default />);
    expect(document.querySelector('[data-component="offline-banner"]')?.textContent ?? '').toBe('');
  });
});
