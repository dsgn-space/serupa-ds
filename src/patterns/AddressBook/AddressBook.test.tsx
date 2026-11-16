import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { AddressBook, addressProblems } from './AddressBook';
import { SerupaProvider } from '../../internal/provider';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const said = () => [...document.querySelectorAll('[aria-live]')].map((e) => e.textContent || '').join(' ');
const toastOf = (text: string) => [...document.querySelectorAll('li')].filter((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]')).at(-1) as HTMLElement;
const card = (label: string) => [...document.querySelectorAll('main li')].find((e) => e.querySelector('h3')?.textContent === label) as HTMLElement;

// Address book: each address an <address> with buttons named by it, the default said in words and not removable,
// a dialog whose fields say what they are for autofill and what's missing, and removes with Undo.
describe('Patterns/Address book', () => {
  test('what\'s missing from an address', () => {
    expect(addressProblems({ label: 'Home', name: 'Ana', line1: 'Jl. Braga 12', city: 'Bandung', postalCode: '40111', country: 'Indonesia' })).toEqual({});
    expect(Object.keys(addressProblems({ label: ' ', name: '', line1: '', city: '', postalCode: '', country: '' })))
      .toEqual(['label', 'name', 'line1', 'city', 'postalCode', 'country']);
  });

  test('one main and h1, the skip link first, each address an <address>, the default said in words and without Remove', async () => {
    const screen = await render(<AddressBook />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Addresses']);
    expect(document.querySelectorAll('main address')).toHaveLength(2);
    expect(card('Home').textContent).toContain('Default');
    expect(card('Home').textContent).toContain('To remove it, make another address the default first.');
    expect(screen.getByRole('button', { name: 'Remove Home' }).elements()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Remove Office' }).elements()).toHaveLength(1);
  });

  test('Make default moves the badge and says so; then the old default can be removed', async () => {
    const onDefaultChange = vi.fn();
    const screen = await render(<AddressBook onDefaultChange={onDefaultChange} />);
    await screen.getByRole('button', { name: 'Make default: Office' }).click();
    expect(onDefaultChange).toHaveBeenCalledWith('a2');
    await expect.poll(said).toContain('Office is now your default address');
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Edit Office');
    expect(card('Office').textContent).toContain('Default');
    expect(screen.getByRole('button', { name: 'Remove Home' }).elements()).toHaveLength(1);
  });

  test('Add address: the fields say what they are for autofill; what\'s missing is in a summary that takes focus and links to each field; Save adds it', async () => {
    const onSave = vi.fn(() => Promise.resolve('a9'));
    const screen = await render(<AddressBook onSave={onSave} />);
    await screen.getByRole('button', { name: 'Add address' }).click();
    const dialog = screen.getByRole('dialog', { name: 'Add an address' });
    await expect.element(dialog).toBeVisible();
    expect(document.getElementById('address-line1')?.getAttribute('autocomplete')).toBe('shipping address-line1');
    expect(document.getElementById('address-postalCode')?.getAttribute('autocomplete')).toBe('shipping postal-code');
    await dialog.getByRole('textbox', { name: /^Name for this address/ }).fill('Studio');
    await dialog.getByRole('button', { name: 'Save address' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    expect(dialog.getByRole('link').elements().map((e) => e.getAttribute('href'))).toEqual(['#address-name', '#address-line1', '#address-city', '#address-postalCode', '#address-country']);
    expect(document.getElementById('address-name')?.getAttribute('aria-invalid')).toBe('true');
    await dialog.getByRole('link').first().click();
    await expect.poll(() => active().id).toBe('address-name');
    expect(onSave).not.toHaveBeenCalled();
    await dialog.getByRole('textbox', { name: /^Full name/ }).fill('Ana Lima');
    await dialog.getByRole('textbox', { name: /^Street and number/ }).fill(' Jl. Dago 3 ');
    await dialog.getByRole('textbox', { name: /^Town or city/ }).fill('Bandung');
    await dialog.getByRole('textbox', { name: /^Postal code/ }).fill('40135');
    await dialog.getByRole('combobox', { name: /^Country/ }).selectOptions('Indonesia');
    await dialog.getByRole('checkbox', { name: 'Make this my default address' }).click();
    await dialog.getByRole('button', { name: 'Save address' }).click();
    await expect.poll(() => screen.getByRole('dialog').elements()).toHaveLength(0);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ label: 'Studio', line1: 'Jl. Dago 3', country: 'Indonesia' }));
    expect(card('Studio').textContent).toContain('Default');
    await expect.poll(() => active().textContent).toBe('Add address');
  });

  test('a save that fails says so in the dialog and keeps every field', async () => {
    const screen = await render(<AddressBook onSave={() => Promise.reject(new Error('offline'))} />);
    await screen.getByRole('button', { name: 'Edit Office' }).click();
    const dialog = screen.getByRole('dialog', { name: 'Edit Office' });
    await dialog.getByRole('textbox', { name: /^Apartment/ }).fill('Floor 6');
    await dialog.getByRole('button', { name: 'Save address' }).click();
    await expect.poll(alertText).toContain('Couldn’t save the address.');
    expect((document.getElementById('address-line2') as HTMLInputElement).value).toBe('Floor 6');
    expect(card('Office').textContent).toContain('Floor 5');
  });

  test('Remove takes it out with focus on the next Edit, Undo brings it back; onRemove waits for the toast', async () => {
    const onRemove = vi.fn();
    const screen = await render(<AddressBook defaultId="a2" onRemove={onRemove} />);
    await screen.getByRole('button', { name: 'Remove Home' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Edit Office');
    await page.elementLocator(toastOf('Removed Home')).getByRole('button', { name: 'Undo' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Remove Home');
    expect(onRemove).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Remove Home' }).click();
    await page.elementLocator(toastOf('Removed Home')).getByRole('button', { name: 'Dismiss' }).click();
    await expect.poll(() => onRemove.mock.calls).toEqual([['a1']]);
  });

  test('while they load: one placeholder named "Loading addresses"; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<AddressBook loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading addresses']);
    expect(screen.getByRole('button', { name: 'Add address' }).elements()).toHaveLength(0);
    await screen.rerender(<AddressBook loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 3, name: 'Couldn’t load your addresses' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('editing: Cancel and Escape close without saving; a saved edit replaces the address; removing the last puts focus on the heading', async () => {
    const onSave = vi.fn(() => Promise.resolve());
    const screen = await render(<AddressBook addresses={[{ id: 'a1', label: 'Home', name: 'Ana', line1: 'Jl. Braga 12', city: 'Bandung', postalCode: '40111', country: 'Indonesia' }]} onSave={onSave} />);
    await screen.getByRole('button', { name: 'Edit Home' }).click();
    await screen.getByRole('button', { name: 'Cancel' }).click();
    await expect.poll(() => screen.getByRole('dialog').elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Edit Home' }).click();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => screen.getByRole('dialog').elements()).toHaveLength(0);
    expect(onSave).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Edit Home' }).click();
    await screen.getByRole('textbox', { name: /^Phone/ }).fill('+62 812 0000 0000');
    await screen.getByRole('button', { name: 'Save address' }).click();
    await expect.poll(() => screen.getByRole('dialog').elements()).toHaveLength(0);
    expect(card('Home').textContent).toContain('+62 812 0000 0000');
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1', phone: '+62 812 0000 0000' }));
    await screen.getByRole('button', { name: 'Remove Home' }).click();
    await expect.poll(() => active().id).toBe('saved');
    await expect.element(screen.getByRole('heading', { level: 3, name: 'No addresses yet' })).toBeVisible();
  });

  test('counts follow the locale’s digits', async () => {
    await render(<SerupaProvider locale="ar-EG"><AddressBook /></SerupaProvider>);
    expect(document.body.textContent).toContain('Saved addresses (٢)');
  });

  test('the addresses that arrive once loading ends are the ones shown', async () => {
    const screen = await render(<AddressBook loading addresses={[]} />);
    await screen.rerender(<AddressBook />);
    await expect.poll(() => document.querySelectorAll('main li h3').length).toBeGreaterThan(0);
  });
});
