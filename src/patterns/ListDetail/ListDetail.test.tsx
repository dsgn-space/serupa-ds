import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { ListDetail } from './ListDetail';
import { SerupaProvider } from '../../internal/provider';

const active = () => document.activeElement as HTMLElement;
const current = () => document.querySelector('[aria-current="true"]')?.id;
const regions = () => [...document.querySelectorAll('main section[aria-labelledby]')]
  .map((s) => document.getElementById(s.getAttribute('aria-labelledby') || '')?.textContent);

// List and detail: two named panes on a wide screen with focus kept in the list; one at a time on a phone, with
// focus on the open message and back on its place in the list.
describe('Patterns/List and detail', () => {
  test('wide: one main and one h1, the skip link first; the list and the open message are named regions; the first opens', async () => {
    await render(<ListDetail />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    expect(regions()).toEqual(['Messages (4)', 'Launch checklist']);
    expect(current()).toBe('message-m1');
    expect(document.querySelector('[role="separator"]')?.getAttribute('aria-label')).toBe('Resize the message list');
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('wide: choosing a message opens it beside the list, marks it and keeps focus on it', async () => {
    const onSelect = vi.fn();
    const screen = await render(<ListDetail onSelect={onSelect} />);
    await screen.getByRole('link', { name: /Invoice for October/ }).click();
    expect(regions()).toEqual(['Messages (4)', 'Invoice for October']);
    expect(current()).toBe('message-m2');
    expect(active().id).toBe('message-m2');
    expect(onSelect).toHaveBeenCalledWith('m2');
  });

  test('phone: the list alone; a message alone with Back first and focus on its heading; Back returns to it, still marked', async () => {
    await page.viewport(390, 800);
    try {
      const screen = await render(<ListDetail />);
      expect(regions()).toEqual(['Messages (4)']);
      expect(current()).toBeUndefined();
      await screen.getByRole('link', { name: /New photos/ }).click();
      expect(regions()).toEqual(['New photos for the home page']);
      await expect.poll(() => active().textContent).toBe('New photos for the home page');
      await screen.getByRole('button', { name: 'Back to messages' }).click();
      expect(regions()).toEqual(['Messages (4)']);
      await expect.poll(() => active().id).toBe('message-m3');
      expect(current()).toBe('message-m3');
      const main = document.querySelector('main') as HTMLElement;
      expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
    } finally {
      await page.viewport(900, 700);
    }
  });

  test('dates read in the reader\'s locale, short in the list and long on the message, and keep the ISO day in dateTime', async () => {
    await render(<SerupaProvider locale="en-GB"><ListDetail /></SerupaProvider>);
    const times = [...document.querySelectorAll('main time')].map((t) => [t.textContent, (t as HTMLTimeElement).dateTime]);
    expect(times[0]).toEqual(['6 Nov 2026', '2026-11-06']);
    expect(times.at(-1)).toEqual(['6 November 2026', '2026-11-06']);
    expect(document.querySelector('main')!.textContent).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('phone, nothing to open: a note instead of an empty pane', async () => {
    await page.viewport(390, 800);
    try {
      await render(<ListDetail messages={[]} />);
      expect(regions()).toEqual(['Messages (0)']);
    } finally {
      await page.viewport(900, 700);
    }
    await render(<ListDetail messages={[]} />);
    expect(document.body.textContent).toMatch(/Choose a message to read it/);
  });
});
