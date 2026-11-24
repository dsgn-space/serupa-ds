import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Booking, bookedStays, nightsBetween, stayProblem, takenIn, type BookingPlace } from './Booking';

const active = () => document.activeElement as HTMLElement;
const day = (d: string) => document.querySelector<HTMLElement>(`button[data-date="${d}"]`)!;
const pick = async (a: string, b: string) => { await userEvent.click(day(a)); await userEvent.click(day(b)); };
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const place: BookingPlace = { name: 'Garden cabin', where: 'Ubud', price: 100, cleaning: 30, maxGuests: 2, minNights: 2, taken: ['2026-11-12', '2026-11-13', '2026-11-14'] };

// Booking: the nights already booked are named in words, dates that take one in are said at once, and Reserve books
// only once the server says so.
describe('Patterns/Booking', () => {
  test('the nights between two days, the booked nights a stay takes in, booked runs as stays, and what\'s wrong with the dates', () => {
    expect(nightsBetween('2026-11-05', '2026-11-09')).toBe(4);
    expect(nightsBetween('2026-10-31', '2026-11-02')).toBe(2);
    expect(takenIn({ start: '2026-11-10', end: '2026-11-13' }, place.taken)).toEqual(['2026-11-12']);
    // The day a stay ends isn't a night of it, so a stay can end on the first booked day.
    expect(takenIn({ start: '2026-11-09', end: '2026-11-12' }, place.taken)).toEqual([]);
    expect(bookedStays(['2026-11-27', '2026-11-12', '2026-11-13', '2026-11-12'])).toEqual([{ start: '2026-11-12', end: '2026-11-14' }, { start: '2026-11-27', end: '2026-11-28' }]);
    expect(stayProblem(null, place, 'en-US')).toBe('Choose the day you arrive and the day you leave.');
    expect(stayProblem({ start: '2026-11-10', end: '2026-11-13' }, place, 'en-US')).toBe('The night of Nov 12, 2026 is already booked. Choose other dates.');
    expect(stayProblem({ start: '2026-11-10', end: '2026-11-16' }, place, 'en-US')).toBe('The nights of Nov 12 – 14, 2026 are already booked. Choose other dates.');
    expect(stayProblem({ start: '2026-11-05', end: '2026-11-06' }, place, 'en-US')).toBe('Stay at least 2 nights.');
    expect(stayProblem({ start: '2026-11-05', end: '2026-11-07' }, place, 'en-US')).toBeNull();
  });

  test('one main and h1 named by the place, the skip link first, the calendar named by its heading, and the booked nights in words', async () => {
    const screen = await render(<Booking place={place} />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Garden cabin']);
    await expect.element(screen.getByRole('group', { name: 'Your dates' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Who’s coming' }).elements()).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Your stay' }).elements()).toHaveLength(1);
    expect(screen.getByRole('list', { name: 'Already booked' }).getByRole('listitem').elements()).toHaveLength(1);
    expect(document.body.textContent).toContain('Choose your dates to see the price.');
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('a day closes only when the night before it is booked too, and days before today are closed', async () => {
    await render(<Booking place={place} today="2026-11-05" />);
    expect(['2026-11-04', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'].map((d) => day(d).getAttribute('aria-disabled'))).toEqual(['true', null, 'true', 'true', null]);
  });

  test('picked dates show the nights and the price in a description list; a stay can end on the first booked day', async () => {
    const screen = await render(<Booking place={place} />);
    await pick('2026-11-09', '2026-11-12');
    const terms = [...document.querySelectorAll('dt')].map((d) => d.textContent);
    expect(terms[0]).toBe('Arrive');
    expect(terms[1]).toBe('Leave');
    expect(terms[2]).toContain('× ');
    expect(terms[2]).toContain('nights');
    expect(terms.slice(3)).toEqual(['Cleaning', 'Total']);
    expect(alertText()).toBe('');
    expect(screen.getByRole('group', { name: 'Your dates' }).element().getAttribute('aria-describedby')).toBeNull();
  });

  test('dates that take in a booked night, or too few nights, are said at once, and the calendar points to it', async () => {
    const screen = await render(<Booking place={place} />);
    await pick('2026-11-10', '2026-11-15');
    await expect.poll(alertText).toContain('are already booked. Choose other dates.');
    expect(screen.getByRole('group', { name: 'Your dates' }).element().getAttribute('aria-describedby')).toBe('stay-problem');
    expect(document.querySelectorAll('dt')).toHaveLength(0);
    await pick('2026-11-06', '2026-11-07');
    await expect.poll(alertText).toBe('Stay at least 2 nights.');
  });

  test('Reserve with no dates says what to choose and puts focus on the calendar', async () => {
    const onReserve = vi.fn();
    const screen = await render(<Booking place={place} onReserve={onReserve} />);
    expect(alertText()).toBe('');
    await screen.getByRole('button', { name: 'Reserve' }).click();
    await expect.poll(alertText).toBe('Choose the day you arrive and the day you leave.');
    expect(active().closest('[role="group"]')?.getAttribute('aria-labelledby')).toBe('dates');
    expect(onReserve).not.toHaveBeenCalled();
  });

  test('Reserve books the stay: the form gives way to a confirmation whose heading takes focus; Book other dates starts again', async () => {
    const onReserve = vi.fn(() => Promise.resolve());
    const screen = await render(<Booking place={place} onReserve={onReserve} />);
    await pick('2026-11-05', '2026-11-09');
    await screen.getByRole('spinbutton', { name: /Guests/ }).fill('1');
    await screen.getByRole('button', { name: 'Reserve' }).click();
    await expect.poll(() => active().textContent).toBe('You’re booked');
    expect(onReserve).toHaveBeenCalledWith({ start: '2026-11-05', end: '2026-11-09', guests: 1 });
    expect(document.body.textContent).toMatch(/for \S+ guest\./);
    await screen.getByRole('button', { name: 'Book other dates' }).click();
    await expect.element(screen.getByRole('group', { name: 'Your dates' })).toBeVisible();
    expect(document.body.textContent).toContain('Choose your dates to see the price.');
  });

  test('a place that sleeps one starts at one guest, and Reserve books one', async () => {
    const onReserve = vi.fn(() => Promise.resolve());
    const screen = await render(<Booking place={{ ...place, maxGuests: 1 }} onReserve={onReserve} />);
    await expect.element(screen.getByRole('spinbutton', { name: /Guests/ })).toHaveValue('1');
    await pick('2026-11-05', '2026-11-09');
    await screen.getByRole('button', { name: 'Reserve' }).click();
    await expect.poll(() => onReserve.mock.calls.length).toBe(1);
    expect(onReserve).toHaveBeenCalledWith({ start: '2026-11-05', end: '2026-11-09', guests: 1 });
  });

  test('a booking that fails says so next to the button and keeps the dates', async () => {
    const screen = await render(<Booking place={place} onReserve={() => Promise.reject(new Error('taken'))} />);
    await pick('2026-11-05', '2026-11-09');
    await screen.getByRole('button', { name: 'Reserve' }).click();
    await expect.poll(alertText).toBe('Couldn’t book these dates. Try again.');
    expect(document.querySelectorAll('dt')).toHaveLength(5);
    // Picking again takes the message away.
    await pick('2026-11-05', '2026-11-08');
    await expect.poll(alertText).toBe('');
  });

  test('while it loads: the h1 and one placeholder named "Loading place"; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Booking place={place} loading />);
    expect(document.querySelector('h1')?.textContent).toBe('Garden cabin');
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading place']);
    await screen.rerender(<Booking place={place} loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the place' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('right to left, the taken list keeps its bullets inside, on the right', async () => {
    await render(<div dir="rtl"><Booking /></div>);
    const list = document.querySelector<HTMLElement>('ul[aria-labelledby="taken"]')!;
    expect(getComputedStyle(list).paddingRight).not.toBe('0px');
    expect(getComputedStyle(list).paddingLeft).toBe('0px');
  });
});
