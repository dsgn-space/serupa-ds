import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SerupaProvider } from '../../internal/provider';
import { Timesheet, weekProblems, weekTotals } from './Timesheet';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const cell = (id: string, i: number) => document.getElementById(`ts-${id}-${i}`) as HTMLInputElement;
const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const total = () => document.getElementById('ts-total')!.textContent;

// Timesheet: a table with project row headers and day column headers, each field named by both, totals as you type,
// adding and removing projects with focus kept, a summary of what's wrong that takes focus, and an answer.
describe('Patterns/Timesheet', () => {
  test('totals, and what\'s wrong with a week', () => {
    expect(weekTotals({ a: [1, 2, null, null, null, null, null], b: [3, null, null, null, null, null, 1] })).toEqual({ days: [4, 2, 0, 0, 0, 0, 1], week: 7 });
    expect(weekProblems({}, names)).toEqual({ empty: 'Enter your hours for at least one day.' });
    expect(weekProblems({ a: Array<number | null>(7).fill(null) }, names)).toEqual({ empty: 'Enter your hours for at least one day.' });
    expect(weekProblems({ a: [20, 8, null, null, null, null, null], b: [5, null, null, null, null, null, null] }, names)).toEqual({ 'day-0': 'Check Mon: its hours add up to more than 24.' });
  });

  test('one main and h1, the skip link first, and each field named by its project and day', async () => {
    const screen = await render(<Timesheet />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    expect(screen.getByRole('rowheader', { name: 'Website redesign' }).elements()).toHaveLength(1);
    expect(screen.getByRole('spinbutton', { name: /^Website redesign, / }).elements()).toHaveLength(7);
    expect(cell('web', 0).getAttribute('aria-label')).toMatch(/^Website redesign, \S.*(9|٩)/);
    expect(total()).toMatch(/^(16|١٦) hours this week, (24|٢٤) hours under/);
  });

  test('the totals follow each hour, and the week\'s total is said', async () => {
    await render(<Timesheet />);
    await userEvent.fill(cell('web', 2), '8');
    await userEvent.tab();
    await expect.poll(total).toMatch(/^(24|٢٤) hours this week/);
    await expect.poll(() => document.body.textContent).toMatch(/Week total (24|٢٤) hours/);
  });

  test('the week is one range in the locale\'s words, its shared month and year said once: "9.–15. Februar 2026", not "9. Februar to 15. Februar 2026"', async () => {
    await render(<SerupaProvider locale="de"><Timesheet weekStart="2026-02-09" /></SerupaProvider>);
    const range = new Intl.DateTimeFormat('de', { dateStyle: 'long', timeZone: 'UTC' }).formatRange(new Date(Date.UTC(2026, 1, 9)), new Date(Date.UTC(2026, 1, 15))).replace(/[\u2009\u202f]/g, ' ');
    expect(document.querySelector('h1')?.textContent).toBe(`Week of ${range}`);
  });

  test('adding a project moves focus to its first day; removing one moves it to the next Remove, or to Add', async () => {
    const screen = await render(<Timesheet />);
    await screen.getByRole('combobox', { name: /^Add a project/ }).selectOptions('support');
    await screen.getByRole('button', { name: 'Add', exact: true }).click();
    await expect.poll(() => active().id).toBe('ts-support-0');
    await screen.getByRole('button', { name: 'Remove: Website redesign' }).click();
    await expect.poll(() => active().id).toBe('ts-remove-admin');
    await screen.getByRole('button', { name: 'Remove: Customer support' }).click();
    await expect.poll(() => active().id).toBe('ts-add');
  });

  test('Copy last week fills in last week\'s hours', async () => {
    const screen = await render(<Timesheet />);
    await screen.getByRole('button', { name: 'Copy last week' }).click();
    await expect.poll(total).toMatch(/^(40|٤٠) hours this week\.$/);
    expect(screen.getByRole('rowheader', { name: 'Mobile app' }).elements()).toHaveLength(1);
  });

  test('Send with problems: a summary takes focus and links to the day', async () => {
    const onSend = vi.fn();
    const screen = await render(<Timesheet defaultHours={{ web: [20, null, null, null, null, null, null], admin: [6, null, null, null, null, null, null] }} onSend={onSend} />);
    await screen.getByRole('button', { name: 'Send for approval' }).click();
    await expect.poll(() => active().textContent).toMatch(/its hours add up to more than 24/);
    await screen.getByRole('link', { name: /^Check / }).click();
    await expect.poll(() => active().id).toBe('ts-web-0');
    expect(cell('web', 0).getAttribute('aria-invalid')).toBe('true');
    expect(onSend).not.toHaveBeenCalled();
  });

  test('an empty week links to Add when there are no projects', async () => {
    const screen = await render(<Timesheet defaultHours={{}} />);
    await screen.getByRole('button', { name: 'Send for approval' }).click();
    await expect.poll(() => active().textContent).toMatch(/Enter your hours/);
    expect(screen.getByRole('link', { name: 'Enter your hours for at least one day.' }).element().getAttribute('href')).toBe('#ts-add');
  });

  test('a send that fails keeps every hour; sent, the answer\'s heading takes focus', async () => {
    const onSend = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<Timesheet onSend={onSend} />);
    await screen.getByRole('textbox', { name: /^Note for your approver/ }).fill(' Off Friday ');
    await screen.getByRole('button', { name: 'Send for approval' }).click();
    await expect.poll(alertText).toContain('Couldn’t send your timesheet.');
    expect(cell('web', 0).value).toMatch(/6|٦/);
    await screen.getByRole('button', { name: 'Send for approval' }).click();
    await expect.poll(() => active().textContent).toBe('Sent to Maya Chen for approval');
    expect(onSend).toHaveBeenLastCalledWith({ web: [6, 5, null, null, null, null, null], admin: [2, 3, null, null, null, null, null] }, 'Off Friday');
    expect(document.body.textContent).toMatch(/(16|١٦) hours on (2|٢) projects/);
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Timesheet loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading your timesheet']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<Timesheet loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your timesheet' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the hours that arrive once loading ends are the ones filled in', async () => {
    const screen = await render(<Timesheet loading defaultHours={{}} />);
    await screen.rerender(<Timesheet />);
    await expect.poll(() => (cell('web', 0)?.value ?? '').replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660))).toBe('6');
  });
});
