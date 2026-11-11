import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { ConsentBanner } from './ConsentBanner';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const KEY = 'serupa-test-consent';
const banner = () => document.querySelector('section[aria-labelledby="consent-title"]');

afterEach(() => { window.localStorage.removeItem(KEY); });

// Consent banner (PT13): in the flow, not over the page; accept and reject alike; no trap; changeable later.
describe('Patterns/Consent banner', () => {
  test('one main and one h1, and the banner is a named region in the flow, before the page, never over it', async () => {
    await render(<ConsentBanner />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    const region = banner() as HTMLElement;
    expect(region.getAttribute('role') ?? 'region').toBe('region');
    expect(['static', 'relative']).toContain(getComputedStyle(region).position);
    expect(region.compareDocumentPosition(document.querySelector('main')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('accept and reject are the same kind of button, the same size, side by side', async () => {
    const screen = await render(<ConsentBanner />);
    const accept = screen.getByRole('button', { name: 'Accept analytics cookies' }).element() as HTMLElement;
    const reject = screen.getByRole('button', { name: 'Reject analytics cookies' }).element() as HTMLElement;
    expect(reject.className).toBe(accept.className);
    expect(Math.abs(accept.getBoundingClientRect().height - reject.getBoundingClientRect().height)).toBeLessThan(1);
    expect(getComputedStyle(reject).backgroundColor).toBe(getComputedStyle(accept).backgroundColor);
  });

  test('it traps nothing: Tab goes through the banner and on into the page', async () => {
    await render(<ConsentBanner />);
    const stops: string[] = [];
    for (let i = 0; i < 6; i++) { await userEvent.tab(); stops.push(active().textContent || ''); }
    expect(stops.slice(1, 4)).toEqual(['Accept analytics cookies', 'Reject analytics cookies', 'Choose your cookies']);
    expect(stops[4]).toBe('Shop the range');
  });

  test('an answer is kept, said in the banner with focus on it, and "Hide this message" moves focus to main', async () => {
    const onChange = vi.fn();
    const screen = await render(<ConsentBanner saveKey={KEY} onChange={onChange} />);
    await screen.getByRole('button', { name: 'Reject analytics cookies' }).click();
    expect(onChange).toHaveBeenCalledWith('rejected');
    expect(window.localStorage.getItem(KEY)).toBe('rejected');
    await vi.waitFor(() => expect(active().textContent).toContain('You’ve rejected analytics cookies.'));
    await expect.element(screen.getByRole('radio', { name: 'No, don’t use analytics cookies' })).toBeChecked();
    await screen.getByRole('button', { name: 'Hide this message' }).click();
    expect(banner()).toBeNull();
    expect(active().id).toBe('main');
  });

  test('accepting says so too', async () => {
    const screen = await render(<ConsentBanner />);
    await screen.getByRole('button', { name: 'Accept analytics cookies' }).click();
    await vi.waitFor(() => expect(active().textContent).toContain('You’ve accepted analytics cookies.'));
  });

  test('a saved answer means no banner, and the settings show it', async () => {
    window.localStorage.setItem(KEY, 'accepted');
    const screen = await render(<ConsentBanner saveKey={KEY} initial="rejected" />);
    expect(banner()).toBeNull();
    await expect.element(screen.getByRole('radio', { name: 'Yes, use analytics cookies' })).toBeChecked();
  });

  test('the answer can be changed later in the settings, which says it was saved and closes the question', async () => {
    const onChange = vi.fn();
    const screen = await render(<ConsentBanner onChange={onChange} />);
    await expect.element(screen.getByRole('link', { name: 'Cookie settings' })).toHaveAttribute('href', '#cookie-settings');
    await screen.getByRole('radio', { name: 'Yes, use analytics cookies' }).click();
    await screen.getByRole('button', { name: 'Save cookie settings' }).click();
    expect(onChange).toHaveBeenLastCalledWith('accepted');
    await vi.waitFor(() => expect(said()).toContain('Your cookie settings were saved. You’ve accepted analytics cookies.'));
    expect(banner()).toBeNull();
  });

  test('saving the settings while the message shows keeps the message', async () => {
    const screen = await render(<ConsentBanner initial={null} />);
    await screen.getByRole('button', { name: 'Accept analytics cookies' }).click();
    await screen.getByRole('radio', { name: 'No, don’t use analytics cookies' }).click();
    await screen.getByRole('button', { name: 'Save cookie settings' }).click();
    await vi.waitFor(() => expect(banner()?.textContent).toContain('You’ve rejected analytics cookies.'));
  });

  test('a storage that throws is ignored', async () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
    const screen = await render(<ConsentBanner saveKey={KEY} />);
    await screen.getByRole('button', { name: 'Accept analytics cookies' }).click();
    await vi.waitFor(() => expect(active().textContent).toContain('You’ve accepted'));
    get.mockRestore();
    set.mockRestore();
  });
});
