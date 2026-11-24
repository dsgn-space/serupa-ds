import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Donation, coverFee, giftProblems } from './Donation';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const norm = (t: string | null) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/٫/g, '.');
const total = () => norm(document.getElementById('donate-total')!.textContent);
const radioFor = (buys: string) => [...document.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
  .find((r) => r.getAttribute('aria-describedby')?.split(' ').some((id) => document.getElementById(id)?.textContent === buys))!;
const good = { amount: '25', other: null, name: 'Ana', email: 'ana@example.com' };

// Donation: how often and how much as named groups, each amount described by what it pays for, the card fee, a total
// that Give names, a summary of what's missing that takes focus, and a thank-you whose heading takes focus.
describe('Patterns/Donation', () => {
  test('the fee that covers the card\'s cut, and what\'s wrong with a gift', () => {
    expect(coverFee(50, { rate: 0.029, fixed: 0.3 })).toBe(1.81);
    expect(coverFee(0, { rate: 0.029, fixed: 0.3 })).toBe(0);
    // A fee that comes out whole cents isn't a cent more for the rounding of the arithmetic.
    expect(coverFee(10, { rate: 0, fixed: 0.3 })).toBe(0.3);
    expect(giftProblems(good, 2)).toEqual({});
    expect(Object.keys(giftProblems({ amount: '', other: null, name: '', email: '' }, 2))).toEqual(['amount', 'name', 'email']);
    expect(giftProblems({ ...good, amount: 'other', other: 1 }, 2).other).toBe('Enter an amount of 2 or more.');
    expect(giftProblems({ ...good, email: 'ana' }, 2).email).toBe('Enter an email address like name@example.com.');
  });

  test('one main and h1, the skip link first, and each amount described by what it pays for', async () => {
    const screen = await render(<Donation />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Give to Acme Schools']);
    expect(screen.getByRole('group', { name: /^How much/ }).element().querySelectorAll('input[type="radio"]')).toHaveLength(5);
    expect(radioFor('A set of schoolbooks for a year').value).toBe('25');
    expect(total()).toBe('Choose an amount to see your total.');
  });

  test('the total and Give follow how often, how much and the fee', async () => {
    const screen = await render(<Donation />);
    await userEvent.click(radioFor('A month of a teacher’s training'));
    expect(total()).toMatch(/^You’ll give .*50.*\.$/);
    await screen.getByRole('radio', { name: 'Every month' }).click();
    await screen.getByRole('checkbox', { name: 'Cover the card fee' }).click();
    expect(total()).toMatch(/51[.,]81.* a month, .*1[.,]81.* of it for the card fee\./);
    expect(norm(screen.getByRole('button', { name: /^Give / }).element().textContent)).toMatch(/^Give .*51[.,]81.* a month$/);
    await screen.getByRole('radio', { name: 'Another amount' }).click();
    await screen.getByRole('spinbutton', { name: /^Your amount a month/ }).fill('20');
    await userEvent.tab();
    await expect.poll(total).toMatch(/20[.,]91.* a month/);
  });

  test('Give with problems: a summary takes focus, and its first link lands on an amount', async () => {
    const onGive = vi.fn();
    const screen = await render(<Donation onGive={onGive} />);
    await screen.getByRole('button', { name: 'Give' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    await screen.getByRole('link', { name: 'Choose an amount.' }).click();
    await expect.poll(() => active().getAttribute('type')).toBe('radio');
    expect(onGive).not.toHaveBeenCalled();
  });

  test('a gift that fails keeps everything; given, the thank-you\'s heading takes focus and says how to stop it', async () => {
    const onGive = vi.fn().mockRejectedValueOnce(new Error('declined')).mockResolvedValueOnce(undefined);
    const screen = await render(<Donation onGive={onGive} />);
    await screen.getByRole('radio', { name: 'Every month' }).click();
    await userEvent.click(radioFor('A week of school meals for one child'));
    await screen.getByRole('textbox', { name: /^Your name/ }).fill(' Ana ');
    await screen.getByRole('textbox', { name: /^Your email/ }).fill('ana@example.com');
    await screen.getByRole('button', { name: /^Give / }).click();
    await expect.poll(alertText).toContain('Couldn’t take your gift, and nothing was charged.');
    await screen.getByRole('button', { name: /^Give / }).click();
    await expect.poll(() => active().textContent).toBe('Thank you, Ana');
    expect(onGive).toHaveBeenLastCalledWith({ amount: 10, fee: 0, monthly: true, name: 'Ana', email: 'ana@example.com' });
    expect(document.body.textContent).toContain('change or stop your monthly gift');
  });
});
