import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { StockCount, applyCounts, countProgress, parseCount, type StockItem } from './StockCount';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/[‎‏؜]/g, '');
const status = () => norm(document.getElementById('sc-progress')!.textContent);
const headers = () => page.getByRole('columnheader').elements().map((e) => e.textContent);
const item = (id: string, expected: number, counted: number | null): StockItem => ({ id, sku: id, name: id, location: '', expected, counted });

// Stock count: counts typed into a grid, how many are counted and differ said as they go in, the row size and the
// columns in one toolbar, and a save that fails keeping every count.
describe('Patterns/StockCount', () => {
  test('counts from text, from grid changes, and the progress', () => {
    expect([parseCount(' 12 '), parseCount(''), parseCount('-1'), parseCount('2.5'), parseCount('x')]).toEqual([12, null, null, null, null]);
    const items = [item('a', 5, null), item('b', 3, 3)];
    const next = applyCounts(items, [{ rowId: 'a', column: 'counted', value: '4' }, { rowId: 'b', column: 'counted', value: '' }, { rowId: 'b', column: 'name', value: 'x' }]);
    expect(next.map((i) => i.counted)).toEqual([4, null]);
    expect(countProgress(items)).toEqual({ counted: 1, differ: 0 });
    expect(countProgress(next)).toEqual({ counted: 1, differ: 1 });
  });

  test('one main and h1, the skip link first, a named grid, and the progress so far', async () => {
    const screen = await render(<StockCount />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Stock count: Main Street shop']);
    await expect.element(screen.getByRole('grid', { name: 'Stock at Main Street shop' })).toBeVisible();
    expect(headers()).toEqual(['Product', 'Location', 'On record', 'Counted', 'Difference']);
    expect(status()).toBe('Counted 3 of 6 products. 1 differs from the record.');
    expect(norm(screen.getByRole('row', { name: /Gayo coffee/ }).element().textContent)).toMatch(/−2$/);
  });

  test('typing a count updates the progress; a save that fails says so and keeps it; saving again works', async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<StockCount onSave={onSave} />);
    await userEvent.click(screen.getByRole('gridcell', { name: 'Palm sugar, 500 g', exact: true }));
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}28{Enter}');
    await expect.poll(status).toBe('Counted 4 of 6 products. 2 differ from the record.');
    await screen.getByRole('button', { name: 'Save counts' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Couldn’t save the counts. Try again; every count is still here.');
    expect((onSave.mock.calls[0]![0] as StockItem[]).find((i) => i.id === 'd')?.counted).toBe(28);
    await screen.getByRole('button', { name: 'Save counts' }).click();
    await expect.element(screen.getByRole('status').filter({ hasText: 'Counts saved.' })).toBeVisible();
    expect(status()).toMatch(/^Counted 4 of 6/);
  });

  test('the toolbar sets the row size, and Columns moves columns between hidden and shown', async () => {
    const screen = await render(<StockCount />);
    const grid = () => document.querySelector('[data-component="data-grid"]')!;
    expect(grid().className).not.toMatch(/--lg/);
    await screen.getByRole('button', { name: 'Touch' }).click();
    expect(grid().className).toMatch(/srp-data-grid--lg/);
    await expect.element(screen.getByRole('button', { name: 'Touch' })).toHaveAttribute('aria-pressed', 'true');
    await screen.getByRole('button', { name: 'Columns' }).click();
    const dialog = screen.getByRole('dialog', { name: 'Columns' });
    await expect.element(dialog).toBeVisible();
    await dialog.getByRole('checkbox', { name: 'SKU' }).click();
    await dialog.getByRole('button', { name: 'Add' }).click();
    await dialog.getByRole('checkbox', { name: 'Location' }).click();
    await dialog.getByRole('button', { name: 'Remove' }).click();
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect.poll(headers).toEqual(['SKU', 'Product', 'On record', 'Counted', 'Difference']);
  });
});
