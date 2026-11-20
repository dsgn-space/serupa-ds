import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { StoreLocator, distanceKm, matchStores, openState, type Store } from './StoreLocator';

const active = () => document.activeElement as HTMLElement;
const names = () => [...document.querySelectorAll('main li h2')].map((h) => h.textContent);
const days = (h: [string, string] | null, sunday: [string, string] | null = h) => [sunday, h, h, h, h, h, h];
const stores: Store[] = [
  { id: 'a', name: 'Kemang', address: 'Jl. Kemang 8', area: 'South Jakarta 12730', lat: -6.2607, lng: 106.8137, hours: days(['10:00', '21:00']), phone: '+62 21 1' },
  { id: 'b', name: 'Sudirman', address: 'Jl. Sudirman 21', area: 'Central Jakarta 10220', lat: -6.2088, lng: 106.8227, hours: days(['08:00', '20:00'], null), phone: '+62 21 2' },
  { id: 'c', name: 'Bandung', address: 'Jl. Braga 40', area: 'Bandung 40111', lat: -6.9175, lng: 107.6191, hours: days(['09:00', '21:00']), phone: '+62 22 3' },
];
const wed = (h: number, m = 0) => new Date(2026, 1, 11, h, m);

// Store locator: shops as a list named by their headings, open or closed in words with when that changes, the count
// in a status line, sorting by where you are, and saying so when the browser won't share it.
describe('Patterns/Store locator', () => {
  test('distance, open or closed with when it changes, and matching by name or area', () => {
    expect(Math.round(distanceKm(stores[1]!, stores[2]!))).toBe(118);
    expect(openState(stores[0]!, wed(12))).toEqual({ open: true, words: 'closes 21:00' });
    expect(openState(stores[0]!, wed(8))).toEqual({ open: false, words: 'opens 10:00' });
    expect(openState(stores[0]!, wed(22))).toEqual({ open: false, words: 'opens tomorrow 10:00' });
    expect(openState(stores[1]!, new Date(2026, 1, 14, 21))).toEqual({ open: false, words: 'opens Monday 08:00' });
    expect(openState({ ...stores[0]!, hours: days(null) }, wed(12))).toEqual({ open: false, words: 'closed for now' });
    expect(matchStores(stores, 'central 10220').map((s) => s.id)).toEqual(['b']);
    expect(matchStores(stores, ' ').length).toBe(3);
  });

  test('one main and h1, the skip link first, a search landmark, and each shop a list item named by its heading', async () => {
    const screen = await render(<StoreLocator now={wed(20, 30)} />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Find a shop']);
    expect(screen.getByRole('search', { name: 'Shops' }).elements()).toHaveLength(1);
    expect(screen.getByRole('listitem', { name: 'Acme Sudirman' }).element().textContent).toContain('Closed nowopens tomorrow 08:00');
    expect(screen.getByRole('link', { name: 'Directions: Acme Kemang' }).elements()).toHaveLength(1);
  });

  test('opening hours fold under a heading button (the system disclosure); today is bold at the list\u2019s own size', async () => {
    const screen = await render(<StoreLocator now={wed(20, 30)} />);
    const shop = screen.getByRole('listitem', { name: 'Acme Kemang' });
    const toggle = shop.getByRole('button', { name: 'Opening hours' });
    expect([toggle.element().closest('h3') !== null, toggle.element().getAttribute('aria-expanded')]).toEqual([true, 'false']);
    await toggle.click();
    await expect.poll(() => toggle.element().getAttribute('aria-expanded')).toBe('true');
    const term = (day: string) => [...shop.element().querySelectorAll('dt')].find((t) => t.textContent === day)!;
    const style = (day: string) => [getComputedStyle(term(day)).fontSize, getComputedStyle(term(day)).fontWeight];
    expect([style('Wednesday')[0], Number(style('Wednesday')[1]) > Number(style('Tuesday')[1])]).toEqual([style('Tuesday')[0], true]);
  });

  test('searching and "Open now only" narrow the list and say how many', async () => {
    const screen = await render(<StoreLocator stores={stores} now={wed(20, 30)} />);
    await screen.getByRole('searchbox').fill('jakarta');
    await expect.poll(names).toEqual(['Kemang', 'Sudirman']);
    expect(document.getElementById('store-count')?.getAttribute('role')).toBe('status');
    await screen.getByRole('switch', { name: 'Open now only' }).click();
    await expect.poll(names).toEqual(['Kemang']);
    await screen.getByRole('searchbox').fill('bogor');
    await expect.poll(() => document.body.textContent).toContain('None that match are open now.');
    await screen.getByRole('switch', { name: 'Open now only' }).click();
    await expect.poll(() => document.body.textContent).toContain('Try a town or a postcode');
    await screen.getByRole('searchbox').click();
    await userEvent.keyboard('{Escape}');
    await expect.poll(names).toEqual(['Kemang', 'Sudirman', 'Bandung']);
  });

  test('by default, "Use my location" asks the browser', async () => {
    const ask = vi.spyOn(navigator.geolocation, 'getCurrentPosition').mockImplementation((ok) => ok({ coords: { latitude: -6.2, longitude: 106.82 } } as GeolocationPosition));
    const screen = await render(<StoreLocator stores={stores} now={wed(12)} />);
    await screen.getByRole('button', { name: 'Use my location' }).click();
    await expect.poll(names).toEqual(['Sudirman', 'Kemang', 'Bandung']);
    expect(ask).toHaveBeenCalledOnce();
    ask.mockRestore();
  });

  test('"Use my location" sorts nearest first with distances; when it can\'t, it says so', async () => {
    const locate = vi.fn().mockRejectedValueOnce(new Error('denied')).mockResolvedValueOnce({ lat: -6.92, lng: 107.6 });
    const screen = await render(<StoreLocator stores={stores} now={wed(12)} locate={locate} />);
    await screen.getByRole('button', { name: 'Use my location' }).click();
    await expect.poll(() => document.body.textContent).toContain('Couldn’t get your location.');
    await screen.getByRole('button', { name: 'Use my location' }).click();
    await expect.poll(names).toEqual(['Bandung', 'Kemang', 'Sudirman']);
    expect(document.getElementById('store-count')?.textContent).toMatch(/nearest first$/);
    expect(document.body.textContent).toMatch(/km away/);
    expect(document.body.textContent).not.toContain('Couldn’t get your location.');
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<StoreLocator loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading stores']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<StoreLocator loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the stores' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
