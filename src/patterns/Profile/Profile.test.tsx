import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Profile, profileChanged, profileProblems, type ProfileInfo } from './Profile';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const me: ProfileInfo = { name: 'Ana Lima', bio: 'Designer.', location: 'Bandung', website: 'https://ana.example.com', photo: '' };
// A real one-pixel PNG, so the preview loads.
const png = () => new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='), (c) => c.charCodeAt(0))], 'me.png', { type: 'image/png' });

// Profile: one form saved when you say so, what's wrong said next to its field, where the save has got to said in a
// status, and Discard changes putting back what was saved.
describe('Patterns/Profile', () => {
  test('what\'s wrong with a profile, and whether it changed', () => {
    expect(profileProblems(me)).toEqual({});
    expect(profileProblems({ ...me, name: ' ', website: 'ana.example' })).toEqual({ name: 'Enter your name.', website: 'Enter a link that starts with https://, like https://example.com.' });
    expect(profileProblems({ ...me, website: '' })).toEqual({});
    expect(profileProblems({ ...me, bio: 'x'.repeat(11) }, 10)).toEqual({ bio: 'Shorten your bio to 10 characters.' });
    expect([profileChanged(me, { ...me }), profileChanged(me, { ...me, bio: 'Hi' }), profileChanged(me, { ...me, photo: 'a.png' })]).toEqual([false, true, true]);
  });

  test('one main and h1, the skip link first, the form named by whose profile it is, fields with autofill, and the avatar named', async () => {
    const screen = await render(<Profile profile={me} />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Profile']);
    await expect.element(screen.getByRole('form', { name: 'Edit Ana Lima’s profile' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: /^Name/ }).element().getAttribute('autocomplete')).toBe('name');
    expect(screen.getByRole('textbox', { name: /^Website/ }).element().getAttribute('autocomplete')).toBe('url');
    expect(screen.getByRole('button', { name: 'Discard changes' }).elements()).toHaveLength(0);
    // The bio's limit is applied in characters as people see them, and the count is shown.
    await screen.getByRole('textbox', { name: /^Bio/ }).fill('x'.repeat(170));
    expect((screen.getByRole('textbox', { name: /^Bio/ }).element() as HTMLTextAreaElement).value).toHaveLength(160);
    expect(screen.getByRole('img', { name: 'Ana Lima' }).elements().length).toBeGreaterThan(0);
  });

  test('a missing name and a bad link are said in a summary that takes focus and next to their fields, and nothing is sent', async () => {
    const onSave = vi.fn();
    const screen = await render(<Profile profile={me} onSave={onSave} />);
    await screen.getByRole('textbox', { name: /^Name/ }).fill('');
    await screen.getByRole('textbox', { name: /^Website/ }).fill('ana dot com');
    await screen.getByRole('button', { name: 'Save profile' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    expect(screen.getByRole('link').elements().filter((e) => e.closest('[data-component="error-summary"]')).map((e) => e.getAttribute('href'))).toEqual(['#profile-name', '#profile-website']);
    await screen.getByRole('link', { name: /^Enter your name/ }).click();
    await expect.poll(() => active().id).toBe('profile-name');
    expect(active().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('textbox', { name: /^Website/ }).element().getAttribute('aria-invalid')).toBe('true');
    expect(onSave).not.toHaveBeenCalled();
  });

  test('editing shows the preview at once and offers Discard changes, which puts back what was saved', async () => {
    const screen = await render(<Profile profile={me} />);
    await screen.getByRole('textbox', { name: /^Bio/ }).fill('Maps and cats.');
    const preview = screen.getByRole('region', { name: 'How others see it' });
    await expect.poll(() => preview.element().textContent).toContain('Maps and cats.');
    await screen.getByRole('button', { name: 'Discard changes' }).click();
    expect((screen.getByRole('textbox', { name: /^Bio/ }).element() as HTMLTextAreaElement).value).toBe('Designer.');
    expect(screen.getByRole('button', { name: 'Discard changes' }).elements()).toHaveLength(0);
  });

  test('Save sends the trimmed profile and the new photo, says Saved, and the new photo shows with its name', async () => {
    const onSave = vi.fn((_p: ProfileInfo, _f: File | null) => Promise.resolve());
    const screen = await render(<Profile profile={me} onSave={onSave} />);
    await userEvent.upload(document.getElementById('profile-photo') as HTMLInputElement, [png()]);
    await expect.poll(() => document.querySelector('[role="img"][aria-label="Photo of Ana Lima"] img')).not.toBeNull();
    await screen.getByRole('textbox', { name: /^Location/ }).fill(' Jakarta ');
    await screen.getByRole('button', { name: 'Save profile' }).click();
    await expect.poll(() => onSave.mock.calls.length).toBe(1);
    expect(onSave.mock.calls[0]![0]).toEqual({ ...me, location: 'Jakarta' });
    expect(onSave.mock.calls[0]![1]?.name).toBe('me.png');
    await expect.poll(() => document.body.textContent).toContain('Saved');
    expect(screen.getByRole('button', { name: 'Discard changes' }).elements()).toHaveLength(0);
    expect(document.querySelector('[role="img"][aria-label="Photo of Ana Lima"] img')).not.toBeNull();
  });

  test('a photo can be removed, and a save that fails says so, keeps the changes and saves again from Try again', async () => {
    let fail = true;
    const onSave = vi.fn(() => (fail ? Promise.reject(new Error('offline')) : Promise.resolve()));
    const screen = await render(<Profile profile={{ ...me, photo: 'https://example.com/ana.png' }} onSave={onSave} />);
    await screen.getByRole('button', { name: 'Remove photo' }).click();
    expect(document.querySelector('[role="img"][aria-label="Photo of Ana Lima"] img')).toBeNull();
    await screen.getByRole('button', { name: 'Save profile' }).click();
    await expect.poll(alertText).toContain('Couldn’t save your profile. Your changes are still here.');
    expect(screen.getByRole('button', { name: 'Discard changes' }).elements()).toHaveLength(1);
    fail = false;
    await screen.getByRole('button', { name: /Try again/ }).click();
    await expect.poll(() => onSave.mock.calls.length).toBe(2);
    await expect.poll(alertText).toBe('');
  });

  test('while it loads: the h1 and one placeholder named "Loading profile"; a failed load says so and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Profile loading />);
    expect(document.querySelector('h1')?.textContent).toBe('Profile');
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading profile']);
    await screen.rerender(<Profile loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your profile' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the profile that arrives once loading ends is the one shown and edited', async () => {
    const screen = await render(<Profile loading profile={me} />);
    await screen.rerender(<Profile profile={{ ...me, name: 'Budi Santoso' }} />);
    await expect.element(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Budi Santoso');
  });
});
