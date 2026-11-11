import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SessionTimeout, timeLeft } from './SessionTimeout';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const KEY = 'serupa-test-session';
const WAIT = { timeout: 5000 };

afterEach(() => { window.sessionStorage.removeItem(KEY); });

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
    await expect.element(screen.getByRole('alertdialog', { name: 'You’ll be signed out soon' })).toBeVisible();
    await vi.waitFor(() => expect(said()).toContain('You’ll be signed out in 2 seconds.'));
    await userEvent.keyboard('{Enter}');
    expect(onExtend).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(document.querySelector('dialog[open]')).toBeNull());
    await vi.waitFor(() => expect(said()).toContain('You’re still signed in.'));
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
    await vi.waitFor(() => expect(active().textContent).toBe('You’ve been signed out'), WAIT);
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(JSON.parse(window.sessionStorage.getItem(KEY)!)).toEqual({ subject: 'Invoice is wrong', message: 'Charged twice in May.' });
    await screen.getByRole('button', { name: 'Sign in again' }).click();
    await expect.element(screen.getByLabelText('Subject')).toHaveValue('Invoice is wrong');
    await expect.element(screen.getByLabelText('Message')).toHaveValue('Charged twice in May.');
  });

  test('typing keeps the session: no warning mid-sentence, and the server is told at most once per activityEvery', async () => {
    const onExtend = vi.fn();
    const screen = await render(<SessionTimeout duration={3} warnBefore={1} activityEvery={1} onExtend={onExtend} />);
    await screen.getByLabelText('Message').click();
    for (let i = 0; i < 6; i++) {
      await userEvent.keyboard('a');
      await new Promise((r) => setTimeout(r, 700));
    }
    expect(document.querySelector('dialog[open]')).toBeNull();
    expect(active().tagName).toBe('TEXTAREA');
    expect(onExtend.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(onExtend.mock.calls.length).toBeLessThanOrEqual(5);
    await screen.unmount();
    // When the server refuses, typing doesn't hide the end: the warning still comes.
    const refused = vi.fn(() => Promise.reject(new Error('offline')));
    const again = await render(<SessionTimeout duration={3} warnBefore={1} activityEvery={1} onExtend={refused} />);
    await again.getByLabelText('Message').click();
    await new Promise((r) => setTimeout(r, 1100));
    await userEvent.keyboard('a');
    await vi.waitFor(() => expect(refused).toHaveBeenCalled());
    await vi.waitFor(() => expect(document.querySelector('dialog[open]')).not.toBeNull(), WAIT);
  });

  test('a draft saved before a reload comes back', async () => {
    window.sessionStorage.setItem(KEY, JSON.stringify({ subject: 'Saved', message: 'Before the reload' }));
    const screen = await render(<SessionTimeout saveKey={KEY} />);
    await expect.element(screen.getByLabelText('Subject')).toHaveValue('Saved');
  });

  test('"Sign out" ends it at once and clears the draft from the computer; a refused extension lets it run out as warned', async () => {
    const onExpire = vi.fn();
    const first = await render(<SessionTimeout duration={4} warnBefore={3} saveKey={KEY} onExpire={onExpire} />);
    await userEvent.fill(first.getByLabelText('Subject'), 'Private');
    await first.getByRole('button', { name: 'Sign out' }).click(WAIT);
    await vi.waitFor(() => expect(active().textContent).toBe('You’ve signed out'));
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
    await first.getByRole('button', { name: 'Sign in again' }).click();
    await expect.element(first.getByLabelText('Subject')).toHaveValue('');
    await first.unmount();
    const onExtend = vi.fn(() => Promise.reject(new Error('offline')));
    const second = await render(<SessionTimeout duration={3} warnBefore={2} onExtend={onExtend} />);
    await second.getByRole('button', { name: 'Stay signed in' }).click(WAIT);
    await vi.waitFor(() => expect(active().textContent).toBe('You’ve been signed out'), WAIT);
  });

  test('"Stay signed in" is busy while the server answers; when it can\'t, the warning stays open and says so, and trying again works', async () => {
    let fail = true, settle = () => {};
    const onExtend = vi.fn(() => new Promise<void>((ok, no) => { settle = () => (fail ? no(new Error('offline')) : ok()); }));
    const screen = await render(<SessionTimeout duration={30} warnBefore={29} onExtend={onExtend} />);
    const stay = screen.getByRole('button', { name: 'Stay signed in' });
    await stay.click(WAIT);
    await expect.element(stay).toHaveAttribute('aria-busy', 'true');
    (stay.element() as HTMLButtonElement).click();
    expect(onExtend).toHaveBeenCalledTimes(1);
    settle();
    await expect.element(screen.getByRole('alertdialog').getByText('Couldn’t keep you signed in. Check your connection and try again.')).toBeVisible();
    await vi.waitFor(() => expect(said()).toContain('Couldn’t keep you signed in.'));
    expect(stay.element().hasAttribute('aria-busy')).toBe(false);
    fail = false;
    await stay.click();
    settle();
    await vi.waitFor(() => expect(document.querySelector('dialog[open]')).toBeNull());
  });

  test('drafts are kept for the tab only, never in localStorage, and only the subject and message', async () => {
    window.sessionStorage.setItem(KEY, JSON.stringify({ subject: 'Hi', message: 'There', password: 'hunter2' }));
    const screen = await render(<SessionTimeout saveKey={KEY} />);
    await userEvent.fill(screen.getByLabelText('Message'), 'There again');
    expect(JSON.parse(window.sessionStorage.getItem(KEY)!)).toEqual({ subject: 'Hi', message: 'There again' });
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  test('sending the message clears the draft once onSend resolves, and keeps it when onSend rejects; each outcome shows on screen', async () => {
    const refused = vi.fn(() => Promise.reject(new Error('offline')));
    const first = await render(<SessionTimeout saveKey={KEY} onSend={refused} />);
    await userEvent.fill(first.getByLabelText('Subject'), 'Refund');
    await userEvent.fill(first.getByLabelText('Message'), 'Charged twice');
    await first.getByRole('button', { name: 'Send message' }).click();
    await expect.element(first.getByRole('alert')).toHaveTextContent('The message wasn’t sent. What you typed is kept: try again.');
    expect(refused).toHaveBeenCalledWith({ subject: 'Refund', message: 'Charged twice' });
    expect((JSON.parse(window.sessionStorage.getItem(KEY)!) as { subject: string }).subject).toBe('Refund');
    await first.unmount();
    const onSend = vi.fn();
    const second = await render(<SessionTimeout saveKey={KEY} onSend={onSend} />);
    await expect.element(second.getByLabelText('Subject')).toHaveValue('Refund');
    await second.getByRole('button', { name: 'Send message' }).click();
    const sent = second.getByRole('status').filter({ hasText: 'Message sent' });
    await expect.element(sent).toBeVisible();
    expect(active()).toBe(sent.element());
    expect(onSend).toHaveBeenCalledWith({ subject: 'Refund', message: 'Charged twice' });
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
    await expect.element(second.getByLabelText('Subject')).toHaveValue('');
  });

  test('an empty Subject or Message isn\'t sent: each says what\'s missing, and the first empty one takes focus', async () => {
    const onSend = vi.fn();
    const screen = await render(<SessionTimeout saveKey={KEY} onSend={onSend} />);
    await screen.getByRole('button', { name: 'Send message' }).click();
    expect(onSend).not.toHaveBeenCalled();
    await expect.element(screen.getByLabelText('Subject')).toHaveAccessibleDescription(/Enter a subject/);
    await expect.element(screen.getByLabelText('Message')).toHaveAccessibleDescription(/Enter your message/);
    expect(active()).toBe(screen.getByLabelText('Subject').element());
    await userEvent.fill(screen.getByLabelText('Subject'), 'Refund');
    await expect.element(screen.getByLabelText('Subject')).not.toHaveAccessibleDescription(/Enter a subject/);
    await screen.getByRole('button', { name: 'Send message' }).click();
    expect(active()).toBe(screen.getByLabelText('Message').element());
    expect(onSend).not.toHaveBeenCalled();
  });

  test('while the message is sending, a second press doesn\'t send it again', async () => {
    let done!: () => void;
    const onSend = vi.fn(() => new Promise<void>((r) => { done = r; }));
    const screen = await render(<SessionTimeout saveKey={KEY} onSend={onSend} />);
    await userEvent.fill(screen.getByLabelText('Subject'), 'Refund');
    await userEvent.fill(screen.getByLabelText('Message'), 'Charged twice');
    const button = screen.getByRole('button', { name: 'Send message' });
    await button.click();
    await expect.element(button).toHaveAttribute('aria-busy', 'true');
    // A second press while busy: a click (straight on the element, since the browser's own click waits for a busy
    // button to be ready) and Enter on the focused button.
    (button.element() as HTMLButtonElement).click();
    await userEvent.keyboard('{Enter}');
    expect(onSend).toHaveBeenCalledTimes(1);
    done();
    await expect.element(screen.getByText('Message sent. We’ll reply by email.')).toBeVisible();
    await expect.element(button).not.toHaveAttribute('aria-busy', 'true');
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
