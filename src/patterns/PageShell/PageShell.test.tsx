import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import * as stories from './PageShell.stories';

// The story's render is the page; its args and context aren't used.
const Default = () => <>{stories.Default.render!({} as never, {} as never)}</>;

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
});
