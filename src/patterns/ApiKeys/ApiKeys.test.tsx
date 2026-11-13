import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { ApiKeys, keyNameProblem } from './ApiKeys';

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
// Text shown in the open dialog itself, not in the page's live region, which can sit inside the dialog and still hold
// what it last said.
const inDialog = (text: string | RegExp) => [...document.querySelectorAll('dialog[open] *')]
  .some((e) => !e.closest('[data-dk-announcer]') && (typeof text === 'string' ? e.textContent?.trim() === text : text.test(e.textContent?.trim() || '')));
const nameField = () => page.getByLabelText(/^Name/);

// API keys: a captioned table with each Revoke named by its key, a create form that names a missing or taken name and
// shows the new key once with Copy focused, and a revoke that asks first, survives a failure and keeps focus in the list.
describe('Patterns/API keys', () => {
  test('a name is required and unique, compared without case', () => {
    expect(keyNameProblem('  ', [])).toBe('Name the key, so you know what uses it.');
    expect(keyNameProblem('deploy BOT ', ['Deploy bot'])).toBe('A key is already called “deploy BOT”. Choose another name.');
    expect(keyNameProblem('CI', ['Deploy bot'])).toBeNull();
  });

  test('one main and h1, a table, each Revoke named with its key, and only the last four characters shown', async () => {
    const screen = await render(<ApiKeys />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'API keys']);
    await expect.element(screen.getByRole('table', { name: 'API keys' })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Revoke / }).elements().map((e) => e.getAttribute('aria-label')))
      .toEqual(['Revoke Deploy bot', 'Revoke Analytics export', 'Revoke Old staging test']);
    await expect.element(screen.getByText('…7Qx2')).toBeVisible();
    await expect.element(screen.getByText('Never').first()).toBeVisible();
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('creating: a missing or taken name is said and focused; the new key is shown once with Copy focused, then listed by its end', async () => {
    const onCreate = vi.fn(() => Promise.resolve('acme_test_abcdefghWXYZ'));
    const screen = await render(<ApiKeys onCreate={onCreate} />);
    await screen.getByRole('button', { name: 'Create key' }).click();
    await screen.getByRole('button', { name: 'Create key' }).last().click();
    await expect.poll(() => inDialog('Name the key, so you know what uses it.')).toBe(true);
    expect(active()).toBe(nameField().element());
    await nameField().fill('deploy bot');
    await screen.getByRole('button', { name: 'Create key' }).last().click();
    await expect.poll(() => inDialog('A key is already called “deploy bot”. Choose another name.')).toBe(true);
    await nameField().fill('CI runner');
    await screen.getByRole('radio', { name: /^Read and write/ }).click();
    await screen.getByRole('combobox', { name: /^Stops working/ }).selectOptions('never');
    await screen.getByRole('button', { name: 'Create key' }).last().click();
    expect(onCreate).toHaveBeenCalledWith({ name: 'CI runner', access: 'write', expiresInDays: null });
    await expect.poll(() => inDialog('acme_test_abcdefghWXYZ')).toBe(true);
    await expect.poll(() => active().id).toBe('key-copy');
    await screen.getByRole('button', { name: 'Done' }).click();
    await expect.element(screen.getByText('…WXYZ')).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Revoke CI runner' })).toBeVisible();
    expect(active().textContent).toBe('Create key');
  });

  test('a create that fails says so and keeps the name', async () => {
    const screen = await render(<ApiKeys onCreate={() => Promise.reject(new Error('down'))} />);
    await screen.getByRole('button', { name: 'Create key' }).click();
    await nameField().fill('Backup job');
    await screen.getByRole('button', { name: 'Create key' }).last().click();
    await expect.element(screen.getByText('Couldn’t create the key. Try again.')).toBeVisible();
    await expect.element(nameField()).toHaveValue('Backup job');
    await userEvent.keyboard('{Escape}');
  });

  test('revoking asks first; Keep it keeps the key; a failure says it still works; a revoke moves focus to the next key\'s Revoke', async () => {
    let fail = true;
    const onRevoke = vi.fn(() => (fail ? Promise.reject(new Error('down')) : Promise.resolve()));
    const screen = await render(<ApiKeys onRevoke={onRevoke} />);
    await screen.getByRole('button', { name: 'Revoke Deploy bot' }).click();
    await expect.element(screen.getByRole('alertdialog', { name: 'Revoke Deploy bot?' })).toBeVisible();
    await screen.getByRole('button', { name: 'Keep it' }).click();
    expect(onRevoke).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Revoke Deploy bot' }).click();
    await screen.getByRole('button', { name: 'Revoke key' }).click();
    await expect.element(screen.getByText('Couldn’t revoke the key. It still works. Try again.')).toBeVisible();
    fail = false;
    await screen.getByRole('button', { name: 'Revoke key' }).click();
    expect(onRevoke).toHaveBeenLastCalledWith('k1');
    await expect.poll(() => screen.getByRole('button', { name: 'Revoke Deploy bot' }).elements().length).toBe(0);
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Revoke Analytics export');
    await expect.poll(() => toasted('Revoked Deploy bot')).toBe(true);
  });

  test('revoking the last key moves focus to the heading; no keys says what one is for', async () => {
    const screen = await render(<ApiKeys keys={[{ id: 'a', name: 'Only', ends: 'abcd', access: 'read', created: 0 }]} />);
    await screen.getByRole('button', { name: 'Revoke Only' }).click();
    await screen.getByRole('button', { name: 'Revoke key' }).click();
    await expect.element(screen.getByText('No API keys yet')).toBeVisible();
    await expect.poll(() => active().textContent).toBe('Keys (0)');
  });

  test('while the keys load, the table is busy', async () => {
    await render(<ApiKeys loading />);
    expect(document.querySelector('table')?.getAttribute('aria-busy')).toBe('true');
  });

  test('a failed load says so, without Create key, and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<ApiKeys loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByText('Couldn’t load your API keys')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create key' }).elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalled();
  });
});
