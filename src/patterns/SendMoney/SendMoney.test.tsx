import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SendMoney, transferProblems, transferQuote } from './SendMoney';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/٫/g, '.').replace(/٬/g, ',');

// Send money: who as a named group, the quote following the amount, a summary that takes focus, a review step before
// anything moves, Change keeping everything, and each step's heading taking focus.
describe('Patterns/Send money', () => {
  test('the quote, and what\'s wrong with a transfer', () => {
    expect(transferQuote(100, 0.92, { rate: 0.005, min: 1 })).toEqual({ fee: 1, total: 101, receives: 92 });
    expect(transferQuote(1000, 7.12, { rate: 0.005, min: 1 })).toEqual({ fee: 5, total: 1005, receives: 7120 });
    expect(transferQuote(0, 1, { rate: 0.005, min: 1 }).fee).toBe(0);
    expect(transferProblems('', null, 0, 100)).toEqual({ to: 'Choose who to send it to.', amount: 'Enter how much to send.' });
    expect(transferProblems('a', 100, 101, 100).amount).toBe('Enter a smaller amount: with the fee, it’s more than your 100.');
    expect(transferProblems('a', 50, 51, 100)).toEqual({});
  });

  test('one main and h1, the skip link first, the balance said, and who as a named group', async () => {
    const screen = await render(<SendMoney />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Send money']);
    expect(norm(document.body.textContent)).toMatch(/You have .*1,?240\.50/);
    expect(screen.getByRole('group', { name: /^Send to/ }).element().querySelectorAll('input[type="radio"]')).toHaveLength(3);
  });

  test('Review with problems: a summary takes focus and links to who', async () => {
    const onSend = vi.fn();
    const screen = await render(<SendMoney onSend={onSend} />);
    await screen.getByRole('button', { name: 'Review' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    await screen.getByRole('link', { name: 'Choose who to send it to.' }).click();
    await expect.poll(() => active().getAttribute('type')).toBe('radio');
    await screen.getByRole('radio', { name: 'Lena Vogel' }).click();
    await screen.getByRole('spinbutton', { name: /^Amount in USD/ }).fill('2000');
    await screen.getByRole('button', { name: 'Review' }).click();
    await expect.poll(() => active().textContent).toMatch(/with the fee, it’s more than your/);
    expect(onSend).not.toHaveBeenCalled();
  });

  test('the quote follows; review lists it all, Change keeps it, a failed send stays put; sent, the answer takes focus', async () => {
    const onSend = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<SendMoney onSend={onSend} />);
    await screen.getByRole('radio', { name: 'Lena Vogel' }).click();
    await screen.getByRole('spinbutton', { name: /^Amount in USD/ }).fill('100');
    await userEvent.tab();
    await expect.poll(() => norm(document.getElementById('send-quote')!.textContent)).toMatch(/Lena Vogel gets .*92/);
    await screen.getByRole('textbox', { name: /^Reference/ }).fill('Rent');
    await screen.getByRole('button', { name: 'Review' }).click();
    await expect.poll(() => active().textContent).toBe('Check and send');
    expect(norm(document.body.textContent)).toMatch(/They get.*92/);
    await screen.getByRole('button', { name: 'Change' }).click();
    await expect.poll(() => active().textContent).toBe('Who and how much');
    expect((screen.getByRole('radio', { name: 'Lena Vogel' }).element() as HTMLInputElement).checked).toBe(true);
    await screen.getByRole('button', { name: 'Review' }).click();
    await screen.getByRole('button', { name: /^Send / }).click();
    await expect.poll(alertText).toContain('nothing has moved');
    expect(active().textContent).not.toBe('Sent to Lena Vogel');
    await screen.getByRole('button', { name: /^Send / }).click();
    await expect.poll(() => active().textContent).toBe('Sent to Lena Vogel');
    expect(onSend).toHaveBeenLastCalledWith({ to: 'lena', amount: 100, fee: 1, receives: 92, reference: 'Rent' });
    await screen.getByRole('link', { name: 'Send more money' }).click();
    await expect.poll(() => active().textContent).toBe('Who and how much');
    expect((screen.getByRole('radio', { name: 'Lena Vogel' }).element() as HTMLInputElement).checked).toBe(false);
  });
});
