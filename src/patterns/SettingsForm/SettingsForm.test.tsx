import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SettingsForm, profileProblems } from './SettingsForm';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[aria-live="polite"],[role="status"]')].map((e) => e.textContent || '').join(' ');

// Settings form (PT3): each section saves alone, says what's wrong with links to the fields, says when it's saved,
// and asks before unsaved changes are lost.
describe('Patterns/Settings form', () => {
  test('the profile rules, in the order of the fields', () => {
    expect(profileProblems({ name: ' ', email: 'ada', bio: 'x'.repeat(161), timeZone: '' }).map((e) => e.field))
      .toEqual(['profile-name', 'profile-email', 'profile-bio']);
    expect(profileProblems({ name: 'Ada', email: 'ada@example.com', bio: '', timeZone: '' })).toEqual([]);
  });

  test('one main and one h1, the skip link first, and a named region per section', async () => {
    const screen = await render(<SettingsForm />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    await expect.element(screen.getByRole('region', { name: 'Profile' })).toBeVisible();
    await expect.element(screen.getByRole('region', { name: 'Notifications' })).toBeVisible();
    await expect.element(screen.getByRole('switch', { name: 'Comments' })).toBeChecked();
  });

  test('a Save with problems focuses a summary that links to each field, and the fields say what to write', async () => {
    const onSave = vi.fn();
    const screen = await render(<SettingsForm onSave={onSave} />);
    await userEvent.fill(screen.getByLabelText('Name', { exact: false }), '');
    await userEvent.fill(screen.getByLabelText('Email', { exact: false }), 'ada');
    await screen.getByRole('button', { name: 'Save profile' }).click();
    await vi.waitFor(() => expect(active().textContent).toContain('Enter your name'));
    const links = [...active().querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(['#profile-name', '#profile-email']);
    await expect.element(screen.getByLabelText('Email', { exact: false })).toHaveAttribute('aria-invalid', 'true');
    expect(onSave).not.toHaveBeenCalled();
    // A second try with the same problems takes focus again, so it's read again.
    (screen.getByLabelText('Name', { exact: false }).element() as HTMLElement).focus();
    await screen.getByRole('button', { name: 'Save profile' }).click();
    await vi.waitFor(() => expect(active().textContent).toContain('Enter your name'));
  });

  test('each section saves alone and says "Saved"; changing it again clears that', async () => {
    const onSave = vi.fn();
    const screen = await render(<SettingsForm onSave={onSave} />);
    await userEvent.selectOptions(screen.getByLabelText('Time zone', { exact: false }), 'Asia/Jakarta');
    await screen.getByRole('switch', { name: 'Product news' }).click();
    await screen.getByRole('button', { name: 'Save notifications' }).click();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('notifications', { comments: true, summary: true, news: true });
    await vi.waitFor(() => expect(said()).toContain('Saved'));
    await screen.getByRole('switch', { name: 'Weekly summary' }).click();
    await userEvent.fill(screen.getByLabelText('Bio', { exact: false }), 'Writes the first programs.');
    await screen.getByRole('button', { name: 'Save profile' }).click();
    expect(onSave).toHaveBeenLastCalledWith('profile', { name: 'Ada Lovelace', email: 'ada@example.com', bio: 'Writes the first programs.', timeZone: 'Asia/Jakarta' });
  });

  test('a failed save says so with Try again, and keeps the change', async () => {
    let fail = true;
    const onSave = vi.fn(() => (fail ? Promise.reject(new Error('offline')) : Promise.resolve()));
    const screen = await render(<SettingsForm onSave={onSave} />);
    await screen.getByRole('switch', { name: 'Comments' }).click();
    await screen.getByRole('button', { name: 'Save notifications' }).click();
    await expect.element(screen.getByRole('button', { name: 'Try again' })).toBeVisible();
    await expect.element(screen.getByRole('switch', { name: 'Comments' })).not.toBeChecked();
    fail = false;
    await screen.getByRole('button', { name: 'Try again' }).click();
    await vi.waitFor(() => expect(said()).toContain('Saved'));
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  test('leaving with unsaved changes asks first; Keep editing stays, Discard leaves; nothing unsaved leaves at once', async () => {
    const onLeave = vi.fn();
    const screen = await render(<SettingsForm onLeave={onLeave} />);
    await screen.getByRole('link', { name: 'Back to the dashboard' }).click();
    await vi.waitFor(() => expect(onLeave).toHaveBeenCalledTimes(1));
    await screen.getByRole('switch', { name: 'Product news' }).click();
    await screen.getByRole('link', { name: 'Back to the dashboard' }).click();
    await expect.element(screen.getByRole('alertdialog', { name: /Discard/ })).toBeVisible();
    await screen.getByRole('button', { name: 'Keep editing' }).click();
    expect(onLeave).toHaveBeenCalledTimes(1);
    await screen.getByRole('link', { name: 'Back to the dashboard' }).click();
    await screen.getByRole('button', { name: 'Discard' }).click();
    await vi.waitFor(() => expect(onLeave).toHaveBeenCalledTimes(2));
  });

  test('loading: the page and its sections are there, busy, named once; the form then starts from the settings that came in', async () => {
    const screen = await render(<SettingsForm loading />);
    expect(document.querySelector('main')!.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('heading', { level: 2 }).elements().map((h) => h.textContent)).toEqual(['Profile', 'Notifications']);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading settings']);
    expect(screen.getByRole('textbox').elements()).toHaveLength(0);
    const initial = { profile: { name: 'Budi Santoso', email: 'budi@example.com', bio: '', timeZone: 'Asia/Jakarta' }, notifications: { comments: true, summary: false, news: false } };
    await screen.rerender(<SettingsForm initial={initial} />);
    await expect.element(screen.getByRole('textbox', { name: /^Name/ })).toHaveValue('Budi Santoso');
    expect(document.querySelector('main')!.hasAttribute('aria-busy')).toBe(false);
  });
});
