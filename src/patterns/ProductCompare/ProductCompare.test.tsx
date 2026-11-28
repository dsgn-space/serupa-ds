import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { ProductCompare, differingFeatures, valueWords, type CompareFeature, type CompareProduct } from './ProductCompare';

const active = () => document.activeElement as HTMLElement;
const img = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/%3E';
const features: CompareFeature[] = [{ key: 'battery', label: 'Battery', unit: 'hours' }, { key: 'noise', label: 'Noise cancelling' }, { key: 'wired', label: 'Works with a cable' }];
const products: CompareProduct[] = [
  { id: 'a', name: 'Calm 300', href: '#a', image: img, price: 199, values: { battery: 30, noise: true, wired: true } },
  { id: 'b', name: 'Street One', href: '#b', image: img, price: 79, values: { battery: 40, noise: false, wired: true } },
];
const rowHeads = () => [...document.querySelectorAll('tbody th[scope="row"]')].map((th) => th.textContent);

// Product compare: a table whose products head the columns and features head the rows, values in words, "Only what
// differs" said in a status line, and Remove moving focus on.
describe('Patterns/Product compare', () => {
  test('values in words, and the features that differ', () => {
    expect([valueWords(true, features[1]!), valueWords(false, features[1]!), valueWords(null, features[1]!), valueWords(30, features[0]!, 'en-US'), valueWords('Black', features[1]!)])
      .toEqual(['Yes', 'No', 'Not said', '30 hours', 'Black']);
    expect(differingFeatures(products, features).map((f) => f.key)).toEqual(['battery', 'noise']);
    expect(differingFeatures([products[0]!], features)).toEqual([]);
  });

  test('one main and h1, the skip link first, a table with a caption, products heading columns and features heading rows', async () => {
    await render(<ProductCompare />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Compare headphones']);
    expect(document.querySelector('caption')?.textContent).toBe('The products side by side, a feature in each row');
    expect(document.querySelectorAll('thead th[scope="col"]')).toHaveLength(4);
    expect(rowHeads().slice(0, 3)).toEqual(['Battery', 'Weight', 'Noise cancelling']);
    expect(document.body.textContent).toContain('Not said');
  });

  test('"Only what differs" hides the rows that match and says how many are shown', async () => {
    const screen = await render(<ProductCompare products={products} features={features} />);
    expect(document.getElementById('compare-rows')?.getAttribute('role')).toBe('status');
    await screen.getByRole('switch', { name: 'Only what differs' }).click();
    await expect.poll(() => rowHeads()).toEqual(['Battery', 'Noise cancelling', 'Actions']);
    expect(document.getElementById('compare-rows')?.textContent).toMatch(/ features differ$/);
  });

  test('"Only what differs" on, then down to one product: every feature shows again, not none', async () => {
    const screen = await render(<ProductCompare products={products} features={features} />);
    await screen.getByRole('switch', { name: 'Only what differs' }).click();
    while (screen.getByRole('button', { name: /^Remove: / }).elements().length > 1) await screen.getByRole('button', { name: /^Remove: / }).first().click();
    await expect.poll(() => rowHeads().length).toBeGreaterThan(features.length);
    expect(document.getElementById('compare-rows')!.textContent).toBe(`All ${features.length} features`);
  });

  test('Add to cart says so; Remove moves focus to the next product\'s Remove, then the heading and an empty state', async () => {
    const onAddToCart = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const onRemove = vi.fn();
    const screen = await render(<ProductCompare products={products} features={features} onAddToCart={onAddToCart} onRemove={onRemove} />);
    await screen.getByRole('button', { name: 'Add to cart: Street One' }).click();
    await expect.poll(() => document.body.textContent).toContain('Couldn’t add Street One to your cart.');
    await screen.getByRole('button', { name: 'Add to cart: Street One' }).click();
    await expect.poll(() => document.body.textContent).toContain('Added Street One to your cart');
    await screen.getByRole('button', { name: 'Remove: Calm 300' }).click();
    await expect.poll(() => active().id).toBe('compare-remove-b');
    expect(screen.getByRole('switch').elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Remove: Street One' }).click();
    await expect.poll(() => active().id).toBe('compare-table');
    expect(document.body.textContent).toContain('Nothing to compare');
    expect(onRemove.mock.calls).toEqual([['a'], ['b']]);
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<ProductCompare loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading the products']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<ProductCompare loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the products' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the products that arrive once loading ends are the ones compared', async () => {
    const screen = await render(<ProductCompare loading products={[]} features={features} />);
    await screen.rerender(<ProductCompare products={products} features={features} />);
    await expect.poll(() => document.querySelectorAll('thead th[scope="col"]').length).toBe(products.length + 1);
  });
});
