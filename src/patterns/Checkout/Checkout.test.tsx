import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Checkout, type CheckoutDetails } from './Checkout';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const filled: Partial<CheckoutDetails> = {
  name: 'Ada Lovelace', line1: '12 High Street', city: 'London', postcode: 'SW1Y 4JH', country: 'GB', email: 'ada@example.com',
  cardNumber: '4242 4242 4242 4242', cardName: 'A Lovelace', cardExpiry: '08/27', cardCode: '123',
};

// Checkout (PT12): fields the browser can fill, every problem listed at once, a review before paying, and nothing
// typed lost on the way back.
describe('Patterns/Checkout', () => {
  test('one main and one h1, headings without a skipped level, and the skip link first', async () => {
    await render(<Checkout />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    const levels = [...document.querySelectorAll('main h1, main h2, main h3')].map((h) => Number(h.tagName[1]));
    levels.forEach((l, i) => { if (i > 0) expect(l - (levels[i - 1] ?? 1)).toBeLessThanOrEqual(1); });
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('every field about the person has its autocomplete token', async () => {
    const screen = await render(<Checkout />);
    const tokens: [string, string][] = [
      ['Full name', 'shipping name'], ['Address line 1', 'shipping address-line1'], ['Address line 2', 'shipping address-line2'],
      ['Town or city', 'shipping address-level2'], ['Postcode', 'shipping postal-code'], ['Country', 'shipping country'],
      ['Email', 'email'], ['Phone', 'tel'], ['Card number', 'cc-number'], ['Name on card', 'cc-name'],
      ['Expiry date', 'cc-exp'], ['Security code', 'cc-csc'],
    ];
    for (const [label, token] of tokens) {
      expect(screen.getByLabelText(label, { exact: false }).first().element().getAttribute('autocomplete'), label).toBe(token);
    }
  });

  test('"Review your order" lists every problem at once, in an error summary that takes focus and links to each field', async () => {
    const screen = await render(<Checkout initial={{ email: 'ada', cardExpiry: '13/27' }} />);
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await vi.waitFor(() => expect(active().textContent).toContain('There'));
    const summary = active();
    const links = [...summary.querySelectorAll('a')].map((a) => [a.textContent, a.getAttribute('href')]);
    expect(links).toContainEqual(['Enter an email address, like name@example.com', '#checkout-email']);
    expect(links).toContainEqual(['Enter the expiry date as MM/YY, like 08/27', '#checkout-cardExpiry']);
    expect(links).toHaveLength(10);
    await expect.element(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    // A second try with the same problems refocuses the summary.
    (screen.getByLabelText('Full name').element() as HTMLElement).focus();
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await vi.waitFor(() => expect(active().textContent).toContain('There'));
  });

  test('typing, choosing and the tip all reach the review and the total', async () => {
    const screen = await render(<Checkout lines={[{ id: 'x', name: 'Mug', quantity: 2, price: 1000 }]} initial={{ ...filled, country: '' }} />);
    await userEvent.fill(screen.getByLabelText('Address line 2', { exact: false }), 'Flat 3');
    await userEvent.selectOptions(screen.getByLabelText('Country'), 'Canada');
    await screen.getByRole('radio', { name: /Express/ }).click();
    await userEvent.fill(screen.getByLabelText('Tip for the courier', { exact: false }), '2.50');
    await userEvent.tab();
    // The <data value> holds the amount in major units, whatever the locale writes.
    const total = () => [...document.querySelectorAll('aside dd data')].map((e) => e.getAttribute('value'));
    await vi.waitFor(() => expect(total()).toEqual(['20', '9', '2.5', '31.5']));
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await vi.waitFor(() => expect(active().textContent).toBe('Check your order'));
    const main = document.querySelector('main')!.textContent;
    for (const text of ['Flat 3', 'Canada', 'Express, next working day', 'Tip for the courier: ', 'Card ending in 4242']) expect(main).toContain(text);
  });

  test('"Change" goes back with every answer kept and focus on that part', async () => {
    const screen = await render(<Checkout initial={filled} startAtReview />);
    await screen.getByRole('button', { name: 'Change the payment card' }).click();
    await vi.waitFor(() => expect(active().id).toBe('checkout-cardNumber'));
    expect((active() as HTMLInputElement).value).toBe('4242 4242 4242 4242');
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await screen.getByRole('button', { name: 'Change the delivery' }).click();
    await vi.waitFor(() => expect((active() as HTMLInputElement).value).toBe('standard'));
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await screen.getByRole('button', { name: 'Change the delivery address' }).click();
    await vi.waitFor(() => expect(active().id).toBe('checkout-name'));
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await screen.getByRole('button', { name: 'Back' }).click();
    await vi.waitFor(() => expect(active().textContent).toBe('Delivery and payment'));
    await expect.element(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace');
  });

  test('placing the order says so and moves on; a failure keeps the review and says nothing was charged', async () => {
    let fail = true;
    const onPlaceOrder = vi.fn(() => (fail ? Promise.reject(new Error('declined')) : Promise.resolve()));
    const screen = await render(<Checkout initial={filled} startAtReview onPlaceOrder={onPlaceOrder} />);
    await screen.getByRole('button', { name: /Place order/ }).click();
    await vi.waitFor(() => expect(said()).toContain("Your order wasn't placed. Nothing was charged."));
    expect(document.querySelector('main')!.textContent).toContain('Check your order');
    expect(onPlaceOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 2450 + 1800 * 2 }));
    fail = false;
    await screen.getByRole('button', { name: /Place order/ }).click();
    await vi.waitFor(() => expect(active().textContent).toBe('Thank you, your order is placed'));
    await vi.waitFor(() => expect(said()).toContain('Order placed'));
    expect(document.querySelector('main')!.textContent).toContain("We've sent the receipt to ada@example.com");
  });

  test('while the order is being placed, Back and Change do nothing and say why', async () => {
    let finish = () => {};
    const onPlaceOrder = vi.fn(() => new Promise<void>((r) => { finish = r; }));
    const screen = await render(<Checkout initial={filled} startAtReview onPlaceOrder={onPlaceOrder} />);
    await screen.getByRole('button', { name: /Place order/ }).click();
    const back = screen.getByRole('button', { name: 'Back' }).element() as HTMLButtonElement;
    const changes = [...document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Change "]')];
    expect([back.getAttribute('aria-disabled'), changes.length > 0, changes.every((b) => b.getAttribute('aria-disabled') === 'true')]).toEqual(['true', true, true]);
    back.click(); changes[0].click();
    expect(document.querySelector('main')!.textContent).toContain('Check your order');
    finish();
    await vi.waitFor(() => expect(active().textContent).toBe('Thank you, your order is placed'));
  });

  test('startAtReview with answers missing starts on the details', async () => {
    const screen = await render(<Checkout initial={{ name: 'Ada' }} startAtReview />);
    await expect.element(screen.getByRole('heading', { name: 'Delivery and payment' })).toBeVisible();
  });

  test('the order summary keeps role="list", and long words wrap inside the review cards at 320 px', async () => {
    const long = 'Kundendienstwissensdatenbankabteilung';
    await render(<div style={{ width: 320 }}><Checkout lines={[{ id: 'x', name: long + 'sbecher', quantity: 1, price: 100 }]}
      initial={{ ...filled, line1: long + 'straße 1', email: long.toLowerCase() + '@beispiel.example' }} startAtReview /></div>);
    const bare = [...document.querySelectorAll('ul, ol')].filter((l) => getComputedStyle(l).listStyleType === 'none' && !l.closest('nav'));
    expect(bare.map((l) => l.getAttribute('role'))).toEqual(['list']);
    const main = document.querySelector('main') as HTMLElement;
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
  });

  test('on a phone the order summary comes before "Place order", and from lg up it sits beside the review (GR167)', async () => {
    const at = async (width: number) => {
      const screen = await render(<div style={{ width }}><Checkout initial={{ ...filled, delivery: 'express', tip: 250 }} startAtReview /></div>);
      const aside = (document.querySelector('aside') as HTMLElement).getBoundingClientRect();
      const pay = screen.getByRole('button', { name: /Place order/ }).element();
      const button = pay.getBoundingClientRect();
      const before = ((document.querySelector('aside') as HTMLElement).compareDocumentPosition(pay) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      await screen.unmount();
      return { aside, button, before };
    };
    const phone = await at(390);
    expect(phone.before).toBe(true);
    expect(phone.aside.bottom).toBeLessThanOrEqual(phone.button.top);
    // lg is a media query, so the window itself has to be wide (the tests run at 900 x 700).
    await page.viewport(1280, 900);
    const wide = await at(1200).finally(() => page.viewport(900, 700));
    expect(wide.aside.left).toBeGreaterThanOrEqual(wide.button.right);
    expect(wide.aside.top).toBeLessThan(wide.button.top);
  });

  test('a long "Place order" (a big amount, or a longer language) wraps inside 320 px, never wider than the page (GR169)', async () => {
    const screen = await render(<div style={{ width: 320 }}><Checkout currency="IDR" initial={filled} startAtReview
      lines={[{ id: 'a', name: 'Kursi', quantity: 9, price: 222222222222222 }]} /></div>);
    const main = document.querySelector('main') as HTMLElement;
    const pay = screen.getByRole('button', { name: /Place order/ }).element();
    // The button stays inside the page's column (it wraps), and the page doesn't scroll sideways.
    const column = pay.closest('main > div') as HTMLElement;
    expect(pay.getBoundingClientRect().right).toBeLessThanOrEqual(column.getBoundingClientRect().right);
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
    expect(pay.textContent).toContain('Place order: pay');
  });

  test('amounts are in the currency\'s own minor units: yen have none, so 1800 is ￥1,800 (GR152)', async () => {
    const onPlaceOrder = vi.fn();
    const screen = await render(<Checkout currency="JPY" expressPrice={900} onPlaceOrder={onPlaceOrder} initial={{ ...filled, delivery: 'express', tip: 300 }} startAtReview
      lines={[{ id: 'a', name: 'Tea bowl', quantity: 1, price: 1800 }, { id: 'b', name: 'Tea', quantity: 2, price: 500 }]} />);
    const values = () => [...document.querySelectorAll('aside data')].map((e) => e.getAttribute('value'));
    expect(values()).toEqual(['1800', '1000', '2800', '900', '300', '4000']);
    await screen.getByRole('button', { name: /Place order/ }).click();
    expect(onPlaceOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 4000 }));
  });

  test('a long email wraps on the confirmation at 320 px too (GR153)', async () => {
    const email = 'muhammad.bin.abdullah.al-rashidi.kundendienst@beispielunternehmen-international.de';
    const screen = await render(<div style={{ width: 320 }}><Checkout initial={{ ...filled, email }} startAtReview /></div>);
    await screen.getByRole('button', { name: /Place order/ }).click();
    await vi.waitFor(() => expect(active().textContent).toBe('Thank you, your order is placed'));
    const main = document.querySelector('main') as HTMLElement;
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
  });
});
