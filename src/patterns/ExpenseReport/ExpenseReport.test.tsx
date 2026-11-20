import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { commands, page, userEvent } from 'vitest/browser';
import { ExpenseReport, expenseProblems, missingReceipts, type Expense } from './ExpenseReport';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const described = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
const rows = () => [...document.querySelectorAll('tbody tr')].map((r) => r.querySelectorAll('td')[1]?.firstChild?.textContent);
const today = '2026-02-12';
const expenses: Expense[] = [
  { id: 'a', date: '2026-02-03', category: 'travel', what: 'Train', amount: 18 },
  { id: 'b', date: '2026-02-04', category: 'meals', what: 'Dinner', amount: 64 },
];
const good = { date: '2026-02-05', category: 'travel', what: 'Taxi', amount: 12, receipt: null };

// Expense report: fields that say what they take, problems in a summary that takes focus and next to each field, a table with the
// total in its footer and "Receipt needed" in words, Remove moving focus on, and Send checked before it sends.
describe('Patterns/Expense report', () => {
  test('what\'s wrong with an expense, and the receipts missing', () => {
    expect(expenseProblems(good, today, 25)).toEqual({});
    expect(Object.keys(expenseProblems({ date: '', category: '', what: ' ', amount: null, receipt: null }, today, 25))).toEqual(['date', 'category', 'what', 'amount']);
    expect(expenseProblems({ ...good, date: '2026-03-01' }, today, 25).date).toBe('Enter a date that isn’t in the future.');
    expect(expenseProblems({ ...good, amount: 0 }, today, 25).amount).toBe('Enter how much it cost.');
    expect(expenseProblems({ ...good, amount: 40 }, today, 25).receipt).toBe('Add the receipt: it’s needed over 25.');
    expect(expenseProblems({ ...good, amount: 40, receipt: new File(['x'], 'r.pdf') }, today, 25)).toEqual({});
    expect(missingReceipts(expenses, 25).map((e) => e.id)).toEqual(['b']);
  });

  test('one main and h1, the skip link first, the expenses as a table with the total in its footer, and receipts in words', async () => {
    await render(<ExpenseReport expenses={expenses} today={today} />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    expect(document.querySelector('caption')?.textContent).toBe('Expenses in this report, with the total');
    expect(document.querySelector('tfoot td')?.textContent).toBe('Total');
    expect(document.querySelector('tfoot')?.textContent).toMatch(/82|٨٢/);
    expect([...document.querySelectorAll('tbody tr')].map((r) => r.querySelectorAll('td')[3]?.textContent)).toEqual(['Not needed', 'Receipt needed']);
  });

  test('Add with problems: a summary takes focus and links to each field, which says its own problem; a good one joins the table', async () => {
    const screen = await render(<ExpenseReport expenses={[]} today={today} />);
    await screen.getByRole('button', { name: 'Add expense' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There (are \S+ problems|is a problem)/);
    const links = screen.getByRole('link', { name: /^Choose|^Say|^Enter|^Add/ });
    expect(links.elements()[0]?.getAttribute('href')).toBe('#expense-category');
    await links.first().click();
    await expect.poll(() => active().id).toBe('expense-category');
    expect(described(active())).toContain('Choose what it was for.');
    await screen.getByRole('combobox', { name: /^What for/ }).selectOptions('travel');
    await screen.getByRole('textbox', { name: /^What it was/ }).fill(' Taxi to the client ');
    await screen.getByRole('spinbutton', { name: /^Amount/ }).fill('40');
    await screen.getByRole('button', { name: 'Add expense' }).click();
    await expect.poll(() => document.body.textContent).toContain('Add the receipt: it’s needed over 25.');
    await userEvent.upload(document.getElementById('expense-receipt') as HTMLInputElement, [new File(['x'], 'taxi.jpg', { type: 'image/jpeg' })]);
    await screen.getByRole('button', { name: 'Add expense' }).click();
    await expect.poll(rows).toEqual(['Taxi to the client']);
    expect(document.querySelector('tbody')?.textContent).toContain('taxi.jpg');
    expect((document.getElementById('expense-what') as HTMLInputElement).value).toBe('');
  });

  test('a date cleared is named next to it and in the summary, whose link goes to it, and today is the date a new expense starts with', async () => {
    const screen = await render(<ExpenseReport expenses={[]} />);
    const box = document.querySelector<HTMLInputElement>('#expense-date input')!;
    expect(box.value).not.toBe('');
    await userEvent.fill(box, '');
    await screen.getByRole('button', { name: 'Add expense' }).click();
    await expect.poll(() => document.body.textContent).toContain('Enter the date you spent it.');
    await screen.getByRole('link', { name: 'Enter the date you spent it.' }).click();
    await expect.poll(() => active().closest('#expense-date') !== null).toBe(true);
  });

  test('Remove moves focus to the next row\'s Remove, then the form\'s first field', async () => {
    const screen = await render(<ExpenseReport expenses={expenses} today={today} />);
    await screen.getByRole('button', { name: 'Remove: Train' }).click();
    await expect.poll(() => active().id).toBe('expense-remove-b');
    await screen.getByRole('button', { name: 'Remove: Dinner' }).click();
    await expect.poll(() => active().closest('#expense-date') !== null).toBe(true);
    expect(document.body.textContent).toContain('None yet.');
  });

  test('Send is checked first: no expenses, then a missing receipt; a send that fails says so; sent, the answer takes focus', async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const { rerender } = await render(<ExpenseReport expenses={[]} today={today} onSubmit={onSubmit} />);
    const sendButton = () => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Send for approval')!;
    sendButton().click();
    await expect.poll(alertText).toContain('Add at least one expense first.');
    await rerender(<ExpenseReport key="2" expenses={expenses} today={today} onSubmit={onSubmit} />);
    sendButton().click();
    await expect.poll(alertText).toContain('Add the receipt for Dinner');
    await rerender(<ExpenseReport key="3" expenses={[expenses[0]!]} today={today} onSubmit={onSubmit} />);
    sendButton().click();
    await expect.poll(alertText).toContain('Couldn’t send the report.');
    sendButton().click();
    await expect.poll(() => active().textContent).toBe('Sent for approval');
    expect(onSubmit).toHaveBeenLastCalledWith([expenses[0]]);
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<ExpenseReport loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading expenses']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<ExpenseReport loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your expenses' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the expenses that arrive once loading ends are the ones shown', async () => {
    const screen = await render(<ExpenseReport loading expenses={[]} today={today} />);
    await screen.rerender(<ExpenseReport expenses={expenses} today={today} />);
    await expect.poll(rows).toEqual(['Train', 'Dinner']);
  });
});

// How many lines an element's text takes on screen.
const linesOf = (el: Element) => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size; };

describe('ExpenseReport on a phone', () => {
  test('on a phone, dates stay on one line and each Remove stays in view while the table scrolls', async () => {
    await page.viewport(360, 720);
    try {
      await render(<ExpenseReport />);
      for (const t of document.querySelectorAll('td time')) expect(linesOf(t), t.textContent ?? '').toBe(1);
      const frame = document.querySelector('table')!.parentElement!.getBoundingClientRect();
      const buttons = [...document.querySelectorAll('td button')].filter((b) => /^Remove/.test(b.getAttribute('aria-label') ?? ''));
      expect(buttons.length).toBeGreaterThan(0);
      for (const b of buttons) { const r = b.getBoundingClientRect(); expect(r.right, b.getAttribute('aria-label') ?? '').toBeLessThanOrEqual(frame.right + 1); expect(r.left).toBeGreaterThanOrEqual(frame.left - 1); }
    } finally { await page.viewport(900, 700); }
  });
});

describe('ExpenseReport printed', () => {
  test('printed, the report leaves out the add form, each Remove and Send for approval, and keeps the expenses', async () => {
    await render(<ExpenseReport />);
    // Found before printing: a role query skips what's hidden.
    const hidden: Element[] = [page.getByRole('heading', { name: 'Add an expense' }).element(), page.getByRole('button', { name: /^Remove/ }).first().element(), page.getByRole('button', { name: 'Send for approval' }).element()];
    const kept: Element[] = [page.getByRole('table').element()];
    await commands.printMedia(true);
    try {
      for (const e of hidden) expect(e.checkVisibility(), e.textContent ?? '').toBe(false);
      for (const e of kept) expect(e.checkVisibility(), e.textContent ?? '').toBe(true);
    } finally { await commands.printMedia(false); }
  });
});
