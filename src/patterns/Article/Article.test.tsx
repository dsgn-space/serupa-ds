import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { commands, page, userEvent } from 'vitest/browser';
import { SerupaProvider } from '../../internal/provider';
import { Article } from './Article';

// Article: the post in an <article> with one h1 and its sections as h2s, a dated byline, "On this page" with a link to
// each section, a breadcrumb, and "Read next" cards named by their titles.
describe('Patterns/Article', () => {
  test('a skip link first, one main, and the post in an article named by its h1, with a section per h2', async () => {
    await render(<Article title="A new start page" />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    expect(page.getByRole('article', { name: 'A new start page' }).element().querySelectorAll('h2').length).toBe(3);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement?.getAttribute('href')).toBe('#main');
  });

  test('the date is a <time> with the machine date, written in the page\'s language, the same day everywhere', async () => {
    await render(<SerupaProvider locale="id-ID"><Article published="2026-11-01" minutes={4} /></SerupaProvider>);
    const time = document.querySelector('article time')!;
    expect(time.getAttribute('datetime')).toBe('2026-11-01');
    expect(time.textContent).toBe('1 November 2026');
    expect(time.parentElement?.textContent).toContain('4 min read');
  });

  test('"On this page" is a navigation landmark with a link to each section, and a link goes to its heading', async () => {
    await render(<Article />);
    const toc = page.getByRole('navigation', { name: 'On this page' });
    const links = toc.getByRole('link').elements();
    expect(links.map((a) => a.textContent)).toEqual(['Why we changed it', 'What changes for you', 'If you’d rather keep the board']);
    for (const a of links) expect(document.getElementById(a.getAttribute('href')!.slice(1))?.tagName).toBe('H2');
  });

  test('the breadcrumb leads back to the blog and marks this post as the current page', async () => {
    await render(<Article title="A new start page" />);
    const crumbs = page.getByRole('navigation', { name: /breadcrumb/i });
    expect(crumbs.getByRole('link', { name: 'Blog' }).element().getAttribute('href')).toBe('#blog');
    expect(crumbs.element().querySelector('[aria-current="page"]')?.textContent).toContain('A new start page');
  });

  test('each "Read next" card is a link named by the post\'s title, and with none the section isn\'t there', async () => {
    const screen = await render(<Article />);
    const next = page.getByRole('region', { name: 'Read next' });
    expect(next.getByRole('link', { name: 'Saved views, shared with a link' }).element().getAttribute('href')).toBe('#saved-views');
    // A Divider sets it off from the post, a line only: nothing for a screen reader.
    const line = next.element().previousElementSibling;
    expect([line?.getAttribute('data-component'), line?.getAttribute('aria-hidden') ?? line?.getAttribute('role')]).toEqual(['divider', expect.stringMatching(/true|none|presentation/)]);
    await screen.rerender(<Article related={[]} />);
    expect(page.getByRole('region', { name: 'Read next' }).elements().length).toBe(0);
    expect(document.querySelector('main [data-component="divider"]')).toBeNull();
  });

  test('a post in another language says so', async () => {
    await render(<Article lang="id" />);
    expect(document.querySelector('article')?.getAttribute('lang')).toBe('id');
  });
});

describe('Article printed', () => {
  test('printed, the post leaves out its On this page list and Read next', async () => {
    await render(<Article />);
    // Found before printing: a role query skips what's hidden.
    const hidden: Element[] = [page.getByRole('heading', { name: 'Read next' }).element(), page.getByRole('navigation', { name: 'On this page' }).element()];
    const kept: Element[] = [page.getByRole('heading', { level: 1 }).element()];
    await commands.printMedia(true);
    try {
      for (const e of hidden) expect(e.checkVisibility(), e.textContent ?? '').toBe(false);
      for (const e of kept) expect(e.checkVisibility(), e.textContent ?? '').toBe(true);
    } finally { await commands.printMedia(false); }
  });
});
