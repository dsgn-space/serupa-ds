import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { LeaveRequest, leaveProblem, workingDays, type LeaveHoliday, type LeaveRequestItem } from './LeaveRequest';

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const day = (d: string) => document.querySelector<HTMLElement>(`button[data-date="${d}"]`)!;
const pick = async (a: string, b: string) => { await userEvent.click(day(a)); await userEvent.click(day(b)); };
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
// The numbers in the balance, in Latin digits whatever the locale writes them in.
const dds = () => [...document.querySelectorAll('dd')].map((d) => (d.textContent ?? '').replace(/[^\p{Nd}]/gu, '').replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x660)));
const holidays: LeaveHoliday[] = [{ date: '2025-03-31', name: 'Eid al-Fitr' }, { date: '2025-04-01', name: 'Eid al-Fitr, second day' }, { date: '2025-04-18', name: 'Good Friday' }];
const requests: LeaveRequestItem[] = [
  { id: 'r2', kind: 'annual', start: '2025-05-12', end: '2025-05-16', days: 5, status: 'waiting' },
  { id: 'r1', kind: 'annual', start: '2025-02-03', end: '2025-02-04', days: 2, status: 'approved' },
];
const page = (over: Partial<React.ComponentProps<typeof LeaveRequest>> = {}) => <LeaveRequest balance={12} holidays={holidays} requests={requests} today="2025-03-10" {...over} />;

// Leave request: working days are counted without weekends and holidays, which are named; annual leave past what's
// left is said at once; a sent request goes to the top of the list, waiting.
describe('Patterns/Leave request', () => {
  test('the working days between two days, without weekends and holidays, and what\'s wrong with a request', () => {
    expect(workingDays('2025-03-28', '2025-04-02', { holidays })).toEqual(['2025-03-28', '2025-04-02']);
    expect(workingDays('2025-03-24', '2025-03-28')).toHaveLength(5);
    // A Friday and Saturday weekend.
    expect(workingDays('2025-03-27', '2025-03-30', { weekend: [5, 6] })).toEqual(['2025-03-27', '2025-03-30']);
    expect(leaveProblem(null, 'annual', 0, 7)).toBe('Choose the first and the last day you’ll be away.');
    expect(leaveProblem({ start: 'a', end: 'b' }, 'annual', 9, 7)).toBe('That’s 9 working days, and you have 7 left. Choose fewer days, or ask for unpaid leave.');
    expect(leaveProblem({ start: 'a', end: 'b' }, 'unpaid', 9, 7)).toBeNull();
    expect(leaveProblem({ start: 'a', end: 'b' }, 'annual', 7, 7)).toBeNull();
  });

  test('one main and h1, the skip link first, the kind of leave a radio group, the balance in words and the holidays in view named', async () => {
    const screen = await render(page());
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Request leave']);
    await expect.element(screen.getByRole('group', { name: 'Dates' })).toBeVisible();
    expect(screen.getByRole('radio').elements().map((r) => (r as HTMLInputElement).checked)).toEqual([true, false]);
    expect([...document.querySelectorAll('dt')].map((d) => d.textContent)).toEqual(['You have', 'Waiting for approval', 'Left after those']);
    expect(dds()).toEqual(['12', '5', '7']);
    expect(screen.getByRole('list', { name: 'Holidays' }).getByRole('listitem').elements().map((li) => li.querySelector('time')?.getAttribute('datetime'))).toEqual(['2025-03-31', '2025-04-01', '2025-04-18']);
    const mine = screen.getByRole('list', { name: 'Your requests' }).getByRole('listitem').elements();
    expect(mine.map((li) => li.textContent?.match(/Waiting|Approved|Declined/)?.[0])).toEqual(['Waiting', 'Approved']);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('weekends and holidays are closed; the count leaves them out and names the holidays inside', async () => {
    await render(page());
    expect(['2025-03-15', '2025-03-16', '2025-03-31', '2025-03-28', '2025-03-09'].map((d) => day(d).getAttribute('aria-disabled'))).toEqual(['true', 'true', 'true', null, 'true']);
    await pick('2025-03-27', '2025-04-03');
    await expect.poll(() => document.body.textContent).toContain('working days, without Eid al-Fitr (');
    expect(alertText()).toBe('');
  });

  test('the holidays listed follow the months shown', async () => {
    const screen = await render(page());
    await screen.getByRole('button', { name: 'Next month' }).click();
    await expect.poll(() => screen.getByRole('list', { name: 'Holidays' }).getByRole('listitem').elements().length).toBe(2);
  });

  test('annual leave past what\'s left is said at once, and unpaid leave takes it away', async () => {
    const screen = await render(page());
    await pick('2025-03-11', '2025-03-26');
    await expect.poll(alertText).toContain('Choose fewer days, or ask for unpaid leave.');
    expect(screen.getByRole('group', { name: 'Dates' }).element().getAttribute('aria-describedby')).toBe('leave-problem');
    await screen.getByRole('radio', { name: /Unpaid leave/ }).click();
    await expect.poll(alertText).toBe('');
  });

  test('Send with no dates says what to choose and puts focus on the calendar', async () => {
    const onSubmit = vi.fn();
    const screen = await render(page({ onSubmit }));
    await screen.getByRole('button', { name: 'Send request' }).click();
    await expect.poll(alertText).toBe('Choose the first and the last day you’ll be away.');
    expect(active().closest('[role="group"]')?.getAttribute('aria-labelledby')).toBe('dates');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('a sent request goes to the top as waiting, takes focus, the balance counts it, a toast says so and the form clears', async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    const screen = await render(page({ onSubmit }));
    await pick('2025-03-24', '2025-03-25');
    await screen.getByRole('textbox', { name: /Note for your manager/ }).fill('  Family visit ');
    await screen.getByRole('button', { name: 'Send request' }).click();
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'annual', start: '2025-03-24', end: '2025-03-25', days: 2, note: 'Family visit' });
    const list = screen.getByRole('list', { name: 'Your requests' });
    await expect.poll(() => active()).toBe(list.getByRole('listitem').first().element());
    expect(active().textContent).toContain('Waiting');
    expect(dds()).toEqual(['12', '7', '5']);
    await expect.poll(() => toasted('Leave requested')).toBe(true);
    expect((screen.getByRole('textbox', { name: /Note for your manager/ }).element() as HTMLTextAreaElement).value).toBe('');
  });

  test('a request that fails says so next to the button and keeps what was chosen', async () => {
    const screen = await render(page({ onSubmit: () => Promise.reject(new Error('offline')) }));
    await pick('2025-03-24', '2025-03-25');
    await screen.getByRole('button', { name: 'Send request' }).click();
    await expect.poll(alertText).toBe('Couldn’t send the request. Try again.');
    expect(screen.getByRole('list', { name: 'Your requests' }).getByRole('listitem').elements()).toHaveLength(2);
    expect(day('2025-03-24').getAttribute('aria-label')).toContain(',');
    await screen.getByRole('radio', { name: /Unpaid leave/ }).click();
    await expect.poll(alertText).toBe('');
  });

  test('with no requests yet it says so', async () => {
    await render(page({ requests: [] }));
    expect(document.body.textContent).toContain('No requests yet.');
  });

  test('while it loads: the h1 and one placeholder named "Loading leave"; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(page({ loading: true }));
    expect(document.querySelector('h1')?.textContent).toBe('Request leave');
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading leave']);
    await screen.rerender(page({ loadFailed: true, onRetry }));
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your leave' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('right to left, the holidays list keeps its bullets inside, on the right', async () => {
    await render(<div dir="rtl">{page()}</div>);
    const list = document.querySelector<HTMLElement>('ul[aria-labelledby="holidays"]')!;
    expect(getComputedStyle(list).paddingRight).not.toBe('0px');
    expect(getComputedStyle(list).paddingLeft).toBe('0px');
  });

  test('the requests that arrive once loading ends are the ones shown', async () => {
    const screen = await render(page({ loading: true, requests: [] }));
    await screen.rerender(page());
    await expect.poll(() => document.querySelectorAll('ul[aria-labelledby="mine"] > li').length).toBe(2);
  });
});
