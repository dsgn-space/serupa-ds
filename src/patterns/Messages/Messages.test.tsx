import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Messages, lastLine, unreadWords, type Conversation } from './Messages';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[data-dk-announcer], [data-dk-announcer-assertive]')].map((e) => e.textContent).join(' ');
const talks = (): Conversation[] => [
  { id: 'ana', name: 'Ana Lima', unread: 2, messages: [
    { id: 'a1', own: true, text: 'Ready?', at: '2025-03-04T09:12:00' },
    { id: 'a2', text: 'Nearly.', at: '2025-03-04T09:20:00' },
  ] },
  { id: 'budi', name: 'Budi Santoso', messages: [{ id: 'b1', text: 'Invoice sent.', at: '2025-03-03T16:02:00' }] },
];

// Messages: conversations named with who and how many unread, opening one reads it and moves focus to it, and a
// message that can't be sent says so and can be sent again.
describe('Patterns/Messages', () => {
  test('the unread count and the last line in words', () => {
    expect([unreadWords(0), unreadWords(undefined), unreadWords(3, 'en-US')]).toEqual(['', '', '3 unread']);
    expect(lastLine(talks()[0]!)).toBe('Nearly.');
    expect(lastLine({ id: 'x', name: 'X', messages: [{ id: 'm', own: true, text: 'Hi', at: '' }] })).toBe('You: Hi');
    expect(lastLine({ id: 'x', name: 'X', messages: [] })).toBe('No messages yet');
  });

  test('one main and h1, the skip link first, the conversations as a list under an h2 with unread in words', async () => {
    await page.viewport(1000, 800);
    const screen = await render(<Messages conversations={talks()} />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Messages']);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Conversations' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ana Lima/ }).element().textContent).toMatch(/unread/);
    expect(screen.getByRole('link', { name: /Budi Santoso/ }).element().textContent).not.toMatch(/unread/);
    // Nothing is open, so nothing is read before it's seen.
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Choose a conversation' })).toBeVisible();
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('opening a conversation reads it, says so to onOpen, shows it under an h2 named by the person, and moves focus there', async () => {
    await page.viewport(1000, 800);
    const onOpen = vi.fn();
    const screen = await render(<Messages conversations={talks()} onOpen={onOpen} />);
    await screen.getByRole('link', { name: /Ana Lima/ }).click();
    const heading = screen.getByRole('heading', { level: 2, name: 'Ana Lima' });
    await expect.poll(() => active()).toBe(heading.element());
    expect(onOpen).toHaveBeenCalledWith('ana');
    expect(screen.getByRole('link', { name: /Ana Lima/ }).element().textContent).not.toMatch(/unread/);
    expect(document.body.textContent).toContain('Nearly.');
    await expect.element(screen.getByRole('textbox', { name: 'Message to Ana Lima' })).toBeVisible();
  });

  test('sending shows the message at once and sends it to onSend', async () => {
    await page.viewport(1000, 800);
    const onSend = vi.fn(() => Promise.resolve());
    const screen = await render(<Messages conversations={talks()} defaultOpen="budi" onSend={onSend} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Message to Budi Santoso' }), 'Thanks!{Enter}');
    await expect.poll(() => onSend.mock.calls.length).toBe(1);
    expect(onSend).toHaveBeenCalledWith('budi', 'Thanks!');
    await expect.poll(() => screen.getByRole('link', { name: /Budi Santoso/ }).element().textContent).toContain('You: Thanks!');
    expect(document.body.textContent).not.toContain('Not sent');
  });

  test('a message that can\'t be sent says "Not sent" and is said once; Try again sends it again', async () => {
    await page.viewport(1000, 800);
    let ok = false;
    const onSend = vi.fn(() => (ok ? Promise.resolve() : Promise.reject(new Error('offline'))));
    const screen = await render(<Messages conversations={talks()} defaultOpen="budi" onSend={onSend} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Message to Budi Santoso' }), 'Hello{Enter}');
    await expect.poll(() => document.body.textContent).toContain('Not sent');
    await expect.poll(said).toContain('Your message wasn’t sent. Try again.');
    ok = true;
    await screen.getByRole('button', { name: /Try again/ }).click();
    await expect.poll(() => onSend.mock.calls.length).toBe(2);
    await expect.poll(() => document.body.textContent).not.toContain('Not sent');
  });

  test('a blank message isn\'t sent', async () => {
    await page.viewport(1000, 800);
    const onSend = vi.fn();
    const screen = await render(<Messages conversations={talks()} defaultOpen="budi" onSend={onSend} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Message to Budi Santoso' }), '   {Enter}');
    expect(onSend).not.toHaveBeenCalled();
  });

  test('on a phone one pane shows at a time; Back to conversations returns focus to the row it came from', async () => {
    await page.viewport(380, 800);
    const screen = await render(<Messages conversations={talks()} />);
    await screen.getByRole('link', { name: /Budi Santoso/ }).click();
    await expect.poll(() => active().textContent).toBe('Budi Santoso');
    expect(screen.getByRole('heading', { level: 2, name: 'Conversations' }).elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Back to conversations' }).click();
    await expect.poll(() => active().id).toBe('conversation-budi');
    await page.viewport(1000, 800);
  });

  test('no conversations says so; loading names one placeholder; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Messages conversations={[]} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No messages yet' })).toBeVisible();
    await screen.rerender(<Messages loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading conversations']);
    await screen.rerender(<Messages loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your messages' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('on a phone the Back button\'s arrow lines up with the conversation\'s name under it', async () => {
    await page.viewport(380, 800);
    const screen = await render(<Messages conversations={talks()} />);
    await screen.getByRole('link', { name: /Budi Santoso/ }).click();
    const back = screen.getByRole('button', { name: 'Back to conversations' }).element() as HTMLElement;
    const icon = back.querySelector('svg, [aria-hidden="true"]')!;
    const name = screen.getByRole('heading', { level: 2, name: 'Budi Santoso' }).element();
    const rtl = getComputedStyle(back).direction === 'rtl';
    const a = icon.getBoundingClientRect(), b = name.getBoundingClientRect();
    expect(Math.abs(rtl ? a.right - b.right : a.left - b.left)).toBeLessThan(3);
  });
});
