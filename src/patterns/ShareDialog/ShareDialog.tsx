'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import { AvatarGroup } from '../../components/AvatarGroup/AvatarGroup';
import { Badge } from '../../components/Badge/Badge';
import { CopyButton } from '../../components/CopyButton/CopyButton';
import { Dialog } from '../../components/Dialog/Dialog';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { Alert } from '../../components/Alert/Alert';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { announce } from '../../internal/announce';

/* Share dialog: who can open one document, what each may do, and the link to it. For an app to copy.
   What it carries (WCAG 2.2):
   - One Share button, in the page's header where people look for it, and beside it who the document is shared with
     as soon as it is shared: the faces, and the count in words.
   - 1.3.1, 2.4.6: each person's access picker is named with the person ("Access for Budi Santoso").
   - 4.1.3: a changed access, a removal, its undo and the link's setting are each said.
   - 3.3.4, 2.4.3: Remove takes the person out at once and leaves "Removed" with Undo in their row, where focus
     goes, so nothing needs "Are you sure?" and focus is never lost. It's done for good when the dialog closes.
   - The link's setting is one picker whose choices are whole phrases ("Anyone with the link can view"), and the
     same phrase is on the page, so people never work out who can see the document from two controls.
   - 3.3.1, 3.3.3: the add-people field names each address that isn't one, or has access already, and keeps what
     was typed; an invite that fails says so, and the dialog stays open.
   - Copy link is always there. "Share via…" opens the device's own share sheet and shows only where the browser has one.
   Storing the changes and sending the email are the app's job: onInvite, onAccessChange, onRemove and
   onLinkAccessChange get them. */

export type ShareAccess = 'view' | 'edit';
export type ShareLinkAccess = 'restricted' | ShareAccess;
export interface SharePerson { id: string; name: string; email: string; access: ShareAccess | 'owner'; avatar?: string | undefined; you?: boolean | undefined }

export interface ShareDialogProps {
  /** The document's name. Default: a demo name. */
  name?: string | undefined;
  /** The link to it. Default: a demo link. */
  url?: string | undefined;
  /** The people with access, the owner first. Default: a demo list. */
  people?: readonly SharePerson[] | undefined;
  /** Who the link alone lets in at first: 'restricted' (only people added, the default), 'view' or 'edit'. */
  linkAccess?: ShareLinkAccess | undefined;
  /** Open on arrival. Default: false. */
  defaultOpen?: boolean | undefined;
  /** Invite was pressed with good addresses. Return its promise: a rejection keeps what was typed and says so. */
  onInvite?: ((emails: string[], access: ShareAccess) => unknown) | undefined;
  /** A person's access was changed. */
  onAccessChange?: ((id: string, access: ShareAccess) => void) | undefined;
  /** The dialog closed with this person removed and not undone: remove them for good. */
  onRemove?: ((id: string) => void) | undefined;
  /** The link's setting was changed. */
  onLinkAccessChange?: ((access: ShareLinkAccess) => void) | undefined;
  /** Opens the device's share sheet. Default: navigator.share where the browser has it. null leaves "Share via…" out. */
  nativeShare?: ((data: { title: string; url: string }) => unknown) | null | undefined;
}

const demoPeople: SharePerson[] = [
  { id: 'u1', name: 'Ana Lima', email: 'ana@example.com', access: 'owner', you: true },
  { id: 'u2', name: 'Budi Santoso', email: 'budi@example.com', access: 'edit' },
  { id: 'u3', name: 'Chen Wei', email: 'chen@example.com', access: 'view' },
];
const ACCESS = [{ value: 'edit', label: 'Can edit' }, { value: 'view', label: 'Can view' }];
const LINK: Record<ShareLinkAccess, string> = {
  restricted: 'Only people added can open',
  view: 'Anyone with the link can view',
  edit: 'Anyone with the link can edit',
};
const linkOptions = (Object.keys(LINK) as ShareLinkAccess[]).map((value) => ({ value, label: LINK[value] }));
const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

const still = () => () => {};
const never = () => false;
const canShare = () => typeof navigator.share === 'function';

/** What's wrong with what was typed, in words, or null when every address can be invited. */
export function shareProblem(emails: readonly string[], taken: readonly string[]): string | null {
  if (!emails.length) return 'Enter an email address.';
  const bad = emails.filter((e) => !EMAIL.test(e));
  if (bad.length) return `${bad.length === 1 ? 'This isn’t an email address' : 'These aren’t email addresses'}: ${bad.join(', ')}.`;
  const on = emails.filter((e) => taken.includes(e));
  if (on.length) return `Already has access: ${on.join(', ')}.`;
  return null;
}

/** How many people it's shared with, in words: the owner doesn't count. */
export function sharedWith(count: number, locale = 'en-US'): string {
  return count === 0 ? 'Not shared' : count === 1 ? 'Shared with 1 person' : `Shared with ${formatNumber(count, locale)} people`;
}

/** A document page with Share in its header, and the dialog it opens: add people, change or remove access, and the link. */
export function ShareDialog({ name = 'Q3 plan', url = 'https://acme.example/d/q3-plan', people = demoPeople, linkAccess = 'restricted', defaultOpen = false,
  onInvite, onAccessChange, onRemove, onLinkAccessChange, nativeShare }: ShareDialogProps) {
  const locale = useLocale();
  const [open, setOpen] = React.useState(defaultOpen);
  const [list, setList] = React.useState<readonly SharePerson[]>(people);
  const [removed, setRemoved] = React.useState<ReadonlySet<string>>(new Set());
  const [link, setLink] = React.useState<ShareLinkAccess>(linkAccess);
  const [text, setText] = React.useState('');
  const [access, setAccess] = React.useState<ShareAccess>('view');
  const [problem, setProblem] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  // The device's share sheet. A browser never gains or loses it: no subscription. Hydration renders the server's answer (none) first.
  const found = React.useSyncExternalStore(still, canShare, never);
  const sheet = nativeShare !== undefined ? nativeShare : found ? (data: { title: string; url: string }) => navigator.share(data) : null;
  const later = (f: () => void) => requestAnimationFrame(f);
  const focusId = (id: string) => () => document.getElementById(id)?.focus();
  const others = list.filter((p) => p.access !== 'owner' && !removed.has(p.id));

  const close = (o: boolean) => {
    setOpen(o);
    if (o) return;
    // Closing is when a removal is for good.
    removed.forEach((id) => onRemove?.(id));
    setList((l) => l.filter((p) => !removed.has(p.id)));
    setRemoved(new Set());
    setProblem(null);
    setFailed(false);
  };
  const change = (p: SharePerson, a: ShareAccess) => {
    setList((l) => l.map((x) => (x.id === p.id ? { ...x, access: a } : x)));
    onAccessChange?.(p.id, a);
    announce(`${p.name} ${a === 'edit' ? 'can edit' : 'can view'}`);
  };
  const remove = (p: SharePerson) => {
    setRemoved((r) => new Set(r).add(p.id));
    announce(`Removed ${p.name}`);
    later(focusId(`undo-${p.id}`));
  };
  const undo = (p: SharePerson) => {
    setRemoved((r) => { const n = new Set(r); n.delete(p.id); return n; });
    announce(`${p.name} has access again`);
    later(focusId(`remove-${p.id}`));
  };
  const setLinkAccess = (a: ShareLinkAccess) => {
    setLink(a);
    onLinkAccessChange?.(a);
    announce(LINK[a]);
  };
  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = [...new Set(text.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean))];
    const found = shareProblem(emails, list.filter((p) => !removed.has(p.id)).map((p) => p.email.toLowerCase()));
    setProblem(found);
    setFailed(false);
    if (found) { later(focusId('share-emails')); return; }
    setBusy(true);
    void Promise.resolve().then(() => onInvite?.(emails, access)).then(() => {
      setList((l) => [...l, ...emails.map((email) => ({ id: email, name: email, email, access }))]);
      setText('');
      announce(emails.length === 1 ? `Added ${emails[0]}` : `Added ${formatNumber(emails.length, locale)} people`);
      later(focusId('share-emails'));
    }, () => setFailed(true)).finally(() => setBusy(false));
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <p className="m-0 flex-1 text-base font-semibold">Acme Docs</p>
        {others.length ? (
          <AvatarGroup size="sm" max={3} label={sharedWith(others.length, locale)}>
            {others.map((p) => <Avatar key={p.id} name={p.name} src={p.avatar} />)}
          </AvatarGroup>
        ) : null}
        <Button leftIcon="share" onClick={() => close(true)}>Share</Button>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8 outline-none">
        <Heading level={1}>{name}</Heading>
        <p className="m-0 text-sm text-text-muted">{sharedWith(others.length, locale)} · {LINK[link]}</p>
        <p className="m-0">Goals for the quarter, who owns each, and what we’ll stop doing to make room.</p>
      </main>

      <Dialog open={open} onOpenChange={close} title={`Share “${name}”`}
        footer={<>
          <CopyButton value={url} variant="secondary" size="md">Copy link</CopyButton>
          {sheet ? <Button variant="secondary" onClick={() => { void Promise.resolve(sheet({ title: name, url })).catch(() => {}); }}>Share via…</Button> : null}
          <Button onClick={() => close(false)}>Done</Button>
        </>}>
        <div className="flex flex-col gap-5">
          <form onSubmit={invite} noValidate className="flex flex-col gap-3">
            {failed ? <Alert tone="danger">Couldn’t add them. Try again.</Alert> : null}
            <Field label="Add people" id="share-emails" hint="Email addresses, separated by commas." error={problem ?? undefined}>
              <Input type="email" multiple value={text} onChange={(e) => { setText(e.target.value); if (problem) setProblem(null); }} autoComplete="off" data-autofocus />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Select size="sm" aria-label="Access for the people you add" value={access} options={ACCESS}
                onChange={(e) => setAccess(e.target.value as ShareAccess)} className="w-32" />
              <Button type="submit" variant="secondary" size="sm" loading={busy}>Add</Button>
            </div>
          </form>

          <section aria-labelledby="share-people" className="flex flex-col gap-1">
            <Heading level={3} size="sm" id="share-people">People with access</Heading>
            <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
              {list.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 py-2">
                  {removed.has(p.id) ? (
                    <>
                      <span className="min-w-0 flex-1 text-sm wrap-break-word text-text-muted">Removed {p.name}</span>
                      <Button id={`undo-${p.id}`} size="sm" variant="ghost" aria-label={`Undo removing ${p.name}`} onClick={() => undo(p)}>Undo</Button>
                    </>
                  ) : (
                    <>
                      <Avatar size="sm" name={p.name} src={p.avatar} alt="" />
                      <div className="flex min-w-0 grow basis-40 flex-col">
                        <span className="font-medium wrap-break-word">{p.name}{p.you ? <Badge className="ms-2">You</Badge> : null}</span>
                        {p.email !== p.name ? <span className="text-sm wrap-break-word text-text-muted">{p.email}</span> : null}
                      </div>
                      {p.access === 'owner' ? <span className="text-sm text-text-muted">Owner</span> : (
                        <div className="flex items-center gap-3">
                          <Select size="sm" aria-label={`Access for ${p.name}`} value={p.access} options={ACCESS}
                            onChange={(e) => change(p, e.target.value as ShareAccess)} className="w-32" />
                          <Button id={`remove-${p.id}`} size="sm" variant="ghost" aria-label={`Remove ${p.name}`} onClick={() => remove(p)}>Remove</Button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <Field label="Link" id="share-link" hint={link === 'restricted' ? 'The link opens only for the people above.' : 'Anyone who gets the link can open it, without signing in.'}>
            <Select value={link} options={linkOptions} onChange={(e) => setLinkAccess(e.target.value as ShareLinkAccess)} />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
