import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { commands, page, userEvent } from 'vitest/browser';
import { Transactions, findTx, monthsOf, totals, type Transaction } from './Transactions';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/٫/g, '.').replace(/٬/g, ',').replace(/[‎‏؜]/g, '');
// What a cell says as it shows: without aria-hidden parts, or the category line that only shows under a description on a phone.
const said = (e: Element) => {
  const gone = [...e.querySelectorAll('*')].map((x) => x.getAttribute('aria-hidden') === 'true' || !x.checkVisibility());
  const c = e.cloneNode(true) as Element;
  [...c.querySelectorAll('*')].forEach((x, i) => { if (gone[i]) x.remove(); });
  return norm(c.textContent);
};
const rows = () => [...document.querySelectorAll('tbody tr')].map((r) => [...r.children].map(said));
const shownText = () => norm(document.getElementById('tx-shown')!.textContent);
const t = (id: string, date: string, description: string, category: string, amount: number): Transaction => ({ id, date, description, category, amount });

// Transactions: totals first, a table whose descriptions are row headers with money in and out as their own columns,
// pending in words, and search, category and month saying how many show.
describe('Patterns/Transactions', () => {
  test('months, totals and finding', () => {
    const tx = [t('a', '2026-10-02', 'Fresh Market', 'Groceries', -10.1), t('b', '2026-11-01', 'Salary', 'Income', 100), t('c', '2026-11-03', 'Fresh Fish Market', 'Groceries', -20.2)];
    expect(monthsOf(tx)).toEqual(['2026-11', '2026-10']);
    expect(totals(tx)).toEqual({ into: 100, out: 30.3 });
    expect(findTx(tx, '2026-11', 'market fresh', '').map((x) => x.id)).toEqual(['c']);
    expect(findTx(tx, '2026-11', '', 'Income').map((x) => x.id)).toEqual(['b']);
    expect(findTx(tx, '2026-10', '', '').map((x) => x.id)).toEqual(['a']);
  });

  test('one main and h1, the skip link first, the month’s totals, and a table with money in and out apart', async () => {
    const screen = await render(<Transactions />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Everyday account: transactions']);
    const dl = norm(document.querySelector('main dl')!.textContent);
    expect(dl).toMatch(/Money in.*3[.,]?479[.,]99/);
    expect(dl).toMatch(/Money out.*1[.,]?372[.,]55/);
    expect(dl).toMatch(/You kept.*2[.,]?107[.,]44/);
    expect(screen.getByRole('rowheader', { name: /Corner Café/ }).elements()).toHaveLength(1);
    expect(rows()).toHaveLength(6);
    expect(rows()[0]![1]).toBe('Corner CaféPending');
    expect(rows()[0]![4]).toBe('');
    expect(rows()[0]![3]).toMatch(/6[.,]40/);
    expect(rows()[3]![3]).toBe('');
    expect(rows()[3]![4]).toMatch(/59[.,]99/);
    expect(shownText()).toMatch(/^6 transactions in /);
  });

  test('search and category say how many show, Clear filters puts them back, and no match says so', async () => {
    const screen = await render(<Transactions />);
    await screen.getByRole('searchbox', { name: 'Search transactions' }).fill('market');
    await expect.poll(shownText).toMatch(/^Showing 1 of 6 transactions in /);
    expect(rows()[0]![1]).toBe('Fresh Market');
    await screen.getByRole('searchbox').fill('');
    await screen.getByRole('combobox', { name: 'Category' }).selectOptions('Home');
    await expect.poll(shownText).toMatch(/^Showing 1 of 6/);
    await screen.getByRole('searchbox').fill('salary');
    await expect.poll(() => norm(document.querySelector('main')!.textContent)).toContain('match. Try other words, or clear the filters.');
    expect(document.querySelector('table')).toBeNull();
    await screen.getByRole('button', { name: 'Clear filters' }).click();
    await expect.poll(shownText).toMatch(/^6 transactions/);
    expect(screen.getByRole('button', { name: 'Clear filters' }).elements()).toHaveLength(0);
  });

  test('another month has its own totals and rows, and spending more than came in says so', async () => {
    const screen = await render(<Transactions transactions={[t('a', '2026-11-02', 'Rent', 'Home', -900), t('b', '2026-11-01', 'Pay', 'Income', 400), t('c', '2026-10-01', 'Pay', 'Income', 400)]} />);
    expect(norm(document.querySelector('main dl')!.textContent)).toMatch(/You spent more by.*500/);
    await screen.getByRole('combobox', { name: 'Month' }).selectOptions('2026-10');
    await expect.poll(() => rows().length).toBe(1);
    expect(norm(document.querySelector('main dl')!.textContent)).toMatch(/You kept.*400/);
  });

  test('transactions that arrive after loading show the newest month, not every month at once', async () => {
    const tx = [t('a', '2026-11-02', 'Rent', 'Home', -900), t('c', '2026-10-01', 'Pay', 'Income', 400)];
    const screen = await render(<Transactions transactions={[]} loading />);
    await screen.rerender(<Transactions transactions={tx} />);
    await expect.poll(rows).toHaveLength(1);
    expect((screen.getByRole('combobox', { name: 'Month' }).element() as HTMLSelectElement).value).toBe('2026-11');
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Transactions loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading transactions']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<Transactions loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your transactions' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('an account with no transactions says so once, without an empty month, totals or filters', async () => {
    const screen = await render(<Transactions transactions={[]} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No transactions yet' })).toBeVisible();
    expect(document.querySelector('main select, main input')).toBeNull();
    expect(document.querySelector('main')!.textContent).not.toMatch(/match|\$0\.00/);
  });
});

describe('Transactions printed', () => {
  test('printed, the list leaves out its search and filters, and keeps the transactions', async () => {
    await render(<Transactions />);
    // Found before printing: a role query skips what's hidden.
    const hidden: Element[] = [page.getByRole('search').element()];
    const kept: Element[] = [page.getByRole('table').element()];
    await commands.printMedia(true);
    try {
      for (const e of hidden) expect(e.checkVisibility(), e.textContent ?? '').toBe(false);
      for (const e of kept) expect(e.checkVisibility(), e.textContent ?? '').toBe(true);
    } finally { await commands.printMedia(false); }
  });

  test('on a phone the category moves under each description, so the table fits with money in and out still apart', async () => {
    await page.viewport(390, 844);
    document.body.style.padding = '0';
    try {
      await render(<Transactions />);
      await document.fonts.ready; // measured in the real font, not the wider fallback it starts in
      const first = [...document.querySelectorAll('tbody tr')[0]!.children].filter((c) => c.checkVisibility()).map(said);
      expect(first).toEqual([expect.any(String), 'Corner CaféPendingEating out', expect.stringMatching(/6[.,]40/), '']);
      const frame = document.querySelector('[data-component="table"]')!;
      expect(frame.scrollWidth - frame.clientWidth).toBeLessThanOrEqual(1);
    } finally { document.body.style.padding = ''; await page.viewport(900, 700); }
  });
});
