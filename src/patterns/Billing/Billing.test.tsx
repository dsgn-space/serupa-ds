import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Billing, billingDate, methodText, money } from './Billing';
import { SerupaProvider } from '../../internal/provider';

const active = () => document.activeElement as HTMLElement;
const main = () => document.querySelector('main')!;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const cancelled = { name: 'Team', price: 24, currency: 'USD', interval: 'month' as const, renews: '2026-12-01', cancelled: true };

// Billing: the price and renewal up front, usage in words, invoices named per link, a failed payment said, and a
// cancel in one dialog that can fail and can be resumed.
describe('Patterns/Billing', () => {
  test('dates and amounts in the reader\'s locale; anything else as it came', () => {
    expect(billingDate('2026-12-01', 'en-GB')).toBe('1 December 2026');
    expect(billingDate('2028-04', 'en-GB')).toBe('April 2028');
    expect(billingDate('soon', 'en-GB')).toBe('soon');
    expect(money(24, 'USD', 'en-US')).toBe('$24.00');
    expect(money(24, 'nope', 'en-US')).toBe('24 nope');
  });

  test('one main and h1, the price and renewal day in the plan, usage in words, and each Download named with its invoice', async () => {
    const screen = await render(<SerupaProvider locale="en-GB"><Billing /></SerupaProvider>);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Billing']);
    expect(main().textContent).toContain('Renews on 1 December 2026 for US$24.00.');
    await expect.element(screen.getByRole('meter', { name: 'Seats' })).toHaveAttribute('aria-valuetext', '4 of 10 seats');
    await expect.element(screen.getByRole('meter', { name: 'Storage' })).toHaveAttribute('aria-valuetext', '8.6 GB of 10 GB, almost full');
    expect(main().textContent).toContain('Visa ending 4242, expires April 2028');
    await expect.element(screen.getByRole('table', { name: 'Invoices' })).toBeVisible();
    expect(screen.getByRole('link', { name: /^Download the invoice of/ }).elements().map((e) => e.getAttribute('aria-label')))
      .toEqual(['Download the invoice of 1 November 2026', 'Download the invoice of 1 October 2026', 'Download the invoice of 1 September 2026']);
    expect(screen.getByRole('alert').elements()).toHaveLength(0);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('the invoices\' amounts end-align, as figures in every table do, and Download sits at the row\'s end', async () => {
    const screen = await render(<Billing />);
    const table = screen.getByRole('table');
    const heads = table.getByRole('columnheader').elements();
    const first = table.getByRole('row').elements()[1]!.querySelectorAll('td');
    expect([heads[1], first[1], first[3]].map((c) => getComputedStyle(c!).textAlign)).toEqual(['end', 'end', 'end']);
  });

  test('a failed payment says so at the top with Update card, and its invoice says so in words', async () => {
    const screen = await render(<Billing updateCardHref="#pay" invoices={[{ id: 'x', date: '2026-11-01', amount: 24, status: 'failed', href: '#x' }]} />);
    const alert = screen.getByRole('alert');
    await expect.element(alert.getByText(/^The payment on .+ failed$/)).toBeVisible();
    await expect.element(alert.getByRole('link', { name: 'Update card' })).toHaveAttribute('href', '#pay');
    await expect.element(screen.getByRole('table').getByText('Failed', { exact: true })).toBeVisible();
  });

  test('each way to pay is said in words, with the way to change it', async () => {
    expect(methodText({ kind: 'card', brand: 'Visa', last4: '4242', expires: '2028-04' })).toBe('Visa ending 4242');
    const screen = await render(<Billing updateCardHref="#pay" paymentMethod={{ kind: 'bank', bank: 'BCA', last4: '7781' }} />);
    const section = screen.getByRole('region', { name: 'Payment method' });
    await expect.element(section.getByText('Direct debit from BCA, account ending 7781')).toBeVisible();
    await expect.element(section.getByRole('link', { name: 'Change payment method' })).toHaveAttribute('href', '#pay');
    expect(section.getByRole('link', { name: 'Update card' }).elements()).toHaveLength(0);
    await screen.rerender(<Billing paymentMethod={{ kind: 'ewallet', provider: 'GoPay', phoneLast4: '4410' }}
      invoices={[{ id: 'x', date: '2026-11-01', amount: 24, status: 'failed', href: '#x' }]} />);
    await expect.element(section.getByText('GoPay, phone ending 4410')).toBeVisible();
    const alert = screen.getByRole('alert');
    await expect.element(alert.getByRole('link', { name: 'Change payment method' })).toBeVisible();
    expect(alert.element().textContent).toContain('Change your payment method to keep Team.');
  });

  test('a card that runs out before the next payment says so in words, and a canceled plan doesn\'t worry about it', async () => {
    const card = { kind: 'card' as const, brand: 'Mastercard', last4: '5100', expires: '2026-11' };
    const screen = await render(<SerupaProvider locale="en-GB"><Billing paymentMethod={card} /></SerupaProvider>);
    const section = screen.getByRole('region', { name: 'Payment method' });
    await expect.element(section.getByText('Expires soon')).toBeVisible();
    await expect.element(section.getByText('It runs out before the next payment on 1 December 2026. Update it to keep Team.')).toBeVisible();
    await expect.element(section.getByRole('link', { name: 'Update card' })).toBeVisible();
    // A card that lasts through the renewal month is fine.
    await screen.rerender(<SerupaProvider locale="en-GB"><Billing paymentMethod={{ ...card, expires: '2026-12' }} /></SerupaProvider>);
    expect(section.getByText('Expires soon').elements()).toHaveLength(0);
    await screen.unmount();
    await render(<Billing plan={cancelled} paymentMethod={card} />);
    await expect.element(page.getByText(/^Active until/)).toBeVisible();
    expect(page.getByText('Expires soon').elements()).toHaveLength(0);
  });

  test('with nothing on file, it says so, by when, and Add payment method', async () => {
    const screen = await render(<SerupaProvider locale="en-GB"><Billing paymentMethod={null} /></SerupaProvider>);
    const section = screen.getByRole('region', { name: 'Payment method' });
    await expect.element(section.getByText('No payment method yet.')).toBeVisible();
    await expect.element(section.getByText('Add one before 1 December 2026 to keep Team.')).toBeVisible();
    await expect.element(section.getByRole('link', { name: 'Add payment method' })).toBeVisible();
  });

  test('Cancel plan asks once, says what changes, and Keep my plan closes it with nothing done', async () => {
    const onCancel = vi.fn();
    const screen = await render(<Billing onCancel={onCancel} />);
    await screen.getByRole('button', { name: 'Cancel plan' }).click();
    const dialog = screen.getByRole('alertdialog', { name: 'Cancel Team?' });
    await expect.element(dialog.getByText(/stays active until .+ Nothing is deleted/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Keep my plan' }).click();
    expect(screen.getByRole('alertdialog').elements()).toHaveLength(0);
    expect(onCancel).not.toHaveBeenCalled();
  });

  test('a cancel that fails keeps the dialog open and says so; trying again cancels, says when it stops, and Resume brings it back', async () => {
    let fail = true;
    const onCancel = vi.fn(() => (fail ? Promise.reject(new Error('offline')) : Promise.resolve()));
    const onResume = vi.fn();
    const screen = await render(<SerupaProvider locale="en-GB"><Billing onCancel={onCancel} onResume={onResume} /></SerupaProvider>);
    await screen.getByRole('button', { name: 'Cancel plan' }).click();
    const dialog = screen.getByRole('alertdialog');
    await dialog.getByRole('button', { name: 'Cancel plan' }).click();
    await expect.element(dialog.getByRole('alert')).toHaveTextContent('Couldn’t cancel Team. Try again.');
    fail = false;
    await dialog.getByRole('button', { name: 'Cancel plan' }).click();
    await expect.poll(() => screen.getByRole('alertdialog').elements()).toHaveLength(0);
    expect(main().textContent).toContain('Active until 1 December 2026, then it stops. Nothing is deleted.');
    await expect.poll(() => toasted('Canceled. Team stays active until 1 December 2026.')).toBe(true);
    await screen.getByRole('button', { name: 'Resume plan' }).click();
    expect(onResume).toHaveBeenCalledOnce();
    expect(main().textContent).toContain('Renews on 1 December 2026');
    await expect.poll(() => toasted('Resumed. Team renews on 1 December 2026.')).toBe(true);
  });

  test('a plan that starts canceled shows Resume, not Cancel; no invoices says when the first comes', async () => {
    const screen = await render(<Billing plan={cancelled} invoices={[]} />);
    await expect.element(screen.getByRole('button', { name: 'Resume plan' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel plan' }).elements()).toHaveLength(0);
    expect(main().textContent).toMatch(/No invoices yet\. The first comes on/);
  });

  test('loading: busy, the parts\' headings, one placeholder named "Loading billing"; a failed load says so with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Billing loading />);
    expect(main().getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('heading', { level: 2 }).elements().map((h) => h.textContent)).toEqual(['Plan', 'Usage', 'Invoices']);
    await expect.poll(() => page.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading billing']);
    await screen.rerender(<Billing loading loadFailed onRetry={onRetry} />);
    expect(main().hasAttribute('aria-busy')).toBe(false);
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { level: 2, name: 'Couldn’t load billing' }).elements()).toHaveLength(1);
  });

  test('on a wide screen each card is a row: the method beside its link, the plan beside its buttons, both at the start', async () => {
    const sideBySide = (a: Element, b: Element) => { const r = a.getBoundingClientRect(), q = b.getBoundingClientRect(); return r.top < q.bottom && q.top < r.bottom && (r.right <= q.left || q.right <= r.left); };
    await render(<Billing />);
    const card = document.querySelector('#billing-card')!.nextElementSibling!;
    const text = [...card.querySelectorAll('p')].find((p) => p.textContent?.startsWith('Visa'))!;
    expect(sideBySide(text, card.querySelector('a')!)).toBe(true);
    expect(Math.abs(text.getBoundingClientRect().left - card.getBoundingClientRect().left)).toBeLessThan(40);
    const plan = document.querySelector('#billing-plan')!.nextElementSibling!;
    expect(sideBySide(plan.querySelector('p')!, [...plan.querySelectorAll('a, button')].find((b) => b.textContent === 'Change plan')!)).toBe(true);
  });
});

// How many lines an element's text takes on screen.
const linesOf = (el: Element) => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size; };

describe('Billing on a phone', () => {
  test('on a phone, each invoice’s date and its Download link stay whole, and Download stays in view while the table scrolls', async () => {
    await page.viewport(360, 720);
    try {
      await render(<Billing />);
      for (const t of document.querySelectorAll('td time')) expect(linesOf(t), t.textContent ?? '').toBe(1);
      const frame = document.querySelector('table')!.parentElement!.getBoundingClientRect();
      for (const a of document.querySelectorAll('td a')) { expect(linesOf(a), a.textContent ?? '').toBe(1); expect(a.getBoundingClientRect().right).toBeLessThanOrEqual(frame.right + 1); }
    } finally { await page.viewport(900, 700); }
  });

  test('partly loaded: the plan shows, and the Invoices section alone says it failed, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Billing invoicesFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 3, name: 'Couldn’t load your invoices' })).toBeVisible();
    expect(document.querySelector('table')).toBeNull();
    expect(screen.getByText(/^No invoices yet/).elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
