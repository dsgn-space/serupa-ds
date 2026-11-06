import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
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
});
