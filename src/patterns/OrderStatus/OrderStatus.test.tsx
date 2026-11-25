import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { commands, page, userEvent } from 'vitest/browser';
import { OrderStatus, canCancel, stageWords, subtotal, type OrderInfo } from './OrderStatus';

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const order = (over: Partial<OrderInfo> = {}): OrderInfo => ({
  number: '77', stage: 'packed', arriving: 'Friday',
  events: [{ id: 'e2', at: '2025-03-01T11:05:00', title: 'Packed' }, { id: 'e1', at: '2025-02-28T19:22:00', title: 'Order placed', detail: 'Paid by card' }],
  items: [{ id: 'i1', name: 'Mug, Blue', quantity: 2, price: 12 }, { id: 'i2', name: 'Tote', quantity: 1, price: 18 }],
  delivery: 4, address: ['Ana Lima', 'Bandung'], carrier: { name: 'JNE', href: '#jne' },
  ...over,
});

// Order status: the stage is a sentence, cancelling asks first and is done only once the server says so, and an
// order that has shipped says why it can't be canceled.
describe('Patterns/Order status', () => {
  test('the stage in words, whether it can be canceled, and what the items cost', () => {
    expect(stageWords({ stage: 'placed', arriving: 'Friday' })).toEqual({ title: 'Order placed', detail: 'We’re getting it ready. Arriving Friday.' });
    expect(stageWords({ stage: 'packed' })).toEqual({ title: 'Packed', detail: 'It’s waiting for the courier.' });
    expect(stageWords({ stage: 'shipped', arriving: 'Friday' }).title).toBe('On its way');
    expect(stageWords({ stage: 'delivered', arriving: 'Friday' }).detail).not.toContain('Arriving');
    expect(stageWords({ stage: 'shipped', cancelled: true }).title).toBe('Canceled');
    expect([canCancel({ stage: 'placed' }), canCancel({ stage: 'packed' }), canCancel({ stage: 'shipped' }), canCancel({ stage: 'delivered' }), canCancel({ stage: 'placed', cancelled: true })]).toEqual([true, true, false, false, false]);
    expect(subtotal(order().items)).toBe(42);
  });

  test('one main and h1 named by the order, the skip link first, the stage as the first h2, and the steps named', async () => {
    const screen = await render(<OrderStatus order={order()} />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Order 77']);
    expect(screen.getByRole('heading', { level: 2 }).elements().map((h) => h.textContent)).toEqual(['Packed', 'What’s happened', 'Items', 'Delivery address']);
    expect(document.body.textContent).toContain('It’s waiting for the courier. Arriving Friday.');
    await expect.element(screen.getByRole('navigation', { name: 'Order progress' })).toBeVisible();
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('what happened is a list, newest first, each with a time a machine can read; the items and the total are in words', async () => {
    const screen = await render(<OrderStatus order={order()} />);
    const list = screen.getByRole('list', { name: 'What’s happened' });
    expect(list.getByRole('listitem').elements().map((li) => li.querySelector('time')?.getAttribute('datetime'))).toEqual(['2025-03-01T11:05:00', '2025-02-28T19:22:00'].map((at) => new Date(at).toISOString()));
    expect(list.element().textContent).toContain('Paid by card');
    const items = [...document.querySelectorAll('section[aria-labelledby="items"] li')].map((li) => li.textContent);
    expect(items).toHaveLength(2);
    expect(items[0]).toContain('× Mug, Blue');
    expect([...document.querySelectorAll('dt')].map((d) => d.textContent)).toEqual(['Subtotal', 'Delivery', 'Total']);
    expect(document.querySelector('address')?.textContent).toBe('Ana LimaBandung');
  });

  test('free delivery says "Free"', async () => {
    await render(<OrderStatus order={order({ delivery: 0 })} />);
    expect([...document.querySelectorAll('dd')].map((d) => d.textContent)[1]).toBe('Free');
  });

  test('Cancel order asks first; Keep order closes the dialog, cancels nothing and gives focus back', async () => {
    const onCancel = vi.fn();
    const screen = await render(<OrderStatus order={order()} onCancel={onCancel} />);
    const open = screen.getByRole('button', { name: 'Cancel order' });
    await open.click();
    const dialog = screen.getByRole('dialog', { name: 'Cancel order 77?' });
    await expect.element(dialog).toBeVisible();
    expect(dialog.element().textContent).toContain('goes back to you within 5 working days');
    await dialog.getByRole('button', { name: 'Keep order' }).click();
    await expect.poll(() => active()).toBe(open.element());
    expect(onCancel).not.toHaveBeenCalled();
    expect(document.querySelector('h2')?.textContent).toBe('Packed');
  });

  test('confirming cancels: the stage says so, the steps and the button go, focus is on the h1, and a toast says so', async () => {
    const onCancel = vi.fn(() => Promise.resolve());
    const screen = await render(<OrderStatus order={order({ delay: 'A day behind.' })} onCancel={onCancel} />);
    expect(document.body.textContent).toContain('It’s running late');
    await screen.getByRole('button', { name: 'Cancel order' }).click();
    await screen.getByRole('dialog').getByRole('button', { name: 'Cancel order' }).click();
    await expect.poll(() => document.querySelector('h2')?.textContent).toBe('Canceled');
    expect(onCancel).toHaveBeenCalledTimes(1);
    await expect.poll(() => active().tagName).toBe('H1');
    await expect.poll(() => toasted('Order 77 is canceled')).toBe(true);
    expect(screen.getByRole('navigation', { name: 'Order progress' }).elements()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Cancel order' }).elements()).toHaveLength(0);
    expect(document.body.textContent).not.toContain('It’s running late');
    expect(screen.getByRole('list', { name: 'What’s happened' }).getByRole('listitem').first().element().textContent).toContain('Order canceled');
  });

  test('a cancel that fails says so in the dialog, which stays open, and the order stays as it was', async () => {
    const screen = await render(<OrderStatus order={order()} onCancel={() => Promise.reject(new Error('offline'))} />);
    await screen.getByRole('button', { name: 'Cancel order' }).click();
    const dialog = screen.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Cancel order' }).click();
    await expect.element(dialog.getByRole('alert').filter({ hasText: 'Couldn’t cancel the order. Try again.' })).toBeVisible();
    expect(document.querySelector('h2')?.textContent).toBe('Packed');
    // Asking again starts without the old message.
    await dialog.getByRole('button', { name: 'Keep order' }).click();
    await screen.getByRole('button', { name: 'Cancel order' }).click();
    expect(screen.getByRole('dialog').getByRole('alert').filter({ hasText: 'Couldn’t cancel' }).elements()).toHaveLength(0);
  });

  test('once shipped: no Cancel button, a sentence says why, and the courier\'s page is a link; a delay says so', async () => {
    const screen = await render(<OrderStatus order={order({ stage: 'shipped', delay: 'A day behind after flooding.' })} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: 'Cancel order' }).elements()).toHaveLength(0);
    expect(document.body.textContent).toContain('It has shipped, so it can’t be canceled.');
    expect(screen.getByRole('link', { name: /Track the parcel with JNE/ }).element().getAttribute('href')).toBe('#jne');
    expect(document.body.textContent).toContain('A day behind after flooding.');
  });

  test('without onCancel there is no Cancel button; before it ships there is no courier link; delivered has every step done', async () => {
    const screen = await render(<OrderStatus order={order()} />);
    expect(screen.getByRole('button', { name: 'Cancel order' }).elements()).toHaveLength(0);
    expect(screen.getByRole('link', { name: /Track the parcel/ }).elements()).toHaveLength(0);
    await screen.rerender(<OrderStatus key="d" order={order({ stage: 'delivered' })} />);
    expect(document.querySelector('h2')?.textContent).toBe('Delivered');
    expect(document.querySelector('nav[aria-label="Order progress"] [aria-current]')).toBeNull();
  });

  test('while it loads: the h1 and one placeholder named "Loading order"; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<OrderStatus order={order()} loading />);
    expect(document.querySelector('h1')?.textContent).toBe('Order 77');
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading order']);
    await screen.rerender(<OrderStatus order={order()} loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the order' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the order that arrives once loading ends is the one shown', async () => {
    const screen = await render(<OrderStatus loading order={order()} />);
    await screen.rerender(<OrderStatus order={order({ number: '78' })} />);
    await expect.poll(() => document.querySelector('main h1')?.textContent).toContain('78');
  });
});

describe('OrderStatus printed', () => {
  test('printed, the order leaves out Cancel order', async () => {
    await render(<OrderStatus order={order()} onCancel={() => {}} />);
    // Found before printing: a role query skips what's hidden.
    const hidden: Element[] = [page.getByRole('button', { name: 'Cancel order' }).element()];
    const kept: Element[] = [page.getByRole('heading', { level: 1 }).element()];
    await commands.printMedia(true);
    try {
      for (const e of hidden) expect(e.checkVisibility(), e.textContent ?? '').toBe(false);
      for (const e of kept) expect(e.checkVisibility(), e.textContent ?? '').toBe(true);
    } finally { await commands.printMedia(false); }
  });
});
