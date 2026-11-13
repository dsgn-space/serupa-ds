'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { Dialog } from '../../components/Dialog/Dialog';
import { Field } from '../../components/Field/Field';
import { Select } from '../../components/Select/Select';
import { Textarea } from '../../components/Textarea/Textarea';
import { Alert } from '../../components/Alert/Alert';
import { Toaster, toast } from '../../components/Toast/Toast';
import { Loader } from '../../components/Loader/Loader';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { announce } from '../../internal/announce';

/* Team members: who is on the team, what each may do, inviting more people, and removing someone. For an app to copy.
   What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: each member's role picker is named with the member ("Role for Ana Lima"), so a list of them isn't
     a list of "Role, Role, Role".
   - 4.1.3: a changed role is said ("Ana Lima is now an Admin"); an invite sent, resent or revoked is said in a toast.
   - 3.3.4: removing a member or revoking an invite happens at once with Undo in a toast, and is done for good only
     when the toast goes, so nothing needs "Are you sure?" first.
   - 2.4.3: after a removal, focus goes to the next row's button (or the list's heading), never to the top of the page.
   - 3.3.1, 3.3.3: the invite form names each address that isn't one, or is on the team already, and keeps what was
     typed; an invite that fails says so in the dialog, which stays open.
   - 4.1.3, 3.3.1: while the team loads, the list is busy with one placeholder name ("Loading members"); a failed load
     says so in its place, with Try again.
   - The owner can't be removed or demoted here, and the row says why in words, not only by a missing button.
   Storing the changes is the app's job: onInvite, onRoleChange, onRemove, onResend and onRevoke get them. */

export type TeamRole = 'admin' | 'member' | 'viewer';
export interface TeamMember { id: string; name: string; email: string; role: TeamRole | 'owner'; avatar?: string | undefined; you?: boolean | undefined }
export interface TeamInvite { email: string; role: TeamRole }

export interface TeamMembersProps {
  /** The people on the team. Default: a demo team. */
  members?: readonly TeamMember[] | undefined;
  /** Invites sent and not yet accepted. Default: one demo invite. */
  invites?: readonly TeamInvite[] | undefined;
  /** Invite was pressed with good addresses. Return its promise: a rejection keeps the dialog open and says so. */
  onInvite?: ((emails: string[], role: TeamRole) => unknown) | undefined;
  /** A member's role was changed. */
  onRoleChange?: ((id: string, role: TeamRole) => void) | undefined;
  /** A removed member's toast closed without Undo: remove them for good. */
  onRemove?: ((id: string) => void) | undefined;
  /** Resend was pressed on an invite. */
  onResend?: ((email: string) => void) | undefined;
  /** A revoked invite's toast closed without Undo: revoke it for good. */
  onRevoke?: ((email: string) => void) | undefined;
  /** The team is on its way: placeholder rows in place of the members and invites, named once ("Loading members"). Default: false. */
  loading?: boolean | undefined;
  /** The team failed to load: a "Couldn’t load your team" message with Try again, which calls onRetry, in their place. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const demoMembers: TeamMember[] = [
  { id: 'u1', name: 'Ana Lima', email: 'ana@example.com', role: 'owner', you: true },
  { id: 'u2', name: 'Budi Santoso', email: 'budi@example.com', role: 'admin' },
  { id: 'u3', name: 'Chen Wei', email: 'chen@example.com', role: 'member' },
  { id: 'u4', name: 'Dewi Lestari', email: 'dewi@example.com', role: 'viewer' },
];
const demoInvites: TeamInvite[] = [{ email: 'eko@example.com', role: 'member' }];

const ROLES: { value: TeamRole; label: string; hint: string }[] = [
  { value: 'admin', label: 'Admin', hint: 'can invite and remove people' },
  { value: 'member', label: 'Member', hint: 'can edit projects' },
  { value: 'viewer', label: 'Viewer', hint: 'can only look' },
];
const roleName = (r: TeamMember['role']) => (r === 'owner' ? 'Owner' : ROLES.find((x) => x.value === r)!.label);
const options = ROLES.map((r) => ({ value: r.value, label: r.label }));
const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

/** The addresses in what was typed, split at commas, semicolons, spaces and new lines, each once. */
export function emailsIn(text: string): string[] {
  return [...new Set(text.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

/** What's wrong with these addresses, in words, or null when they can all be invited. */
export function inviteProblem(emails: readonly string[], taken: readonly string[]): string | null {
  if (!emails.length) return 'Enter at least one email address.';
  const bad = emails.filter((e) => !EMAIL.test(e));
  if (bad.length) return `${bad.length === 1 ? 'This isn’t an email address' : 'These aren’t email addresses'}: ${bad.join(', ')}.`;
  const on = emails.filter((e) => taken.includes(e));
  if (on.length) return `Already on the team or invited: ${on.join(', ')}.`;
  return null;
}

/** The team page: a skip link, a header, then main with the h1 and Invite people, the members, and the open invites. */
export function TeamMembers({ members = demoMembers, invites = demoInvites, onInvite, onRoleChange, onRemove, onResend, onRevoke, loading = false, loadFailed = false, onRetry }: TeamMembersProps) {
  const [roles, setRoles] = React.useState<Record<string, TeamRole>>({});
  const [gone, setGone] = React.useState<ReadonlySet<string>>(new Set());
  const [sent, setSent] = React.useState<TeamInvite[]>([]);
  const [inviting, setInviting] = React.useState(false);
  const [text, setText] = React.useState('');
  const [role, setRole] = React.useState<TeamRole>('member');
  const [problem, setProblem] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);
  const membersHeading = React.useRef<HTMLHeadingElement>(null);
  const invitesHeading = React.useRef<HTMLHeadingElement>(null);
  const shown = members.filter((m) => !gone.has(m.id));
  const open = [...invites, ...sent].filter((i) => !gone.has(i.email));
  const later = (f: () => void) => requestAnimationFrame(f);
  const focusId = (id: string) => () => document.getElementById(id)?.focus();

  // Takes a row out with Undo, and moves focus to the next row's button, or the one before, or the list's heading.
  const takeOut = <T,>(rows: readonly T[], row: T, key: string, button: (r: T) => string, heading: React.RefObject<HTMLHeadingElement | null>,
    title: string, commit: () => void) => {
    const at = rows.indexOf(row), next = rows[at + 1] ?? rows[at - 1];
    setGone((g) => new Set(g).add(key));
    later(next !== undefined ? focusId(button(next)) : () => heading.current?.focus());
    toast.undo({
      title, commit,
      onUndo: () => { setGone((g) => { const n = new Set(g); n.delete(key); return n; }); later(focusId(button(row))); },
    });
  };
  const remove = (m: TeamMember) => takeOut(shown, m, m.id, (r) => `remove-${r.id}`, membersHeading, `Removed ${m.name}`, () => onRemove?.(m.id));
  const revoke = (i: TeamInvite) => takeOut(open, i, i.email, (r) => `revoke-${r.email}`, invitesHeading, `Revoked the invite to ${i.email}`, () => onRevoke?.(i.email));
  const resend = (i: TeamInvite) => { onResend?.(i.email); toast({ title: `Sent the invite to ${i.email} again`, tone: 'success' }); };
  const change = (m: TeamMember, r: TeamRole) => {
    setRoles((x) => ({ ...x, [m.id]: r }));
    onRoleChange?.(m.id, r);
    announce(`${m.name} is now ${r === 'admin' ? 'an' : 'a'} ${roleName(r)}`);
  };

  const ask = (o: boolean) => { setInviting(o); if (!o) { setProblem(null); setFailed(false); } };
  const [busy, setBusy] = React.useState(false);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = emailsIn(text);
    const found = inviteProblem(emails, [...members.map((m) => m.email.toLowerCase()), ...open.map((i) => i.email)]);
    setProblem(found);
    setFailed(false);
    if (found) { later(focusId('invite-emails')); return; }
    // A failed invite, by rejecting or by throwing, keeps the dialog open and says so; the addresses stay typed.
    setBusy(true);
    void Promise.resolve().then(() => onInvite?.(emails, role)).then(() => {
      setSent((s) => [...s, ...emails.map((email) => ({ email, role }))]);
      setInviting(false);
      setText('');
      toast({ title: emails.length === 1 ? `Invited ${emails[0]}` : `Invited ${emails.length} people`, tone: 'success' });
    }, () => setFailed(true)).finally(() => setBusy(false));
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 outline-none">
        <PageHeader title="Team" description="Who can see and change this workspace."
          primary={{ label: 'Invite people', onSelect: () => ask(true) }} />

        {loadFailed ? <EmptyLoadFailed title="Couldn’t load your team" onRetry={() => onRetry?.()} headingLevel={2} /> : loading ? (
          <Card className="flex flex-col gap-3">
            <Heading level={2} size="lg">Members</Heading>
            <ul role="list" aria-busy="true" className="m-0 flex list-none flex-col gap-4 p-0">
              {/* One name for all of them: the first row is named, the others are only pictures. */}
              {[0, 1, 2].map((i) => <li key={i}><Loader variant="skeleton" shape="text" size="sm" lines={2} label={i === 0 ? 'Loading members' : ''} /></li>)}
            </ul>
          </Card>
        ) : <>
        <Card className="flex flex-col gap-3">
          <Heading level={2} size="lg" ref={membersHeading} tabIndex={-1} className="outline-none">Members ({shown.length})</Heading>
          <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
            {shown.map((m) => {
              const r = m.role === 'owner' ? 'owner' : roles[m.id] ?? m.role;
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                  <Avatar size="sm" name={m.name} src={m.avatar} alt="" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium">{m.name}{m.you ? <Badge className="ms-2">You</Badge> : null}</span>
                    <span className="text-sm wrap-break-word text-text-muted">{m.email}</span>
                  </div>
                  {r === 'owner' ? (
                    <span className="text-sm text-text-muted">Owner, can’t be removed</span>
                  ) : (
                    <>
                      <Select size="sm" aria-label={`Role for ${m.name}`} value={r} options={options}
                        onChange={(e) => change(m, e.target.value as TeamRole)} className="w-32" />
                      <Button id={`remove-${m.id}`} size="sm" variant="ghost" aria-label={`Remove ${m.name}`} onClick={() => remove(m)}>Remove</Button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3">
          <Heading level={2} size="lg" ref={invitesHeading} tabIndex={-1} className="outline-none">Invites ({open.length})</Heading>
          {open.length ? (
            <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
              {open.map((i) => (
                <li key={i.email} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="wrap-break-word">{i.email}</span>
                    <span className="text-sm text-text-muted">Invited as {roleName(i.role)}, not joined yet</span>
                  </div>
                  <Button size="sm" variant="outline" aria-label={`Resend the invite to ${i.email}`} onClick={() => resend(i)}>Resend</Button>
                  <Button id={`revoke-${i.email}`} size="sm" variant="ghost" aria-label={`Revoke the invite to ${i.email}`} onClick={() => revoke(i)}>Revoke</Button>
                </li>
              ))}
            </ul>
          ) : <p className="m-0 text-text-muted">No invites waiting.</p>}
        </Card>

        </>}

        <Dialog open={inviting} onOpenChange={ask} title="Invite people" description="They get an email with a link to join. It works for 7 days.">
          <form onSubmit={send} noValidate className="flex flex-col gap-4">
            {failed ? <Alert tone="danger">Couldn’t send the invites. Try again.</Alert> : null}
            <Field label="Email addresses" id="invite-emails" hint="Separate them with commas or new lines." error={problem ?? undefined}>
              <Textarea rows={3} value={text} onChange={(e) => { setText(e.target.value); if (problem) setProblem(null); }} autoComplete="off" />
            </Field>
            <Field label="Role" id="invite-role" hint={ROLES.find((x) => x.value === role)!.hint.replace(/^./, (c) => c.toUpperCase()) + '.'}>
              <Select value={role} options={options} onChange={(e) => setRole(e.target.value as TeamRole)} />
            </Field>
            <Button type="submit" className="self-start" loading={busy}>Send invites</Button>
          </form>
        </Dialog>
      </main>
      <Toaster />
    </div>
  );
}
