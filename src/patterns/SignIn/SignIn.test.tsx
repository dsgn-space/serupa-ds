import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SignIn } from './SignIn';
import { SignUp } from '../SignUp/SignUp';
import { PasswordReset } from '../PasswordReset/PasswordReset';

const active = () => document.activeElement as HTMLElement;
const input = (id: string) => document.getElementById(id) as HTMLInputElement;
const describedBy = (id: string) => (input(id).getAttribute('aria-describedby') || '').split(' ').map((d) => document.getElementById(d)?.textContent || '').join(' ');

// Sign in (PT1): the pattern works from the keyboard alone, says each change, and leaves nothing to remember or work out
// beyond the password (WCAG 3.3.8), so a password manager and a phone can fill it in.
describe('Patterns/Sign in', () => {
  test('the page has the frame of the other sign-in pages: the same width, the card a Card, the title the same size', async () => {
    await render(<SignIn />);
    await render(<SignUp />);
    await render(<PasswordReset />);
    const mains = [...document.querySelectorAll('main')];
    const frame = (m: HTMLElement) => {
      const h1 = m.querySelector('h1')!;
      return [getComputedStyle(m).maxWidth, getComputedStyle(h1).fontSize, h1.closest('[data-component="card"]') !== null, getComputedStyle(m.firstElementChild!).marginTop];
    };
    expect(mains).toHaveLength(3);
    expect(frame(mains[0]!)).toEqual(frame(mains[1]!));
    expect(frame(mains[0]!)).toEqual(frame(mains[2]!));
  });

  test('the fields say what they hold, so a password manager and a phone fill them in, and paste is never blocked', async () => {
    await render(<SignIn />);
    // The attributes, which password managers and phones read: Firefox's .autocomplete property was '' for them.
    const ac = (id: string) => input(id).getAttribute('autocomplete');
    expect([ac('sign-in-email'), input('sign-in-email').type, ac('sign-in-password')]).toEqual(['username', 'email', 'current-password']);
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    input('sign-in-password').dispatchEvent(paste);
    expect(paste.defaultPrevented).toBe(false);
    expect(document.querySelector('form')!.querySelector('img, canvas, iframe')).toBe(null);
  });

  test('from the keyboard: the first Tab is the skip link, and a failed try lists each problem, takes focus, and leads to its field', async () => {
    await render(<SignIn />);
    await userEvent.tab();
    expect(active().textContent).toMatch(/skip/i);
    await userEvent.keyboard('{Enter}');
    expect(active().closest('main')).not.toBe(null);
    await userEvent.tab();
    expect(active().id).toBe('sign-in-email');
    await userEvent.keyboard('ada@{Enter}');
    const summary = active();
    expect(summary.getAttribute('data-component')).toBe('error-summary');
    expect([...summary.querySelectorAll('a')].map((a) => a.textContent)).toEqual(['Enter an email address in the right format, like name@example.com', 'Enter your password']);
    expect(describedBy('sign-in-email')).toContain('Enter an email address in the right format');
    expect(input('sign-in-password').getAttribute('aria-invalid')).toBe('true');
    await userEvent.click(summary.querySelectorAll('a')[1]!);
    expect(active().id).toBe('sign-in-password');
  });

  test('a wrong password says so on the password without saying which was wrong, and the right one moves on to the code', async () => {
    await render(<SignIn />);
    await userEvent.type(input('sign-in-email'), 'ada@example.com');
    await userEvent.type(input('sign-in-password'), 'nope');
    await userEvent.keyboard('{Enter}');
    expect(active().textContent).toContain('The email or password is not right');
    await userEvent.clear(input('sign-in-password'));
    await userEvent.type(input('sign-in-password'), 'correct horse{Enter}');
    // The new step's heading takes focus, so a screen reader says where it is and the next Tab goes on from there.
    expect([active().tagName, active().textContent]).toEqual(['H1', 'Enter your sign-in code']);
    expect(input('sign-in-code').getAttribute('autocomplete')).toBe('one-time-code');
  });

  test('the code step: a short or wrong code is said on the field, and the right one ends on the signed-in heading', async () => {
    await render(<SignIn start="code" />);
    await userEvent.click(input('sign-in-code'));
    await userEvent.keyboard('123{Enter}');
    expect(describedBy('sign-in-code')).toContain('Enter the 6-digit code');
    await userEvent.keyboard('999{Enter}');
    expect(describedBy('sign-in-code')).toContain('That code is not right');
    await userEvent.clear(input('sign-in-code'));
    await userEvent.keyboard('123456{Enter}');
    expect([active().tagName, active().textContent]).toEqual(['H1', 'You’re signed in']);
  });

  test('"Send a new code" says on screen and to a screen reader that it went, each time, and clears the code typed so far', async () => {
    const screen = await render(<SignIn start="code" />);
    await userEvent.click(input('sign-in-code'));
    await userEvent.keyboard('12');
    const status = document.querySelector('main [role="status"]')!;
    expect(status.textContent).toBe('');
    await screen.getByRole('button', { name: 'Send a new code' }).click();
    expect([status.textContent, input('sign-in-code').value]).toEqual(['We sent a new code to your phone. It works for 10 minutes.', '']);
    // A second ask adds a new line, so it is said again rather than left unchanged.
    const first = status.firstElementChild;
    await screen.getByRole('button', { name: 'Send a new code' }).click();
    expect([status.childElementCount, status.firstElementChild === first]).toEqual([1, false]);
  });

  test('there is one h1 and one main on every step', async () => {
    for (const start of ['password', 'code', 'done'] as const) {
      const r = await render(<SignIn start={start} />);
      expect([document.querySelectorAll('h1').length, document.querySelectorAll('main').length]).toEqual([1, 1]);
      await r.unmount();
    }
  });
});
