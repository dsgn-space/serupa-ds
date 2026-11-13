import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
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

  test('loading: the count says so over busy placeholder rows; the notifications that arrive keep which ones are read', async () => {
    const items = [
      { id: 'a', title: 'Ana mentioned you', read: false },
      { id: 'b', title: 'Export finished', read: true },
    ];
    const screen = await render(<Notifications items={[]} loading />);
    expect(status()).toBe('Loading notifications');
    expect(document.querySelector('main ul')!.getAttribute('aria-busy')).toBe('true');
    await expect.element(screen.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
    expect(document.querySelector('main')!.textContent).not.toContain('No notifications yet');
    await screen.rerender(<Notifications items={items} />);
    await expect.poll(status).toBe('1 unread');   // not 2: "Export finished" came in read
    await expect.element(screen.getByRole('button', { name: 'Notifications, 1 unread' })).toBeInTheDocument();
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

  test('All: marking one read keeps the row and puts focus on the next unread one, then an earlier one, then the heading', async () => {
    const screen = await render(<Notifications />);
    await screen.getByRole('button', { name: /^Mark as read: Your export is ready/ }).click();
    expect(titles()).toHaveLength(5);
    await expect.poll(() => active().id).toBe('read-n3');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => active().id).toBe('read-n1');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => active().tagName).toBe('H1');
    expect(status()).toBe('All caught up');
  });

  test('Mark all as read puts focus on the heading, not the top of the page, as the button turns disabled', async () => {
    const screen = await render(<Notifications />);
    await screen.getByRole('button', { name: 'Mark all as read' }).click();
    await expect.element(screen.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
    await expect.poll(() => active().tagName).toBe('H1');
  });

  test('the bell opens the drawer with the latest five, and Mark as read there counts on the page too', async () => {
    const screen = await render(<Notifications />);
    await screen.getByRole('button', { name: 'Notifications, 3 unread' }).click();
    const drawer = screen.getByRole('dialog');
    await expect.element(drawer).toBeVisible();
    await drawer.getByRole('button', { name: /Mark all/i }).click();
    expect(status()).toBe('All caught up');
  });

  test('unread ones have the drawer\'s dot before the title, in primary, and a semibold title; read ones keep the room for it, hidden', async () => {
    await render(<Notifications />);
    const rows = titles(), dot = (li: Element) => li.querySelector('span[aria-hidden="true"]:empty') as HTMLElement;
    const seen = rows.map((li) => getComputedStyle(dot(li)).visibility);
    expect(seen).toEqual(['visible', 'visible', 'visible', 'hidden', 'hidden']);
    const probe = document.createElement('span'); probe.style.color = 'var(--primary)'; document.body.append(probe);
    expect(getComputedStyle(dot(rows[0]!)).backgroundColor).toBe(getComputedStyle(probe).color);
    probe.remove();
    expect([dot(rows[0]!).getAttribute('aria-hidden'), dot(rows[0]!).getBoundingClientRect().width, dot(rows[0]!).getBoundingClientRect().left]).toEqual(['true', 8, dot(rows[3]!).getBoundingClientRect().left]);
    expect(getComputedStyle(dot(rows[0]!).nextElementSibling!).fontWeight).toBe('600');
  });

  test('"Notification settings" by the heading leads to settingsHref, so turning notifications off is one step away', async () => {
    await page.viewport(1024, 768);
    const screen = await render(<Notifications settingsHref="/settings#notifications" />);
    await expect.element(screen.getByRole('link', { name: 'Notification settings' })).toHaveAttribute('href', '/settings#notifications');
  });

  test('the title opens like every app page (the PageHeader line under it), and on a phone the settings sit in More actions', async () => {
    await page.viewport(360, 720);
    const screen = await render(<Notifications settingsHref="/settings#notifications" />);
    const ruled = (e: Element | null): boolean => !!e && e.tagName !== 'MAIN' && (getComputedStyle(e).borderBottomWidth !== '0px' || ruled(e.parentElement));
    expect(ruled(document.querySelector('h1'))).toBe(true);
    await screen.getByRole('button', { name: 'More actions' }).click();
    await expect.element(screen.getByRole('menuitem', { name: 'Notification settings' })).toHaveAttribute('href', '/settings#notifications');
  });

  test('with no notifications at all: an empty state that says what will show up here and links to the settings, and Mark all as read off', async () => {
    const screen = await render(<Notifications items={[]} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No notifications yet' })).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Choose what you hear about' })).toHaveAttribute('href', '#settings-notifications');
    await expect.element(screen.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
    expect([document.querySelectorAll('main ul').length, status()]).toEqual([0, 'All caught up']);
  });

  test('at 320 px nothing scrolls the page sideways', async () => {
    await render(<div style={{ width: 320 }}><Notifications /></div>);
    const main = document.querySelector('main') as HTMLElement;
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
  });

  test('a failed load: "Couldn’t load your notifications" in its place, said once, and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Notifications loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { name: 'Couldn’t load your notifications' })).toBeVisible();
    expect(document.querySelectorAll('main ul > li')).toHaveLength(0);
    await expect.element(screen.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
    expect(status()).toBe('');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
