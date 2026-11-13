import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { TeamMembers, emailsIn, inviteProblem } from './TeamMembers';

const active = () => document.activeElement as HTMLElement;
const said = () => [...document.querySelectorAll('[aria-live]')].map((e) => e.textContent || '').join(' ');
// The toast that says text: its Undo has no aria-label (its words name it), its close button is "Dismiss".
const toastOf = (text: string) => [...document.querySelectorAll('li')].filter((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]')).at(-1) as HTMLElement;

// Team members: role pickers named per member, removals and revokes with Undo that keep focus in the list, and an
// invite dialog that names each bad address and survives a failed send.
describe('Patterns/Team members', () => {
  test('addresses are split at commas, semicolons and new lines, once each; problems are named', () => {
    expect(emailsIn(' A@x.com, b@y.org;\nb@y.org  c@z.io ')).toEqual(['a@x.com', 'b@y.org', 'c@z.io']);
    expect(inviteProblem([], [])).toBe('Enter at least one email address.');
    expect(inviteProblem(['a@x.com', 'nope'], [])).toBe('This isn’t an email address: nope.');
    expect(inviteProblem(['no', 'pe@'], [])).toBe('These aren’t email addresses: no, pe@.');
    expect(inviteProblem(['a@x.com'], ['a@x.com'])).toBe('Already on the team or invited: a@x.com.');
    expect(inviteProblem(['a@x.com'], [])).toBeNull();
  });

  test('one main and h1, each role picker named with its member, the owner\'s row saying why it has none', async () => {
    const screen = await render(<TeamMembers />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Team']);
    expect(screen.getByRole('combobox').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Role for Budi Santoso', 'Role for Chen Wei', 'Role for Dewi Lestari']);
    await expect.element(screen.getByText('Owner, can’t be removed')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Remove Ana Lima' }).elements()).toHaveLength(0);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('a changed role is stored and said', async () => {
    const onRoleChange = vi.fn();
    const screen = await render(<TeamMembers onRoleChange={onRoleChange} />);
    await screen.getByRole('combobox', { name: 'Role for Chen Wei' }).selectOptions('admin');
    expect(onRoleChange).toHaveBeenCalledWith('u3', 'admin');
    await expect.poll(said).toContain('Chen Wei is now an Admin');
    await screen.getByRole('combobox', { name: 'Role for Chen Wei' }).selectOptions('viewer');
    await expect.poll(said).toContain('Chen Wei is now a Viewer');
  });

  test('Remove takes the member out at once, focus goes to the next Remove, Undo brings them back; onRemove waits for the toast', async () => {
    const onRemove = vi.fn();
    const screen = await render(<TeamMembers onRemove={onRemove} />);
    await screen.getByRole('button', { name: 'Remove Chen Wei' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Remove Dewi Lestari');
    expect(screen.getByRole('heading', { level: 2, name: 'Members (3)' }).elements()).toHaveLength(1);
    await page.elementLocator(toastOf('Removed Chen Wei')).getByRole('button', { name: 'Undo' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Remove Chen Wei');
    expect(onRemove).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Remove Dewi Lestari' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Remove Chen Wei');
    await page.elementLocator(toastOf('Removed Dewi Lestari')).getByRole('button', { name: 'Dismiss' }).click();
    await expect.poll(() => onRemove.mock.calls).toEqual([['u4']]);
  });

  test('revoking the last invite moves focus to the heading and says none are waiting; Resend is said in a toast', async () => {
    const onRevoke = vi.fn(), onResend = vi.fn();
    const screen = await render(<TeamMembers onRevoke={onRevoke} onResend={onResend} />);
    await screen.getByRole('button', { name: 'Resend the invite to eko@example.com' }).click();
    expect(onResend).toHaveBeenCalledWith('eko@example.com');
    await expect.poll(() => !!toastOf('Sent the invite to eko@example.com again')).toBe(true);
    await screen.getByRole('button', { name: 'Revoke the invite to eko@example.com' }).click();
    await expect.poll(() => active().textContent).toBe('Invites (0)');
    await expect.element(screen.getByText('No invites waiting.')).toBeVisible();
    await page.elementLocator(toastOf('Revoked the invite to eko@example.com')).getByRole('button', { name: 'Dismiss' }).click();
    await expect.poll(() => onRevoke.mock.calls).toEqual([['eko@example.com']]);
  });

  test('revoking an invite moves focus to the next one\'s Revoke, and Undo brings it back', async () => {
    const screen = await render(<TeamMembers invites={[{ email: 'eko@example.com', role: 'member' }, { email: 'fay@example.com', role: 'viewer' }]} />);
    await screen.getByRole('button', { name: 'Revoke the invite to eko@example.com' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Revoke the invite to fay@example.com');
    await page.elementLocator(toastOf('Revoked the invite to eko@example.com')).getByRole('button', { name: 'Undo' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Revoke the invite to eko@example.com');
  });

  test('the invite form names bad and taken addresses and keeps them typed; good ones are invited with the role and listed', async () => {
    const onInvite = vi.fn();
    const screen = await render(<TeamMembers onInvite={onInvite} />);
    await screen.getByRole('button', { name: 'Invite people' }).click();
    const box = screen.getByRole('textbox', { name: /^Email addresses/ });
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.element(screen.getByText('Enter at least one email address.')).toBeVisible();
    await box.fill('fay@example.com, chen@example.com');
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.element(screen.getByText('Already on the team or invited: chen@example.com.')).toBeVisible();
    await expect.poll(() => active().tagName).toBe('TEXTAREA');
    await expect.element(box).toHaveValue('fay@example.com, chen@example.com');
    await box.fill('fay@example.com\ngus@example.com');
    await screen.getByRole('dialog').getByRole('combobox', { name: /^Role/ }).selectOptions('viewer');
    await expect.element(screen.getByText('Can only look.')).toBeVisible();
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.poll(() => onInvite.mock.calls).toEqual([[['fay@example.com', 'gus@example.com'], 'viewer']]);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Invites (3)' })).toBeVisible();
    await expect.poll(() => !!toastOf('Invited 2 people')).toBe(true);
    expect(screen.getByRole('dialog').elements()).toHaveLength(0);
  });

  test('an invite that fails keeps the dialog open, says so and keeps the addresses; trying again sends it', async () => {
    let fail = true;
    const onInvite = vi.fn(() => (fail ? Promise.reject(new Error('offline')) : Promise.resolve()));
    const screen = await render(<TeamMembers onInvite={onInvite} />);
    await screen.getByRole('button', { name: 'Invite people' }).click();
    await screen.getByRole('textbox', { name: /^Email addresses/ }).fill('fay@example.com');
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Couldn’t send the invites. Try again.');
    await expect.element(screen.getByRole('textbox', { name: /^Email addresses/ })).toHaveValue('fay@example.com');
    fail = false;
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.poll(() => !!toastOf('Invited fay@example.com')).toBe(true);
    expect(onInvite).toHaveBeenCalledTimes(2);
  });

  test('closing the dialog forgets its problem', async () => {
    const screen = await render(<TeamMembers />);
    await screen.getByRole('button', { name: 'Invite people' }).click();
    await screen.getByRole('button', { name: 'Send invites' }).click();
    await expect.element(screen.getByText('Enter at least one email address.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await screen.getByRole('button', { name: 'Invite people' }).click();
    expect(screen.getByText('Enter at least one email address.').elements()).toHaveLength(0);
  });

  test('loading: one busy list named "Loading members", no rows yet; a failed load says so with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<TeamMembers loading />);
    expect(document.querySelector('ul[aria-busy="true"]')).not.toBeNull();
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading members']);
    expect(screen.getByRole('combobox').elements()).toHaveLength(0);
    await screen.rerender(<TeamMembers loading loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load your team' })).toBeVisible();
    expect(screen.getByRole('progressbar').elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
    await screen.rerender(<TeamMembers />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Members (4)' })).toBeVisible();
  });
});
