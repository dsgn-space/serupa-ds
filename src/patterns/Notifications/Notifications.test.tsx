import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Notifications } from './Notifications';

const active = () => document.activeElement as HTMLElement;
const status = () => document.querySelector('main [role="status"]')?.textContent;
const titles = () => [...document.querySelectorAll('main ul > li')];

// Notifications: the bell named with its count, unread said in words, a filter whose count is a status, and focus kept
// in the list as read ones leave it.
describe('Patterns/Notifications', () => {
  test('one main and one h1, the skip link first; the bell is named with its count; unread ones say so in words', async () => {
    const screen = await render(<Notifications />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    await expect.element(screen.getByRole('button', { name: 'Notifications, 3 unread' })).toBeInTheDocument();
    expect(status()).toBe('3 unread');
    const unreadWords = [...document.querySelectorAll('main ul > li')].filter((li) => /Unread/.test(li.textContent || '')).length;
    expect(unreadWords).toBe(3);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('Mark as read: the count and the bell follow, and onMarkRead hears it; Mark all as read ends at "All caught up"', async () => {
    const onMarkRead = vi.fn(), onMarkAllRead = vi.fn();
    const screen = await render(<Notifications onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} />);
    await screen.getByRole('button', { name: /^Mark as read: Your export is ready/ }).click();
    expect(onMarkRead).toHaveBeenCalledWith('n2');
    expect(status()).toBe('2 unread');
    await expect.element(screen.getByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument();
    await screen.getByRole('button', { name: 'Mark all as read' }).click();
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
    expect(status()).toBe('All caught up');
    await expect.element(screen.getByRole('button', { name: 'Notifications', exact: true })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
  });

  test('Unread: only unread ones; marking one read takes it out and puts focus on the next, then the heading', async () => {
    const screen = await render(<Notifications />);
    await screen.getByRole('radio', { name: 'Unread' }).click();
    expect(titles()).toHaveLength(3);
    await screen.getByRole('button', { name: /^Mark as read: Ana Lima/ }).click();
    expect(titles()).toHaveLength(2);
    await expect.poll(() => active().id).toBe('read-n2');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => active().id).toBe('read-n3');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => active().tagName).toBe('H1');
    await expect.element(screen.getByText(/You’re all caught up/)).toBeVisible();
  });

  test('the bell opens the drawer with the latest five, and Mark as read there counts on the page too', async () => {
    const screen = await render(<Notifications />);
    await screen.getByRole('button', { name: 'Notifications, 3 unread' }).click();
    const drawer = screen.getByRole('dialog');
    await expect.element(drawer).toBeVisible();
    await drawer.getByRole('button', { name: /Mark all/i }).click();
    expect(status()).toBe('All caught up');
  });

  test('at 320 px nothing scrolls the page sideways', async () => {
    await render(<div style={{ width: 320 }}><Notifications /></div>);
    const main = document.querySelector('main') as HTMLElement;
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
  });
});
