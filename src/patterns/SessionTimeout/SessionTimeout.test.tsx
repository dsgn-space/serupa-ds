import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SessionTimeout, timeLeft } from './SessionTimeout';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const KEY = 'serupa-test-session';
const WAIT = { timeout: 5000 };

afterEach(() => { window.localStorage.removeItem(KEY); });

// Session time-out (PT14): a warning well before the end, one action to stay, the time said at sensible steps, and
// nothing typed lost.
describe('Patterns/Session time-out', () => {
  test('the time left in words', () => {
    expect([timeLeft(120), timeLeft(90), timeLeft(61), timeLeft(45), timeLeft(1), timeLeft(0)])
      .toEqual(['2 minutes', '1 minute 30 seconds', '1 minute 1 second', '45 seconds', '1 second', '0 seconds']);
  });

  test('one main and one h1, the skip link first, and no warning while there is time', async () => {
    await render(<SessionTimeout />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    expect(document.querySelector('dialog[open]')).toBeNull();
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('the warning opens before the end with "Stay signed in" focused, says the time once, and staying puts focus back', async () => {
    const onExtend = vi.fn();
    const screen = await render(<SessionTimeout duration={3} warnBefore={2} onExtend={onExtend} />);
    await screen.getByLabelText('Message').click();
    await vi.waitFor(() => expect(active().textContent).toBe('Stay signed in'), WAIT);
    await expect.element(screen.getByRole('alertdialog', { name: "You'll be signed out soon" })).toBeVisible();
    await vi.waitFor(() => expect(said()).toContain("You'll be signed out in 2 seconds."));
    await userEvent.keyboard('{Enter}');
    expect(onExtend).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(document.querySelector('dialog[open]')).toBeNull());
    await vi.waitFor(() => expect(said()).toContain("You're still signed in."));
    expect(active().tagName).toBe('TEXTAREA');
  });

  test('Escape keeps the session too', async () => {
    const onExtend = vi.fn();
    const screen = await render(<SessionTimeout duration={3} warnBefore={2} onExtend={onExtend} />);
    await expect.element(screen.getByRole('alertdialog'), WAIT).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await vi.waitFor(() => expect(onExtend).toHaveBeenCalledTimes(1));
  });

  test('after the first warning, the time is said only at sensible steps (30 seconds), not every second', async () => {
    await render(<SessionTimeout duration={33} warnBefore={32} />);
    await vi.waitFor(() => expect(said()).toContain('30 seconds left.'), WAIT);
    expect(said()).not.toContain('31 seconds left.');
  });

  test('when it runs out, the signed-out page takes focus, and signing in again brings back what was typed', async () => {
    const onExpire = vi.fn();
    const screen = await render(<SessionTimeout duration={3} warnBefore={1} saveKey={KEY} onExpire={onExpire} />);
    await userEvent.fill(screen.getByLabelText('Subject'), 'Invoice is wrong');
    await userEvent.fill(screen.getByLabelText('Message'), 'Charged twice in May.');
    await vi.waitFor(() => expect(active().textContent).toBe("You've been signed out"), WAIT);
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toEqual({ subject: 'Invoice is wrong', message: 'Charged twice in May.' });
    await screen.getByRole('button', { name: 'Sign in again' }).click();
    await expect.element(screen.getByLabelText('Subject')).toHaveValue('Invoice is wrong');
    await expect.element(screen.getByLabelText('Message')).toHaveValue('Charged twice in May.');
  });

  test('a draft saved before a reload comes back', async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ subject: 'Saved', message: 'Before the reload' }));
    const screen = await render(<SessionTimeout saveKey={KEY} />);
    await expect.element(screen.getByLabelText('Subject')).toHaveValue('Saved');
  });

  test('"Sign out" ends it at once; a refused extension lets it run out as warned', async () => {
    const onExpire = vi.fn();
    const first = await render(<SessionTimeout duration={3} warnBefore={2} onExpire={onExpire} />);
    await first.getByRole('button', { name: 'Sign out' }).click(WAIT);
    await vi.waitFor(() => expect(active().textContent).toBe("You've been signed out"));
    expect(onExpire).toHaveBeenCalledTimes(1);
    await first.unmount();
    const onExtend = vi.fn(() => Promise.reject(new Error('offline')));
    const second = await render(<SessionTimeout duration={3} warnBefore={2} onExtend={onExtend} />);
    await second.getByRole('button', { name: 'Stay signed in' }).click(WAIT);
    await vi.waitFor(() => expect(active().textContent).toBe("You've been signed out"), WAIT);
  });

  test('a storage that throws is ignored', async () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
    const screen = await render(<SessionTimeout saveKey={KEY} />);
    await userEvent.fill(screen.getByLabelText('Subject'), 'Kept in the page');
    await expect.element(screen.getByLabelText('Subject')).toHaveValue('Kept in the page');
    get.mockRestore();
    set.mockRestore();
  });
});
