import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { ContactForm, contactProblems, type ContactMessage } from './ContactForm';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const described = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
const good: ContactMessage = { name: 'Ana', email: 'ana@example.com', topic: 'account/email', order: '', message: 'I can’t change my email address.', copy: false };

// Contact form: what each field is for, a summary of what's missing that takes focus and links to each field, the
// order number asked for only for an order, and an answer whose heading takes focus once sent.
// Picks a topic's path in the CascadeSelect: opens it, then each step by its name.
const pick = async (...steps: string[]) => {
  await page.getByRole('combobox', { name: /^What’s it about/ }).click();
  for (const step of steps) await page.getByRole('option', { name: step, exact: true }).click();
  await expect.poll(() => document.getElementById('contact-topic')?.getAttribute('aria-expanded')).toBe('false');
};

describe('Patterns/Contact form', () => {
  test('what\'s wrong with a message', () => {
    expect(contactProblems(good)).toEqual({});
    expect(Object.keys(contactProblems({ ...good, name: '', email: '', topic: '', message: '' }))).toEqual(['name', 'email', 'topic', 'message']);
    expect(contactProblems({ ...good, email: 'ana' }).email).toBe('Enter an email address like name@example.com.');
    expect(contactProblems({ ...good, message: 'Hi' }).message).toBe('Tell us a little more: at least 10 characters.');
    expect(contactProblems({ ...good, message: 'x'.repeat(1001) }).message).toBe('Shorten your message to 1000 characters.');
    expect(contactProblems({ ...good, topic: 'order/late', order: '' })).toEqual({});
    expect(contactProblems({ ...good, topic: 'order/late', order: 'A-10432' })).toEqual({});
    expect(contactProblems({ ...good, topic: 'order/wrong', order: '10432' }).order).toBe('Enter the order number as it is on your receipt, like A-10432.');
  });

  test('one main and h1, the skip link first, fields for autofill, and the order number only for an order', async () => {
    await render(<ContactForm />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Contact us']);
    expect(document.getElementById('contact-name')?.getAttribute('autocomplete')).toBe('name');
    expect(document.getElementById('contact-email')?.getAttribute('autocomplete')).toBe('email');
    expect(document.getElementById('contact-order')).toBeNull();
    await pick('An order', 'It hasn’t arrived');
    await expect.poll(() => document.getElementById('contact-order')).not.toBeNull();
    expect(described(document.getElementById('contact-order')!)).toContain('like A-10432');
  });

  test('Send with problems: a summary takes focus, each problem links to its field, and each field says its own', async () => {
    const onSend = vi.fn();
    const screen = await render(<ContactForm onSend={onSend} />);
    await screen.getByRole('textbox', { name: /^Email/ }).fill('ana');
    await screen.getByRole('button', { name: 'Send message' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    expect(screen.getByRole('link', { name: /^Enter|^Choose/ }).elements().map((e) => e.getAttribute('href'))).toEqual(['#contact-name', '#contact-email', '#contact-topic', '#contact-message']);
    expect(described(document.getElementById('contact-email')!)).toContain('Enter an email address like name@example.com.');
    expect(document.getElementById('contact-topic')?.getAttribute('aria-invalid')).toBe('true');
    await screen.getByRole('link', { name: 'Choose what it’s about.' }).click();
    await expect.poll(() => active().id).toBe('contact-topic');
    expect(onSend).not.toHaveBeenCalled();
  });

  test('Send sends the message trimmed, and the answer\'s heading takes focus with the reference', async () => {
    const onSend = vi.fn(() => Promise.resolve('CF-2041'));
    const screen = await render(<ContactForm onSend={onSend} />);
    await screen.getByRole('textbox', { name: /^Name/ }).fill(' Ana Lima ');
    await screen.getByRole('textbox', { name: /^Email/ }).fill('ana@example.com');
    await pick('An order', 'It hasn’t arrived');
    await screen.getByRole('textbox', { name: /^Order number/ }).fill('a-10432');
    await screen.getByRole('textbox', { name: /^Message/ }).fill('My parcel hasn’t arrived yet.');
    await screen.getByRole('checkbox', { name: 'Send me a copy' }).click();
    await screen.getByRole('button', { name: 'Send message' }).click();
    await expect.poll(() => active().textContent).toBe('Message sent');
    expect(onSend).toHaveBeenCalledWith({ name: 'Ana Lima', email: 'ana@example.com', topic: 'order/late', order: 'A-10432', message: 'My parcel hasn’t arrived yet.', copy: true });
    expect(document.body.textContent).toContain('Your reference is CF-2041.');
    expect(document.body.textContent).toContain('A copy of your message is on its way there too.');
  });

  test('a message that can\'t be sent says so next to Send and keeps every field', async () => {
    const screen = await render(<ContactForm onSend={() => Promise.reject(new Error('offline'))} />);
    await screen.getByRole('textbox', { name: /^Name/ }).fill('Ana');
    await screen.getByRole('textbox', { name: /^Email/ }).fill('ana@example.com');
    await pick('Something else');
    await screen.getByRole('textbox', { name: /^Message/ }).fill('A question about gift cards.');
    await screen.getByRole('button', { name: 'Send message' }).click();
    await expect.poll(alertText).toContain('Couldn’t send your message.');
    expect((document.getElementById('contact-message') as HTMLTextAreaElement).value).toBe('A question about gift cards.');
  });
});
