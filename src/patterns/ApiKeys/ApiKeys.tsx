'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { Dialog } from '../../components/Dialog/Dialog';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { CopyButton } from '../../components/CopyButton/CopyButton';
import { Alert } from '../../components/Alert/Alert';
import { Toaster, toast } from '../../components/Toast/Toast';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableLoadingRows } from '../../components/Table/Table';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { useLocale } from '../../internal/provider';

/* API keys: the keys a workspace's scripts and tools use, making one, and revoking one. For an app to copy. What it
   carries (WCAG 2.2):
   - 1.3.1: the keys are a table with a caption, so each cell is read with its column; each Revoke is named with its
     key ("Revoke Deploy bot"), so a list of them isn't "Revoke, Revoke, Revoke".
   - 1.4.1: what a key may do is in words ("Read only"), not only a color.
   - 3.3.2: the form says what a name is for and what each kind of access allows, before anything is typed.
   - 3.3.1, 3.3.3: a missing or taken name is said next to the field, which gets focus; a create or revoke that fails
     says so in its dialog, which stays open with what was typed.
   - 3.3.4: revoking breaks whatever uses the key at once, so it asks first and says that it can't be undone.
   - A new key is shown once, as text with a Copy button that gets focus, with a plain warning that it won't be shown
     again; the list shows only its last four characters.
   - 2.4.3: after a revoke, focus goes to the next key's Revoke (or the list's heading), never to the top of the page.
   - 4.1.3, 3.3.1: while the keys load, the table is busy with placeholder rows; a failed load says so, with Try again.
   Making and revoking keys is the app's job: onCreate gets the new key's details and returns its secret, and
   onRevoke gets the key to revoke. */

export type ApiKeyAccess = 'read' | 'write';
export interface ApiKey {
  id: string;
  /** What uses it, as the person named it: "Deploy bot". */
  name: string;
  /** The key's last four characters, so people can match it to what they stored. */
  ends: string;
  access: ApiKeyAccess;
  /** When it was made: a time in ms or an ISO string. */
  created: number | string;
  /** When it was last used, or null for never. */
  lastUsed?: number | string | null | undefined;
  /** When it stops working, or null for never. */
  expires?: number | string | null | undefined;
}
export interface ApiKeyDraft {
  name: string;
  access: ApiKeyAccess;
  /** Days until it stops working, or null for never. */
  expiresInDays: number | null;
}

export interface ApiKeysProps {
  /** The workspace's keys, newest first. Default: three demo keys. */
  keys?: readonly ApiKey[] | undefined;
  /** Create key was pressed with a good name. Return the new key's secret (or its promise): a rejection keeps the dialog open and says so. */
  onCreate?: ((draft: ApiKeyDraft) => string | Promise<string>) | undefined;
  /** Revoke key was pressed and confirmed. Return its promise: a rejection keeps the key and says so. */
  onRevoke?: ((id: string) => unknown) | undefined;
  /** The keys are on their way: a busy table with placeholder rows. Default: false. */
  loading?: boolean | undefined;
  /** The keys failed to load: a "Couldn’t load your API keys" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

// Times are days before 9:00 UTC on 12 November 2026, so the demo reads the same whenever it's drawn.
const day = (n: number) => Date.UTC(2026, 10, 12, 9) - n * 86400_000;
const demo: ApiKey[] = [
  { id: 'k1', name: 'Deploy bot', ends: '7Qx2', access: 'write', created: day(40), lastUsed: day(0), expires: day(-325) },
  { id: 'k2', name: 'Analytics export', ends: 'm4Ld', access: 'read', created: day(120), lastUsed: day(6), expires: null },
  { id: 'k3', name: 'Old staging test', ends: 'Pz09', access: 'read', created: day(300), lastUsed: null, expires: day(-10) },
];
const demoSecret = 'acme_demo_key_shown_once_8Kd7Ba3L';

const ACCESS: { value: ApiKeyAccess; label: string; hint: string }[] = [
  { value: 'read', label: 'Read only', hint: 'Can look at projects and data, not change them.' },
  { value: 'write', label: 'Read and write', hint: 'Can also change and delete projects and data.' },
];
const EXPIRY = [{ value: '30', label: 'In 30 days' }, { value: '90', label: 'In 90 days' }, { value: '365', label: 'In a year' }, { value: 'never', label: 'Never' }];

/** What's wrong with a new key's name, in words, or null when it's good. Names are compared without case. */
export function keyNameProblem(name: string, taken: readonly string[]): string | null {
  const n = name.trim();
  if (!n) return 'Name the key, so you know what uses it.';
  if (taken.some((t) => t.toLocaleLowerCase() === n.toLocaleLowerCase())) return `A key is already called “${n}”. Choose another name.`;
  return null;
}

/** The API keys page: a skip link, a header, then main with the h1 and Create key, and the keys. */
export function ApiKeys({ keys = demo, onCreate, onRevoke, loading = false, loadFailed = false, onRetry }: ApiKeysProps) {
  const locale = useLocale();
  const [made, setMade] = React.useState<ApiKey[]>([]);
  const [gone, setGone] = React.useState<ReadonlySet<string>>(new Set());
  const shown = [...made, ...keys].filter((k) => !gone.has(k.id));
  const listHeading = React.useRef<HTMLHeadingElement>(null);
  const afterRevoke = React.useRef<HTMLElement | null>(null);

  // Creating: the form, then the new key's secret, shown once.
  const [creating, setCreating] = React.useState(false);
  const [draft, setDraft] = React.useState<{ name: string; access: ApiKeyAccess; expiry: string }>({ name: '', access: 'read', expiry: '90' });
  const [nameProblem, setNameProblem] = React.useState<string | null>(null);
  const [createFailed, setCreateFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [secret, setSecret] = React.useState<string | null>(null);
  const openCreate = (o: boolean) => {
    setCreating(o);
    if (!o) { setSecret(null); setNameProblem(null); setCreateFailed(false); setDraft({ name: '', access: 'read', expiry: '90' }); }
  };
  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const found = keyNameProblem(draft.name, shown.map((k) => k.name));
    setNameProblem(found);
    setCreateFailed(false);
    if (found) { document.getElementById('key-name')?.focus(); return; }
    const d: ApiKeyDraft = { name: draft.name.trim(), access: draft.access, expiresInDays: draft.expiry === 'never' ? null : Number(draft.expiry) };
    setBusy(true);
    void Promise.resolve().then(() => (onCreate ? onCreate(d) : demoSecret)).then((s) => {
      const now = Date.now();
      setMade((m) => [{ id: `new-${now}`, name: d.name, ends: s.slice(-4), access: d.access, created: now, lastUsed: null,
        expires: d.expiresInDays === null ? null : now + d.expiresInDays * 86400_000 }, ...m]);
      setSecret(s);
      // The form's button is gone: Copy, the one thing to do now, takes focus.
      requestAnimationFrame(() => document.getElementById('key-copy')?.focus());
    }, () => setCreateFailed(true)).finally(() => setBusy(false));
  };

  // Revoking: asks first, since whatever uses the key stops working at once.
  const [revoking, setRevoking] = React.useState<ApiKey | null>(null);
  const [revokeFailed, setRevokeFailed] = React.useState(false);
  const [revokeBusy, setRevokeBusy] = React.useState(false);
  const askRevoke = (k: ApiKey | null) => { setRevoking(k); setRevokeFailed(false); };
  const revoke = () => {
    const k = revoking;
    if (!k) return;
    setRevokeBusy(true);
    setRevokeFailed(false);
    void Promise.resolve().then(() => onRevoke?.(k.id)).then(() => {
      const at = shown.indexOf(k), next = shown[at + 1] ?? shown[at - 1];
      afterRevoke.current = next ? document.getElementById(`revoke-${next.id}`) : listHeading.current;
      setGone((g) => new Set(g).add(k.id));
      setRevoking(null);
      toast({ title: `Revoked ${k.name}`, tone: 'success' });
    }, () => setRevokeFailed(true)).finally(() => setRevokeBusy(false));
  };

  const date = (t: number | string) => {
    const d = new Date(t);
    let text: string;
    try { text = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d); } catch { text = d.toISOString().slice(0, 10); }
    return <time dateTime={d.toISOString()}>{text}</time>;
  };
  const accessLabel = (a: ApiKeyAccess) => ACCESS.find((x) => x.value === a)!.label;
  const head = (
    <TableHead><TableRow>
      <TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Key</TableHeaderCell><TableHeaderCell>Access</TableHeaderCell>
      <TableHeaderCell>Created</TableHeaderCell><TableHeaderCell>Last used</TableHeaderCell><TableHeaderCell>Expires</TableHeaderCell>
      <TableHeaderCell><span className="sr-only">Actions</span></TableHeaderCell>
    </TableRow></TableHead>
  );

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 outline-none">
        <PageHeader title="API keys" description="Keys let your scripts and tools use this workspace. Keep each one secret, like a password."
          primary={loadFailed ? undefined : { label: 'Create key', onSelect: () => openCreate(true) }} />

        {loadFailed ? <EmptyLoadFailed title="Couldn’t load your API keys" onRetry={() => onRetry?.()} headingLevel={2} /> : (
          <Card className="flex flex-col gap-3">
            <Heading level={2} size="lg" ref={listHeading} tabIndex={-1} className="outline-none">
              {loading ? 'Keys' : `Keys (${shown.length})`}
            </Heading>
            {loading ? (
              <Table caption="API keys" hideCaption busy>{head}<TableLoadingRows columns={7} rows={3} label="Loading API keys" /></Table>
            ) : !shown.length ? (
              <EmptyState icon="key" title="No API keys yet" headingLevel={3}
                description="Create a key when a script or tool needs to use this workspace." />
            ) : (
              <Table caption="API keys" hideCaption>
                {head}
                <TableBody>{shown.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="whitespace-nowrap font-mono">…{k.ends}</TableCell>
                    <TableCell><Badge>{accessLabel(k.access)}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap">{date(k.created)}</TableCell>
                    <TableCell className="whitespace-nowrap">{k.lastUsed == null ? 'Never' : date(k.lastUsed)}</TableCell>
                    <TableCell className="whitespace-nowrap">{k.expires == null ? 'Never' : date(k.expires)}</TableCell>
                    <TableCell>
                      <Button id={`revoke-${k.id}`} size="sm" variant="ghost" destructive aria-label={`Revoke ${k.name}`} onClick={() => askRevoke(k)}>Revoke</Button>
                    </TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </Card>
        )}

        <Dialog open={creating} onOpenChange={openCreate}
          title={secret ? 'Copy your new key' : 'Create an API key'}
          description={secret
            ? 'This is the only time it’s shown. Store it where your script reads its secrets, or in a password manager.'
            : 'Give it only the access it needs. You can revoke it at any time.'}>
          {secret ? (
            <div className="flex flex-col gap-4">
              <code id="key-secret" className="rounded-md border border-border bg-surface-muted p-3 font-mono text-sm break-all">{secret}</code>
              <div className="flex flex-wrap gap-2">
                <CopyButton id="key-copy" value={secret} copiedLabel="Copied" aria-describedby="key-secret">Copy the key</CopyButton>
                <Button variant="outline" onClick={() => openCreate(false)}>Done</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={create} noValidate className="flex flex-col gap-4">
              {createFailed ? <Alert tone="danger">Couldn’t create the key. Try again.</Alert> : null}
              <Field label="Name" id="key-name" hint="What uses it, like “Deploy bot”." error={nameProblem ?? undefined} required>
                <Input value={draft.name} autoComplete="off" onChange={(e) => { setDraft({ ...draft, name: e.target.value }); if (nameProblem) setNameProblem(null); }} />
              </Field>
              <Field label="Access" group>
                <RadioGroup name="key-access" value={draft.access} onValueChange={(v) => setDraft({ ...draft, access: v })}>
                  {ACCESS.map((a) => <Radio key={a.value} value={a.value} description={a.hint}>{a.label}</Radio>)}
                </RadioGroup>
              </Field>
              <Field label="Stops working" id="key-expiry" hint="A key that ends limits the harm if it leaks.">
                <Select value={draft.expiry} options={EXPIRY} onChange={(e) => setDraft({ ...draft, expiry: e.target.value })} />
              </Field>
              <Button type="submit" className="self-start" loading={busy}>Create key</Button>
            </form>
          )}
        </Dialog>

        <Dialog alert open={!!revoking} onOpenChange={(o) => { if (!o) askRevoke(null); }} finalFocus={afterRevoke}
          title={revoking ? `Revoke ${revoking.name}?` : 'Revoke this key?'}
          description="Anything using this key stops working at once. You can’t undo this, but you can create a new key.">
          <div className="flex flex-col gap-4">
            {revokeFailed ? <Alert tone="danger">Couldn’t revoke the key. It still works. Try again.</Alert> : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => askRevoke(null)}>Keep it</Button>
              <Button variant="outline" destructive loading={revokeBusy} onClick={revoke}>Revoke key</Button>
            </div>
          </div>
        </Dialog>
      </main>
      <Toaster />
    </div>
  );
}
