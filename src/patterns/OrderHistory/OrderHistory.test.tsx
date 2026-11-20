import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { OrderHistory, itemWords, matchOrders, type PastOrder } from './OrderHistory';

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const headings = () => [...document.querySelectorAll('main h2[data-order-heading]')].map((e) => e.textContent);
const count = () => document.getElementById('order-count')?.textContent ?? '';
const o = (number: string, state: PastOrder['state'], items: string[]): PastOrder => ({ number, placed: '2025-03-04', total: 10, state, items });
const few = [o('A-1', 'delivered', ['Linen shirt']), o('A-2', 'shipped', ['Clay mug', 'Tea towel']), o('A-3', 'cancelled', ['Linen shirt', 'Notebook', 'Desk lamp', 'Rain jacket'])];

// Order history: orders as a list headed by number, their state in words, links and buttons named with the order,
// the count said as the search or filter changes, Show more that moves focus to the first new order.
describe('Patterns/Order history', () => {
  test('finding orders, and their items in words', () => {
    expect(matchOrders(few, ' linen ', '').map((x) => x.number)).toEqual(['A-1', 'A-3']);
    expect(matchOrders(few, 'a-2', '').map((x) => x.number)).toEqual(['A-2']);
    expect(matchOrders(few, 'linen', 'cancelled').map((x) => x.number)).toEqual(['A-3']);
    expect(matchOrders(few, '', '')).toHaveLength(3);
    expect([itemWords(['A']), itemWords(['A', 'B']), itemWords(['A', 'B', 'C', 'D'])]).toEqual(['A', 'A and B', 'A, B and 2 more']);
  });

  test('one main and h1, the skip link first, orders headed by number, state in words, links named with the order', async () => {
    const screen = await render(<OrderHistory orders={few} />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Orders']);
    expect(headings()).toEqual(['Order A-1', 'Order A-2', 'Order A-3']);
    expect(document.querySelectorAll('main ul > li')[1]?.textContent).toContain('On the way');
    expect(document.body.textContent).toContain('Linen shirt, Notebook and');
    expect(screen.getByRole('link', { name: 'View order A-2' }).elements()).toHaveLength(1);
    expect(screen.getByRole('button', { name: /^Buy again/ }).elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Buy again: order A-1', 'Buy again: order A-2']);
    expect(screen.getByRole('search', { name: 'Orders' }).elements()).toHaveLength(1);
    expect(document.getElementById('order-count')?.getAttribute('role')).toBe('status');
  });

  test('searching and filtering say how many match; no match says so, and Clear filters brings every order back', async () => {
    const screen = await render(<OrderHistory orders={few} />);
    await screen.getByRole('searchbox', { name: /^Search orders/ }).fill('linen');
    await expect.poll(headings).toEqual(['Order A-1', 'Order A-3']);
    expect(count()).toMatch(/^\S+ of \S+ orders$/);
    await screen.getByRole('combobox', { name: 'Show' }).selectOptions('shipped');
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No orders match “linen”' })).toBeVisible();
    await screen.getByRole('button', { name: /^Clear filters/ }).click();
    await expect.poll(headings).toEqual(['Order A-1', 'Order A-2', 'Order A-3']);
    expect((document.querySelector('input[type="search"]') as HTMLInputElement).value).toBe('');
  });

  test('Show more adds the next orders and puts focus on the first new one', async () => {
    const screen = await render(<OrderHistory pageSize={5} />);
    expect(headings()).toHaveLength(5);
    await screen.getByRole('button', { name: /Show more orders/ }).click();
    await expect.poll(() => headings().length).toBe(10);
    await expect.poll(() => active().textContent).toBe(headings()[5]);
  });

  test('two on one page: Show more focuses the first new order on its own page', async () => {
    const screen = await render(<><OrderHistory pageSize={5} /><OrderHistory pageSize={5} /></>);
    await screen.getByRole('button', { name: /Show more orders/ }).nth(1).click();
    const second = () => document.querySelectorAll('main')[1]!.querySelectorAll('h2[data-order-heading]');
    await expect.poll(() => second().length).toBe(10);
    await expect.poll(() => active()).toBe(second()[5]);
  });

  test('Buy again says what went into the cart, or that it couldn\'t', async () => {
    let ok = true;
    const onBuyAgain = vi.fn(() => (ok ? Promise.resolve() : Promise.reject(new Error('stock'))));
    const screen = await render(<OrderHistory orders={few} onBuyAgain={onBuyAgain} />);
    await screen.getByRole('button', { name: 'Buy again: order A-2' }).click();
    expect(onBuyAgain).toHaveBeenCalledWith('A-2');
    await expect.poll(() => toasted('Added to your cart: Clay mug and Tea towel')).toBe(true);
    ok = false;
    await screen.getByRole('button', { name: 'Buy again: order A-1' }).click();
    await expect.poll(() => toasted('Couldn’t add order A-1 to your cart.')).toBe(true);
  });

  test('no orders yet, loading, and a failed load', async () => {
    const onRetry = vi.fn();
    const screen = await render(<OrderHistory orders={[]} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No orders yet' })).toBeVisible();
    await screen.rerender(<OrderHistory loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading orders']);
    await screen.rerender(<OrderHistory loadFailed onRetry={onRetry} />);
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the search\'s clear button brings every order back; Buy again on a long order counts the rest', async () => {
    const screen = await render(<OrderHistory orders={few} onBuyAgain={() => Promise.resolve()} />);
    await screen.getByRole('searchbox', { name: /^Search orders/ }).fill('mug');
    await expect.poll(headings).toEqual(['Order A-2']);
    await screen.getByRole('button', { name: /^Clear/ }).click();
    await expect.poll(headings).toEqual(['Order A-1', 'Order A-2', 'Order A-3']);
    await screen.rerender(<OrderHistory orders={[{ ...few[2]!, state: 'delivered' }]} onBuyAgain={() => Promise.resolve()} />);
    await screen.getByRole('button', { name: 'Buy again: order A-3' }).click();
    await expect.poll(() => toasted('Added to your cart: Linen shirt, Notebook and')).toBe(true);
  });
});
