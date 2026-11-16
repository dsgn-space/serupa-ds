import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Invoice, invoiceState, invoiceTotals, type InvoiceInfo } from './Invoice';

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const inv = (over: Partial<InvoiceInfo> = {}): InvoiceInfo => ({
  number: 'INV-7', issued: '2025-03-01', due: '2025-03-31', paid: '', from: ['Acme'], to: ['Lima & Co.'],
  lines: [{ id: 'a', description: 'Workshop', quantity: 2, price: 100 }, { id: 'b', description: 'Audit', quantity: 1, price: 50.5 }],
  taxRate: 0.1, pdf: '#inv-7.pdf', ...over,
});

// Invoice: where it stands is a word and a sentence, the lines are a table, and Pay marks it paid only once the
// server says so.
describe('Patterns/Invoice', () => {
  test('the sums, and where an invoice stands on a day', () => {
    expect(invoiceTotals(inv().lines, 0.1)).toEqual({ subtotal: 250.5, tax: 25.05, total: 275.55 });
    expect(invoiceState({ due: '2025-03-31', paid: '' }, '2025-03-20')).toEqual({ state: 'due', days: 11 });
    expect(invoiceState({ due: '2025-03-31', paid: '' }, '2025-04-05')).toEqual({ state: 'overdue', days: 5 });
    expect(invoiceState({ due: '2025-03-31', paid: '2025-03-10' }, '2025-04-05')).toEqual({ state: 'paid', days: 0 });
  });

  test('one main and h1 named by the invoice, the skip link first, its state in words, and Download named', async () => {
    const screen = await render(<Invoice invoice={inv()} today="2025-03-20" />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Invoice INV-7']);
    expect(document.getElementById('standing')?.textContent).toMatch(/to pay\s*Due$/);
    expect(document.body.textContent).toContain('Due on ');
    expect(screen.getByRole('link', { name: 'Download PDF of invoice INV-7' }).element().getAttribute('href')).toBe('#inv-7.pdf');
    expect(screen.getByRole('button', { name: /^Pay/ }).elements()).toHaveLength(0);
  });

  test('the lines are a table with a caption and headers, and the totals name the amount due', async () => {
    const screen = await render(<Invoice invoice={inv()} />);
    const table = screen.getByRole('table', { name: 'Lines of invoice INV-7' });
    expect(table.getByRole('columnheader').elements().map((c) => c.textContent)).toEqual(['Description', 'Quantity', 'Price', 'Amount']);
    expect(table.getByRole('row').elements()).toHaveLength(3);
    expect([...document.querySelectorAll('dt')].map((d) => d.textContent)).toEqual(['Issued', 'Due', 'Subtotal', expect.stringMatching(/^Tax \(/), 'Total', 'Paid', 'Amount due']);
    expect(document.querySelectorAll('time[datetime="2025-03-31"]')).toHaveLength(1);
  });

  test('overdue and paid are said in words', async () => {
    const screen = await render(<Invoice invoice={inv()} today="2025-04-05" />);
    expect(document.getElementById('standing')?.textContent).toMatch(/Overdue$/);
    expect(document.body.textContent).toMatch(/Overdue by \S+ days\. It was due on /);
    await screen.rerender(<Invoice key="one" invoice={inv()} today="2025-04-01" />);
    expect(document.body.textContent).toContain('Overdue by 1 day.');
    await screen.rerender(<Invoice key="today" invoice={inv()} today="2025-03-31" />);
    expect(document.body.textContent).toContain(', today.');
    await screen.rerender(<Invoice key="paid" invoice={inv({ paid: '2025-03-10' })} today="2025-04-05" />);
    expect(document.getElementById('standing')?.textContent).toMatch(/paid\s*Paid$/);
    expect(document.body.textContent).toContain('Paid on ');
  });

  test('Pay pays the total: the state says Paid, the button goes, focus is on the h1 and a toast says so', async () => {
    const onPay = vi.fn((_n: number) => Promise.resolve());
    const screen = await render(<Invoice invoice={inv()} today="2025-03-20" onPay={onPay} />);
    await screen.getByRole('button', { name: /^Pay/ }).click();
    await expect.poll(() => active().tagName).toBe('H1');
    expect(onPay).toHaveBeenCalledWith(275.55);
    expect(document.getElementById('standing')?.textContent).toMatch(/Paid$/);
    expect(screen.getByRole('button', { name: /^Pay/ }).elements()).toHaveLength(0);
    await expect.poll(() => toasted('Invoice INV-7 is paid')).toBe(true);
  });

  test('a payment that fails says so next to the button, and the invoice stays due', async () => {
    const screen = await render(<Invoice invoice={inv()} today="2025-03-20" onPay={() => Promise.reject(new Error('declined'))} />);
    await screen.getByRole('button', { name: /^Pay/ }).click();
    await expect.poll(alertText).toContain('The payment didn’t go through.');
    expect(document.getElementById('standing')?.textContent).toMatch(/Due$/);
    expect(screen.getByRole('button', { name: /^Pay/ }).elements()).toHaveLength(1);
  });

  test('while it loads: the h1 and one placeholder named "Loading invoice"; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Invoice invoice={inv()} loading />);
    expect(document.querySelector('h1')?.textContent).toBe('Invoice INV-7');
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading invoice']);
    await screen.rerender(<Invoice invoice={inv()} loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the invoice' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the invoice that arrives once loading ends is the one shown', async () => {
    const screen = await render(<Invoice loading invoice={inv()} />);
    await screen.rerender(<Invoice invoice={inv({ number: 'INV-8' })} />);
    await expect.poll(() => document.querySelector('main h1')?.textContent).toContain('INV-8');
  });
});
