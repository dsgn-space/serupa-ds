import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Profile, profileChanged, profileProblems, type ProfileInfo } from './Profile';

const active = () => document.activeElement as HTMLElement;
// The page's own alerts, not the announcer's live region, which keeps the last thing it said a while.
const alertText = () => [...document.querySelectorAll('[role="alert"]:not([data-srp-announcer-assertive])')].map((e) => e.textContent).join(' ');
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
    expect([profileChanged(me, { ...me }), profileChanged(me, { ...me, bio: 'Hi' }), profileChanged(me, { ...me, photo: 'a.png' }), profileChanged(me, { ...me, timeZone: 'Asia/Tokyo' })]).toEqual([false, true, true, true]);
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

  test('a new photo\'s preview in Strict Mode, hidden and shown again (Activity): every address made is let go but the one shown, which still loads', async () => {
    const made: string[] = [], gone: string[] = [];
    const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
    const c = vi.spyOn(URL, 'createObjectURL').mockImplementation((f) => { const u = create(f); made.push(u); return u; });
    const r = vi.spyOn(URL, 'revokeObjectURL').mockImplementation((u) => { gone.push(u); revoke(u); });
    try {
      const ui = (mode: 'visible' | 'hidden') => <React.StrictMode><React.Activity mode={mode}><Profile profile={me} /></React.Activity></React.StrictMode>;
      const screen = await render(ui('visible'));
      await userEvent.upload(document.getElementById('profile-photo') as HTMLInputElement, [png()]);
      const img = () => document.querySelector<HTMLImageElement>('[role="img"][aria-label="Photo of Ana Lima"] img');
      await expect.poll(img).not.toBeNull();
      await screen.rerender(ui('hidden'));
      await screen.rerender(ui('visible'));
      await expect.poll(() => img()?.src && !gone.includes(img()!.src)).toBe(true);
      expect(made.filter((u) => !gone.includes(u))).toEqual([img()!.src]);
      expect(await fetch(img()!.src).then((x) => x.ok, () => false)).toBe(true);
    } finally { c.mockRestore(); r.mockRestore(); }
  });

  test('Save sends the trimmed profile and the new photo, says Saved, and the new photo shows with its name', async () => {
    const onSave = vi.fn((_p: ProfileInfo, _f: File | null, _c?: unknown) => Promise.resolve());
    const screen = await render(<Profile profile={me} onSave={onSave} />);
    await userEvent.upload(document.getElementById('profile-photo') as HTMLInputElement, [png()]);
    await expect.poll(() => document.querySelector('[role="img"][aria-label="Photo of Ana Lima"] img')).not.toBeNull();
    await screen.getByRole('textbox', { name: /^Location/ }).fill(' Jakarta ');
    await screen.getByRole('button', { name: 'Save profile' }).click();
    await expect.poll(() => onSave.mock.calls.length).toBe(1);
    expect(onSave.mock.calls[0]![0]).toEqual({ ...me, location: 'Jakarta' });
    expect(onSave.mock.calls[0]![1]?.name).toBe('me.png');
    // The photo comes with the square of it to keep, from the cropper under the upload: here all of a 1×1 picture.
    expect(onSave.mock.calls[0]![2]).toEqual({ x: 0, y: 0, width: 1, height: 1 });
    await expect.poll(() => document.body.textContent).toContain('Saved');
    expect(screen.getByRole('button', { name: 'Discard changes' }).elements()).toHaveLength(0);
    expect(document.querySelector('[role="img"][aria-label="Photo of Ana Lima"] img')).not.toBeNull();
    // The saved photo's address still holds the picture: it isn't let go with the upload.
    const saved = document.querySelector<HTMLImageElement>('[role="img"][aria-label="Photo of Ana Lima"] img')!.src;
    expect(await fetch(saved).then((r) => r.ok, () => false)).toBe(true);
  });

  test('a new photo can be framed: a cropper under the upload, named by its field, with a zoom slider; none without one', async () => {
    const screen = await render(<Profile profile={me} />);
    expect(screen.getByRole('group', { name: 'Frame your photo' }).elements()).toHaveLength(0);
    await userEvent.upload(document.getElementById('profile-photo') as HTMLInputElement, [png()]);
    const frame = screen.getByRole('group', { name: 'Frame your photo' });
    await expect.element(frame).toBeVisible();
    await expect.element(frame.getByRole('slider')).toBeVisible();
    await expect.poll(() => frame.element().querySelector('[role="application"]') != null).toBe(true);
  });

  test('a time zone is picked from the list by city, and saved with the profile', async () => {
    const onSave = vi.fn((_p: ProfileInfo, _f: File | null, _c?: unknown) => Promise.resolve());
    const screen = await render(<Profile profile={me} onSave={onSave} />);
    const zone = screen.getByRole('combobox', { name: /^Time zone/ });
    await zone.fill('Tokyo');
    await screen.getByRole('option', { name: /^Tokyo/ }).click();
    await screen.getByRole('button', { name: 'Save profile' }).click();
    await expect.poll(() => onSave.mock.calls.length).toBe(1);
    expect(onSave.mock.calls[0]![0]).toEqual({ ...me, timeZone: 'Asia/Tokyo' });
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
