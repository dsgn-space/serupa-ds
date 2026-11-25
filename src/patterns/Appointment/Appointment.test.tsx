import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Appointment, detailProblems, freeDays, slotWords, timeWords, type AppointmentSlot } from './Appointment';

const active = () => document.activeElement as HTMLElement;
const day = (d: string) => document.querySelector<HTMLElement>(`button[data-date="${d}"]`)!;
const radio = (t: string) => document.querySelector<HTMLInputElement>(`input[type="radio"][value="${t}"]`)!;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const slots: Record<string, AppointmentSlot[]> = {
  '2025-03-04': [{ time: '09:00', free: true }, { time: '09:30', free: false }, { time: '10:00', free: true }],
  '2025-03-06': [{ time: '09:00', free: false }],
};
const page = (over: Partial<React.ComponentProps<typeof Appointment>> = {}) => <Appointment slots={slots} today="2025-03-03" {...over} />;
const fill = async (screen: Awaited<ReturnType<typeof render>>, name: string, email: string) => {
  await screen.getByRole('textbox', { name: /^Name/ }).fill(name);
  await screen.getByRole('textbox', { name: /^Email/ }).fill(email);
};

// Appointment: days without a free time are closed, a taken time is listed and named taken, what's missing is said
// next to its field, and a booking is shown only once the server says so.
describe('Patterns/Appointment', () => {
  test('the days with a free time, a day and time in words, and what\'s wrong with the details', () => {
    expect(freeDays(slots)).toEqual(['2025-03-04']);
    expect(timeWords('14:05', 'en-US')).toBe('2:05 PM');
    expect(slotWords('2025-03-04', '10:30', 'en-US')).toBe('Tuesday, March 4 at 10:30 AM');
    expect(detailProblems({ name: ' ', email: '' })).toEqual({ name: 'Enter your name.', email: 'Enter your email address.' });
    expect(detailProblems({ name: 'Ana', email: 'ana@' })).toEqual({ email: 'Enter an email address like name@example.com.' });
    expect(detailProblems({ name: 'Ana', email: ' ana@example.com ' })).toEqual({});
  });

  test('one main and h1, the skip link first, the calendar named, days with no free time closed, and autofill on the details', async () => {
    const screen = await render(page());
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Book an eye test']);
    expect(['2025-03-04', '2025-03-05', '2025-03-06', '2025-03-02'].map((d) => day(d).getAttribute('aria-disabled'))).toEqual([null, 'true', 'true', 'true']);
    expect(screen.getByRole('textbox', { name: /^Name/ }).element().getAttribute('autocomplete')).toBe('name');
    expect(screen.getByRole('textbox', { name: /^Email/ }).element().getAttribute('autocomplete')).toBe('email');
    expect([...document.querySelectorAll('dt')].map((d) => d.textContent)).toEqual(['What', 'With', 'When', 'Where']);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('picking a day says how many times are free and lists them as radios, a taken one disabled and named taken', async () => {
    const screen = await render(page());
    await userEvent.click(day('2025-03-04'));
    await expect.poll(() => document.getElementById('free-times')?.textContent).toMatch(/times free on/);
    expect([radio('09:00').disabled, radio('09:30').disabled, radio('10:00').disabled]).toEqual([false, true, false]);
    expect(radio('09:30').getAttribute('aria-label')).toMatch(/, taken$/);
    expect(screen.getByRole('group', { name: /^Times on/ }).elements()).toHaveLength(1);
    await userEvent.click(radio('10:00'));
    expect([...document.querySelectorAll('dd')][2]!.textContent).toContain(' at ');
  });

  test('Book with no day, then with no time, says what to choose and moves focus to the calendar, then the times', async () => {
    const onBook = vi.fn();
    const screen = await render(page({ onBook }));
    await screen.getByRole('button', { name: 'Book' }).click();
    await expect.poll(alertText).toBe('Choose a day, then a time.');
    expect(active().getAttribute('data-date')).not.toBeNull();
    await userEvent.click(day('2025-03-04'));
    expect(alertText()).toBe('');
    await screen.getByRole('button', { name: 'Book' }).click();
    await expect.poll(alertText).toBe('Choose a time.');
    expect(active()).toBe(radio('09:00'));
    await userEvent.click(radio('09:00'));
    expect(alertText()).toBe('');
    expect(onBook).not.toHaveBeenCalled();
  });

  test('missing details are said next to their fields, and focus goes to the first', async () => {
    const onBook = vi.fn();
    const screen = await render(page({ onBook }));
    await userEvent.click(day('2025-03-04'));
    await userEvent.click(radio('09:00'));
    await screen.getByRole('button', { name: 'Book' }).click();
    await expect.poll(() => active().id).toBe('appointment-name');
    expect(active().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('textbox', { name: /^Email/ }).element().getAttribute('aria-invalid')).toBe('true');
    await screen.getByRole('textbox', { name: /^Name/ }).fill('Ana Lima');
    await screen.getByRole('button', { name: 'Book' }).click();
    await expect.poll(() => active().id).toBe('appointment-email');
    expect(onBook).not.toHaveBeenCalled();
  });

  test('Book sends the day, time and details; the confirmation takes focus; Book another time starts again', async () => {
    const onBook = vi.fn(() => Promise.resolve());
    const screen = await render(page({ onBook }));
    await userEvent.click(day('2025-03-04'));
    await userEvent.click(radio('10:00'));
    await fill(screen, ' Ana Lima ', 'ana@example.com');
    await screen.getByRole('textbox', { name: /^Anything we should know/ }).fill('Contacts ');
    await screen.getByRole('button', { name: 'Book' }).click();
    await expect.poll(() => active().tagName).toBe('H2');
    expect(active().textContent).toMatch(/^You’re booked for /);
    expect(onBook).toHaveBeenCalledWith({ day: '2025-03-04', time: '10:00', name: 'Ana Lima', email: 'ana@example.com', note: 'Contacts' });
    expect(document.body.textContent).toContain('ana@example.com');
    await screen.getByRole('button', { name: 'Book another time' }).click();
    await expect.element(screen.getByRole('button', { name: 'Book' })).toBeVisible();
    expect(document.getElementById('free-times')).toBeNull();
  });

  test('a booking that fails says so next to the button and keeps everything; editing takes the message away', async () => {
    const screen = await render(page({ onBook: () => Promise.reject(new Error('taken')) }));
    await userEvent.click(day('2025-03-04'));
    await userEvent.click(radio('10:00'));
    await fill(screen, 'Ana', 'ana@example.com');
    await screen.getByRole('button', { name: 'Book' }).click();
    await expect.poll(alertText).toBe('Couldn’t book this time. Try again, or choose another.');
    expect(radio('10:00').checked).toBe(true);
    await screen.getByRole('textbox', { name: /^Name/ }).fill('Ana Lima');
    await expect.poll(alertText).toBe('');
  });

  test('while it loads: the h1 and one placeholder named "Loading times"; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(page({ loading: true }));
    expect(document.querySelector('h1')?.textContent).toBe('Book an eye test');
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading times']);
    await screen.rerender(page({ loadFailed: true, onRetry }));
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the times' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('no free times at all: it says so, in place of a month of struck-through days and a form', async () => {
    const screen = await render(<Appointment slots={{}} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No free times' })).toBeVisible();
    expect(document.querySelector('main [role="grid"], main form')).toBeNull();
  });

  test('free times only before today are none: it says so too, and the calendar opens on a day that can be booked', async () => {
    const screen = await render(<Appointment today="2025-03-10" slots={{ '2025-03-04': [{ time: '10:00', free: true }] }} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No free times' })).toBeVisible();
    expect(document.querySelector('main [role="grid"], main form')).toBeNull();
  });
});
