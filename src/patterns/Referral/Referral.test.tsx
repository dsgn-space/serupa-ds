import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Referral, addressesIn, referralProblem } from './Referral';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const described = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const rows = () => [...document.querySelectorAll('main tbody tr')].map((r) => r.querySelector('td')?.textContent);

// Invite friends: the rules in a sentence, the link in a labelled read-only field with Copy, bad or repeated addresses
// named before sending, and who was invited in a table with where each is in words.
describe('Patterns/Referral', () => {
  test('reading addresses, and what\'s wrong with them', () => {
    expect(addressesIn(' A@x.com, b@y.org;\nb@y.org ')).toEqual(['a@x.com', 'b@y.org']);
    expect(referralProblem([], [])).toBe('Enter at least one email address.');
    expect(referralProblem(['a@x.com', 'nope'], [])).toBe('This isn’t an email address: nope.');
    expect(referralProblem(['a@x.com'], ['a@x.com'])).toBe('Already invited: a@x.com.');
    expect(referralProblem(['a@x.com'], [])).toBeNull();
  });

  test('one main and h1, the skip link first, the rules said, the link labelled with Copy, the invites a table', async () => {
    const screen = await render(<Referral />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Invite friends']);
    expect(document.body.textContent).toMatch(/A friend gets .+ off their first order, and you get .+ in credit once it ships\./);
    const link = screen.getByRole('textbox', { name: 'Your invite link' }).element() as HTMLInputElement;
    expect([link.readOnly, link.value]).toEqual([true, 'https://acme.example/r/ana-7k2']);
    expect(screen.getByRole('button', { name: 'Copy link' }).elements()).toHaveLength(1);
    // Copy is the field's height (its frame), so the pair reads as one control row.
    const copy = screen.getByRole('button', { name: 'Copy link' }).element();
    expect(Math.round(copy.getBoundingClientRect().height)).toBe(Math.round(link.parentElement!.getBoundingClientRect().height));   // the field's frame, around the input
    expect(screen.getByRole('table', { name: 'Friends you’ve invited, newest first' }).elements()).toHaveLength(1);
    expect(document.querySelector('main tbody tr')?.textContent).toMatch(/Earned you/);
  });

  test('a bad or repeated address is named next to the box, with focus there, before anything is sent', async () => {
    const onInvite = vi.fn();
    const screen = await render(<Referral onInvite={onInvite} />);
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.poll(() => active().id).toBe('referral-emails');
    expect(described(active())).toContain('Enter at least one email address.');
    await screen.getByRole('textbox', { name: /^Or invite by email/ }).fill('fajar@example.com, dewi@example.com');
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.poll(() => described(active())).toContain('Already invited: dewi@example.com.');
    expect(onInvite).not.toHaveBeenCalled();
  });

  test('Send invites sends them, adds them to the table first, and a toast says so', async () => {
    const onInvite = vi.fn(() => Promise.resolve());
    const screen = await render(<Referral onInvite={onInvite} />);
    await screen.getByRole('textbox', { name: /^Or invite by email/ }).fill('Fajar@example.com\ngita@example.com');
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.poll(rows).toEqual(['fajar@example.com', 'gita@example.com', 'chen@example.com', 'dewi@example.com', 'eko@example.com']);
    expect(onInvite).toHaveBeenCalledWith(['fajar@example.com', 'gita@example.com']);
    expect((document.getElementById('referral-emails') as HTMLTextAreaElement).value).toBe('');
    await expect.poll(() => toasted('invites sent')).toBe(true);
  });

  test('a send that fails says so next to the button and keeps the addresses', async () => {
    const screen = await render(<Referral referrals={[]} onInvite={() => Promise.reject(new Error('offline'))} />);
    expect(document.body.textContent).toContain('Nobody yet.');
    await screen.getByRole('textbox', { name: /^Or invite by email/ }).fill('fajar@example.com');
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.poll(alertText).toContain('Couldn’t send the invites.');
    expect((document.getElementById('referral-emails') as HTMLTextAreaElement).value).toBe('fajar@example.com');
  });

  test('focusing the link selects all of it, ready to copy by hand', async () => {
    const screen = await render(<Referral />);
    const link = screen.getByRole('textbox', { name: 'Your invite link' }).element() as HTMLInputElement;
    await userEvent.click(link);
    await expect.poll(() => [link.selectionStart, link.selectionEnd]).toEqual([0, link.value.length]);
    // Safari puts the caret where the press lands on the mouseup after focus, undoing the select-all: the page passes
    // that one mouseup over, and only that one, so a later click still places the caret.
    const up = () => { const e = new MouseEvent('mouseup', { bubbles: true, cancelable: true }); link.dispatchEvent(e); return e.defaultPrevented; };
    link.blur();
    link.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    link.focus();
    expect([up(), up()]).toEqual([true, false]);
  });
});

// How many lines an element's text takes on screen.
const linesOf = (el: Element) => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size; };

describe('Referral on a phone', () => {
  test('on a phone, each invite’s date stays on one line', async () => {
    await page.viewport(360, 720);
    try {
      await render(<Referral />);
      for (const t of document.querySelectorAll('td time')) expect(linesOf(t), t.textContent ?? '').toBe(1);
    } finally { await page.viewport(900, 700); }
  });
});
