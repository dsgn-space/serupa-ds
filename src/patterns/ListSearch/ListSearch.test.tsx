import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SerupaProvider } from '../../internal/provider';
import { ListSearch, readView, writeView } from './ListSearch';

const active = () => document.activeElement as HTMLElement;
const status = () => document.querySelector('main [role="status"]')?.textContent;
const names = () => [...document.querySelectorAll('tbody tr')].map((r) => r.querySelectorAll('td')[1]?.textContent);
// The toast that says text, and its buttons: Undo is named by its words, the close button is "Dismiss".
const toastOf = (text: string) => [...document.querySelectorAll('li')].filter((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]')).at(-1) as HTMLElement | undefined;
const undoIn = (text: string) => [...toastOf(text)!.querySelectorAll('button')].find((b) => b.textContent === 'Undo') as HTMLElement;

// List with search and filters (PT2): the count said as it changes, sort and selection that say what they are, a
// way out of no results, and the view kept in the address.
describe('Patterns/List with search and filters', () => {
  test('the view round-trips through the address, and anything odd falls back to the default', () => {
    const v = readView('?q=app&status=Active&owner=Ana&sort=updated&dir=descending&page=2');
    expect(v).toEqual({ q: 'app', status: 'Active', owner: 'Ana', sort: 'updated', dir: 'descending', page: 2 });
    expect(writeView(v)).toBe('?q=app&status=Active&owner=Ana&sort=updated&dir=descending&page=2');
    expect(readView('?sort=size&dir=up&page=-3')).toEqual({ q: '', status: '', owner: '', sort: 'name', dir: 'ascending', page: 1 });
    expect(writeView(readView(''))).toBe('');
  });

  test('one main and one h1, the skip link first, a search landmark, and ten rows of 24 with pages', async () => {
    const screen = await render(<ListSearch />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    await expect.element(screen.getByRole('search', { name: 'Search and filter projects' })).toBeVisible();
    expect(status()).toBe('24 projects');
    expect(names()).toHaveLength(10);
    await expect.element(screen.getByRole('navigation', { name: 'Projects pages' })).toBeVisible();
  });

  test('searching and filtering say the new count, go back to page 1 and write the address', async () => {
    const onSearchChange = vi.fn();
    const screen = await render(<ListSearch search="?page=2" onSearchChange={onSearchChange} />);
    await userEvent.fill(screen.getByRole('searchbox'), 'app');
    await vi.waitFor(() => expect(status()).toBe('1 of 24 projects'));
    expect(onSearchChange).toHaveBeenLastCalledWith('?q=app');
    await userEvent.fill(screen.getByRole('searchbox'), '');
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'Paused');
    await userEvent.selectOptions(screen.getByLabelText('Owner'), 'Ana');
    expect(onSearchChange).toHaveBeenLastCalledWith('?status=Paused&owner=Ana');
    expect(names().length).toBeGreaterThan(0);
  });

  test('sorting is on the headers: aria-sort says the order, a second press turns it round', async () => {
    const onSearchChange = vi.fn();
    const screen = await render(<ListSearch onSearchChange={onSearchChange} />);
    const updated = () => screen.getByRole('columnheader', { name: /Updated/ });
    await expect.element(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
    await screen.getByRole('button', { name: /Updated/ }).click();
    await expect.element(updated()).toHaveAttribute('aria-sort', 'ascending');
    await screen.getByRole('button', { name: /Updated/ }).click();
    await expect.element(updated()).toHaveAttribute('aria-sort', 'descending');
    expect(onSearchChange).toHaveBeenLastCalledWith('?sort=updated&dir=descending');
    expect(names()[0]).toBe('Website redesign');
    await screen.getByRole('button', { name: /Name/ }).click();
    expect(onSearchChange).toHaveBeenLastCalledWith('');
  });

  test('a page is kept in the address, and selection works by row and by page', async () => {
    const onSearchChange = vi.fn();
    const screen = await render(<SerupaProvider locale="en"><ListSearch onSearchChange={onSearchChange} /></SerupaProvider>);
    await screen.getByRole('button', { name: /^Page (3|٣)$/ }).click();
    expect(onSearchChange).toHaveBeenLastCalledWith('?page=3');
    expect(names()).toHaveLength(4);
    await screen.getByRole('checkbox', { name: 'Select all projects on this page' }).click();
    await expect.element(screen.getByRole('group', { name: /^(4|٤) selected$/ })).toBeVisible();
    await screen.getByRole('checkbox', { name: `Select ${names()[0]}` }).click();
    await expect.element(screen.getByRole('group', { name: /^(3|٣) selected$/ })).toBeVisible();
    await screen.getByRole('checkbox', { name: 'Select all projects on this page' }).click();
    await expect.element(screen.getByRole('group', { name: /^(4|٤) selected$/ })).toBeVisible();
    await screen.getByRole('checkbox', { name: 'Select all projects on this page' }).click();
    expect(document.querySelectorAll('tbody input:checked')).toHaveLength(0);
    await screen.getByRole('checkbox', { name: `Select ${names()[1]}` }).click();
    await screen.getByRole('button', { name: 'Archive' }).click();
    expect(document.querySelectorAll('tbody input:checked')).toHaveLength(0);
    await screen.getByRole('checkbox', { name: `Select ${names()[1]}` }).click();
    await screen.getByRole('button', { name: 'Clear selection' }).click();
    expect(document.querySelectorAll('tbody input:checked')).toHaveLength(0);
  });

  test('a search or filter lets go of the selected rows it hides, so the count and the bulk actions only reach rows in view', async () => {
    const screen = await render(<SerupaProvider locale="en"><ListSearch /></SerupaProvider>);
    const [a, b] = names();
    await screen.getByRole('checkbox', { name: `Select ${a}` }).click();
    await screen.getByRole('checkbox', { name: `Select ${b}` }).click();
    await expect.element(screen.getByRole('group', { name: '2 selected' })).toBeVisible();
    await userEvent.fill(screen.getByRole('searchbox'), a);
    await expect.element(screen.getByRole('group', { name: '1 selected' })).toBeVisible();
    await userEvent.fill(screen.getByRole('searchbox'), '');
    await vi.waitFor(() => expect(status()).toBe('24 projects'));
    await expect.element(screen.getByRole('group', { name: '1 selected' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: `Select ${b}` }).element()).not.toBeChecked();
  });

  test('Archive takes the rows away with Undo and archives them for good only once its toast closes; Export says what it did', async () => {
    const onArchive = vi.fn(), onExport = vi.fn();
    const screen = await render(<SerupaProvider locale="en"><ListSearch onArchive={onArchive} onExport={onExport} /></SerupaProvider>);
    const [a, b] = names();
    await screen.getByRole('checkbox', { name: `Select ${a}` }).click();
    await screen.getByRole('button', { name: 'Export' }).click();
    expect(onExport).toHaveBeenCalledWith([a]);
    await vi.waitFor(() => expect(toastOf('Exported 1 project')).toBeTruthy());
    await screen.getByRole('checkbox', { name: `Select ${b}` }).click();
    await screen.getByRole('button', { name: 'Archive' }).click();
    await vi.waitFor(() => expect(toastOf('Archived 2 projects')).toBeTruthy());
    expect([status(), names().includes(a), names().includes(b), document.querySelectorAll('tbody input:checked').length]).toEqual(['22 projects', false, false, 0]);
    undoIn('Archived 2 projects').click();
    await vi.waitFor(() => expect(status()).toBe('24 projects'));
    expect([names().includes(a), onArchive.mock.calls.length]).toEqual([true, 0]);
    await screen.getByRole('checkbox', { name: `Select ${a}` }).click();
    await screen.getByRole('button', { name: 'Archive' }).click();
    await vi.waitFor(() => expect(toastOf('Archived 1 project')).toBeTruthy());
    (toastOf('Archived 1 project')!.querySelector('button[aria-label="Dismiss"]') as HTMLElement).click();
    await vi.waitFor(() => expect(onArchive).toHaveBeenCalledWith([a]));
    expect(status()).toBe('23 projects');
  });

  test('the Updated column reads as a day in the reader\'s locale, and keeps the ISO day in dateTime', async () => {
    await render(<SerupaProvider locale="en-US"><ListSearch projects={[{ name: 'X', status: 'Active', owner: 'Ana', updated: '2026-11-06' }]} /></SerupaProvider>);
    const time = document.querySelector('tbody time') as HTMLTimeElement;
    expect([time.textContent, time.dateTime]).toEqual(['Nov 6, 2026', '2026-11-06']);
  });

  test('no results says so in words and "Clear filters" brings every row back with focus on the search', async () => {
    const screen = await render(<ListSearch search="?q=rocket" />);
    await expect.element(screen.getByRole('heading', { name: 'No projects match “rocket”', level: 2 })).toBeVisible();
    expect(document.querySelector('table')).toBeNull();
    const buttons = screen.getByRole('button', { name: 'Clear filters' });
    await buttons.last().click();
    expect(status()).toBe('24 projects');
    expect(active().getAttribute('type')).toBe('search');
  });

  test('filters that match nothing, with no search, say "these filters"', async () => {
    const screen = await render(<ListSearch search="?status=Done&owner=Ana" projects={[{ name: 'X', status: 'Active', owner: 'Ana', updated: '2026-01-01' }]} />);
    await expect.element(screen.getByRole('heading', { name: 'No projects match these filters' })).toBeVisible();
    expect(document.querySelector('nav[aria-label="Projects pages"]')).toBeNull();
  });
});
