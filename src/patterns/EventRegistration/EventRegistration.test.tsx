import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { EventRegistration, icsFor, placesWords, registrationProblems, type EventDetails, type Registration } from './EventRegistration';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const event: EventDetails = {
  title: 'Design systems meetup', start: '2026-03-12T18:30:00+07:00', end: '2026-03-12T21:00:00+07:00', timeZone: 'Asia/Jakarta', zone: 'Jakarta time (UTC+7)',
  place: 'Acme office, Jl. Sudirman 21, Jakarta', capacity: 60, taken: 47,
  tickets: [{ value: 'general', label: 'General', price: 12, who: 'Talks and dinner' }, { value: 'student', label: 'Student', price: 5, who: 'With a student card' }],
};
const good: Registration = { ticket: 'general', count: 2, name: 'Ana Lima', email: 'ana@example.com', needs: '', waitlist: false };

// Event registration: when (in the event's own time zone) and where, places left in words, tickets with a total,
// a summary of what's missing that takes focus, an answer with a calendar file, and a waiting list once it's full.
describe('Patterns/Event registration', () => {
  test('places left in words, what\'s wrong with a registration, and the calendar file', () => {
    expect([placesWords(13, 'en-US'), placesWords(1, 'en-US'), placesWords(0, 'en-US')]).toEqual(['13 places left', '1 place left', 'Full']);
    expect(registrationProblems(good, 13)).toEqual({});
    expect(Object.keys(registrationProblems({ ...good, ticket: '', count: 0, name: '', email: '' }, 13))).toEqual(['ticket', 'count', 'name', 'email']);
    expect(registrationProblems({ ...good, count: 3 }, 2).count).toBe('Choose from 1 to 2 tickets.');
    expect(registrationProblems({ ...good, count: 5 }, 13).count).toBe('Choose from 1 to 4 tickets.');
    expect(registrationProblems({ ...good, email: 'ana' }, 13).email).toBe('Enter an email address like name@example.com.');
    expect(registrationProblems({ ...good, ticket: '', count: 0, waitlist: true }, 0)).toEqual({});
    const ics = icsFor({ ...event, place: 'Room 1; Floor 5, Jakarta' });
    expect(ics).toContain('DTSTART:20260312T113000Z\r\nDTEND:20260312T140000Z');
    expect(ics).toContain('LOCATION:Room 1\\; Floor 5\\, Jakarta');
  });

  test('one main and h1, the skip link first, the time in the event\'s own zone, and places as a meter with words', async () => {
    await render(<EventRegistration event={event} />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Design systems meetup']);
    expect(document.querySelector('time')?.getAttribute('dateTime')).toBe('2026-03-12T18:30:00+07:00');
    expect(document.body.textContent).toContain('Jakarta time (UTC+7)');
    const meter = document.querySelector('[role="meter"]')!;
    expect(meter.getAttribute('aria-valuetext')).toMatch(/places left$/);
  });

  test('the total follows the ticket and how many; Register with problems: a summary takes focus and its links reach each field', async () => {
    const onRegister = vi.fn();
    const screen = await render(<EventRegistration event={event} onRegister={onRegister} />);
    await screen.getByRole('button', { name: 'Register' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    expect(screen.getByRole('link', { name: /^Enter|^Choose/ }).elements().map((e) => e.getAttribute('href'))).toEqual(['#event-ticket', '#event-name', '#event-email']);
    await screen.getByRole('link', { name: 'Choose a ticket.' }).click();
    await expect.poll(() => active().getAttribute('type')).toBe('radio');
    const total = () => document.getElementById('event-total')?.textContent;
    expect(total()).toBe('Choose a ticket to see your total.');   // never an empty line, as in Donation
    await screen.getByRole('radio', { name: /^Student/ }).click();
    await expect.poll(total).toMatch(/^Total: /);
    const one = total();
    await screen.getByRole('spinbutton', { name: /^How many tickets/ }).click();
    await userEvent.keyboard('{ArrowUp}');
    await expect.poll(() => document.getElementById('event-count')?.getAttribute('aria-valuenow')).toBe('2');
    await expect.poll(total).not.toBe(one);
    expect(onRegister).not.toHaveBeenCalled();
  });

  test('Register sends the registration, and the answer\'s heading takes focus with the total and a calendar file', async () => {
    const onRegister = vi.fn(() => Promise.resolve());
    const screen = await render(<EventRegistration event={event} onRegister={onRegister} />);
    await screen.getByRole('radio', { name: /^General/ }).click();
    await screen.getByRole('textbox', { name: /^Your name/ }).fill(' Ana Lima ');
    await screen.getByRole('textbox', { name: /^Email/ }).fill('ana@example.com');
    await screen.getByRole('textbox', { name: /^Anything that would make/ }).fill('A seat near the front, please.');
    await screen.getByRole('button', { name: 'Register' }).click();
    await expect.poll(() => active().textContent).toBe('You’re going');
    expect(onRegister).toHaveBeenCalledWith({ ticket: 'general', count: 1, name: 'Ana Lima', email: 'ana@example.com', needs: 'A seat near the front, please.', waitlist: false });
    expect(screen.getByRole('link', { name: 'Add to your calendar' }).element().getAttribute('href')).toMatch(/^data:text\/calendar/);
  });

  test('full: the waiting list, with no tickets to choose; a send that fails says so and keeps the fields', async () => {
    const onRegister = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<EventRegistration event={{ ...event, taken: 60 }} onRegister={onRegister} />);
    expect(document.querySelector('[role="meter"]')?.getAttribute('aria-valuetext')).toBe('Full');
    expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(0);
    await screen.getByRole('textbox', { name: /^Your name/ }).fill('Ana');
    await screen.getByRole('textbox', { name: /^Email/ }).fill('ana@example.com');
    await screen.getByRole('button', { name: 'Join the waiting list' }).click();
    await expect.poll(alertText).toContain('Couldn’t register you.');
    expect((document.getElementById('event-name') as HTMLInputElement).value).toBe('Ana');
    await screen.getByRole('button', { name: 'Join the waiting list' }).click();
    await expect.poll(() => active().textContent).toBe('You’re on the waiting list');
    expect(onRegister).toHaveBeenLastCalledWith({ ticket: '', count: 0, name: 'Ana', email: 'ana@example.com', needs: '', waitlist: true });
  });
});
