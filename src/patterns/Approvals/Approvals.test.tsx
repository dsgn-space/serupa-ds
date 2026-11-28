import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Approvals, nextAfter } from './Approvals';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/٫/g, '.').replace(/٬/g, ',');
const headings = () => [...document.querySelectorAll('main h3')].map((h) => h.textContent);

// Approvals: requests as articles named by who and what, Approve with Undo and nothing sent until the toast goes,
// Decline asking for a reason, focus on the next request, and Waiting and Decided saying how many they hold.
describe('Patterns/Approvals', () => {
  test('the next request after one is decided', () => {
    expect([nextAfter(['a', 'b', 'c'], 'a'), nextAfter(['a', 'b', 'c'], 'b'), nextAfter(['a', 'b', 'c'], 'c'), nextAfter(['a'], 'a'), nextAfter(['a', 'b'], 'x')]).toEqual(['b', 'c', 'b', null, 'a']);
  });

  test('one main and h1, the skip link first, each request an article with its details, and buttons naming it', async () => {
    const screen = await render(<Approvals />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Approvals']);
    expect(norm(document.body.textContent)).toContain('3 requests are waiting on you.');
    expect(screen.getByRole('article', { name: 'Dewi Lestari: Taxi to the Jakarta client visit' }).elements()).toHaveLength(1);
    expect(norm(screen.getByRole('article', { name: /^Dewi/ }).element().textContent)).toMatch(/Amount.*46[.,]50/);
    expect(norm(screen.getByRole('article', { name: /^Kofi/ }).element().textContent)).toContain('5 working days');
    expect(screen.getByRole('button', { name: 'Approve Lena Vogel: A second monitor for design work' }).elements()).toHaveLength(1);
    expect(norm(document.getElementById('approvals-shown')!.textContent)).toBe('3 waiting');
  });

  test('approving moves it to Decided at once, focuses the next request, and sends it only when the toast goes', async () => {
    const onDecide = vi.fn();
    const screen = await render(<Approvals onDecide={onDecide} />);
    await screen.getByRole('button', { name: /^Approve Dewi/ }).click();
    expect(headings()).toEqual(['Kofi Mensah: Annual leave, 22 to 26 December', 'Lena Vogel: A second monitor for design work']);
    await expect.poll(() => active().textContent).toBe('Kofi Mensah: Annual leave, 22 to 26 December');
    expect(onDecide).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Dismiss' }).click();
    await expect.poll(() => onDecide.mock.calls).toEqual([[{ id: 'r1', approved: true }]]);
    await screen.getByRole('radio', { name: 'Decided' }).click();
    expect(norm(document.getElementById('approvals-shown')!.textContent)).toBe('1 decided');
    expect(norm(screen.getByRole('article', { name: /^Dewi/ }).element().textContent)).toContain('Approved');
  });

  test('a decided request the app then takes out of requests still shows under Decided', async () => {
    const all = [{ id: 'r1', who: 'Dewi Lestari', kind: 'expense' as const, what: 'Taxi', amount: 46.5, asked: '2026-11-14' }, { id: 'r2', who: 'Kofi Mensah', kind: 'leave' as const, what: 'Leave', days: 5, asked: '2026-11-13' }];
    const errors = vi.spyOn(console, 'error');
    const screen = await render(<Approvals requests={all} />);
    await screen.getByRole('button', { name: /^Approve Dewi/ }).click();
    await screen.rerender(<Approvals requests={all.slice(1)} />);
    await screen.getByRole('radio', { name: 'Decided' }).click();
    expect(screen.getByRole('article', { name: /^Dewi/ }).elements()).toHaveLength(1);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  test('Undo puts it back, focused, and sends nothing', async () => {
    const onDecide = vi.fn();
    const screen = await render(<Approvals onDecide={onDecide} />);
    await screen.getByRole('button', { name: /^Approve Lena/ }).click();
    await expect.poll(() => active().textContent).toBe('Kofi Mensah: Annual leave, 22 to 26 December');
    await screen.getByRole('button', { name: 'Undo' }).click();
    await expect.poll(() => active().textContent).toBe('Lena Vogel: A second monitor for design work');
    expect(headings()).toHaveLength(3);
    expect(onDecide).not.toHaveBeenCalled();
  });

  test('declining asks for a reason, says when it is missing, and sends it', async () => {
    const onDecide = vi.fn();
    const screen = await render(<Approvals onDecide={onDecide} />);
    await screen.getByRole('button', { name: /^Decline Kofi/ }).click();
    const dialog = screen.getByRole('dialog', { name: 'Decline Kofi Mensah’s leave?' });
    await expect.element(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Decline' }).click();
    await expect.element(dialog.getByRole('textbox', { name: /Why are you declining it/ })).toHaveAccessibleDescription(/Say why, so Kofi Mensah knows what to change/);
    await dialog.getByRole('textbox').fill('We’re short that week. Could you take the week after?');
    await dialog.getByRole('button', { name: 'Decline' }).click();
    await expect.poll(() => active().textContent).toBe('Lena Vogel: A second monitor for design work');
    await screen.getByRole('button', { name: 'Dismiss' }).click();
    await expect.poll(() => onDecide.mock.calls).toEqual([[{ id: 'r2', approved: false, reason: 'We’re short that week. Could you take the week after?' }]]);
    await screen.getByRole('radio', { name: 'Decided' }).click();
    expect(norm(document.querySelector('main article')!.textContent)).toContain('Your reason: We’re short that week.');
  });

  test('Cancel and Escape close without deciding; the last one decided focuses the list, and nothing waiting says so', async () => {
    const screen = await render(<Approvals requests={[{ id: 'x', who: 'Ana Lima', kind: 'expense', what: 'Lunch', asked: '2026-11-15' }]} />);
    expect(norm(document.body.textContent)).toContain('1 request is waiting on you.');
    await screen.getByRole('button', { name: /^Decline Ana/ }).click();
    await screen.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    expect(headings()).toHaveLength(1);
    await screen.getByRole('button', { name: /^Decline Ana/ }).click();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(0);
    expect(headings()).toHaveLength(1);
    await screen.getByRole('button', { name: /^Approve Ana/ }).click();
    await expect.poll(() => active().id).toBe('approvals-list');
    expect(norm(document.body.textContent)).toContain('You’re all caught up.');
    expect(norm(document.body.textContent)).toContain('Nothing is waiting on you.');
  });

  test('nothing decided yet says so', async () => {
    const screen = await render(<Approvals requests={[]} />);
    await screen.getByRole('radio', { name: 'Decided' }).click();
    expect(norm(document.body.textContent)).toContain('You haven’t decided anything yet.');
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Approvals loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading requests']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<Approvals loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your requests' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
