import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { announcerIdle } from '../../internal/announce';
import { SignUp, passwordRules, signUpProblems } from './SignUp';

const active = () => document.activeElement as HTMLElement;
const input = (id: string) => document.getElementById(id) as HTMLInputElement;
const rules = () => [...document.querySelectorAll('ul[aria-label="Your password needs"] li')].map((li) => li.textContent);

// Sign-up: the password's rules shown before typing and said in words, fields a browser can fill, every problem listed
// at once, a code step, and a way back that keeps the answers.
describe('Patterns/Sign-up', () => {
  test('the rules and the problems, in the order of the fields', () => {
    expect(passwordRules('short', 'ana@example.com').map((r) => r.met)).toEqual([false, true]);
    expect(passwordRules('ana-and-the-sea', 'ana@example.com').map((r) => r.met)).toEqual([true, false]);
    expect(passwordRules('', '').map((r) => r.met)).toEqual([false, false]);
    expect(signUpProblems({ name: '', email: 'ana', phone: '', password: 'x', terms: false }).map((e) => e.field))
      .toEqual(['sign-up-name', 'sign-up-email', 'sign-up-password', 'sign-up-terms']);
    expect(signUpProblems({ name: '', email: '', phone: '', password: '', terms: false })[1]?.message).toBe('Enter your email address');
    expect(signUpProblems({ name: 'Ana', email: 'ana@example.com', phone: '', password: 'blue whales sing', terms: true })).toEqual([]);
  });

  test('one main and one h1, the skip link first; each field says what it holds, and the rules show before typing', async () => {
    await render(<SignUp />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    const ac = (id: string) => input(id).getAttribute('autocomplete');
    expect([ac('sign-up-name'), ac('sign-up-email'), ac('sign-up-phone'), ac('sign-up-password')]).toEqual(['name', 'email', 'tel', 'new-password']);
    expect(rules()).toEqual(['At least 12 characters, not yet', 'Not your email address or its name part, not yet']);
    // The rules are part of the password field's description, so a screen reader reads them with it.
    const described = (input('sign-up-password').getAttribute('aria-describedby') || '').split(' ').map((d) => document.getElementById(d)?.textContent || '').join(' ');
    expect(described).toMatch(/At least 12 characters/);
    expect(input('sign-up-terms').checked).toBe(false);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('when creating the account fails, it says so at once and keeps the form and what was typed; trying again clears it', async () => {
    let fail = true;
    const onSubmit = vi.fn(() => (fail ? Promise.reject(new Error('503')) : Promise.resolve()));
    await render(<SignUp onSubmit={onSubmit} initial={{ name: 'Ana', email: 'ana@example.com', password: 'blue whales sing', terms: true }} />);
    await userEvent.click(page.getByRole('button', { name: 'Create account' }));
    await expect.element(page.getByRole('alert')).toHaveTextContent('Couldn’t create your account. Check your connection and try again.');
    expect([onSubmit.mock.calls.length, document.querySelector('h1')!.textContent, input('sign-up-email').value]).toEqual([1, 'Create your account', 'ana@example.com']);
    fail = false;
    await userEvent.click(page.getByRole('button', { name: 'Create account' }));
    await expect.poll(() => document.querySelector('h1')!.textContent).toBe('Check your email');
    expect(document.querySelector('[role=alert]')).toBe(null);
  });

  test('each rule says done as it is met', async () => {
    await render(<SignUp initial={{ email: 'ana@example.com' }} />);
    await userEvent.click(input('sign-up-password'));
    await userEvent.keyboard('ana-and-the-sea');
    expect(rules()).toEqual(['At least 12 characters, done', 'Not your email address or its name part, not yet']);
    await userEvent.keyboard('{Control>}a{/Control}blue whales sing');
    expect(rules()).toEqual(['At least 12 characters, done', 'Not your email address or its name part, done']);
  });

  test('Create account with problems: a summary that takes focus and links to each field, and nothing sent', async () => {
    const onSubmit = vi.fn();
    const screen = await render(<SignUp onSubmit={onSubmit} />);
    await screen.getByRole('button', { name: 'Create account' }).click();
    await expect.poll(() => active().textContent || '').toMatch(/Enter your name/);
    const links = [...active().querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(['#sign-up-name', '#sign-up-email', '#sign-up-password', '#sign-up-terms']);
    expect(input('sign-up-name').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('a good form goes to the code step, focus on its heading; a wrong code says so; Change email keeps every answer; the right code ends it', async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    const screen = await render(<SignUp onSubmit={onSubmit} initial={{ name: 'Ana Lima', email: 'ana@example.com', password: 'blue whales sing', terms: true }} />);
    await screen.getByRole('button', { name: 'Create account' }).click();
    await expect.poll(() => active().textContent).toBe('Check your email');
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana Lima', email: 'ana@example.com', phone: '', password: 'blue whales sing', terms: true });
    expect(input('sign-up-code').getAttribute('autocomplete')).toBe('one-time-code');

    await screen.getByRole('button', { name: 'Verify email' }).click();
    // In the form, not the page's live region, which may still hold the same words for a moment (GR204).
    const form = page.elementLocator(screen.container);
    await expect.element(form.getByText('Enter the 6-digit code from the email')).toBeVisible();
    await userEvent.click(input('sign-up-code'));
    await userEvent.keyboard('111111');
    await screen.getByRole('button', { name: 'Verify email' }).click();
    await expect.element(form.getByText(/That code isn’t right/)).toBeVisible();

    await screen.getByRole('button', { name: 'Change email' }).click();
    await expect.poll(() => active().textContent).toBe('Create your account');
    expect([input('sign-up-name').value, input('sign-up-email').value, input('sign-up-password').value, input('sign-up-terms').checked])
      .toEqual(['Ana Lima', 'ana@example.com', 'blue whales sing', true]);

    await screen.getByRole('button', { name: 'Create account' }).click();
    await expect.poll(() => active().textContent).toBe('Check your email');
    await userEvent.click(input('sign-up-code'));
    await userEvent.keyboard('123456');
    await screen.getByRole('button', { name: 'Verify email' }).click();
    await expect.poll(() => active().textContent).toBe('Your account is ready');
    await expect.element(screen.getByRole('link', { name: 'Go to your dashboard' })).toBeInTheDocument();
  });

  test('the wrong-code error points to "Send a new code", which is there: busy while it sends, then says the code went or that it couldn’t', async () => {
    let fail = true, settle = () => {};
    const onResend = vi.fn(() => new Promise<void>((ok, no) => { settle = () => (fail ? no(new Error('offline')) : ok()); }));
    const screen = await render(<SignUp start="code" onResend={onResend} initial={{ email: 'ana@example.com' }} />);
    const status = () => (screen.container.querySelector('[role="status"]') as HTMLElement).textContent;
    const button = screen.getByRole('button', { name: 'Send a new code' });
    await button.click();
    await expect.element(button).toHaveAttribute('aria-busy', 'true');
    (button.element() as HTMLButtonElement).click();
    expect(onResend).toHaveBeenCalledWith('ana@example.com');
    expect(onResend).toHaveBeenCalledTimes(1);
    settle();
    await expect.poll(status).toBe('Couldn’t send a new code. Check your connection and try again.');
    fail = false;
    await button.click();
    settle();
    await expect.poll(status).toBe('We sent a new code to ana@example.com. It works for 10 minutes.');
  });

  test('a second wrong code is said again, though the words under the field are the same', async () => {
    const screen = await render(<SignUp start="code" />);
    const region = document.querySelector('[data-dk-announcer]') as HTMLElement;
    await userEvent.click(input('sign-up-code'));
    await userEvent.keyboard('111111');
    await screen.getByRole('button', { name: 'Verify email' }).click();
    await expect.poll(() => region.textContent).toContain('That code isn’t right');
    await expect.poll(announcerIdle).toBe(true);
    const heard: string[] = [];
    const watch = new MutationObserver(() => heard.push(region.textContent || ''));
    watch.observe(region, { childList: true, characterData: true, subtree: true });
    await screen.getByRole('button', { name: 'Verify email' }).click();
    await expect.poll(() => heard.at(-1)).toContain('That code isn’t right');
    watch.disconnect();
  });

  test('a refused account stays on the form', async () => {
    const screen = await render(<SignUp onSubmit={() => Promise.reject(new Error('no'))} initial={{ name: 'A', email: 'a@b.co', password: 'blue whales sing', terms: true }} />);
    await screen.getByRole('button', { name: 'Create account' }).click();
    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector('h1')?.textContent).toBe('Create your account');
  });

  test('at 320 px nothing scrolls the page sideways', async () => {
    await render(<div style={{ width: 320 }}><SignUp /></div>);
    const main = document.querySelector('main') as HTMLElement;
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
  });
});
