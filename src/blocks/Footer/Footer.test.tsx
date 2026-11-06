import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Footer, type FooterLinkGroup } from './Footer';

const groups: FooterLinkGroup[] = [
  { title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Changelog', href: '/changelog' }] },
  { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Careers', href: '/careers' }] },
];
const languages = [{ value: 'en', label: 'English' }, { value: 'id', label: 'Bahasa Indonesia' }];

// Footer (BL10): the contentinfo landmark, each link group a navigation landmark named by its heading, a language
// picker that waits for Change, a theme picker that applies at once, and the legal line.
describe('Blocks/Footer', () => {
  test('a contentinfo landmark with each link group as navigation named by its heading', async () => {
    await render(<Footer groups={groups} legal="© 2026 Acme, Inc." />);
    await expect.element(page.getByRole('contentinfo')).toBeVisible();
    const product = page.getByRole('navigation', { name: 'Product' });
    await expect.element(product).toBeVisible();
    await expect.element(page.getByRole('navigation', { name: 'Company' })).toBeVisible();
    expect(product.getByRole('link').elements().map((a) => a.getAttribute('href'))).toEqual(['/pricing', '/changelog']);
    await expect.element(page.getByRole('heading', { level: 2, name: 'Product' })).toBeVisible();
    expect(document.querySelector('footer')!.textContent).toContain('© 2026 Acme, Inc.');
    expect(page.getByRole('combobox').elements()).toHaveLength(0);   // no pickers unless the app handles them
  });

  test('each language is written in itself, and picking one changes nothing until Change is pressed', async () => {
    const onLanguageChange = vi.fn();
    await render(<Footer groups={groups} legal="©" languages={languages} language="en" onLanguageChange={onLanguageChange} />);
    const select = page.getByRole('combobox', { name: 'Language' });
    expect(select.element().querySelector('option[value="id"]')!.getAttribute('lang')).toBe('id');
    await userEvent.selectOptions(select, 'id');
    expect(onLanguageChange).not.toHaveBeenCalled();
    await userEvent.click(page.getByRole('button', { name: 'Change' }));
    expect(onLanguageChange).toHaveBeenCalledWith('id');
  });

  test('the theme applies as soon as it is picked', async () => {
    const onThemeChange = vi.fn();
    await render(<Footer groups={groups} legal="©" theme="system" onThemeChange={onThemeChange} />);
    const select = page.getByRole('combobox', { name: 'Theme' });
    await expect.element(select).toHaveValue('system');
    await userEvent.selectOptions(select, 'dark');
    expect(onThemeChange).toHaveBeenCalledWith('dark');
  });

  test('every word can be given in the page language', async () => {
    await render(<Footer groups={[{ title: 'Produk', links: [{ label: 'Harga', href: '/harga' }] }]} legal="© 2026 Acme" headingLevel={3}
      languages={languages} language="id" onLanguageChange={() => {}} onThemeChange={() => {}}
      labels={{ language: 'Bahasa', changeLanguage: 'Ganti', theme: 'Tema', system: 'Ikuti perangkat', light: 'Terang', dark: 'Gelap' }} />);
    await expect.element(page.getByRole('navigation', { name: 'Produk' })).toBeVisible();
    await expect.element(page.getByRole('heading', { level: 3, name: 'Produk' })).toBeVisible();
    await expect.element(page.getByRole('combobox', { name: 'Bahasa' })).toHaveValue('id');
    await expect.element(page.getByRole('button', { name: 'Ganti' })).toBeVisible();
    expect(page.getByRole('combobox', { name: 'Tema' }).element().textContent).toBe('Ikuti perangkatTerangGelap');
  });
});
