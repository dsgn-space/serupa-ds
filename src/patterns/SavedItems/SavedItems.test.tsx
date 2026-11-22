import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { SavedItems, savedChange, sortSaved, type SavedItem } from './SavedItems';

const active = () => document.activeElement as HTMLElement;
const names = () => [...document.querySelectorAll('main li h3')].map((h) => h.textContent);
const toastOf = (text: string) => [...document.querySelectorAll('li')].filter((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]')).at(-1) as HTMLElement;
const img = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/%3E';
const items: SavedItem[] = [
  { id: 'a', name: 'Linen shirt', href: '#a', image: img, price: 39, savedPrice: 52, saved: '2026-02-12' },
  { id: 'b', name: 'Tote bag', href: '#b', image: img, price: 24, savedPrice: 24, left: 2, saved: '2026-02-08' },
  { id: 'c', name: 'Pour-over set', href: '#c', image: img, price: 68, savedPrice: 68, left: 0, saved: '2026-01-30' },
];

// Saved items: what changed since saving said in words, the sort said in a status line, buttons named by their
// item, Move to cart, and Remove with Undo that moves focus on to the next item.
describe('Patterns/Saved items', () => {
  test('the sorts, and what changed since saving in words', () => {
    expect(sortSaved(items, 'newest').map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(sortSaved(items, 'price-low').map((i) => i.id)).toEqual(['b', 'a', 'c']);
    expect(sortSaved(items, 'price-high').map((i) => i.id)).toEqual(['c', 'a', 'b']);
    expect(sortSaved([items[1]!, items[0]!], 'dropped').map((i) => i.id)).toEqual(['a', 'b']);
    expect(items.map(savedChange)).toEqual([{ label: 'Price dropped', tone: 'success' }, { label: 'Only 2 left', tone: 'warning' }, { label: 'Sold out', tone: 'neutral' }]);
    expect(savedChange({ ...items[1]!, left: 40 })).toBeNull();
  });

  test('one main and h1, the skip link first, each item a list item named by its link, and buttons named by their item', async () => {
    const screen = await render(<SavedItems />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Saved items']);
    expect(screen.getByRole('listitem', { name: 'Linen shirt' }).element().querySelector('del')?.parentElement?.textContent).toMatch(/^Was /);
    expect(screen.getByRole('button', { name: 'Move to cart: Linen shirt' }).elements()).toHaveLength(1);
    expect(screen.getByRole('button', { name: /^Move to cart: Ceramic/ }).elements()).toHaveLength(0);
    expect(document.body.textContent).toContain('Sold out');
  });

  test('the sort reorders the list and says so', async () => {
    const screen = await render(<SavedItems items={items} />);
    expect(document.getElementById('saved-count')?.textContent).toMatch(/items, newest saved first$/);
    await screen.getByRole('combobox', { name: 'Sort by' }).selectOptions('price-high');
    await expect.poll(names).toEqual(['Pour-over set', 'Linen shirt', 'Tote bag']);
    expect(document.getElementById('saved-count')?.textContent).toMatch(/price, high to low$/);
  });

  test('Remove takes it out at once, focus moves on, Undo brings it back; closing commits it', async () => {
    const onRemove = vi.fn();
    const screen = await render(<SavedItems items={items} onRemove={onRemove} />);
    await screen.getByRole('button', { name: 'Remove: Linen shirt' }).click();
    await expect.poll(names).toEqual(['Tote bag', 'Pour-over set']);
    await expect.poll(() => active().id).toBe('remove-b');
    await page.elementLocator(toastOf('Removed Linen shirt')).getByRole('button', { name: 'Undo' }).click();
    await expect.poll(names).toEqual(['Linen shirt', 'Tote bag', 'Pour-over set']);
    await expect.poll(() => active().id).toBe('remove-a');
    expect(onRemove).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Remove: Pour-over set' }).click();
    await expect.poll(() => active().id).toBe('remove-b');
    await page.elementLocator(toastOf('Removed Pour-over set')).getByRole('button', { name: 'Dismiss' }).click();
    await expect.poll(() => onRemove.mock.calls).toEqual([['c']]);
  });

  test('Move to cart moves it and says so; one that can\'t says so and stays; the last one gone focuses the heading and an empty state', async () => {
    const onMoveToCart = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const screen = await render(<SavedItems items={[items[0]!]} onMoveToCart={onMoveToCart} />);
    await screen.getByRole('button', { name: 'Move to cart: Linen shirt' }).click();
    await expect.poll(() => document.body.textContent).toContain('Couldn’t move Linen shirt to your cart.');
    expect(names()).toEqual(['Linen shirt']);
    await screen.getByRole('button', { name: 'Move to cart: Linen shirt' }).click();
    await expect.poll(() => document.body.textContent).toContain('Moved Linen shirt to your cart');
    await expect.poll(() => active().textContent).toBe('Your list');
    expect(document.body.textContent).toContain('Nothing saved yet');
    expect(onMoveToCart).toHaveBeenLastCalledWith('a');
  });

  test('the items that arrive once loading ends are the ones shown', async () => {
    const screen = await render(<SavedItems loading items={[]} />);
    await screen.rerender(<SavedItems items={items} />);
    await expect.poll(names).toEqual(['Linen shirt', 'Tote bag', 'Pour-over set']);
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<SavedItems loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading saved items']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<SavedItems loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your saved items' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('after Try again, focus goes to the page title, not lost with the button', async () => {
    const screen = await render(<SavedItems loadFailed onRetry={() => {}} items={items} />);
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(active().textContent).toBe('Try again');
    await screen.rerender(<SavedItems loading items={items} />);
    await expect.poll(() => active().tagName).toBe('H1');
    await screen.rerender(<SavedItems items={items} />);
    expect(active().tagName).toBe('H1');
  });
});
