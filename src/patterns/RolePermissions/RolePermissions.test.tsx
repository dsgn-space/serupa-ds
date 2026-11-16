import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { RolePermissions, applyGrant, countChanges, type Grants, type Permission } from './RolePermissions';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660));
const also = () => document.getElementById('roles-also')!.textContent;
const perms: Permission[] = [
  { id: 'view', label: 'View', allows: '' },
  { id: 'edit', label: 'Edit', allows: '', needs: ['view'] },
  { id: 'delete', label: 'Delete', allows: '', needs: ['edit'] },
  { id: 'bill', label: 'Billing', allows: '' },
];

// Roles and permissions: a table of checkboxes read with role and permission, needs brought along and said, the
// owner's column read-only, and nothing saved until Save, which says how many changes it saves.
describe('Patterns/Roles and permissions', () => {
  test('turning on brings what it needs; turning off takes what needs it; changes are counted', () => {
    expect(applyGrant(perms, [], 'delete', true)).toEqual({ now: ['view', 'edit', 'delete'], also: ['view', 'edit'] });
    expect(applyGrant(perms, ['view', 'edit', 'delete', 'bill'], 'view', false)).toEqual({ now: ['bill'], also: ['edit', 'delete'] });
    expect(applyGrant(perms, ['view'], 'bill', true)).toEqual({ now: ['view', 'bill'], also: [] });
    expect(countChanges({ a: ['view'], b: ['edit'] }, { a: ['view', 'bill'], b: [] })).toBe(2);
    expect(countChanges({ a: ['view'] }, { a: ['view'], c: ['bill'] })).toBe(1);
  });

  test('one main and h1, the skip link first, each box named by role and permission, the owner’s read-only', async () => {
    const screen = await render(<RolePermissions />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Roles and permissions']);
    expect(screen.getByRole('rowheader', { name: /Delete projects/ }).element().textContent).toContain('Needs Edit projects.');
    expect(screen.getByRole('columnheader', { name: 'Guest' }).elements()).toHaveLength(1);
    await expect.element(screen.getByRole('checkbox', { name: 'Member: Edit projects' })).toBeChecked();
    await expect.element(screen.getByRole('checkbox', { name: 'Guest: Edit projects' })).not.toBeChecked();
    const owner = screen.getByRole('checkbox', { name: 'Owner: Manage billing' });
    await expect.element(owner).toHaveAttribute('aria-readonly', 'true');
    await owner.click();
    await expect.element(owner).toBeChecked();
    expect(document.body.textContent).toContain('Owner can do everything');
    expect(document.getElementById('roles-changes')!.textContent).toBe('Everything is saved.');
  });

  test('a permission brings what it needs, takes what needs it, and says so', async () => {
    const screen = await render(<RolePermissions />);
    await screen.getByRole('checkbox', { name: 'Guest: Delete projects' }).click();
    await expect.poll(also).toBe('Also turned on Edit projects for Guest.');
    await expect.element(screen.getByRole('checkbox', { name: 'Guest: Edit projects' })).toBeChecked();
    await screen.getByRole('checkbox', { name: 'Guest: Comment' }).click();
    await expect.poll(also).toBe('');
    await screen.getByRole('checkbox', { name: 'Guest: View projects' }).click();
    await expect.poll(also).toBe('Also turned off Comment, Edit projects and Delete projects for Guest.');
    await screen.getByRole('checkbox', { name: 'Guest: Manage billing' }).click();
    await expect.poll(also).toBe('');
    expect(norm(document.getElementById('roles-changes')!.textContent)).toBe('2 changes not saved yet.');
  });

  test('Save sends every role, says it’s saved, and Discard puts changes back', async () => {
    const onSave = vi.fn<(g: Grants) => void>();
    const screen = await render(<RolePermissions onSave={onSave} />);
    await screen.getByRole('checkbox', { name: 'Member: Invite people' }).click();
    await screen.getByRole('button', { name: 'Save 1 change' }).click();
    await expect.poll(() => document.getElementById('roles-changes')!.textContent).toBe('Everything is saved.');
    expect(onSave.mock.calls[0]![0].member).toEqual(['view', 'comment', 'edit', 'invite']);
    await screen.getByRole('checkbox', { name: 'Admin: Edit projects' }).click();
    expect(norm(screen.getByRole('button', { name: /^Save/ }).element().textContent)).toBe('Save 2 changes');
    await screen.getByRole('button', { name: 'Discard changes' }).click();
    await expect.element(screen.getByRole('checkbox', { name: 'Admin: Delete projects' })).toBeChecked();
    await expect.element(screen.getByRole('checkbox', { name: 'Member: Invite people' })).toBeChecked();
  });

  test('changes that can’t be saved say so and stay', async () => {
    const screen = await render(<RolePermissions onSave={() => Promise.reject(new Error('offline'))} />);
    await screen.getByRole('checkbox', { name: 'Guest: Comment' }).click();
    await screen.getByRole('button', { name: 'Save 1 change' }).click();
    await expect.element(screen.getByText('Couldn’t save the roles.', { exact: false })).toBeVisible();
    await expect.element(screen.getByRole('checkbox', { name: 'Guest: Comment' })).toBeChecked();
    expect(norm(document.getElementById('roles-changes')!.textContent)).toBe('1 change not saved yet.');
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<RolePermissions loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading roles']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<RolePermissions loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the roles' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('the grants that arrive once loading ends are the ones shown', async () => {
    const ticked = () => document.querySelectorAll('main input[type="checkbox"]:checked').length;
    const first = await render(<RolePermissions />);
    const all = ticked();
    expect(all).toBeGreaterThan(0);
    await first.unmount();
    const screen = await render(<RolePermissions loading grants={{}} />);
    await screen.rerender(<RolePermissions />);
    await expect.poll(ticked).toBe(all);
  });
});

describe('Patterns/Roles and permissions on a phone', () => {
  test('the permissions wrap, so the first roles’ checkboxes are on screen without scrolling the table', async () => {
    await page.viewport(360, 720);
    try {
      await render(<RolePermissions />);
      const frame = document.querySelector('table')!.parentElement!.getBoundingClientRect();
      const boxes = [...document.querySelectorAll<HTMLElement>('tbody tr')].map((r) => r.querySelector('td input, td [role="checkbox"]')!);
      expect(boxes.length).toBeGreaterThan(0);
      for (const b of boxes) expect(b.getBoundingClientRect().right).toBeLessThanOrEqual(frame.right);
    } finally { await page.viewport(900, 700); }
  });
});
