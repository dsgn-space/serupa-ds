import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { PasswordReset, resetEmailProblem, resetPasswordRules } from './PasswordReset';

// A field's own error text, not the copy the polite live region may be saying at the same moment (announce.ts): both
// match getByText, and a locator that finds two fails.
const own = (text: string) => page.getByText(text).elements().filter((e) => !e.closest('[data-dk-announcer], [data-dk-announcer-assertive]'));
const shown = (text: string) => own(text).filter((e) => e.checkVisibility()).length;
const active = () => document.activeElement as HTMLElement;
const h1 = () => document.querySelector('h1');
const status = () => document.querySelector('[role="status"]:not([data-dk-announcer])')?.textContent || '';

// Password reset: an email step that names a missing or malformed address, a sent step that says the same for every
// address and can send again, a new-password step a password manager can fill, and focus on each step's heading.
describe('Patterns/Password reset', () => {
  test('the email and the password are checked, in words', () => {
    expect(resetEmailProblem(' ')).toBe('Enter the email address you sign in with.');
    expect(resetEmailProblem('ana@')).toBe('Enter an email address in the right format, like name@example.com.');
    expect(resetEmailProblem(' ana@example.com ')).toBeNull();
    expect(resetPasswordRules('short', 'ana@example.com').map((r) => r.met)).toEqual([false, true]);
    expect(resetPasswordRules('ana-likes-long-ones', 'ana@example.com').map((r) => r.met)).toEqual([true, false]);
    expect(resetPasswordRules('', 'ana@example.com').map((r) => r.met)).toEqual([false, false]);
  });

  test('a missing email is said and focused; the link is sent; the sent step names the email and takes focus', async () => {
    const onRequest = vi.fn();
    const screen = await render(<PasswordReset onRequest={onRequest} />);
    expect([document.querySelectorAll('main').length, h1()?.textContent]).toEqual([1, 'Reset your password']);
    const email = page.getByLabelText('Email');
    expect(email.element().getAttribute('autocomplete')).toBe('email');
    await screen.getByRole('button', { name: 'Send the link' }).click();
    await expect.poll(() => shown('Enter the email address you sign in with.')).toBe(1);
    expect(active()).toBe(email.element());
    await email.fill('ana@example.com');
    await screen.getByRole('button', { name: 'Send the link' }).click();
    expect(onRequest).toHaveBeenCalledWith('ana@example.com');
    await expect.poll(() => h1()?.textContent).toBe('Check your email');
    await expect.poll(() => active()).toBe(h1());
    expect(screen.getByText(/^If an account uses/).element().textContent).toBe('If an account uses ana@example.com, we sent it a link to choose a new password. It works for 1 hour.');
  });

  test('a request that fails says so and keeps the email', async () => {
    const screen = await render(<PasswordReset onRequest={() => Promise.reject(new Error('down'))} email="ana@example.com" />);
    await screen.getByRole('button', { name: 'Send the link' }).click();
    await expect.element(screen.getByText('Couldn’t send the link. Check your connection and try again.')).toBeVisible();
    await expect.element(page.getByLabelText('Email')).toHaveValue('ana@example.com');
  });

  test('sending again says it went, or couldn\'t, without moving focus; a different email goes back with it kept', async () => {
    let fail = false;
    const onRequest = vi.fn(() => (fail ? Promise.reject(new Error('down')) : Promise.resolve()));
    const screen = await render(<PasswordReset start="sent" email="ana@example.com" onRequest={onRequest} />);
    const again = screen.getByRole('button', { name: 'Send it again' });
    await again.click();
    await expect.poll(status).toBe('We sent a new link. It works for 1 hour.');
    expect(active()).toBe(again.element());
    fail = true;
    await again.click();
    await expect.poll(status).toBe('Couldn’t send the link. Check your connection and try again.');
    expect(onRequest).toHaveBeenCalledTimes(2);
    await screen.getByRole('button', { name: 'Use a different email' }).click();
    await expect.poll(() => h1()?.textContent).toBe('Reset your password');
    await expect.element(page.getByLabelText('Email')).toHaveValue('ana@example.com');
  });

  test('the new password: the account for the password manager, the rules said, a broken rule focused, then done', async () => {
    let fail = true;
    const onReset = vi.fn(() => (fail ? Promise.reject(new Error('down')) : Promise.resolve()));
    const screen = await render(<PasswordReset start="choose" email="ana@example.com" onReset={onReset} />);
    expect(page.getByLabelText('Account').element().getAttribute('autocomplete')).toBe('username');
    const pw = page.getByLabelText(/^New password/);
    expect(pw.element().getAttribute('autocomplete')).toBe('new-password');
    expect(screen.getByRole('list', { name: 'Your password needs' }).element().textContent).toContain('At least 12 characters, not yet');
    await pw.fill('short');
    await screen.getByRole('button', { name: 'Change password' }).click();
    await expect.poll(() => shown('Choose a password that meets the rules under it.')).toBe(1);
    expect(active()).toBe(pw.element());
    expect(onReset).not.toHaveBeenCalled();
    await pw.fill('correct horse battery');
    await screen.getByRole('button', { name: 'Change password' }).click();
    await expect.element(screen.getByText('Couldn’t change your password. Check your connection and try again.')).toBeVisible();
    fail = false;
    await screen.getByRole('button', { name: 'Change password' }).click();
    expect(onReset).toHaveBeenLastCalledWith('correct horse battery');
    await expect.poll(() => h1()?.textContent).toBe('Your password is changed');
    await expect.poll(() => active()).toBe(h1());
    expect(screen.getByRole('link', { name: 'Sign in' }).element().getAttribute('href')).toBe('#sign-in');
  });

  test('an expired link says why, and Send a new link goes back with the email kept', async () => {
    const screen = await render(<PasswordReset start="expired" email="ana@example.com" />);
    await expect.element(screen.getByText('A link works for 1 hour, and only once. Send a new one to choose your password.')).toBeVisible();
    await screen.getByRole('button', { name: 'Send a new link' }).click();
    await expect.poll(() => active()).toBe(h1());
    await expect.element(page.getByLabelText('Email')).toHaveValue('ana@example.com');
    await userEvent.tab();
    expect(active()).toBe(page.getByLabelText('Email').element());
  });
});
