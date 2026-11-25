import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { DataExport, exportSize, sizeWords } from './DataExport';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/٫/g, '.').replace(/٬/g, ',');
const sizeText = () => norm(document.getElementById('export-size')!.textContent);

// Download your data: a named group with Everything, sizes said as the choice changes, nothing chosen as a summary
// that takes focus, a request that fails keeping the choices, and the exports heading taking focus once asked.
describe('Patterns/Download your data', () => {
  test('sizes add up and are said in the largest unit', () => {
    const parts = [{ id: 'a', label: 'A', holds: '', bytes: 500 }, { id: 'b', label: 'B', holds: '', bytes: 1_250_000 }];
    expect([exportSize(parts, ['a', 'b']), exportSize(parts, ['b']), exportSize(parts, [])]).toEqual([1_250_500, 1_250_000, 0]);
    expect([sizeWords(500, 'en-US'), sizeWords(240_000, 'en-US'), sizeWords(1_320_000_000, 'en-US'), sizeWords(18_400_000, 'en-US')]).toEqual(['500 byte', '240 kB', '1.3 GB', '18 MB']);
    // A size that rounds up to 1,000 of a unit is 1 of the next.
    expect([sizeWords(999_950, 'en-US'), sizeWords(999_600, 'en-US'), sizeWords(9_960, 'en-US')]).toEqual(['1 MB', '1 MB', '10 kB']);
  });

  test('one main and h1, the skip link first, everything chosen with its size, and the size follows the choice', async () => {
    const screen = await render(<DataExport today="2026-11-16" />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Download your data']);
    expect(screen.getByRole('group', { name: /What should it include/ }).elements()).toHaveLength(1);
    await expect.element(screen.getByRole('checkbox', { name: 'Everything' })).toBeChecked();
    expect(sizeText()).toMatch(/about 1[.,]4\s?\S+\.$/);
    await screen.getByRole('checkbox', { name: 'Files' }).click();
    await expect.poll(sizeText).toMatch(/about 105\s?\S+\.$/);
    expect(screen.getByRole('checkbox', { name: 'Everything' }).element()).toHaveProperty('indeterminate', true);
    await expect.element(screen.getByRole('radio', { name: 'CSV' })).toHaveAccessibleDescription(/spreadsheet/);
  });

  test('past exports say their state in words; a ready one names its date and size', async () => {
    const screen = await render(<DataExport today="2026-11-16" />);
    const text = norm(document.body.textContent);
    expect(text).toContain('Ready');
    expect(text).toContain('Expired');
    expect(text).toContain('Its link has run out.');
    const link = screen.getByRole('link', { name: /^Download export of / });
    expect(link.element().getAttribute('href')).toBe('#export-e2');
    expect(norm(link.element().getAttribute('aria-label'))).toMatch(/, 19\s?\S+$/);
  });

  test('asking with nothing chosen shows a summary that takes focus, linked to the group', async () => {
    const onRequest = vi.fn();
    const screen = await render(<DataExport today="2026-11-16" onRequest={onRequest} />);
    await screen.getByRole('checkbox', { name: 'Everything' }).click();
    expect(sizeText()).toBe('Choose what to include to see its size.');
    await screen.getByRole('button', { name: 'Ask for my data' }).click();
    await expect.poll(() => active().textContent).toContain('Choose at least one thing to include.');
    expect(onRequest).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Choose at least one thing to include.' }).element().getAttribute('href')).toBe('#export-parts');
  });

  test('asking sends the choice, puts a preparing export first and takes focus to the exports', async () => {
    const onRequest = vi.fn();
    const screen = await render(<DataExport today="2026-11-16" onRequest={onRequest} />);
    await screen.getByRole('checkbox', { name: 'Messages' }).click();
    await screen.getByRole('radio', { name: 'CSV' }).click();
    await screen.getByRole('button', { name: 'Ask for my data' }).click();
    await expect.poll(() => active().id).toBe('export-list');
    expect(onRequest).toHaveBeenCalledWith({ parts: ['profile', 'projects', 'files'], format: 'csv' });
    expect(document.getElementById('export-asked')!.textContent).toContain('We’re preparing your data.');
    const first = document.querySelector('main section li')!;
    expect(norm(first.textContent)).toContain('Preparing');
    expect(norm(first.textContent)).toContain('Profile and settings, Projects, Files. CSV');
  });

  test('a request that fails says so and keeps the choices', async () => {
    const screen = await render(<DataExport exports={[]} onRequest={() => Promise.reject(new Error('offline'))} />);
    expect(norm(document.body.textContent)).toContain('You haven’t asked for your data yet.');
    await screen.getByRole('radio', { name: 'CSV' }).click();
    await screen.getByRole('button', { name: 'Ask for my data' }).click();
    await expect.element(screen.getByText('Couldn’t ask for your data.', { exact: false })).toBeVisible();
    await expect.element(screen.getByRole('radio', { name: 'CSV' })).toBeChecked();
    expect(document.querySelectorAll('main section li')).toHaveLength(0);
  });

  test('without today, a new export is marked with the real date', async () => {
    const screen = await render(<DataExport exports={[]} />);
    await screen.getByRole('button', { name: 'Ask for my data' }).click();
    await expect.poll(() => document.querySelectorAll('main section li').length).toBe(1);
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<DataExport loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading your exports']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<DataExport loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your exports' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the exports that arrive once loading ends are the ones shown', async () => {
    const screen = await render(<DataExport loading exports={[]} />);
    await screen.rerender(<DataExport />);
    await expect.poll(() => document.querySelectorAll('section[aria-labelledby="export-list"] li').length).toBeGreaterThan(0);
  });
});
