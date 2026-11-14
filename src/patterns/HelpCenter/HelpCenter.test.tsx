import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { HelpCenter, messageProblems } from './HelpCenter';

// A field's own error text, not the copy the polite live region may be saying at the same moment (announce.ts): both
// match getByText, and a locator that finds two fails.
const own = (text: string) => page.getByText(text).elements().filter((e) => !e.closest('[data-dk-announcer], [data-dk-announcer-assertive]'));
const shown = (text: string) => own(text).filter((e) => e.checkVisibility()).length;
const active = () => document.activeElement as HTMLElement;

// Help center: topics as named links, the FAQ, and a message form that names what's missing, survives a failed send
// and says what happens next.
describe('Patterns/Help center', () => {
  test('a message needs a topic and some words, in the order of the form', () => {
    expect(messageProblems({ topic: '', message: '  ' }).map((p) => p.field)).toEqual(['topic', 'message']);
    expect(messageProblems({ topic: 'Billing', message: 'Charged twice' })).toEqual([]);
  });

  test('one main and h1, topics linked by their titles, the questions, and the form last, saying who answers and when', async () => {
    const screen = await render(<HelpCenter email="budi@example.com" replyTime="within two hours" />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Help']);
    // The page's title is set off from what's under it by the page header's line, as on the other app pages.
    const ruled = (e: Element | null): boolean => !!e && e.tagName !== 'MAIN' && (getComputedStyle(e).borderBottomWidth !== '0px' || ruled(e.parentElement));
    expect(ruled(document.querySelector('h1'))).toBe(true);
    // The app pages' frame: the header on the surface, over a page a step darker, as on the other app pages.
    const bg = (e: Element | null) => getComputedStyle(e!).backgroundColor;
    expect(bg(document.querySelector('header'))).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg(document.querySelector('header'))).not.toBe(bg(document.querySelector('header')!.parentElement));
    await expect.element(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute('href', '#help-billing');
    expect(screen.getByRole('heading', { level: 3 }).elements().map((h) => h.textContent).slice(0, 4))
      .toEqual(['Getting started', 'Your account', 'Billing', 'Your data']);
    await expect.element(screen.getByRole('button', { name: 'How do I cancel my plan?' })).toBeVisible();
    const h2s = screen.getByRole('heading', { level: 2 }).elements().map((h) => h.textContent);
    expect(h2s.at(-1)).toBe('Write to us');
    expect(document.querySelector('#contact')!.textContent).toContain('answers within two hours, by email to budi@example.com');
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('Send names what\'s missing and focuses it; a fixed problem goes at once', async () => {
    const onSend = vi.fn();
    const screen = await render(<HelpCenter onSend={onSend} />);
    await screen.getByRole('button', { name: 'Send' }).click();
    await expect.poll(() => shown('Choose what your message is about.')).toBe(1);
    await expect.poll(() => shown('Write what happened, or what you’re trying to do.')).toBe(1);
    expect(active().id).toBe('help-topic');
    await screen.getByRole('combobox', { name: /^What is it about/ }).selectOptions('Billing');
    expect(own('Choose what your message is about.')).toHaveLength(0);
    await expect.poll(() => shown('Write what happened, or what you’re trying to do.')).toBe(1);
    expect(onSend).not.toHaveBeenCalled();
  });

  test('a send that fails says so and keeps every word; trying again sends it and says what happens next', async () => {
    let fail = true;
    const onSend = vi.fn(() => (fail ? Promise.reject(new Error('offline')) : Promise.resolve()));
    const screen = await render(<HelpCenter onSend={onSend} />);
    await screen.getByRole('combobox', { name: /^What is it about/ }).selectOptions('Billing');
    await screen.getByRole('textbox', { name: /^Your message/ }).fill('I was charged twice.');
    await screen.getByRole('button', { name: 'Send' }).click();
    await expect.element(screen.getByText(/^Couldn’t send your message./)).toBeVisible();
    await expect.element(screen.getByRole('textbox', { name: /^Your message/ })).toHaveValue('I was charged twice.');
    fail = false;
    await screen.getByRole('button', { name: 'Send' }).click();
    await expect.poll(() => active().textContent).toBe('We got your message');
    expect(onSend.mock.calls.at(-1)).toEqual([{ topic: 'Billing', message: 'I was charged twice.' }]);
    expect(screen.getByRole('textbox', { name: /^Your message/ }).elements()).toHaveLength(0);
  });
});
