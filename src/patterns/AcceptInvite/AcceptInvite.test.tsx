import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { AcceptInvite, inviteState, type WorkspaceInvite } from './AcceptInvite';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const invite: WorkspaceInvite = {
  from: 'Dewi Lestari', workspace: 'Acme Design', role: 'Editor', roleCan: 'Edit files and comment.',
  email: 'ana@example.com', members: ['Dewi Lestari', 'Chen Wei', 'Eko Prasetyo', 'Sara Haddad', 'Lena Vogel'], expires: '2026-03-20T17:00:00Z',
};
const before = new Date('2026-03-01T00:00:00Z');

// Accept invite: who invited you in the h1, the role and members as named facts, the account you'd join with (and a
// mismatch said in words), Join and Decline whose answer's heading takes focus, and why an invite can't be used.
describe('Patterns/Accept invite', () => {
  test('whether an invite can still be used', () => {
    expect(inviteState(invite, before)).toBe('open');
    expect(inviteState(invite, new Date('2026-03-20T17:00:00Z'))).toBe('ended');
    expect(inviteState({ ...invite, used: true }, before)).toBe('used');
  });

  test('one main and h1 saying who invited you, the skip link first, the role and members named, and the account said', async () => {
    const screen = await render(<AcceptInvite invite={invite} now={before} />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Dewi Lestari invited you to join Acme Design']);
    expect([...document.querySelectorAll('dt')].map((d) => d.textContent)).toEqual(['Your role', 'Members', 'Invite ends']);
    expect(screen.getByRole('group', { name: 'Members of Acme Design' }).elements()).toHaveLength(1);
    expect(document.body.textContent).toContain('Joining as ana@example.com.');
    expect(alertText()).toBe('');
  });

  test('signed in with another account: it says so in words before Join', async () => {
    await render(<AcceptInvite invite={invite} now={before} signedInAs="ana.lima@work.example" />);
    expect(document.body.textContent).toContain('The invite went to ana@example.com, and you’re signed in as ana.lima@work.example.');
  });

  test('Join that fails says so and changes nothing; Join again: the answer\'s heading takes focus', async () => {
    const onJoin = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<AcceptInvite invite={invite} now={before} onJoin={onJoin} />);
    await screen.getByRole('button', { name: 'Join Acme Design' }).click();
    await expect.poll(alertText).toContain('Couldn’t join Acme Design.');
    await screen.getByRole('button', { name: 'Join Acme Design' }).click();
    await expect.poll(() => active().textContent).toBe('You’ve joined Acme Design');
    expect(active().tagName).toBe('H1');
    expect(screen.getByRole('link', { name: 'Open Acme Design' }).elements()).toHaveLength(1);
  });

  test('Decline: the answer\'s heading takes focus and says what happens', async () => {
    const onDecline = vi.fn();
    const screen = await render(<AcceptInvite invite={invite} now={before} onDecline={onDecline} />);
    await screen.getByRole('button', { name: 'Decline' }).click();
    await expect.poll(() => active().textContent).toBe('Invite declined');
    expect(onDecline).toHaveBeenCalledOnce();
  });

  test('an ended or used invite says why in the h1, and who to ask', async () => {
    const { rerender } = await render(<AcceptInvite invite={invite} now={new Date('2026-04-01T00:00:00Z')} />);
    expect(document.querySelector('h1')?.textContent).toBe('This invite has ended');
    expect(document.body.textContent).toContain('Ask Dewi Lestari for a new one');
    expect(document.querySelectorAll('button')).toHaveLength(0);
    await rerender(<AcceptInvite invite={{ ...invite, used: true }} now={before} />);
    expect(document.querySelector('h1')?.textContent).toBe('This invite has been used');
  });
});
