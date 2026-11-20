import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { ProductPage, countItems, countReviews, lineName, missingOptions, saving, type ProductInfo } from './ProductPage';

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const px = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"/>');
const mug: ProductInfo = {
  name: 'Mug', summary: 'Holds tea.', price: 12, was: 16, rating: 4, left: 3,
  pictures: [{ src: px, alt: 'The mug from the side' }, { src: px + '#2', alt: 'The mug from above' }],
  options: [
    { id: 'color', label: 'Color', choices: [{ value: 'red', label: 'Red' }, { value: 'blue', label: 'Blue' }] },
    { id: 'size', label: 'Size', choices: [{ value: 's', label: 'Small' }, { value: 'l', label: 'Large', soldOut: true }, { value: 'm', label: 'Medium' }] },
  ],
  details: [{ term: 'Material', value: 'Stoneware' }],
  delivery: 'Arrives in a week.',
  reviews: [{ id: 'r1', author: 'Ana', rating: 5, date: '2025-02-18', title: 'Keeps tea hot', body: 'Thick walls.' }],
};

// Product page: the choices are named groups, a missing one is asked for by name, adding says what went in the
// cart, and a failed add keeps every choice.
describe('Patterns/Product page', () => {
  test('the words for a saving, the options still to choose, what was added, and counts', () => {
    expect([saving(39, 52), saving(39), saving(39, 39), saving(40, 30)]).toEqual([25, null, null, null]);
    expect(missingOptions(mug.options, {})).toEqual(['color', 'size']);
    expect(missingOptions(mug.options, { color: 'red', size: 'l' })).toEqual(['size']);   // sold out doesn't count
    expect(missingOptions(mug.options, { color: 'red', size: 'm' })).toEqual([]);
    expect(lineName(mug, { options: { color: 'blue', size: 'm' }, quantity: 2 })).toBe('2 × Mug, Blue, Medium');
    expect(lineName(mug, { options: {}, quantity: 1 }, '١')).toBe('١ × Mug');
    expect([countItems(1), countItems(0), countItems(3, '٣'), countReviews(1), countReviews(12)]).toEqual(['1 item', '0 items', '٣ items', '1 review', '12 reviews']);
  });

  test('one main and h1 named by the product, the skip link first, every picture with its own alt, and the sale in words', async () => {
    const screen = await render(<ProductPage product={mug} />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Mug']);
    expect(screen.getByRole('heading', { level: 2 }).elements().map((h) => h.textContent)).toEqual(['About this product', 'Reviews']);
    expect([...document.querySelectorAll('main img')].map((i) => i.getAttribute('alt'))).toEqual(['The mug from the side', 'The mug from above']);
    await expect.element(screen.getByRole('region', { name: 'Pictures of Mug' })).toBeVisible();
    expect(document.body.textContent).toContain('Was ');
    expect(document.body.textContent).toContain('25% off');
    expect(document.body.textContent).toMatch(/Only .+ left\./);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('each choice is a named group of radios, and a sold-out one says so and can\'t be picked', async () => {
    const screen = await render(<ProductPage product={mug} />);
    const size = screen.getByRole('group', { name: /Size/ });
    expect(size.getByRole('radio').elements()).toHaveLength(3);
    const large = size.getByRole('radio', { name: /Large/ }).element() as HTMLInputElement;
    expect(large.disabled).toBe(true);
    expect(size.element().textContent).toContain('Sold out');
    expect(size.getByRole('radio', { checked: true }).elements()).toHaveLength(0);
  });

  test('a color choice with a swatch shows a 16px dot before its name, centred on the text and hidden from the name', async () => {
    const screen = await render(<ProductPage product={{ ...mug, options: [{ id: 'color', label: 'Color', choices: [{ value: 'sand', label: 'Sand', swatch: '#e9dfc8' }, { value: 'navy', label: 'Navy' }] }] }} />);
    const sand = screen.getByRole('radio', { name: 'Sand', exact: true }).element();
    const dot = sand.closest('label')!.querySelector('span[style]') as HTMLElement;
    const words = document.createRange();
    words.selectNodeContents(dot.nextSibling!);
    const d = dot.getBoundingClientRect(), text = words.getBoundingClientRect();
    expect([getComputedStyle(dot).backgroundColor, d.width, d.height]).toEqual(['rgb(233, 223, 200)', 16, 16]);
    expect(Math.abs((d.top + d.bottom) / 2 - (text.top + text.bottom) / 2)).toBeLessThanOrEqual(1);
    expect(screen.getByRole('radio', { name: 'Navy', exact: true }).element().closest('label')!.querySelector('span[style]')).toBeNull();
  });

  test('Add to cart with a choice missing says which next to its group, focuses its first radio, and sends nothing', async () => {
    const onAdd = vi.fn();
    const screen = await render(<ProductPage product={mug} onAddToCart={onAdd} />);
    await screen.getByRole('radio', { name: 'Red' }).click();
    await screen.getByRole('button', { name: 'Add to cart' }).click();
    // Scoped to the group: the page's live announcer can hold the same words for a moment.
    await expect.element(screen.getByRole('group', { name: /Size/ }).getByText('Choose a size.')).toBeVisible();
    expect(screen.getByRole('group', { name: /Color/ }).element().textContent).not.toContain('Choose a color.');
    expect((active() as HTMLInputElement).name).toBe('option-size');
    expect(active().getAttribute('value')).toBe('s');
    expect(onAdd).not.toHaveBeenCalled();
    // Picking clears the message.
    await screen.getByRole('radio', { name: 'Medium' }).click();
    expect(screen.getByRole('group', { name: /Size/ }).element().textContent).not.toContain('Choose a size.');
  });

  test('two on one page: a missing choice focuses the radio in the form that was sent', async () => {
    const screen = await render(<><ProductPage product={mug} /><ProductPage product={mug} /></>);
    const second = screen.getByRole('button', { name: 'Add to cart' }).nth(1);
    await second.click();
    await expect.element(screen.getByText('Choose a color.').first()).toBeVisible();
    expect(active().closest('form')).toBe(second.element().closest('form'));
  });

  test('adding sends the choices and the quantity, says what was added, and the cart link carries the new count', async () => {
    const onAdd = vi.fn(() => Promise.resolve());
    const screen = await render(<ProductPage product={mug} cartCount={1} onAddToCart={onAdd} />);
    await expect.element(screen.getByRole('link', { name: /^Cart, .+ item$/ })).toBeVisible();
    await screen.getByRole('radio', { name: 'Blue' }).click();
    await screen.getByRole('radio', { name: 'Medium' }).click();
    await screen.getByRole('button', { name: 'Increase' }).click();
    await screen.getByRole('button', { name: 'Add to cart' }).click();
    await expect.poll(() => toasted('× Mug, Blue, Medium')).toBe(true);
    expect(onAdd).toHaveBeenCalledWith({ options: { color: 'blue', size: 'm' }, quantity: 2 });
    await expect.element(screen.getByRole('link', { name: /^Cart, .+ items$/ })).toBeVisible();
  });

  test('the quantity keeps to what\'s in stock', async () => {
    const onAdd = vi.fn();
    const screen = await render(<ProductPage product={{ ...mug, left: 2, options: [] }} onAddToCart={onAdd} />);
    const more = screen.getByRole('button', { name: 'Increase' });
    await more.click();
    expect((more.element() as HTMLButtonElement).disabled).toBe(true);
    await screen.getByRole('button', { name: 'Add to cart' }).click();
    await expect.poll(() => onAdd.mock.calls.length).toBe(1);
    expect(onAdd).toHaveBeenCalledWith({ options: {}, quantity: 2 });
  });

  test('an add that fails says so above the button and keeps every choice', async () => {
    const screen = await render(<ProductPage product={mug} onAddToCart={() => Promise.reject(new Error('offline'))} />);
    await screen.getByRole('radio', { name: 'Red' }).click();
    await screen.getByRole('radio', { name: 'Small' }).click();
    await screen.getByRole('button', { name: 'Add to cart' }).click();
    await expect.element(screen.getByRole('alert').filter({ hasText: 'Couldn’t add it to your cart. Try again.' })).toBeVisible();
    expect((screen.getByRole('radio', { name: 'Red' }).element() as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('radio', { name: 'Small' }).element() as HTMLInputElement).checked).toBe(true);
    await expect.element(screen.getByRole('link', { name: /^Cart, .+ items$/ })).toBeVisible();   // still 0 items
  });

  test('a group with one choice in stock is already made', async () => {
    const onAdd = vi.fn();
    const one: ProductInfo = { ...mug, options: [{ id: 'size', label: 'Size', choices: [{ value: 's', label: 'Small' }, { value: 'l', label: 'Large', soldOut: true }] }] };
    const screen = await render(<ProductPage product={one} onAddToCart={onAdd} />);
    expect((screen.getByRole('radio', { name: 'Small' }).element() as HTMLInputElement).checked).toBe(true);
    await screen.getByRole('button', { name: 'Add to cart' }).click();
    await expect.poll(() => onAdd.mock.calls.length).toBe(1);
    expect(onAdd).toHaveBeenCalledWith({ options: { size: 's' }, quantity: 1 });
  });

  test('none left says "Sold out" in place of the form; no reviews says so', async () => {
    const screen = await render(<ProductPage product={{ ...mug, left: 0, was: undefined, rating: undefined, reviews: [] }} />);
    expect(document.body.textContent).toContain('Sold out');
    expect(screen.getByRole('button', { name: 'Add to cart' }).elements()).toHaveLength(0);
    expect(screen.getByRole('radio').elements()).toHaveLength(0);
    expect(document.body.textContent).toContain('No reviews yet.');
    expect(document.body.textContent).not.toContain('% off');
  });

  test('the reviews link goes to the reviews, each with its rating as one named image', async () => {
    const screen = await render(<ProductPage product={mug} />);
    expect(screen.getByRole('link', { name: /review$/ }).element().getAttribute('href')).toBe('#reviews');
    expect(document.getElementById('reviews')?.tagName).toBe('H2');
    expect(screen.getByRole('img', { name: /^Rating, / }).elements()).toHaveLength(2);
    expect(screen.getByRole('heading', { level: 3, name: 'Keeps tea hot' }).elements()).toHaveLength(1);
  });

  test('while it loads: placeholders named once, still an h1; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<ProductPage loading />);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading product']);
    expect(screen.getByRole('button', { name: 'Add to cart' }).elements()).toHaveLength(0);
    await screen.rerender(<ProductPage loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the product' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
