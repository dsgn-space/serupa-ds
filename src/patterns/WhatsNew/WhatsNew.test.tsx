import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { WhatsNew, byMonth } from './WhatsNew';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660));
const status = () => norm(document.getElementById('changes-count')?.textContent);
const articles = () => [...document.querySelectorAll('article h3')].map((h) => h.textContent);

// What's new: months as headings, each change an article named by its heading, kinds in words, what's new since your
// last visit marked, the filter's count in a status, and Show older months moving focus to what it adds.
describe('Patterns/What’s new', () => {
  test('changes by month, newest first', () => {
    const c = (id: string, date: string) => ({ id, date, kind: 'new' as const, title: id, body: '' });
    expect(byMonth([c('a', '2026-01-05'), c('b', '2026-02-01'), c('c', '2026-01-20')]).map((g) => [g.month, g.changes.map((x) => x.id)]))
      .toEqual([['2026-02', ['b']], ['2026-01', ['c', 'a']]]);
  });

  test('one main and h1, the skip link first, months as headings and changes as named articles, the new ones marked', async () => {
    const screen = await render(<WhatsNew />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'What’s new']);
    expect(document.querySelectorAll('h2')).toHaveLength(2);
    expect(screen.getByRole('article', { name: 'Dark mode' }).elements()).toHaveLength(1);
    expect(screen.getByText('Since your last visit').elements()).toHaveLength(2);
    expect(norm(document.body.textContent)).toContain('2 changes since your last visit');
    expect(screen.getByRole('link', { name: 'Try it: Dark mode' }).elements()).toHaveLength(1);
  });

  test('the filter says how many it shows', async () => {
    const screen = await render(<WhatsNew />);
    expect(status()).toBe('Showing 5 changes');
    await screen.getByRole('radio', { name: 'New' }).click();
    await expect.poll(status).toBe('Showing 2 changes');
    expect(articles()).toEqual(['Share a board with people outside your team', 'Dark mode']);
    await screen.getByRole('button', { name: 'Show older months' }).click();
    await expect.poll(() => active().textContent).toBe('Recurring cards');
    expect(status()).toBe('Showing 3 changes');
  });

  test('Show older months moves focus to the first change it adds, and goes once there are none left', async () => {
    const screen = await render(<WhatsNew />);
    await screen.getByRole('button', { name: 'Show older months' }).click();
    await expect.poll(() => active().textContent).toBe('Pasting a list makes one card per line again');
    expect(articles()).toHaveLength(7);
    expect(screen.getByRole('button', { name: 'Show older months' }).elements()).toHaveLength(0);
  });

  test('all seen, and a kind with nothing in it', async () => {
    const screen = await render(<WhatsNew lastSeen="2026-03-31" changes={[{ id: 'x', date: '2026-03-01', kind: 'new', title: 'X', body: 'Y' }]} />);
    expect(document.body.textContent).toContain('You’ve seen every change.');
    expect(status()).toBe('Showing 1 change');
    await screen.getByRole('radio', { name: 'Fixed' }).click();
    await expect.poll(() => document.body.textContent).toContain('No changes of this kind yet.');
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<WhatsNew loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading what’s new']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<WhatsNew loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load what’s new' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
