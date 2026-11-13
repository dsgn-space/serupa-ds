import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { MultiStepForm, stepProblems, type Application } from './MultiStepForm';

const active = () => document.activeElement as HTMLElement;
const input = (id: string) => document.getElementById(id) as HTMLInputElement;
// Numbers are written in the reader's digits (Arabic-Indic in ar-EG): read them back as Latin.
const latin = (t: string | null) => (t || '').replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660));
const ANSWERS: Partial<Application> = {
  business: 'Kopi Senja', type: 'sole', line1: 'Jalan Braga 12', city: 'Bandung', postcode: '40111', country: 'ID',
  name: 'Ani Wijaya', email: 'ani@example.com', phone: '0812 3456 7890', payments: 'few', cards: 2,
};
const help = () => document.getElementById('apply-help')!.closest('aside')!;

// Multi-step form: each step checked as it's left, every answer kept on the way back, an address asked for once,
// every answer shown with a way to change it before sending, and help in the same place on every step.
describe('Patterns/Multi-step form', () => {
  test('each step’s problems in the order of its fields; a registration number only for a limited company', () => {
    const empty = { ...ANSWERS, business: '', type: '', city: '' } as Application;
    expect(stepProblems(0, empty).map((e) => e.field)).toEqual(['apply-business', 'apply-type-sole', 'apply-city']);
    expect(stepProblems(0, { ...ANSWERS, type: 'company', registration: '12' } as Application).map((e) => e.message)).toEqual(['Enter the registration number as it is on the certificate: 6 to 20 letters and numbers']);
    expect(stepProblems(1, { ...ANSWERS, email: 'ani@example', sameAddress: false, cardLine1: '', cardCity: 'Bandung', cardPostcode: '40111', cardCountry: 'ID' } as Application).map((e) => e.field)).toEqual(['apply-email', 'apply-cardLine1']);
    expect(stepProblems(2, { ...ANSWERS, payments: '', cards: 0 } as Application).map((e) => e.field)).toEqual(['apply-payments-few', 'apply-cards']);
    expect(stepProblems(3, {} as Application)).toEqual([]);
  });

  test('one main and one h1, the skip link first; Continue on an empty step lists every problem and focuses the list', async () => {
    await render(<MultiStepForm />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    // The app's header, as on the other app pages, a banner landmark before main.
    expect(document.querySelector('header')?.textContent).toBe('Acme');
    expect(document.querySelector('header')?.compareDocumentPosition(document.querySelector('main')!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => latin(active().textContent)).toMatch(/There are 6 problems/);
    expect(page.getByRole('link', { name: 'Choose what kind of business it is' }).elements()).toHaveLength(1);
    expect(page.getByRole('navigation', { name: 'Application steps' }).element().textContent).toMatch(/has an error/);
  });

  test('a good step goes on with its heading focused, and Back keeps every answer', async () => {
    await render(<MultiStepForm initial={{ ...ANSWERS, name: '' }} />);
    await userEvent.fill(input('apply-business'), 'Kopi Senja Dua');
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => active().textContent).toBe('Contact person');
    await userEvent.fill(input('apply-name'), 'Budi Santoso');
    await userEvent.click(page.getByRole('button', { name: 'Back' }));
    await expect.poll(() => active().textContent).toBe('Your business');
    expect(input('apply-business').value).toBe('Kopi Senja Dua');
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => active().textContent).toBe('Contact person');
    expect(input('apply-name').value).toBe('Budi Santoso');
  });

  test('a limited company is asked for its registration number, right after the choice', async () => {
    await render(<MultiStepForm />);
    expect(document.getElementById('apply-registration')).toBeNull();
    await userEvent.click(page.getByRole('radio', { name: /Limited company/ }));
    expect(input('apply-registration')).not.toBeNull();
  });

  test('the cards go to the business address unless that’s unticked; only then is another address asked for', async () => {
    await render(<MultiStepForm start={1} initial={ANSWERS} />);
    const box = page.getByRole('checkbox', { name: 'Post the cards to the business address' });
    expect(box.element()).toHaveProperty('checked', true);
    expect(document.getElementById('apply-cardLine1')).toBeNull();
    expect(page.getByText('Jalan Braga 12, Bandung').elements()).toHaveLength(1);
    await userEvent.click(box);
    expect(input('apply-cardLine1').getAttribute('autocomplete')).toBe('shipping address-line1');
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => latin(active().textContent)).toMatch(/There are 4 problems/);
  });

  test('every kind of field keeps what is picked: the countries, the currency, the payments and the number of cards reach the review', async () => {
    await render(<MultiStepForm initial={{ ...ANSWERS, country: '' }} />);
    await userEvent.selectOptions(input('apply-country'), 'Malaysia');
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => active().textContent).toBe('Contact person');
    await userEvent.click(page.getByRole('checkbox', { name: 'Post the cards to the business address' }));
    await userEvent.fill(input('apply-cardLine1'), 'Orchard Road 1');
    await userEvent.fill(input('apply-cardCity'), 'Singapore');
    await userEvent.fill(input('apply-cardPostcode'), '238801');
    await userEvent.selectOptions(input('apply-cardCountry'), 'Singapore');
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => active().textContent).toBe('The account');
    await userEvent.selectOptions(input('apply-currency'), 'US dollar (USD)');
    await userEvent.click(page.getByRole('radio', { name: '50 to 500 a month' }));
    await userEvent.fill(input('apply-cards'), '5');
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => active().textContent).toBe('Check your answers');
    const review = latin(page.getByRole('region', { name: 'Check your answers' }).element().textContent);
    for (const said of ['Malaysia', 'Orchard Road 1', 'Singapore', 'US dollar (USD)', '50 to 500 a month']) expect(review).toContain(said);
    expect(review).toMatch(/Debit cards\s*5/);
  });

  test('the review shows every answer; Change opens that step, and its button comes back to the answers', async () => {
    await render(<MultiStepForm start={3} initial={ANSWERS} />);
    const review = () => page.getByRole('region', { name: 'Check your answers' }).element().textContent;
    expect(review()).toMatch(/Kopi Senja/);
    expect(review()).toMatch(/Cards posted toThe business address/);
    await userEvent.click(page.getByRole('button', { name: 'Change the contact person' }));
    await expect.poll(() => active().textContent).toBe('Contact person');
    await userEvent.fill(input('apply-email'), 'budi@example.com');
    await userEvent.click(page.getByRole('button', { name: 'Save and go back to your answers' }));
    await expect.poll(() => active().textContent).toBe('Check your answers');
    expect(review()).toMatch(/budi@example\.com/);
  });

  test('a change that breaks a step stops there with the problem, on the way back to the answers', async () => {
    await render(<MultiStepForm start={3} initial={ANSWERS} />);
    await userEvent.click(page.getByRole('button', { name: 'Change the contact person' }));
    await userEvent.fill(input('apply-email'), 'budi');
    await userEvent.click(page.getByRole('button', { name: 'Save and go back to your answers' }));
    await expect.poll(() => active().textContent).toMatch(/There is a problem/);
    expect(page.getByRole('link', { name: 'Enter an email address like name@example.com' }).elements()).toHaveLength(1);
  });

  test('sending: nothing goes before Send; a failure keeps the review and says so; then the confirmation takes focus', async () => {
    let fail = true;
    const onSubmit = vi.fn(() => (fail ? Promise.reject(new Error('503')) : Promise.resolve()));
    await render(<MultiStepForm start={3} initial={ANSWERS} onSubmit={onSubmit} />);
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(page.getByRole('button', { name: 'Send application' }));
    await expect.element(page.getByText('Your application wasn’t sent')).toBeVisible();
    fail = false;
    await userEvent.click(page.getByRole('button', { name: 'Try sending again' }));
    await expect.poll(() => active().textContent).toBe('Application sent');
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit.mock.calls[1]).toMatchObject([{ business: 'Kopi Senja', email: 'ani@example.com', cards: 2 }]);
    expect(page.getByRole('main').element().textContent).toMatch(/The cards arrive by post/);
  });

  test('help is in the same place, with the same words, on every step, the review and the confirmation', async () => {
    const seen: string[] = [];
    const { rerender } = await render(<MultiStepForm key="0" initial={ANSWERS} />);
    const record = () => { const h = help(); seen.push(`${h.previousElementSibling?.tagName} ${h.nextElementSibling?.tagName} ${h.textContent}`); };
    record();
    for (const name of ['Continue', 'Continue', 'Continue']) {
      await userEvent.click(page.getByRole('button', { name }));
      await expect.poll(() => document.querySelectorAll('section:not([hidden])').length).toBe(1);
      record();
    }
    await rerender(<MultiStepForm key="sent" sent initial={ANSWERS} />);
    record();
    expect(seen.length).toBe(5);
    expect(new Set(seen.map((x) => x.replace(/^\w+ /, ''))).size).toBe(1);
    expect(help().textContent).toMatch(/Need help\?/);
  });

  test('on a right-to-left page, the email and phone in the answers still read left to right', async () => {
    await render(<div dir="rtl"><MultiStepForm start={3} initial={{ ...ANSWERS, phone: '+62 811 0000 1234' }} /></div>);
    for (const text of ['+62 811 0000 1234', 'ani@example.com']) {
      const node = [...document.querySelectorAll('bdi')].find((n) => n.textContent === text)!.firstChild as Text;
      const x = (i: number) => { const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1); return r.getBoundingClientRect().left; };
      expect(x(0)).toBeLessThan(x(text.length - 1));
    }
  });
});
