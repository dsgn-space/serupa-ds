import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SerupaProvider } from '../../internal/provider';
import { Dashboard, type DashboardData } from './Dashboard';

const active = () => document.activeElement as HTMLElement;
const regions = () => [...document.querySelectorAll('main section[aria-labelledby]')]
  .map((s) => document.getElementById(s.getAttribute('aria-labelledby') || '')?.textContent);
const empty: DashboardData = { stats: [], storage: { used: 0, limit: 10 }, goal: { label: 'Launch checklist', done: 0, total: 5 }, projects: [], activity: [] };

// Dashboard: each part a named region, numbers and levels said in words, one skeleton name per part while loading,
// a first run that offers the first step, and activity that loads more without losing focus.
describe('Patterns/Dashboard', () => {
  test('one main and one h1, the skip link first, and each part a region named by its h2', async () => {
    await render(<Dashboard />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    expect(regions()).toEqual(['This month', 'Recent projects', 'Usage', 'Activity']);
    const levels = [...document.querySelectorAll('main h1, main h2, main h3')].map((h) => Number(h.tagName[1]));
    levels.forEach((l, i) => { if (i > 0) expect(l - (levels[i - 1] ?? 1)).toBeLessThanOrEqual(1); });
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('the changes, the storage level and the goal are said in words', async () => {
    const screen = await render(<Dashboard />);
    const stats = document.querySelector('main section ul') as HTMLElement;
    expect(stats.textContent).toMatch(/Up 12%/);
    expect(stats.textContent).toMatch(/Down 3%/);
    await expect.element(screen.getByRole('meter', { name: 'Storage' })).toHaveAttribute('aria-valuetext', expect.stringMatching(/of .*GB, almost full$/));
    await expect.element(screen.getByRole('progressbar', { name: 'Launch checklist' })).toHaveAttribute('aria-valuetext', '3 of 5 done');
    // Under the amber zone, the meter says only the amounts.
    await render(<Dashboard data={{ ...empty, projects: [{ name: 'A', href: '#a', status: 'Active', updated: '2026-11-06' }], storage: { used: 2, limit: 10 } }} />);
    const meters = screen.getByRole('meter', { name: 'Storage' }).elements();
    expect(meters.at(-1)?.getAttribute('aria-valuetext')).toMatch(/GB$/);
  });

  test('a project\'s Updated day reads in the reader\'s locale, and keeps the ISO day in dateTime', async () => {
    await render(<SerupaProvider locale="en-US"><Dashboard data={{ ...empty, projects: [{ name: 'A', href: '#a', status: 'Active', updated: '2026-11-06' }] }} /></SerupaProvider>);
    const time = document.querySelector('tbody time') as HTMLTimeElement;
    expect([time.textContent, time.dateTime]).toEqual(['Nov 6, 2026', '2026-11-06']);
  });

  test('the recent projects are a table of links, and "All projects" sits by its heading', async () => {
    const screen = await render(<Dashboard />);
    const table = screen.getByRole('table', { name: 'Recent projects' });
    await expect.element(table).toBeInTheDocument();
    expect(table.element().querySelectorAll('tbody tr')).toHaveLength(5);
    await expect.element(screen.getByRole('link', { name: 'Website redesign' }).first()).toHaveAttribute('href', '#website-redesign');
    await expect.element(screen.getByRole('link', { name: 'All projects' })).toBeInTheDocument();
  });

  test('loading: main is busy, and each part has one named skeleton', async () => {
    const screen = await render(<Dashboard loading />);
    expect(document.querySelector('main')?.getAttribute('aria-busy')).toBe('true');
    // A skeleton waits a moment before it shows (Loader's delay), so a fast load never flashes.
    const names = () => [...document.querySelectorAll('main [aria-label^="Loading"]')].map((e) => e.getAttribute('aria-label'));
    await expect.poll(names).toEqual(['Loading: This month', 'Loading: Recent projects', 'Loading: Usage', 'Loading: Activity']);
    expect(screen.getByRole('table').elements()).toHaveLength(0);
    expect(regions()).toEqual(['This month', 'Recent projects', 'Usage', 'Activity']);
  });

  test('first run: says what a project is and offers the one button that starts one', async () => {
    const onCreateProject = vi.fn();
    const screen = await render(<Dashboard data={empty} onCreateProject={onCreateProject} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No projects yet' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'New project' }).elements()).toHaveLength(1);
    expect(screen.getByRole('meter').elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'New project' }).click();
    expect(onCreateProject).toHaveBeenCalledTimes(1);
  });

  test('activity: Load more adds the next events and keeps focus, then ends; an app can load its own', async () => {
    const screen = await render(<Dashboard />);
    const items = () => document.querySelectorAll('main ol li').length;
    expect(items()).toBe(4);
    await screen.getByRole('button', { name: 'Load more' }).click();
    await expect.poll(items).toBe(8);
    await screen.getByRole('button', { name: 'Load more' }).click();
    await expect.poll(items).toBe(10);
    await expect.poll(() => active().textContent || '').toContain('reached the end');

    const onLoadMoreActivity = vi.fn(() => Promise.resolve());
    const own = await render(<Dashboard onLoadMoreActivity={onLoadMoreActivity} hasMoreActivity />);
    await own.getByRole('button', { name: 'Load more' }).last().click();
    expect(onLoadMoreActivity).toHaveBeenCalledTimes(1);
  });

  test('at 320 px nothing scrolls the page sideways', async () => {
    await render(<div style={{ width: 320 }}><Dashboard /></div>);
    const main = document.querySelector('main') as HTMLElement;
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
  });

  test('a failed load: "Couldn’t load your dashboard" in its place, said once, and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Dashboard loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { name: 'Couldn’t load your dashboard' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'This month' }).elements()).toHaveLength(0);
    expect(screen.getByRole('heading', { name: 'No projects yet' }).elements()).toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
