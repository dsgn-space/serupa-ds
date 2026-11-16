'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Button } from '../../components/Button/Button';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { Link } from '../../components/Link/Link';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Loader } from '../../components/Loader/Loader';
import { Card } from '../../components/Card/Card';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Roles and permissions: what each role in a workspace can do, as a grid of checkboxes, where a permission that needs
   another brings it along, and nothing changes until Save. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the grid is a table with a caption; each permission is its row's header with what it allows, and each role
     its column's, so every checkbox is read with both; each checkbox is also named "Role: Permission".
   - 3.3.2: a permission that needs another says so under its name; turning it on turns that on too, and turning that
     off turns off what needs it.
   - 4.1.3: what else changed is said in a status ("Also turned on View projects for Guest").
   - 3.2.2: nothing is saved as you go: Save says how many changes it saves, and Discard puts them back.
   - 3.3.4, 4.1.3: Save shows it's busy; changes that can't be saved say so and stay; saved ones are said.
   - 4.1.2: the owner's column can't change: its checkboxes are read-only, and the reason is said above the table.
   Storing the roles is the app's job: onSave gets every role's permissions; reject when they can't be saved. */

export interface Role { id: string; name: string; locked?: boolean | undefined }
export interface Permission { id: string; label: string; allows: string; needs?: string[] | undefined }
export type Grants = Record<string, string[]>;

export interface RolePermissionsProps {
  roles?: Role[] | undefined;
  permissions?: Permission[] | undefined;
  /** Each role's permissions, by role id. */
  grants?: Grants | undefined;
  /** Saves every role's permissions. Reject when they can't be saved. */
  onSave?: ((grants: Grants) => unknown) | undefined;
  /** The roles are still loading: a placeholder in their place. Default: false. */
  loading?: boolean | undefined;
  /** The roles failed to load: a "Couldn’t load the roles" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads them again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const demoRoles: Role[] = [
  { id: 'owner', name: 'Owner', locked: true },
  { id: 'admin', name: 'Admin' },
  { id: 'member', name: 'Member' },
  { id: 'guest', name: 'Guest' },
];
const demoPerms: Permission[] = [
  { id: 'view', label: 'View projects', allows: 'Open projects and read their tasks and comments' },
  { id: 'comment', label: 'Comment', allows: 'Add comments to tasks', needs: ['view'] },
  { id: 'edit', label: 'Edit projects', allows: 'Add, change and move tasks', needs: ['view'] },
  { id: 'delete', label: 'Delete projects', allows: 'Delete a project and everything in it', needs: ['edit'] },
  { id: 'invite', label: 'Invite people', allows: 'Invite people to the workspace and set their role', needs: ['view'] },
  { id: 'billing', label: 'Manage billing', allows: 'Change the plan and see invoices' },
];
const all = demoPerms.map((p) => p.id);
const demoGrants: Grants = { owner: all, admin: ['view', 'comment', 'edit', 'delete', 'invite'], member: ['view', 'comment', 'edit'], guest: ['view'] };

/** A role's permissions after one is turned on or off: on brings what it needs, off takes what needs it. Also gives
 *  the other permissions that changed, in the table's order. */
export function applyGrant(perms: Permission[], had: string[], perm: string, on: boolean) {
  const next = new Set(had);
  const visit = (id: string) => {
    if (on ? next.has(id) : !next.has(id)) return;
    if (on) next.add(id); else next.delete(id);
    if (on) perms.find((p) => p.id === id)?.needs?.forEach(visit);
    else perms.filter((p) => p.needs?.includes(id)).forEach((p) => visit(p.id));
  };
  visit(perm);
  const now = perms.map((p) => p.id).filter((id) => next.has(id));
  const also = perms.filter((p) => p.id !== perm && next.has(p.id) !== had.includes(p.id)).map((p) => p.id);
  return { now, also };
}

/** How many role-and-permission boxes differ between two sets of grants. */
export function countChanges(before: Grants, after: Grants) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].reduce((n, role) => {
    const a = before[role] ?? [];
    const b = after[role] ?? [];
    return n + a.filter((x) => !b.includes(x)).length + b.filter((x) => !a.includes(x)).length;
  }, 0);
}

/** The page: a skip link, a header, then main with the h1, the grid, and Save. */
export function RolePermissions({ roles = demoRoles, permissions = demoPerms, grants = demoGrants, onSave, loading = false, loadFailed = false, onRetry }: RolePermissionsProps) {
  const locale = useLocale();
  const [saved, setSaved] = React.useState(grants);
  const [draft, setDraft] = React.useState(grants);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) { setSaved(grants); setDraft(grants); } }
  const [also, setAlso] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const changes = countChanges(saved, draft);
  const label = (id: string) => permissions.find((p) => p.id === id)?.label ?? id;
  const locked = roles.filter((r) => r.locked);

  const toggle = (role: Role, perm: string, on: boolean) => {
    const r = applyGrant(permissions, draft[role.id] ?? [], perm, on);
    setDraft((d) => ({ ...d, [role.id]: r.now }));
    setFailed(false);
    const names = r.also.map(label);
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
    setAlso(names.length ? `Also turned ${on ? 'on' : 'off'} ${list} for ${role.name}.` : '');
  };
  const save = () => {
    setBusy(true);
    setFailed(false);
    const now = draft;
    void Promise.resolve().then(() => onSave?.(now)).then(() => {
      setSaved(now);
      setAlso('');
      announce('Roles saved');
    }, () => setFailed(true)).finally(() => setBusy(false));
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Projects</p>
        <Link href="#workspace">Workspace settings</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col px-4 py-8 outline-none">
        <PageHeader breadcrumb={[{ label: 'Workspace settings', href: '#workspace' }, { label: 'Roles' }]} title="Roles and permissions"
          description="Choose what people in each role can do. Changes apply to everyone in the role once you save." />
        {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load the roles" onRetry={() => onRetry?.()} headingLevel={2} /></div>
          : loading ? <Card className="mt-6"><Loader variant="skeleton" shape="text" lines={6} label="Loading roles" /></Card> : (<>
        {locked.length ? <p className="m-0 pt-6">{locked.map((r) => r.name).join(', ')} can do everything, and that can’t be changed, so the workspace always has someone who can.</p> : null}
        <div className="pt-4">
          <Table caption="What each role can do" hideCaption>
            <TableHead><TableRow>
              <TableHeaderCell>Permission</TableHeaderCell>
              {roles.map((r) => <TableHeaderCell key={r.id} align="center">{r.name}</TableHeaderCell>)}
            </TableRow></TableHead>
            <TableBody>
              {permissions.map((p) => (
                <TableRow key={p.id}>
                  <TableHeaderCell scope="row" className="font-normal">
                    <span className="block font-semibold">{p.label}</span>
                    <span className="block text-sm text-text-muted">{p.allows}{p.needs?.length ? `. Needs ${p.needs.map(label).join(' and ')}` : ''}.</span>
                  </TableHeaderCell>
                  {roles.map((r) => (
                    <TableCell key={r.id} align="center">
                      <Checkbox aria-label={`${r.name}: ${p.label}`} readOnly={r.locked}
                        checked={r.locked ? true : (draft[r.id] ?? []).includes(p.id)}
                        onCheckedChange={(on) => toggle(r, p.id, on)} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p role="status" id="roles-also" className="m-0 min-h-6 pt-3 text-sm">{also}</p>
        <div className="flex flex-col items-start gap-3 pt-4">
          {failed ? <Alert tone="danger">Couldn’t save the roles. Try again; your changes are still here.</Alert> : null}
          <p className="m-0 text-sm text-text-muted" id="roles-changes">
            {changes ? `${changes === 1 ? '1 change' : `${formatNumber(changes, locale)} changes`} not saved yet.` : 'Everything is saved.'}
          </p>
          {changes ? (
            <div className="flex flex-wrap gap-2">
              <Button loading={busy} onClick={save}>{changes === 1 ? 'Save 1 change' : `Save ${formatNumber(changes, locale)} changes`}</Button>
              <Button variant="outline" onClick={() => { setDraft(saved); setAlso(''); setFailed(false); announce('Changes discarded'); }}>Discard changes</Button>
            </div>
          ) : null}
        </div>
        </>)}
      </main>
    </div>
  );
}
