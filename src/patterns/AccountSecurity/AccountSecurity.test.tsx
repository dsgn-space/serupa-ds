import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { AccountSecurity, passwordProblems } from './AccountSecurity';

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const current = () => page.getByLabelText(/^Current password/);
const next = () => page.getByLabelText(/^New password/);

// Account security: password fields a manager can fill with the rules first, two-step setup without a camera and with
// recovery codes, a confirm before turning it off, and named Sign out buttons that keep focus in the list.
describe('Patterns/Account security', () => {
  test('the password rules, in the order of the fields', () => {
    expect(passwordProblems('', 'short').map((e) => e.message)).toEqual(['Enter your current password', 'Make the new password at least 12 characters']);
    expect(passwordProblems('the same long one', 'the same long one').map((e) => e.field)).toEqual(['password-new']);
    expect(passwordProblems('old', 'a long new phrase')).toEqual([]);
  });

  test('one main and h1, the skip link first, and the password fields marked for password managers', async () => {
    await render(<AccountSecurity />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Security']);
    await expect.element(current()).toHaveAttribute('autocomplete', 'current-password');
    await expect.element(next()).toHaveAttribute('autocomplete', 'new-password');
    expect(document.body.textContent).toContain('At least 12 characters.');
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('problems are listed and focused; a good change is sent, clears the fields and says Saved; a failed one keeps them', async () => {
    let fail = false;
    const onChangePassword = vi.fn(() => (fail ? Promise.reject(new Error('wrong')) : Promise.resolve()));
    const screen = await render(<AccountSecurity onChangePassword={onChangePassword} />);
    await screen.getByRole('button', { name: 'Change password' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    expect(screen.getByRole('link', { name: 'Make the new password at least 12 characters' }).elements()).toHaveLength(1);
    expect(onChangePassword).not.toHaveBeenCalled();
    await current().fill('old password');
    await next().fill('a much longer phrase');
    await screen.getByRole('button', { name: 'Change password' }).click();
    await expect.poll(() => onChangePassword.mock.calls).toEqual([['old password', 'a much longer phrase']]);
    await expect.element(screen.getByText(/^Saved/)).toBeVisible();
    await expect.element(current()).toHaveValue('');
    fail = true;
    await current().fill('old password');
    await next().fill('another long phrase');
    await screen.getByRole('button', { name: 'Change password' }).click();
    await expect.element(screen.getByRole('button', { name: 'Try again' })).toBeVisible();
    await expect.element(next()).toHaveValue('another long phrase');
  });

  test('two-step setup: the key as text with Copy, a wrong code says what to check, a right one shows the recovery codes once', async () => {
    const onEnableTwoStep = vi.fn((code: string) => (code === '123456' ? Promise.resolve() : Promise.reject(new Error('no'))));
    const screen = await render(<AccountSecurity onEnableTwoStep={onEnableTwoStep} setupKey="ABCD EFGH" recoveryCodes={['aaaa-1111', 'bbbb-2222']} />);
    await screen.getByRole('button', { name: 'Turn on' }).click();
    const dialog = screen.getByRole('dialog', { name: 'Turn on two-step verification' });
    await expect.element(dialog.getByText('ABCD EFGH')).toBeVisible();
    await expect.element(dialog.getByRole('button', { name: /^Copy the key/ })).toBeVisible();
    await dialog.getByRole('button', { name: 'Turn on' }).click();
    await expect.element(dialog.getByText('Enter the 6-digit code from your authenticator app.').first()).toBeVisible();
    await dialog.getByRole('textbox').first().click();
    await userEvent.keyboard('654321');
    await dialog.getByRole('button', { name: 'Turn on' }).click();
    await expect.element(dialog.getByText(/That code didn’t work/).first()).toBeVisible();
    await expect.poll(() => active().id).toBe('two-step-code');
    await userEvent.keyboard('123456');
    await dialog.getByRole('button', { name: 'Turn on' }).click();
    await expect.poll(() => onEnableTwoStep.mock.calls.map((c) => c[0])).toEqual(['654321', '123456']);
    const codes = screen.getByRole('dialog', { name: 'Save your recovery codes' });
    await expect.element(codes.getByRole('list', { name: 'Recovery codes' })).toHaveTextContent('aaaa-1111bbbb-2222');
    expect(onEnableTwoStep.mock.calls.map((c) => c[0])).toEqual(['654321', '123456']);
    await codes.getByRole('button', { name: 'I’ve saved them' }).click();
    await expect.poll(() => toasted('Two-step verification is on')).toBe(true);
    await expect.element(screen.getByRole('button', { name: 'Turn off' })).toBeVisible();
  });

  test('closing setup before the code works leaves two-step off', async () => {
    const screen = await render(<AccountSecurity />);
    await screen.getByRole('button', { name: 'Turn on' }).click();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog').elements()).toHaveLength(0);
    await expect.element(screen.getByRole('button', { name: 'Turn on' })).toBeVisible();
  });

  test('turning two-step off asks first; Keep it on changes nothing, Turn off does and says so', async () => {
    const onDisableTwoStep = vi.fn();
    const screen = await render(<AccountSecurity twoStep onDisableTwoStep={onDisableTwoStep} />);
    await screen.getByRole('button', { name: 'Turn off' }).click();
    const dialog = screen.getByRole('alertdialog', { name: 'Turn off two-step verification?' });
    await dialog.getByRole('button', { name: 'Keep it on' }).click();
    expect(onDisableTwoStep).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Turn off' }).click();
    await screen.getByRole('alertdialog').getByRole('button', { name: 'Turn off' }).click();
    expect(onDisableTwoStep).toHaveBeenCalledOnce();
    await expect.poll(() => toasted('Two-step verification is off')).toBe(true);
    await expect.element(screen.getByRole('button', { name: 'Turn on' })).toBeVisible();
  });

  test('each Sign out is named with its device, this device has none, and focus moves on to the next one, then the heading', async () => {
    const onSignOut = vi.fn();
    const screen = await render(<AccountSecurity onSignOut={onSignOut} />);
    expect(screen.getByRole('button', { name: /^Sign out of/ }).elements().map((e) => e.getAttribute('aria-label')))
      .toEqual(['Sign out of Safari on an iPhone', 'Sign out of Firefox on a Windows PC']);
    await expect.element(screen.getByText('This device')).toBeVisible();
    await screen.getByRole('button', { name: 'Sign out of Safari on an iPhone' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Sign out of Firefox on a Windows PC');
    await expect.poll(() => toasted('Signed out of Safari on an iPhone')).toBe(true);
    expect(screen.getByRole('button', { name: 'Sign out everywhere else' }).elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Sign out of Firefox on a Windows PC' }).click();
    await expect.poll(() => active().textContent).toBe('Where you’re signed in');
    expect(onSignOut.mock.calls).toEqual([['d2'], ['d3']]);
  });

  test('Sign out everywhere else ends every other session at once', async () => {
    const onSignOutOthers = vi.fn();
    const screen = await render(<AccountSecurity onSignOutOthers={onSignOutOthers} />);
    await screen.getByRole('button', { name: 'Sign out everywhere else' }).click();
    expect(onSignOutOthers).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: /^Sign out of/ }).elements()).toHaveLength(0);
    await expect.poll(() => toasted('Signed out of 2 other devices')).toBe(true);
    await expect.poll(() => active().textContent).toBe('Where you’re signed in');
  });
});
