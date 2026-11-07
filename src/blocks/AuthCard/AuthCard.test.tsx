import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { AuthCard } from './AuthCard';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const later = <T,>(value: T) => new Promise<T>((resolve) => { window.setTimeout(() => resolve(value), 50); });

// Auth card (BL9): the sign-in card as a block, for an app's own page. The Sign-in pattern's tests cover the steps in
// detail (src/patterns/SignIn); these cover what a page placing the card sets: async checks, no code step, its heading
// level and its words.
describe('Blocks/Auth card', () => {
  test('under a page’s h1: the card is a region named by its h2, and the error summary heading is an h3', async () => {
    await render(<><h1>Acme</h1><AuthCard headingLevel={2} check={() => true} forgotHref="/forgot" /></>);
    await expect.element(page.getByRole('region', { name: 'Sign in' })).toBeVisible();
    await expect.element(page.getByRole('heading', { level: 2, name: 'Sign in' })).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Sign in' }));
    expect(active().getAttribute('data-component')).toBe('error-summary');
    expect(active().querySelector('h3')).not.toBe(null);
    await expect.element(page.getByRole('link', { name: 'Forgot your password?' })).toHaveAttribute('href', '/forgot');
  });

  test('an async check: the button shows it’s working, a wrong answer says so on the password, and a right one moves on', async () => {
    const check = vi.fn((_: string, password: string) => later(password === 'right'));
    await render(<AuthCard check={check} verify={() => true} forgotHref="#" />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Email' }), 'ada@example.com');
    await userEvent.fill(page.getByLabelText('Password', { exact: true }), 'nope');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => active().textContent).toContain('The email or password is not right');
    await userEvent.fill(page.getByLabelText('Password', { exact: true }), 'right');
    await userEvent.click(page.getByRole('button', { name: 'Sign in' }));
    await expect.poll(() => [active().tagName, active().textContent]).toEqual(['H1', 'Enter your sign-in code']);
    expect(check).toHaveBeenLastCalledWith('ada@example.com', 'right');
  });

  test('a check that fails (the network, not the password) ends the working state and stays on the step', async () => {
    let fail = () => {};
    const check = vi.fn(() => new Promise<boolean>((_, no) => { fail = () => no(new Error('offline')); }));
    await render(<AuthCard check={check} verify={() => true} forgotHref="#" />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Email' }), 'ada@example.com');
    await userEvent.fill(page.getByLabelText('Password', { exact: true }), 'right');
    await userEvent.click(page.getByRole('button', { name: 'Sign in' }));
    await expect.element(page.getByRole('button', { name: 'Sign in' })).toHaveAttribute('aria-busy', 'true');
    fail();
    await expect.poll(() => page.getByRole('button', { name: 'Sign in' }).element().getAttribute('aria-busy')).not.toBe('true');
    await expect.element(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect.element(page.getByText("Couldn't check that. Check your connection and try again.")).toBeVisible();
    await expect.poll(said).toContain("Couldn't check that");
    expect(check).toHaveBeenCalledTimes(1);
  });

  test('a second wrong password takes focus to the summary again, so it is said again (GR148)', async () => {
    await render(<AuthCard check={() => false} verify={() => true} forgotHref="#" />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Email' }), 'ada@example.com');
    await userEvent.fill(page.getByLabelText('Password', { exact: true }), 'nope');
    await userEvent.click(page.getByRole('button', { name: 'Sign in' }));
    await expect.poll(() => active().getAttribute('data-component')).toBe('error-summary');
    await userEvent.fill(page.getByLabelText('Password', { exact: true }), 'still nope');
    await userEvent.click(page.getByRole('button', { name: 'Sign in' }));
    await expect.poll(() => active().getAttribute('data-component')).toBe('error-summary');
    expect(active().textContent).toContain('The email or password is not right');
  });

  test('a code check that fails says so under Verify, and the next try clears it (GR149)', async () => {
    const verify = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(true);
    await render(<AuthCard check={() => true} verify={verify} forgotHref="#" start="code" />);
    await userEvent.click(page.getByRole('textbox').first());
    await userEvent.keyboard('123456');
    await userEvent.click(page.getByRole('button', { name: 'Verify' }));
    await expect.element(page.getByText("Couldn't check that. Check your connection and try again.")).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Verify' }));
    await expect.poll(() => [active().tagName, active().textContent]).toEqual(['H1', 'You’re signed in']);
    expect(verify).toHaveBeenCalledTimes(2);
  });

  test('without verify there is no code step: a right password ends on done, and onSignedIn runs once', async () => {
    const onSignedIn = vi.fn();
    await render(<AuthCard check={() => true} onSignedIn={onSignedIn} forgotHref="#" doneHref="/home" />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Email' }), 'ada@example.com');
    await userEvent.fill(page.getByLabelText('Password', { exact: true }), 'x');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => [active().tagName, active().textContent]).toEqual(['H1', 'You’re signed in']);
    expect(onSignedIn).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('link', { name: 'Go to your dashboard' })).toHaveAttribute('href', '/home');
  });

  test('Send a new code asks the app each time', async () => {
    const onResend = vi.fn();
    await render(<AuthCard start="code" check={() => true} verify={() => true} onResend={onResend} forgotHref="#" />);
    await userEvent.click(page.getByRole('button', { name: 'Send a new code' }));
    await userEvent.click(page.getByRole('button', { name: 'Send a new code' }));
    expect(onResend).toHaveBeenCalledTimes(2);
    await expect.element(page.getByText('We sent a new code to your phone. It works for 10 minutes.')).toBeVisible();
  });

  test('every word can be given in the page language, the errors too', async () => {
    await render(<AuthCard check={() => true} forgotHref="#" labels={{ title: 'Masuk', email: 'Email', password: 'Kata sandi', signIn: 'Masuk', forgot: 'Lupa kata sandi?', emailMissing: 'Isi alamat email Anda', passwordMissing: 'Isi kata sandi Anda' }} />);
    await expect.element(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();
    await expect.element(page.getByRole('link', { name: 'Lupa kata sandi?' })).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Masuk' }));
    expect([...active().querySelectorAll('a')].map((a) => a.textContent)).toEqual(['Isi alamat email Anda', 'Isi kata sandi Anda']);
  });
});
