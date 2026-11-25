import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Heading } from '../../components/Heading/Heading';
import { page, userEvent } from 'vitest/browser';
import { Checkout, type CheckoutDetails } from './Checkout';
import { SerupaProvider } from '../../internal/provider';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const filled: Partial<CheckoutDetails> = {
  name: 'Ada Lovelace', line1: '12 High Street', city: 'London', postcode: 'SW1Y 4JH', country: 'GB', email: 'ada@example.com',
  cardNumber: '4242 4242 4242 4242', cardName: 'A Lovelace', cardExpiry: '08/27', cardCode: '123',
};

// Checkout (PT12): fields the browser can fill, every problem listed at once, a review before paying, and nothing
// typed lost on the way back.
describe('Patterns/Checkout', () => {
  test('each section heading is the size every pattern gives one (an h2 at lg), set by Heading, not a text class', async () => {
    await render(<Checkout />);
    await render(<div id="probe-lg"><Heading level={2} size="lg">Probe</Heading></div>);
    const look = (h: Element) => { const c = getComputedStyle(h); return [c.fontSize, c.lineHeight, c.letterSpacing].join(' '); };
    const want = look(document.querySelector('#probe-lg h2')!);
    const h2s = [...document.querySelectorAll('h2')].filter((h) => !h.closest('#probe, #probe-lg, dialog'));
    expect(h2s.length).toBeGreaterThan(0);
    expect(h2s.map(look)).toEqual(h2s.map(() => want));
  });

  test('one main and one h1, headings without a skipped level, and the skip link first', async () => {
    await render(<Checkout />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    // The page's title is set off from what's under it by the page header's line, as on the other app pages.
    const ruled = (e: Element | null): boolean => !!e && e.tagName !== 'MAIN' && (getComputedStyle(e).borderBottomWidth !== '0px' || ruled(e.parentElement));
    expect(ruled(document.querySelector('h1'))).toBe(true);
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
    await expect.element(screen.getByLabelText('Full name', { exact: false })).toHaveAttribute('aria-invalid', 'true');
    // A second try with the same problems refocuses the summary.
    (screen.getByLabelText('Full name', { exact: false }).element() as HTMLElement).focus();
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await vi.waitFor(() => expect(active().textContent).toContain('There'));
  });

  test('typing, choosing and the tip all reach the review and the total', async () => {
    const screen = await render(<Checkout lines={[{ id: 'x', name: 'Mug', quantity: 2, price: 1000 }]} initial={{ ...filled, country: '' }} />);
    await userEvent.fill(screen.getByLabelText('Address line 2', { exact: false }), 'Flat 3');
    await userEvent.selectOptions(screen.getByLabelText('Country', { exact: false }), 'Canada');
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
    await screen.getByRole('button', { name: 'Change how you pay' }).click();
    await vi.waitFor(() => expect([active().getAttribute('name'), (active() as HTMLInputElement).value]).toEqual(['method', 'card']));
    await expect.element(screen.getByLabelText('Card number', { exact: false })).toHaveValue('4242 4242 4242 4242');
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await screen.getByRole('button', { name: 'Change the delivery' }).click();
    await vi.waitFor(() => expect((active() as HTMLInputElement).value).toBe('standard'));
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await screen.getByRole('button', { name: 'Change the delivery address' }).click();
    await vi.waitFor(() => expect(active().id).toBe('checkout-name'));
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await screen.getByRole('button', { name: 'Back' }).click();
    await vi.waitFor(() => expect(active().textContent).toBe('Delivery and payment'));
    await expect.element(screen.getByLabelText('Full name', { exact: false })).toHaveValue('Ada Lovelace');
  });

  test('placing the order says so and moves on; a failure keeps the review and says nothing was charged', async () => {
    let fail = true;
    const onPlaceOrder = vi.fn(() => (fail ? Promise.reject(new Error('declined')) : Promise.resolve()));
    const screen = await render(<Checkout initial={filled} startAtReview onPlaceOrder={onPlaceOrder} />);
    await screen.getByRole('button', { name: /Place order/ }).click();
    await vi.waitFor(() => expect(said()).toContain('Your order wasn’t placed. Nothing was charged.'));
    expect(document.querySelector('main')!.textContent).toContain('Check your order');
    expect(onPlaceOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 2450 + 1800 * 2 }));
    fail = false;
    await screen.getByRole('button', { name: /Place order/ }).click();
    await vi.waitFor(() => expect(active().textContent).toBe('Thank you, your order is placed'));
    await vi.waitFor(() => expect(said()).toContain('Order placed'));
    expect(document.querySelector('main')!.textContent).toContain('We’ve sent the receipt to ada@example.com');
  });

  test('while the order is being placed, Back and Change do nothing and say why', async () => {
    let finish = () => {};
    const onPlaceOrder = vi.fn(() => new Promise<void>((r) => { finish = r; }));
    const screen = await render(<Checkout initial={filled} startAtReview onPlaceOrder={onPlaceOrder} />);
    await screen.getByRole('button', { name: /Place order/ }).click();
    const back = screen.getByRole('button', { name: 'Back' }).element() as HTMLButtonElement;
    const changes = [...document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Change "]')];
    expect([back.getAttribute('aria-disabled'), changes.length > 0, changes.every((b) => b.getAttribute('aria-disabled') === 'true')]).toEqual(['true', true, true]);
    back.click(); changes[0]!.click();
    expect(document.querySelector('main')!.textContent).toContain('Check your order');
    finish();
    await vi.waitFor(() => expect(active().textContent).toBe('Thank you, your order is placed'));
  });

  test('startAtReview with answers missing starts on the details', async () => {
    const screen = await render(<Checkout initial={{ name: 'Ada' }} startAtReview />);
    await expect.element(screen.getByRole('heading', { name: 'Delivery and payment' })).toBeVisible();
  });

  test('failed starts on the review as after a failed try, and trying again places the order; placed starts on the confirmation', async () => {
    const screen = await render(<Checkout initial={filled} failed />);
    await expect.element(screen.getByRole('heading', { name: 'Check your order' })).toBeVisible();
    expect(document.querySelector('main')!.textContent).toContain('Your order wasn’t placed. Nothing was charged. Try again, or use another card.');
    await screen.getByRole('button', { name: /Place order/ }).click();
    await vi.waitFor(() => expect(active().textContent).toBe('Thank you, your order is placed'));
    await screen.unmount();
    const done = await render(<Checkout initial={filled} placed />);
    await expect.element(done.getByRole('heading', { name: 'Thank you, your order is placed' })).toBeVisible();
    expect(document.querySelector('main')!.textContent).toContain('We’ve sent the receipt to ada@example.com');
  });

  test('failed or placed with answers missing starts on the details, as startAtReview does', async () => {
    for (const start of [{ failed: true }, { placed: true }]) {
      const screen = await render(<Checkout initial={{ name: 'Ada' }} {...start} />);
      await expect.element(screen.getByRole('heading', { name: 'Delivery and payment' })).toBeVisible();
      expect(document.body.textContent).not.toContain('wasn’t placed');
      await screen.unmount();
    }
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

  test('on a wide screen the summary stays in view down the long form, and Expiry date and Security code line up side by side', async () => {
    await page.viewport(1280, 900);
    try {
      await render(<Checkout />);
      const aside = page.getByRole('complementary', { name: 'Order summary' }).element();
      const top = (name: string) => Math.round(page.getByRole('textbox', { name }).element().getBoundingClientRect().top);
      expect([getComputedStyle(aside).position, top('Expiry date') === top('Security code')]).toEqual(['sticky', true]);
    } finally { await page.viewport(900, 700); }
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

describe('Patterns/Checkout: ways to pay', () => {
  const base: Partial<CheckoutDetails> = { ...filled, cardNumber: '', cardName: '', cardExpiry: '', cardCode: '' };
  const toReview = async (screen: Awaited<ReturnType<typeof render>>) => {
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await vi.waitFor(() => expect(active().textContent).toBe('Check your order'));
  };
  const place = async (screen: Awaited<ReturnType<typeof render>>, name: RegExp = /^Place order/) => {
    await screen.getByRole('button', { name }).click();
    await vi.waitFor(() => expect(document.querySelector('#checkout-step')?.textContent).toMatch(/order is placed/));
  };

  test('the methods are radio cards in one named group, each with a decorative icon and a second line; arrows move between them and the chosen one\'s questions show under the list', async () => {
    const screen = await render(<Checkout />);
    const group = screen.getByRole('group', { name: 'How would you like to pay?', exact: false }).element();
    const radios = [...group.querySelectorAll('input[type="radio"]')] as HTMLInputElement[];
    const names = radios.map((r) => r.labels?.[0]?.textContent?.trim().split(/\s{2,}|(?=[A-Z][a-z]+ [a-z])/)[0]);
    expect(radios.map((r) => r.value)).toEqual(['card', 'apple-pay', 'google-pay', 'bank', 'ewallet', 'qris']);
    expect(names.length).toBe(6);
    expect(radios.every((r) => r.labels?.[0]?.querySelector('[aria-hidden="true"] svg, svg[aria-hidden]'))).toBe(true);
    expect(radios[3]!.getAttribute('aria-describedby')).toBeTruthy();
    expect(radios[0]!.checked).toBe(true);
    await expect.element(screen.getByLabelText('Card number', { exact: false })).toBeVisible();
    radios[0]!.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect([active().getAttribute('value'), (active() as HTMLInputElement).checked]).toEqual(['bank', true]);
    expect(document.getElementById('checkout-cardNumber')).toBeNull();
    await expect.element(screen.getByLabelText('Your bank', { exact: false })).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('group', { name: 'E-wallet', exact: false })).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.querySelector('main')!.textContent).toContain('Scan it with any banking or e-wallet app');
  });

  test('the list is the app\'s: only the methods passed show, and one marked unavailable can\'t be picked and says why', async () => {
    const screen = await render(<Checkout methods={[
      { kind: 'card', id: 'card', label: 'Card' },
      { kind: 'qr', id: 'qris', label: 'QRIS', unavailable: 'Not for orders over Rp 10.000.000' },
    ]} />);
    const radios = [...screen.getByRole('group', { name: 'How would you like to pay?', exact: false }).element().querySelectorAll('input')];
    expect(radios.map((r) => [r.value, r.disabled])).toEqual([['card', false], ['qris', true]]);
    expect(document.getElementById(radios[1]!.getAttribute('aria-describedby')!.split(' ')[0]!)?.textContent).toBe('Not for orders over Rp 10.000.000');
  });

  test('the expiry date is one MM/YY field (cc-exp): the slash goes in as it\'s typed, "8" becomes "08/", a filled "08/2027" becomes "08/27", and Backspace can take the slash out', async () => {
    const screen = await render(<Checkout />);
    const exp = screen.getByLabelText('Expiry date', { exact: false });
    expect(exp.element().getAttribute('autocomplete')).toBe('cc-exp');
    expect(document.querySelectorAll('[autocomplete="cc-exp-month"], [autocomplete="cc-exp-year"]').length).toBe(0);
    await exp.click();
    await userEvent.keyboard('0827');
    await expect.element(exp).toHaveValue('08/27');
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');
    await expect.element(exp).toHaveValue('08');
    await exp.fill('');
    await userEvent.keyboard('8');
    await expect.element(exp).toHaveValue('08/');
    await exp.fill('08/2027');
    await expect.element(exp).toHaveValue('08/27');
  });

  test('a card past its month says it has expired, in the summary and at the field', async () => {
    const screen = await render(<Checkout initial={{ ...filled, cardExpiry: '01/20' }} />);
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await vi.waitFor(() => expect(active().textContent).toContain('There'));
    expect([...active().querySelectorAll('a')].map((a) => [a.textContent, a.getAttribute('href')]))
      .toEqual([['This card has expired: check the date, or use another card', '#checkout-cardExpiry']]);
  });

  test('saved cards come first, the first one that hasn\'t expired chosen; an expired one can\'t be picked; "A new card" shows the card fields; the review names the card', async () => {
    const screen = await render(<Checkout initial={base} methods={[{
      kind: 'card', id: 'card', label: 'Card',
      savedCards: [{ id: 'old', brand: 'Mastercard', last4: '1111', expiry: '01/20' }, { id: 'visa', brand: 'Visa', last4: '4242', expiry: '08/39' }],
    }]} />);
    const saved = screen.getByRole('group', { name: 'Card', exact: false }).element();
    expect([...saved.querySelectorAll('input')].map((r) => [r.value, r.checked, r.disabled])).toEqual([['old', false, true], ['visa', true, false], ['new', false, false]]);
    expect(saved.textContent).toContain('Expired 01/20');
    expect(document.getElementById('checkout-cardNumber')).toBeNull();
    await screen.getByRole('radio', { name: 'A new card' }).click();
    await expect.element(screen.getByLabelText('Card number', { exact: false })).toBeVisible();
    await screen.getByRole('radio', { name: /Visa ending in 4242/ }).click();
    await toReview(screen);
    expect(document.querySelector('main')!.textContent).toContain('Visa ending in 4242, expires 08/39');
  });

  test('a device wallet: nothing more to type, and the button says it pays with it', async () => {
    const screen = await render(<Checkout initial={{ ...base, method: 'apple-pay' }} />);
    expect(document.querySelector('main')!.textContent).toContain('Apple Pay opens for you to confirm');
    await toReview(screen);
    const total = [...document.querySelectorAll('aside dt')].find((t) => t.textContent === 'Total')!.nextElementSibling!.textContent;
    await expect.element(screen.getByRole('button', { name: `Pay ${total} with Apple Pay` })).toBeVisible();
    await place(screen, /with Apple Pay/);
    expect(document.querySelector('#checkout-step')!.textContent).toBe('Thank you, your order is placed');
  });

  test('bank transfer: the bank is asked for; after the order, the account number with a copy button, the amount and the time left; when time runs out it says so and goes back to choose again', async () => {
    const screen = await render(<Checkout initial={{ ...base, method: 'bank' }} onPlaceOrder={() => Promise.resolve({ accountNumber: '8808 0000 1111 2222', secondsLeft: 86400 })} />);
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await vi.waitFor(() => expect([...active().querySelectorAll('a')].map((a) => a.textContent)).toEqual(['Choose the bank you’ll transfer from']));
    await screen.getByLabelText('Your bank', { exact: false }).selectOptions('mandiri');
    await toReview(screen);
    expect(document.querySelector('main')!.textContent).toContain('Bank transfer to a Mandiri virtual account');
    await place(screen);
    expect(document.querySelector('#checkout-step')!.textContent).toBe('Your order is placed: now pay for it');
    await vi.waitFor(() => expect(said()).toContain('Order placed. Pay to finish it'));
    const main = document.querySelector('main')!;
    expect(main.textContent).toContain('8808 0000 1111 2222');
    await expect.element(screen.getByRole('button', { name: 'Copy number' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Copy amount' })).toBeVisible();
    await expect.element(screen.getByRole('timer', { name: /^Time left to pay/ })).toBeVisible();
  });

  test('when the time to pay has passed, it says the order is cancelled and nothing was charged, and "Choose another way to pay" goes back to the methods', async () => {
    const screen = await render(<Checkout initial={{ ...base, method: 'qris' }} onPlaceOrder={() => Promise.resolve({ payBy: Date.now() - 1000 })} />);
    await toReview(screen);
    await place(screen);
    await expect.element(screen.getByText('The time to pay has run out, so the order is cancelled. Nothing was charged.')).toBeVisible();
    await screen.getByRole('button', { name: 'Choose another way to pay' }).click();
    await vi.waitFor(() => expect([active().getAttribute('name'), (active() as HTMLInputElement).value]).toEqual(['method', 'qris']));
  });

  test('e-wallet: which one and its phone number are asked for; after the order it says which app to approve in', async () => {
    const screen = await render(<Checkout initial={{ ...base, method: 'ewallet', phone: '' }} onPlaceOrder={() => Promise.resolve({ secondsLeft: 300 })} />);
    await screen.getByRole('button', { name: 'Review your order' }).click();
    await vi.waitFor(() => expect([...active().querySelectorAll('a')].map((a) => a.textContent)).toEqual(['Choose your e-wallet', 'Enter the phone number your e-wallet uses']));
    await screen.getByRole('radio', { name: 'OVO' }).click();
    await screen.getByLabelText('Phone number for the e-wallet', { exact: false }).fill('0812 3456 7890');
    await toReview(screen);
    await place(screen);
    expect(document.querySelector('main')!.textContent).toContain('Open OVO on your phone (0812 3456 7890) and approve the payment of');
    await expect.element(screen.getByRole('timer', { name: /^Time left to approve/ })).toBeVisible();
  });

  test('QRIS: after the order a QR code named with the amount, the provider\'s own image when it gives one', async () => {
    const screen = await render(<Checkout initial={{ ...base, method: 'qris' }} onPlaceOrder={() => Promise.resolve({ secondsLeft: 900 })} />);
    await toReview(screen);
    await place(screen);
    const total = [...document.querySelectorAll('aside dt')].find((t) => t.textContent === 'Total')!.nextElementSibling!.textContent;
    await expect.element(screen.getByRole('img', { name: `QR code to pay ${total}` })).toBeVisible();
    await expect.element(screen.getByRole('timer', { name: /^Time left to scan the code/ })).toBeVisible();
    const img = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/%3E';
    await render(<Checkout initial={{ ...base, method: 'qris' }} placed instructions={{ qrImage: img, secondsLeft: 900 }} />);
    expect(document.querySelectorAll(`img[src='${img}']`).length).toBe(1);
  });

  test('a failure with another way to pay says to choose another, not another card', async () => {
    const screen = await render(<Checkout initial={{ ...base, method: 'bank', bank: 'bca' }} failed onPlaceOrder={() => Promise.reject(new Error('down'))} />);
    expect(screen.getByText(/Your order wasn’t placed/).element().textContent).toContain('choose another way to pay');
  });

  test('at 320 px, right to left: the methods and the bank transfer\'s account number and buttons fit, never wider than the page', async () => {
    document.documentElement.dir = 'rtl';
    try {
      await page.viewport(320, 700);
      await render(<Checkout initial={{ ...base, method: 'bank', bank: 'bca' }} />);
      const main = document.querySelector('main') as HTMLElement;
      expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
      await render(<Checkout initial={{ ...base, method: 'bank', bank: 'bca' }} placed instructions={{ accountNumber: '8808 1234 5678 9012', secondsLeft: 86400 }} />);
      const mains = document.querySelectorAll('main');
      const last = mains[mains.length - 1] as HTMLElement;
      expect(last.scrollWidth).toBeLessThanOrEqual(last.clientWidth);
      const num = [...last.querySelectorAll('[dir="ltr"]')].find((e) => e.textContent === '8808 1234 5678 9012');
      expect(num && getComputedStyle(num).direction).toBe('ltr');
    } finally {
      document.documentElement.removeAttribute('dir');
      await page.viewport(1024, 768);
    }
  });
});

describe('Patterns/Checkout: promo code', () => {
  test('in the order summary, above nothing but itself: "Add promo code" opens a field and focuses it; a wrong code says why at the field and aloud', async () => {
    const screen = await render(<Checkout />);
    const add = screen.getByRole('button', { name: 'Add promo code' });
    expect(add.element().closest('aside')).not.toBeNull();
    expect(add.element().getAttribute('aria-expanded')).toBe('false');
    await add.click();
    expect(add.element().getAttribute('aria-expanded')).toBe('true');
    await vi.waitFor(() => expect(active().id).toBe('checkout-promo-code'));
    await userEvent.keyboard('NOPE{Enter}');
    await vi.waitFor(() => expect(said()).toContain('This code isn’t valid'));
    expect(active().getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(active().getAttribute('aria-describedby')!.split(' ').find((x) => document.getElementById(x)?.textContent?.includes('valid'))!)).not.toBeNull();
  });

  test('a good code: Apply is busy while it checks, then the code shows as a badge with Remove, a discount line comes before the total, and the total drops; Remove puts it back', async () => {
    let done: (v: { code: string; discount: number; label: string }) => void = () => {};
    const screen = await render(<Checkout lines={[{ id: 'a', name: 'A', quantity: 1, price: 10000 }]}
      onApplyPromo={(code) => new Promise((r) => { done = r; void code; })} />);
    const total = () => [...document.querySelectorAll('aside dt')].find((t) => t.textContent === 'Total')!.nextElementSibling!.querySelector('data')!.getAttribute('value');
    expect(total()).toBe('100');
    await screen.getByRole('button', { name: 'Add promo code' }).click();
    await screen.getByLabelText('Promo code').fill('save10');
    await screen.getByRole('button', { name: 'Apply' }).click();
    await vi.waitFor(() => expect(document.querySelector('#checkout-promo button[type="submit"]')!.getAttribute('aria-busy')).toBe('true'));
    done({ code: 'SAVE10', discount: 1000, label: '10% off' });
    await vi.waitFor(() => expect(said()).toContain('Promo code SAVE10 applied: 10% off. The total is updated.'));
    const terms = [...document.querySelectorAll('aside dt')].map((t) => t.textContent);
    expect(terms.indexOf('Discount (SAVE10)')).toBe(terms.indexOf('Subtotal') + 1);
    expect(total()).toBe('90');
    expect(document.querySelector('aside')!.textContent).toContain('SAVE10');
    await screen.getByRole('button', { name: 'Remove promo code SAVE10' }).click();
    await vi.waitFor(() => expect(total()).toBe('100'));
    await vi.waitFor(() => expect(said()).toContain('Promo code SAVE10 removed'));
  });

  test('once the order is placed there is no promo code to add: the summary shows the discount, if any, and nothing to change', async () => {
    await render(<Checkout initial={filled} placed promo={{ code: 'WELCOME10', discount: 615 }} />);
    expect([...document.querySelectorAll('aside button')].length).toBe(0);
    expect([...document.querySelectorAll('aside dt')].map((t) => t.textContent)).toContain('Discount (WELCOME10)');
  });

  test('on the review each part sits beside its Change button, not above it', async () => {
    const sideBySide = (a: Element, b: Element) => { const r = a.getBoundingClientRect(), q = b.getBoundingClientRect(); return r.top < q.bottom && q.top < r.bottom && (r.right <= q.left || q.right <= r.left); };
    const screen = await render(<Checkout initial={filled} startAtReview />);
    await expect.element(screen.getByRole('heading', { name: 'Check your order' })).toBeVisible();
    for (const part of ['Delivery address', 'Delivery', 'Payment']) {
      const h = screen.getByRole('heading', { name: part, exact: true }).element();
      const button = h.parentElement!.parentElement!.querySelector('button, a')!   // the part's card: its text column, then the card;
      expect(sideBySide(h, button), part).toBe(true);
    }
  });

  test('counts follow the locale’s digits', async () => {
    await render(<SerupaProvider locale="ar-EG"><Checkout /></SerupaProvider>);
    expect(document.body.textContent).toContain('Step ١ of ٢');
    expect(document.body.textContent).toMatch(/ × [٠-٩]/);
  });
});
