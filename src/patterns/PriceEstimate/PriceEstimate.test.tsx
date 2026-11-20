import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { PriceEstimate, estimate } from './PriceEstimate';
import { SerupaProvider } from '../../internal/provider';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/٫/g, '.').replace(/٬/g, ',');
const total = () => norm(document.getElementById('estimate-total')!.textContent);
const rows = () => [...document.querySelectorAll('tbody th')].map((h) => norm(h.textContent));
const plan = { id: 'p', name: 'Team', perSeat: 10, about: '', minSeats: 3, maxSeats: 50 };

// Price estimate: plans and extras as named groups with their prices, the people's range said, the estimate a table
// with the total in its foot, and the total said with how it's billed.
describe('Patterns/Price estimate', () => {
  test('an estimate, line by line', () => {
    const extra = { id: 'x', name: 'X', price: 2, perSeat: true, about: '' };
    const flat = { id: 'y', name: 'Y', price: 20, perSeat: false, about: '' };
    expect(estimate(plan, 5, [extra, flat], false, 0.2)).toMatchObject({ seats: 5, subtotal: 80, off: 0, monthly: 80, yearlyTotal: 0 });
    expect(estimate(plan, 5, [], true, 0.2)).toMatchObject({ subtotal: 50, off: 10, monthly: 40, yearlyTotal: 480 });
    expect(estimate(plan, 1, [], false, 0.2).seats).toBe(3);
    expect(estimate(plan, 99, [], false, 0.2).seats).toBe(50);
    expect(estimate(plan, Number.NaN, [], false, 0.2).seats).toBe(3);
    expect(estimate({ ...plan, minSeats: 1 }, 1, [], false, 0).lines[0]!.name).toBe('Team, 1 person');
  });

  test('one main and h1, the skip link first, plans and extras as named groups, and the people\'s range said', async () => {
    const screen = await render(<PriceEstimate />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'What would it cost?']);
    expect(screen.getByRole('group', { name: /^Plan/ }).element().querySelectorAll('input[type="radio"]')).toHaveLength(3);
    expect(screen.getByRole('group', { name: /^Extras/ }).element().querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
    expect(norm(document.body.textContent)).toContain('Team is for 3 to 250 people.');
    expect(rows()).toEqual(['Team, 12 people', expect.stringMatching(/^Paying yearly, 20/)]);
    expect(total()).toMatch(/134[.,]40.* a month, billed as .*1[.,]?612[.,]80.* once a year\. You save .*403[.,]20.* a year\./);
  });

  test('the estimate follows each choice, and Start trial carries them', async () => {
    const screen = await render(<PriceEstimate />);
    await screen.getByRole('switch', { name: /^Pay yearly/ }).click();
    expect(total()).toMatch(/168.* a month, billed monthly\./);
    expect(rows()).toEqual(['Team, 12 people']);
    await screen.getByRole('checkbox', { name: /^Priority support/ }).click();
    await screen.getByRole('checkbox', { name: /^Extra storage/ }).click();
    expect(rows()).toEqual(['Team, 12 people', 'Extra storage', 'Priority support']);
    expect(total()).toMatch(/224.* a month/);
    await screen.getByRole('radio', { name: /^Business/ }).click();
    expect(rows()[0]).toBe('Business, 12 people');
    await screen.getByRole('spinbutton', { name: /^How many people/ }).fill('40');
    await userEvent.tab();
    await expect.poll(() => rows()[0]).toBe('Business, 40 people');
    const href = screen.getByRole('link', { name: 'Start a 14-day trial' }).element().getAttribute('href')!;
    expect(new URLSearchParams(href.split('?')[1]).toString()).toBe('plan=business&seats=40&billing=monthly&extras=storage%2Csupport');
  });

  test('counts follow the locale’s digits', async () => {
    const team = { id: 't', name: 'Team', perSeat: 10, minSeats: 1, maxSeats: 50, about: '' };
    expect(estimate(team, 12, [], false, 0, 'ar-EG').lines[0]!.name).toBe('Team, ١٢ people');
    await render(<SerupaProvider locale="ar-EG"><PriceEstimate /></SerupaProvider>);
    expect(document.body.textContent).toMatch(/Team, [٠-٩]+ people/);
  });
});

describe('PriceEstimate: two on one page', () => {
  test('each keeps its own plan chosen: their radios are not one group (a docs page shows several)', async () => {
    await render(<><PriceEstimate /><PriceEstimate /></>);
    const checked = () => [...document.querySelectorAll<HTMLInputElement>('input[type="radio"]')].filter((r) => r.checked).map((r) => r.value);
    await expect.poll(checked).toEqual(['team', 'team']);
  });
});
