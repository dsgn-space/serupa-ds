import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { GiftCard, giftProblems } from './GiftCard';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const today = '2026-03-10';
const good = { amount: '50', other: null, design: 'leaves', to: 'Dewi', email: 'dewi@example.com', message: '', send: today, from: 'Ana' };
const preview = () => document.querySelector('[aria-labelledby="gift-preview"]')!.textContent;

// Gift card: amounts and designs as named groups, Another amount bringing a number field, a preview that follows the
// form, a summary of what's missing that takes focus, and an answer whose heading takes focus.
describe('Patterns/Gift card', () => {
  test('what\'s wrong with a gift card', () => {
    expect(giftProblems(good, today, 10, 500)).toEqual({});
    expect(Object.keys(giftProblems({ ...good, amount: '', to: ' ', email: '', send: '', from: '' }, today, 10, 500))).toEqual(['amount', 'to', 'email', 'send', 'from']);
    expect(giftProblems({ ...good, amount: 'other', other: 5 }, today, 10, 500).other).toBe('Enter an amount from 10 to 500.');
    expect(giftProblems({ ...good, amount: 'other', other: null }, today, 10, 500).other).toBeDefined();
    expect(giftProblems({ ...good, amount: 'other', other: 120 }, today, 10, 500)).toEqual({});
    expect(giftProblems({ ...good, email: 'dewi@' }, today, 10, 500).email).toBe('Enter an email address like name@example.com.');
    expect(giftProblems({ ...good, message: 'x'.repeat(201) }, today, 10, 500).message).toBe('Shorten the message to 200 characters.');
    expect(giftProblems({ ...good, send: '2026-03-09' }, today, 10, 500).send).toBe('Enter today or a day after it.');
    expect(giftProblems({ ...good, send: '2027-03-11' }, today, 10, 500).send).toBe('Enter a day within a year.');
    expect(giftProblems({ ...good, send: '2027-03-10' }, today, 10, 500)).toEqual({});
  });

  test('one main and h1, the skip link first, amounts and designs as named groups, and a named preview', async () => {
    const screen = await render(<GiftCard today={today} />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Send a gift card']);
    expect(screen.getByRole('group', { name: /^Amount/ }).element().querySelectorAll('input[type="radio"]')).toHaveLength(4);
    expect(screen.getByRole('group', { name: /^Design/ }).element().querySelectorAll('input[type="radio"]')).toHaveLength(3);
    expect(screen.getByRole('region', { name: 'What they’ll get' }).elements()).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'The Confetti design' }).elements()).toHaveLength(1);
  });

  test('the preview follows the form, and Another amount brings a number field', async () => {
    const screen = await render(<GiftCard today={today} />);
    expect(preview()).toContain('Choose an amount');
    await screen.getByRole('radio', { name: 'Leaves' }).click();
    expect(screen.getByRole('img', { name: 'The Leaves design' }).elements()).toHaveLength(1);
    await screen.getByRole('textbox', { name: /^Who it’s for/ }).fill('Dewi');
    await screen.getByRole('textbox', { name: /^Message/ }).fill('Happy birthday!');
    await screen.getByRole('textbox', { name: /^From/ }).fill('Ana');
    expect(preview()).toContain('For Dewi, from Ana');
    expect(preview()).toContain('Happy birthday!');
    expect(screen.getByRole('spinbutton').elements()).toHaveLength(0);
    await screen.getByRole('radio', { name: 'Another amount' }).click();
    expect(screen.getByRole('spinbutton', { name: /^Your amount/ }).elements()).toHaveLength(1);
  });

  test('Add with problems: a summary takes focus, and its first link lands on an amount', async () => {
    const onAdd = vi.fn();
    const screen = await render(<GiftCard today={today} onAdd={onAdd} />);
    await screen.getByRole('button', { name: 'Add to bag' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    expect(screen.getByRole('link', { name: /^Choose|^Enter/ }).elements().map((e) => e.getAttribute('href'))).toEqual(['#gift-amount', '#gift-to', '#gift-email', '#gift-from']);
    await screen.getByRole('link', { name: 'Choose an amount.' }).click();
    await expect.poll(() => active().getAttribute('type')).toBe('radio');
    expect(onAdd).not.toHaveBeenCalled();
  });

  test('adding that fails keeps everything; added, the answer\'s heading takes focus with what was added', async () => {
    const onAdd = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<GiftCard today={today} onAdd={onAdd} />);
    await screen.getByRole('radio', { name: 'Another amount' }).click();
    await screen.getByRole('spinbutton', { name: /^Your amount/ }).fill('75');
    await screen.getByRole('textbox', { name: /^Who it’s for/ }).fill(' Dewi ');
    await screen.getByRole('textbox', { name: /^Their email/ }).fill('dewi@example.com');
    await screen.getByRole('textbox', { name: /^From/ }).fill('Ana');
    await screen.getByRole('button', { name: 'Add to bag' }).click();
    await expect.poll(alertText).toContain('Couldn’t add it to your bag.');
    expect((screen.getByRole('textbox', { name: /^Who it’s for/ }).element() as HTMLInputElement).value).toBe(' Dewi ');
    await screen.getByRole('button', { name: 'Add to bag' }).click();
    await expect.poll(() => active().textContent).toBe('Gift card added to your bag');
    expect(onAdd).toHaveBeenLastCalledWith({ amount: 75, design: 'confetti', to: 'Dewi', email: 'dewi@example.com', message: '', send: today, from: 'Ana' });
    expect(document.body.textContent).toContain('Today, once you’ve paid');
  });

  test('without today, it starts on today', async () => {
    await render(<GiftCard />);
    const year = String(new Date().getFullYear());
    expect(document.querySelector<HTMLInputElement>('#gift-send input[id$="-year"]')!.value.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660))).toBe(year);
  });

  test('sent on a later day says the day', async () => {
    const onAdd = vi.fn();
    const screen = await render(<GiftCard today={today} amounts={[30]} onAdd={onAdd} />);
    await screen.getByRole('radio', { name: /30|٣٠/ }).click();
    await screen.getByRole('textbox', { name: /^Who it’s for/ }).fill('Dewi');
    await screen.getByRole('textbox', { name: /^Their email/ }).fill('dewi@example.com');
    await screen.getByRole('textbox', { name: /^From/ }).fill('Ana');
    await userEvent.tripleClick(document.querySelector<HTMLInputElement>('#gift-send input[id$="-year"]')!);
    await userEvent.keyboard('2027');
    await screen.getByRole('button', { name: 'Add to bag' }).click();
    await expect.poll(() => active().textContent).toBe('Gift card added to your bag');
    expect(document.body.textContent).not.toContain('Today, once you’ve paid');
    expect(onAdd).toHaveBeenLastCalledWith(expect.objectContaining({ send: '2027-03-10' }));
  });
});
