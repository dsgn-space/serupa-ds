import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import type { CalendarEvent } from '../../components/EventCalendar/EventCalendar';
import { TeamCalendar, dayOf, draftProblems, eventFrom, timeOf, whenWords } from './TeamCalendar';

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const cell = (d: string) => document.querySelector<HTMLElement>(`td[data-date="${d}"]`)!;
const eventIn = (d: string, id: string) => cell(d)?.querySelector<HTMLElement>(`[data-event-id="${id}"]`) ?? null;
const MARCH = new Date(2025, 2, 1);
const events = (): CalendarEvent[] => [
  { id: 'review', title: 'Design review', start: '2025-03-04T14:00', end: '2025-03-04T15:00' },
  { id: 'launch', title: 'Launch day', start: '2025-03-12', allDay: true },
];
const good = { title: 'Retro', day: '2025-03-06', allDay: false, start: '10:00', end: '11:00' };

// Team calendar: events are added from a form that says what's missing, moves are saved after and put back when
// they can't be, and an event's own dialog says when it is and deletes it with Undo.
describe('Patterns/Team calendar', () => {
  test('a day and a time in the form\'s words, the form\'s problems, the event it makes, and when an event is in words', () => {
    expect([dayOf(new Date(2025, 2, 4, 9, 5)), timeOf(new Date(2025, 2, 4, 9, 5))]).toEqual(['2025-03-04', '09:05']);
    expect(draftProblems(good)).toEqual({});
    expect(draftProblems({ ...good, title: '  ', day: '' })).toEqual({ title: 'Enter a title for the event.', day: 'Choose a day.' });
    expect(draftProblems({ ...good, end: '09:00' })).toEqual({ end: 'Choose an end after the start.' });
    expect(draftProblems({ ...good, start: '', end: '' })).toEqual({ start: 'Choose when it starts.', end: 'Choose when it ends.' });
    expect(draftProblems({ ...good, allDay: true, start: '', end: '' })).toEqual({});
    expect(eventFrom({ ...good, title: ' Retro ' }, 'x')).toEqual({ id: 'x', title: 'Retro', start: '2025-03-06T10:00', end: '2025-03-06T11:00' });
    expect(eventFrom({ ...good, allDay: true }, 'y')).toEqual({ id: 'y', title: 'Retro', start: '2025-03-06', allDay: true });
    expect(whenWords({ start: '2025-03-04T14:00', end: '2025-03-04T15:00' }, 'en-US')).toMatch(/^Tuesday, March 4, 2025, 2:00\sPM to 3:00\sPM$/);
    expect(whenWords({ start: '2025-03-12' }, 'en-US')).toBe('Wednesday, March 12, 2025, all day');
    expect(whenWords({ start: '2025-03-18', end: '2025-03-20', allDay: true }, 'en-US')).toBe('Tuesday, March 18, 2025 to Thursday, March 20, 2025, all day');
    expect(whenWords({ start: '2025-03-04T22:00', end: '2025-03-05T01:00' }, 'en-US')).toMatch(/^Tuesday, March 4, 2025, 10:00\sPM to Wednesday, March 5, 2025, 1:00\sAM$/);
    expect(whenWords({ start: '2025-03-12' }, 'not a locale!')).toBe('Wednesday, March 12, 2025, all day');
  });

  test('one main and h1 named by the calendar, the skip link first, and the month as its h2', async () => {
    const screen = await render(<TeamCalendar title="Design team" events={events()} defaultMonth={MARCH} />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Design team']);
    expect(screen.getByRole('heading', { level: 2 }).elements()).toHaveLength(1);
    await expect.element(screen.getByRole('grid')).toBeVisible();
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('New event with nothing typed says what\'s missing next to the field and focuses it; an end before the start is said too', async () => {
    const onAdd = vi.fn();
    const screen = await render(<TeamCalendar events={events()} defaultMonth={MARCH} onAdd={onAdd} />);
    await screen.getByRole('button', { name: 'New event' }).click();
    const dialog = screen.getByRole('dialog', { name: 'New event' });
    await dialog.getByRole('button', { name: 'Add event' }).click();
    // Field also says it through the live region a moment later, so the text can be there twice.
    await expect.element(dialog.getByText('Enter a title for the event.').first()).toBeVisible();
    expect(active().id).toBe('event-title');
    expect(onAdd).not.toHaveBeenCalled();
    await userEvent.type(active(), 'Retro');
    await expect.poll(() => active().getAttribute('aria-invalid')).not.toBe('true');
    await userEvent.fill(dialog.getByRole('combobox', { name: /Ends/ }), '08:00');
    await userEvent.keyboard('{Tab}');
    await dialog.getByRole('button', { name: 'Add event' }).click();
    await expect.element(dialog.getByText('Choose an end after the start.').first()).toBeVisible();
    expect(active().id).toBe('event-end');
    // All day has no times to get wrong.
    await dialog.getByRole('switch', { name: 'All day' }).click();
    expect(dialog.getByRole('combobox', { name: /Ends/ }).elements()).toHaveLength(0);
  });

  test('choosing an empty day opens the form on that day, all day; adding saves it, says so, and it shows on the day', async () => {
    const onAdd = vi.fn(() => Promise.resolve('new-id'));
    const screen = await render(<TeamCalendar events={events()} defaultMonth={MARCH} onAdd={onAdd} />);
    await userEvent.click(cell('2025-03-20'));
    const dialog = screen.getByRole('dialog', { name: 'New event' });
    await expect.element(dialog).toBeVisible();
    expect((dialog.getByRole('switch', { name: 'All day' }).element() as HTMLInputElement).checked).toBe(true);
    await userEvent.fill(dialog.getByRole('textbox', { name: /Title/ }), 'Board meeting');
    await dialog.getByRole('button', { name: 'Add event' }).click();
    await expect.poll(() => eventIn('2025-03-20', 'new-id')).not.toBeNull();
    expect(onAdd).toHaveBeenCalledWith({ title: 'Board meeting', day: '2025-03-20', allDay: true, start: '09:00', end: '10:00' });
    await expect.poll(() => toasted('Added “Board meeting”')).toBe(true);
    expect(screen.getByRole('dialog', { name: 'New event' }).elements().filter((d) => (d as HTMLDialogElement).open)).toHaveLength(0);
  });

  test('a timed event from New event, with an id made here when onAdd gives none, and focus back on New event', async () => {
    const screen = await render(<TeamCalendar events={events()} defaultMonth={MARCH} />);
    const opener = screen.getByRole('button', { name: 'New event' });
    await opener.click();
    const dialog = screen.getByRole('dialog', { name: 'New event' });
    await userEvent.fill(dialog.getByRole('textbox', { name: /Title/ }), 'Kickoff');
    await dialog.getByRole('button', { name: 'Add event' }).click();
    await expect.poll(() => eventIn('2025-03-01', 'new-1')).not.toBeNull();
    await expect.poll(() => active()).toBe(opener.element());
  });

  test('an add that fails says so in the dialog, which stays open with what was typed', async () => {
    const screen = await render(<TeamCalendar events={events()} defaultMonth={MARCH} onAdd={() => Promise.reject(new Error('offline'))} />);
    await screen.getByRole('button', { name: 'New event' }).click();
    const dialog = screen.getByRole('dialog', { name: 'New event' });
    await userEvent.fill(dialog.getByRole('textbox', { name: /Title/ }), 'Retro');
    await dialog.getByRole('button', { name: 'Add event' }).click();
    await expect.element(dialog.getByRole('alert').filter({ hasText: 'Couldn’t add the event. Try again.' })).toBeVisible();
    expect((dialog.getByRole('textbox', { name: /Title/ }).element() as HTMLInputElement).value).toBe('Retro');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });

  test('a move shows at once and is sent; one that can\'t be saved goes back and says which event and when', async () => {
    const onMove = vi.fn(() => Promise.reject(new Error('offline')));
    await render(<TeamCalendar events={events()} defaultMonth={MARCH} onMove={onMove} />);
    eventIn('2025-03-04', 'review')!.focus();
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await expect.poll(() => onMove.mock.calls.length).toBe(1);
    await expect.poll(() => toasted('Couldn’t move “Design review”')).toBe(true);
    await expect.poll(() => eventIn('2025-03-04', 'review')).not.toBeNull();
    expect(eventIn('2025-03-05', 'review')).toBeNull();
  });

  test('a move that saves stays, all day ones too', async () => {
    const onMove = vi.fn(() => Promise.resolve());
    await render(<TeamCalendar events={events()} defaultMonth={MARCH} onMove={onMove} />);
    eventIn('2025-03-12', 'launch')!.focus();
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await expect.poll(() => eventIn('2025-03-13', 'launch')).not.toBeNull();
    expect(onMove).toHaveBeenCalledTimes(1);
  });

  test('an event\'s dialog says when it is; Delete removes it at once with Undo, and Undo brings it back', async () => {
    const onDelete = vi.fn();
    const screen = await render(<TeamCalendar events={events()} defaultMonth={MARCH} onDelete={onDelete} />);
    await userEvent.click(eventIn('2025-03-04', 'review')!);
    const dialog = screen.getByRole('dialog', { name: 'Design review' });
    await expect.element(dialog).toBeVisible();
    expect(dialog.element().textContent).toMatch(/, .+ to /);
    await dialog.getByRole('button', { name: 'Delete event' }).click();
    await expect.poll(() => eventIn('2025-03-04', 'review')).toBeNull();
    await expect.poll(() => toasted('Deleted “Design review”')).toBe(true);
    await expect.poll(() => !!active().closest('[data-component="event-calendar"], table, [role="grid"]')).toBe(true);
    await screen.getByRole('button', { name: 'Undo' }).click();
    await expect.poll(() => eventIn('2025-03-04', 'review')).not.toBeNull();
    expect(onDelete).not.toHaveBeenCalled();
  });

  test('the day and start typed into the form are what\'s sent; Escape closes it with nothing added', async () => {
    const onAdd = vi.fn(() => Promise.resolve('typed'));
    const screen = await render(<TeamCalendar events={events()} defaultMonth={MARCH} onAdd={onAdd} />);
    await screen.getByRole('button', { name: 'New event' }).click();
    let dialog = screen.getByRole('dialog', { name: 'New event' });
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelectorAll('dialog[open]').length).toBe(0);
    expect(onAdd).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'New event' }).click();
    dialog = screen.getByRole('dialog', { name: 'New event' });
    await userEvent.fill(dialog.getByRole('textbox', { name: /Title/ }), 'Planning');
    const day = document.getElementById('event-day') as HTMLInputElement;
    await userEvent.clear(day);
    await userEvent.type(day, '2025-03-21');
    await userEvent.fill(dialog.getByRole('combobox', { name: /Starts/ }), '08:30');
    await userEvent.keyboard('{Tab}');
    await dialog.getByRole('button', { name: 'Add event' }).click();
    await expect.poll(() => onAdd.mock.calls.length).toBe(1);
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ title: 'Planning', day: '2025-03-21', start: '08:30', end: '10:00' }));
    await expect.poll(() => eventIn('2025-03-21', 'typed')).not.toBeNull();
  });

  test('a deleted event is sent to onDelete once its toast closes without Undo', async () => {
    const onDelete = vi.fn();
    const screen = await render(<TeamCalendar events={events()} defaultMonth={MARCH} onDelete={onDelete} />);
    await userEvent.click(eventIn('2025-03-12', 'launch')!);
    await screen.getByRole('dialog', { name: 'Launch day' }).getByRole('button', { name: 'Delete event' }).click();
    await expect.poll(() => toasted('Deleted “Launch day”')).toBe(true);
    const toastItem = [...document.querySelectorAll('li')].find((e) => e.textContent?.includes('Deleted “Launch day”') && e.querySelector('button[aria-label="Dismiss"]'))!;
    await userEvent.click(toastItem.querySelector<HTMLElement>('button[aria-label="Dismiss"]')!);
    await expect.poll(() => onDelete.mock.calls.length).toBe(1);
    expect((onDelete.mock.calls[0] as unknown[])[0]).toMatchObject({ id: 'launch' });
  });

  test('closing an event\'s dialog leaves the event as it was', async () => {
    const screen = await render(<TeamCalendar events={events()} defaultMonth={MARCH} />);
    await userEvent.click(eventIn('2025-03-12', 'launch')!);
    const dialog = screen.getByRole('dialog', { name: 'Launch day' });
    expect(dialog.element().textContent).toContain('all day');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelectorAll('dialog[open]').length).toBe(0);
    expect(eventIn('2025-03-12', 'launch')).not.toBeNull();
  });

  test('while it loads: one placeholder named "Loading events" and New event waits; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<TeamCalendar loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading events']);
    expect((screen.getByRole('button', { name: 'New event' }).element() as HTMLButtonElement).disabled || screen.getByRole('button', { name: 'New event' }).element().getAttribute('aria-disabled') === 'true').toBe(true);
    await screen.rerender(<TeamCalendar loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the events' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the events that arrive once loading ends are the ones on the calendar', async () => {
    const screen = await render(<TeamCalendar loading events={[]} defaultMonth={MARCH} />);
    await screen.rerender(<TeamCalendar events={events()} defaultMonth={MARCH} />);
    await expect.poll(() => document.querySelectorAll('[data-event-id]').length).toBeGreaterThan(0);
  });
});
