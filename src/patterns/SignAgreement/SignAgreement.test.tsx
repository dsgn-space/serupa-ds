import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SignAgreement, signProblems } from './SignAgreement';

const active = () => document.activeElement as HTMLElement;
const typed = { method: 'type' as const, svg: '<svg/>', name: 'Ana Lima' };

// Sign agreement: the agreement in a named, scrollable region; a box to tick and a signature, drawn or typed; what's
// missing in a summary; and the answer's heading taking focus once signed.
describe('Patterns/Sign agreement', () => {
  test('what is missing before signing, in the order of the fields', () => {
    expect(signProblems(true, typed)).toEqual([]);
    expect(signProblems(false, null).map((p) => p.field)).toEqual(['sign-agree', 'sign-signature']);
  });

  test('one main and h1, the skip link first, and the agreement in a region the keyboard can reach and scroll', async () => {
    const screen = await render(<SignAgreement />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Design work agreement']);
    const terms = screen.getByRole('region', { name: 'Design work agreement' });
    await expect.element(terms).toBeVisible();
    await expect.poll(() => terms.element().getAttribute('tabindex')).toBe('0');
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('signing with nothing filled in focuses a summary that links to each field, and nothing is sent', async () => {
    const onSign = vi.fn();
    const screen = await render(<SignAgreement onSign={onSign} />);
    await screen.getByRole('button', { name: 'Sign the agreement' }).click();
    await expect.poll(() => active().textContent).toMatch(/problem/i);
    expect(screen.getByRole('link', { name: 'Tick the box to say you agree.' }).elements()).toHaveLength(1);
    expect(onSign).not.toHaveBeenCalled();
    // Fixing a field takes its problem away at once, from the field and the summary.
    const problem = (text: string) => [...document.querySelectorAll('main a')].some((l) => l.textContent === text);
    expect(problem('Tick the box to say you agree.')).toBe(true);
    await screen.getByRole('checkbox', { name: /I’ve read the agreement/ }).click();
    await expect.poll(() => problem('Tick the box to say you agree.')).toBe(false);
    await screen.getByRole('radio', { name: 'Type' }).click();
    await screen.getByRole('textbox', { name: /Full name/ }).fill('Ana Lima');
    await expect.poll(() => problem('Sign: draw your signature, or choose Type and type your name.')).toBe(false);
  });

  test('after a failed sign, typing a name keeps focus in the field: fixing one problem doesn\'t send focus to the summary', async () => {
    const screen = await render(<SignAgreement />);
    await screen.getByRole('button', { name: 'Sign the agreement' }).click();
    await expect.poll(() => active().textContent).toMatch(/problem/i);
    await screen.getByRole('radio', { name: 'Type' }).click();
    const name = screen.getByRole('textbox', { name: /Full name/ }).element() as HTMLInputElement;
    name.focus();
    await userEvent.keyboard('Ana');
    expect([name.value, active()]).toEqual(['Ana', name]);
  });

  test('ticking the box and typing a name signs; a send that fails says so and keeps both; then the answer takes focus', async () => {
    const onSign = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<SignAgreement onSign={onSign} />);
    await screen.getByRole('checkbox', { name: /I’ve read the agreement/ }).click();
    await screen.getByRole('radio', { name: 'Type' }).click();
    await screen.getByRole('textbox', { name: /Full name/ }).fill('Ana Lima');
    await screen.getByRole('button', { name: 'Sign the agreement' }).click();
    await expect.element(screen.getByText('Couldn’t send your signature. Try again; nothing is lost.')).toBeVisible();
    await expect.element(screen.getByRole('checkbox', { name: /I’ve read the agreement/ })).toBeChecked();
    await screen.getByRole('button', { name: 'Sign the agreement' }).click();
    await expect.poll(() => active().textContent).toBe('Signed');
    expect(onSign).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'type', name: 'Ana Lima' }));
  });
});
