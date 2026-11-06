import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Onboarding, type SetupStep } from './Onboarding';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const KEY = 'serupa-test-onboarding';
const steps: SetupStep[] = [
  { id: 'a', title: 'Add your photo', description: 'So your team knows you.', action: { label: 'Edit your profile', href: '/profile' } },
  { id: 'b', title: 'Invite your team', description: 'Work with people.', action: { label: 'Invite people', href: '/invite' } },
];

afterEach(() => { window.localStorage.removeItem(KEY); });

// Onboarding (PT11): the steps are a list of headings, each tick is said in words, and progress survives a reload.
describe('Patterns/Onboarding', () => {
  test('one main and one h1, headings without a skipped level, and the steps an ordered list', async () => {
    await render(<Onboarding />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    const levels = [...document.querySelectorAll('main h1, main h2, main h3')].map((h) => Number(h.tagName[1]));
    levels.forEach((l, i) => { if (i > 0) expect(l - levels[i - 1]).toBeLessThanOrEqual(1); });
    expect(document.querySelectorAll('main ol > li').length).toBe(4);
    expect(document.querySelectorAll('main ol > li h3').length).toBe(4);
    expect(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe('0 of 4 steps done');
  });

  test('every step links to where it is done', async () => {
    const screen = await render(<Onboarding steps={steps} />);
    await expect.element(screen.getByRole('link', { name: 'Edit your profile' })).toHaveAttribute('href', '/profile');
    await expect.element(screen.getByRole('link', { name: 'Invite people' })).toHaveAttribute('href', '/invite');
  });

  test('ticking a step by keyboard says the new count, marks it "Done" in words, and reports the state', async () => {
    const onChange = vi.fn();
    const screen = await render(<Onboarding steps={steps} onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Mark “Add your photo” as done' });
    (box.element() as HTMLElement).focus();
    await userEvent.keyboard(' ');
    await expect.element(box).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith({ done: ['a'], hidden: false });
    await vi.waitFor(() => expect(said()).toContain('1 of 2 steps done'));
    expect(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe('1 of 2 steps done');
    expect(document.querySelector('main ol > li')!.textContent).toContain('Done');
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith({ done: [], hidden: false });
  });

  test('the last tick says "You\'re all set" and shows the way on', async () => {
    const screen = await render(<Onboarding steps={steps} initial={{ done: ['a'] }} dashboardHref="/home" />);
    await screen.getByRole('checkbox', { name: 'Mark “Invite your team” as done' }).click();
    await vi.waitFor(() => expect(said()).toContain("2 of 2 steps done. You're all set."));
    await expect.element(screen.getByRole('heading', { name: "You're all set", level: 3 })).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Go to your dashboard' })).toHaveAttribute('href', '/home');
  });

  test('progress is kept under saveKey: a remount picks up where it was, and unknown ids are dropped', async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ done: ['b', 'gone'] }));
    const first = await render(<Onboarding steps={steps} saveKey={KEY} />);
    await expect.element(first.getByRole('checkbox', { name: 'Mark “Invite your team” as done' })).toBeChecked();
    await first.getByRole('checkbox', { name: 'Mark “Add your photo” as done' }).click();
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toEqual({ done: ['a', 'b'], hidden: false });
    await first.unmount();
    window.localStorage.setItem(KEY, 'not json');
    const second = await render(<Onboarding steps={steps} saveKey={KEY} initial={{ done: ['a'] }} />);
    await expect.element(second.getByRole('checkbox', { name: 'Mark “Add your photo” as done' })).toBeChecked();
  });

  test('a storage that throws is ignored', async () => {
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
    const screen = await render(<Onboarding steps={steps} saveKey={KEY} />);
    await screen.getByRole('checkbox', { name: 'Mark “Add your photo” as done' }).click();
    await expect.element(screen.getByRole('checkbox', { name: 'Mark “Add your photo” as done' })).toBeChecked();
    set.mockRestore();
  });

  test('hiding the checklist moves focus to "Show the checklist", and showing it moves focus to its heading', async () => {
    const screen = await render(<Onboarding steps={steps} initial={{ done: ['a'] }} />);
    await screen.getByRole('button', { name: 'Hide the checklist' }).click();
    await vi.waitFor(() => expect(active().textContent).toBe('Show the checklist'));
    await expect.element(screen.getByRole('heading', { name: 'Set up your workspace: 1 of 2 steps done', level: 2 })).toBeVisible();
    expect(document.querySelector('main ol')).toBeNull();
    await userEvent.keyboard('{Enter}');
    await vi.waitFor(() => expect(active().tagName).toBe('H2'));
    expect(active().textContent).toBe('Set up your workspace');
  });

  test('the skip link is first and leads into main', async () => {
    await render(<Onboarding steps={steps} />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });
});
