import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { ReturnRequest, refundOf, returnProblems, type ReturnItem } from './ReturnRequest';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const described = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
const items: ReturnItem[] = [{ id: 'a', name: 'A', price: 30 }, { id: 'b', name: 'B', price: 3 }];

// Return request: items as a named group with the ones that can't go back said why, a reason asked for each chosen
// item by name, what's missing said next to it, the refund worked out as you choose, and next steps once sent.
describe('Patterns/Return request', () => {
  test('what\'s missing, and what comes back', () => {
    expect(returnProblems([], {})).toEqual({ 'return-items': 'Choose at least one item to return.' });
    expect(returnProblems(['a', 'b'], { a: 'size' })).toEqual({ 'reason-b': 'Choose why you’re returning it.' });
    expect(returnProblems(['a'], { a: 'size' })).toEqual({});
    expect(refundOf(items, ['a'], { a: 'size' }, false, 5)).toEqual({ value: 30, cost: 0, refund: 30 });
    expect(refundOf(items, ['a'], { a: 'size' }, true, 5)).toEqual({ value: 30, cost: 5, refund: 25 });
    expect(refundOf(items, ['a'], { a: 'damaged' }, true, 5)).toEqual({ value: 30, cost: 0, refund: 30 });
    expect(refundOf(items, ['b'], { b: 'mind' }, true, 5)).toEqual({ value: 3, cost: 3, refund: 0 });
  });

  test('one main and h1, the skip link first, the items a named group, one that can\'t go back disabled with why', async () => {
    const screen = await render(<ReturnRequest />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Return items from order A-10432']);
    const group = screen.getByRole('group', { name: /What are you returning/ });
    expect(group.getByRole('checkbox').elements()).toHaveLength(3);
    const socks = screen.getByRole('checkbox', { name: /Wool socks/ }).element();
    expect((socks as HTMLInputElement).disabled).toBe(true);
    expect(described(socks)).toContain('Socks can’t be returned once opened.');
    expect(screen.getByRole('group', { name: /How will you send it back/ }).elements()).toHaveLength(1);
    expect(screen.getByRole('combobox').elements()).toHaveLength(0);
  });

  test('Start return with nothing chosen: a summary takes focus and its link goes to the first item; a missing reason is said next to it, by name', async () => {
    const onSend = vi.fn();
    const screen = await render(<ReturnRequest onSend={onSend} />);
    await screen.getByRole('button', { name: 'Start return' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There is a problem/);
    await screen.getByRole('link', { name: 'Choose at least one item to return.' }).click();
    await expect.poll(() => active().getAttribute('type')).toBe('checkbox');
    await expect.poll(() => described(screen.getByRole('group', { name: /What are you returning/ }).element())).toContain('Choose at least one item to return.');
    await screen.getByRole('checkbox', { name: /Linen shirt/ }).click();
    expect(described(screen.getByRole('group', { name: /What are you returning/ }).element())).not.toContain('Choose at least one');
    await screen.getByRole('button', { name: 'Start return' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There is a problem/);
    expect(screen.getByRole('link', { name: 'Choose why you’re returning it.' }).element().getAttribute('href')).toBe('#reason-i1');
    await screen.getByRole('link', { name: 'Choose why you’re returning it.' }).click();
    await expect.poll(() => active().id).toBe('reason-i1');
    expect(screen.getByRole('combobox', { name: /^Why are you returning the Linen shirt/ }).elements()).toHaveLength(1);
    expect(described(active())).toContain('Choose why you’re returning it.');
    expect(onSend).not.toHaveBeenCalled();
  });

  test('the refund is worked out as you choose, a pickup cost taken off by name', async () => {
    const screen = await render(<ReturnRequest />);
    const refund = () => document.getElementById('refund')!.parentElement!.textContent ?? '';
    expect(refund()).toContain('Choose an item to see what comes back.');
    await screen.getByRole('checkbox', { name: /Canvas tote/ }).click();
    await screen.getByRole('combobox', { name: /Canvas tote/ }).selectOptions('mind');
    await expect.poll(refund).toMatch(/Items.+Refund/);
    expect(refund()).not.toContain('Pickup');
    await screen.getByRole('radio', { name: /^Have it picked up/ }).click();
    await expect.poll(refund).toMatch(/Pickup/);
    await screen.getByRole('combobox', { name: /Canvas tote/ }).selectOptions('damaged');
    await expect.poll(refund).not.toMatch(/Pickup/);
  });

  test('Start return sends the items in their order with their reasons, and the next steps take focus', async () => {
    const onSend = vi.fn(() => Promise.resolve('R-2041'));
    const screen = await render(<ReturnRequest onSend={onSend} />);
    await screen.getByRole('checkbox', { name: /Canvas tote/ }).click();
    await screen.getByRole('checkbox', { name: /Linen shirt/ }).click();
    await screen.getByRole('combobox', { name: /Linen shirt/ }).selectOptions('size');
    await screen.getByRole('combobox', { name: /Canvas tote/ }).selectOptions('looks');
    await screen.getByRole('radio', { name: 'Store credit' }).click();
    await screen.getByRole('button', { name: 'Start return' }).click();
    await expect.poll(() => active().textContent).toBe('Return R-2041 started');
    expect(onSend).toHaveBeenCalledWith({ items: [{ id: 'i1', reason: 'size' }, { id: 'i2', reason: 'looks' }], method: 'dropoff', refund: 'credit' });
    expect(document.body.textContent).toContain('to your store credit');
  });

  test('a return that can\'t be made says so next to the button and keeps every choice', async () => {
    const screen = await render(<ReturnRequest onSend={() => Promise.reject(new Error('offline'))} />);
    await screen.getByRole('checkbox', { name: /Linen shirt/ }).click();
    await screen.getByRole('combobox', { name: /Linen shirt/ }).selectOptions('wrong');
    await screen.getByRole('button', { name: 'Start return' }).click();
    await expect.poll(alertText).toContain('Couldn’t start the return.');
    expect((screen.getByRole('combobox', { name: /Linen shirt/ }).element() as HTMLSelectElement).value).toBe('wrong');
  });

  test('unticking an item takes its reason away and the refund with it', async () => {
    const screen = await render(<ReturnRequest />);
    await screen.getByRole('checkbox', { name: /Linen shirt/ }).click();
    expect(screen.getByRole('combobox', { name: /Linen shirt/ }).elements()).toHaveLength(1);
    await screen.getByRole('checkbox', { name: /Linen shirt/ }).click();
    await expect.poll(() => screen.getByRole('combobox').elements()).toHaveLength(0);
    expect(document.body.textContent).toContain('Choose an item to see what comes back.');
  });
});
