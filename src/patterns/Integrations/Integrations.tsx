'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { IconTile } from '../../components/IconTile/IconTile';
import { Field } from '../../components/Field/Field';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { Dialog } from '../../components/Dialog/Dialog';
import { Alert } from '../../components/Alert/Alert';
import { Loader } from '../../components/Loader/Loader';
import { Toaster, toast } from '../../components/Toast/Toast';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed, EmptyNoResults } from '../../blocks/EmptyStates/EmptyStates';

/* Integrations: the other apps a workspace can connect, which are connected, connecting one and disconnecting one.
   For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: connected and available apps are two lists under their own headings, and each app is a heading, so
     a screen reader can list them and jump between them.
   - 2.4.6, 4.1.2: each button is named with its app ("Connect Slack", "Disconnect GitHub"), so a list of them isn't
     "Connect, Connect, Connect".
   - 1.4.1: connected is said in words, not only by a color or a mark.
   - 4.1.3: how many apps match the search is a status, so it's said politely as people type.
   - 3.3.4: disconnecting stops what the app does at once, so it asks first and says what stops.
   - 3.3.1: a connect that fails says so on that app's card, with what to do; a failed disconnect says so in its dialog.
   - 2.4.3: after a connect or a disconnect, focus goes to the app's button in the list it moved to, never to the top.
   Connecting (usually a sign-in on the other app's page) and disconnecting are the app's job: onConnect and
   onDisconnect get the app's id. */

export interface Integration {
  id: string;
  name: string;
  /** What it does once connected, in a sentence. */
  description: string;
  /** Its picture: a Serupa icon name or your own SVG. */
  icon: React.ComponentProps<typeof IconTile>['icon'];
  connected?: boolean | undefined;
  /** What stops when it's disconnected, said before it is: "New issues stop showing on your projects." */
  stops?: string | undefined;
}

export interface IntegrationsProps {
  /** The apps, in the order to show them. Default: six demo apps, two connected. */
  apps?: readonly Integration[] | undefined;
  /** Connect was pressed. Return its promise: a rejection says on the app's card that it didn't connect. */
  onConnect?: ((id: string) => unknown) | undefined;
  /** Disconnect was pressed and confirmed. Return its promise: a rejection keeps it connected and says so. */
  onDisconnect?: ((id: string) => unknown) | undefined;
  /** The apps are on their way: placeholder cards, named once ("Loading integrations"). Default: false. */
  loading?: boolean | undefined;
  /** The apps failed to load: a "Couldn’t load your integrations" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const demo: Integration[] = [
  { id: 'slack', name: 'Slack', icon: 'forum', connected: true, description: 'Posts a message to a channel when a project changes.', stops: 'Messages stop going to your Slack channels.' },
  { id: 'github', name: 'GitHub', icon: 'code', connected: true, description: 'Links pull requests and issues to projects.', stops: 'Pull requests and issues stop showing on your projects.' },
  { id: 'calendar', name: 'Google Calendar', icon: 'calendar_month', description: 'Adds project due dates to a calendar.' },
  { id: 'drive', name: 'Google Drive', icon: 'folder', description: 'Attaches files from Drive to projects.' },
  { id: 'zapier', name: 'Zapier', icon: 'bolt', description: 'Connects to thousands of other apps without code.' },
  { id: 'stripe', name: 'Stripe', icon: 'payments', description: 'Shows payments and invoices next to customers.' },
];

/** The apps whose name or description holds every word of the query. */
export function matchIntegrations(apps: readonly Integration[], query: string): Integration[] {
  const words = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return apps.filter((a) => words.every((w) => `${a.name} ${a.description}`.toLocaleLowerCase().includes(w)));
}

/** The integrations page: a skip link, a header, then main with the h1, a search, and the connected and available apps. */
export function Integrations({ apps = demo, onConnect, onDisconnect, loading = false, loadFailed = false, onRetry }: IntegrationsProps) {
  const [on, setOn] = React.useState<Record<string, boolean>>({});
  const [query, setQuery] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState<string | null>(null);
  const [asking, setAsking] = React.useState<Integration | null>(null);
  const [disconnectFailed, setDisconnectFailed] = React.useState(false);
  const isOn = (a: Integration) => on[a.id] ?? !!a.connected;
  const found = matchIntegrations(apps, query);
  const connected = found.filter(isOn), available = found.filter((a) => !isOn(a));
  const later = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());

  const connect = (a: Integration) => {
    setBusy(a.id);
    setFailed(null);
    void Promise.resolve().then(() => onConnect?.(a.id)).then(() => {
      setOn((o) => ({ ...o, [a.id]: true }));
      toast({ title: `Connected ${a.name}`, tone: 'success' });
      later(`disconnect-${a.id}`);
    }, () => setFailed(a.id)).finally(() => setBusy(null));
  };
  const ask = (a: Integration | null) => { setAsking(a); setDisconnectFailed(false); };
  const disconnect = () => {
    const a = asking;
    if (!a) return;
    setBusy(a.id);
    setDisconnectFailed(false);
    void Promise.resolve().then(() => onDisconnect?.(a.id)).then(() => {
      setOn((o) => ({ ...o, [a.id]: false }));
      setAsking(null);
      toast({ title: `Disconnected ${a.name}`, tone: 'success' });
      // The dialog gives focus back to its opener, which moved lists: Connect, in the available list, takes it.
      later(`connect-${a.id}`);
    }, () => setDisconnectFailed(true)).finally(() => setBusy(null));
  };

  const card = (a: Integration) => {
    const connectedNow = isOn(a);
    return (
      <li key={a.id} className="flex">
        <Card className="flex w-full flex-col gap-3">
          <div className="flex items-start gap-3">
            <IconTile icon={a.icon} tone={connectedNow ? 'primary' : 'neutral'} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Heading level={3} size="base">{a.name}</Heading>
              <p className="m-0 text-sm text-text-muted">{a.description}</p>
            </div>
            {connectedNow ? <Badge tone="success">Connected</Badge> : null}
          </div>
          {failed === a.id ? <Alert tone="danger">Couldn’t connect {a.name}. Check that you allowed it on {a.name}’s page, then try again.</Alert> : null}
          <div className="mt-auto flex flex-wrap gap-2">
            {connectedNow ? (
              <Button id={`disconnect-${a.id}`} size="sm" variant="outline" aria-label={`Disconnect ${a.name}`} onClick={() => ask(a)}>Disconnect</Button>
            ) : (
              <Button id={`connect-${a.id}`} size="sm" variant="outline" aria-label={`Connect ${a.name}`} loading={busy === a.id} onClick={() => connect(a)}>Connect</Button>
            )}
          </div>
        </Card>
      </li>
    );
  };
  const list = (title: string, items: Integration[], none: string) => (
    <section aria-labelledby={`integrations-${title.toLowerCase()}`} className="flex flex-col gap-3">
      <Heading level={2} size="lg" id={`integrations-${title.toLowerCase()}`}>{title} ({items.length})</Heading>
      {items.length ? <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">{items.map(card)}</ul>
        : <p className="m-0 text-text-muted">{none}</p>}
    </section>
  );

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 outline-none">
        <PageHeader title="Integrations" description="Connect the other apps your team uses. Only admins can connect or disconnect them." />

        {loadFailed ? <EmptyLoadFailed title="Couldn’t load your integrations" onRetry={() => onRetry?.()} headingLevel={2} /> : loading ? (
          <ul role="list" aria-busy="true" className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
            {/* One name for all of them: the first card is named, the others are only pictures. */}
            {[0, 1, 2, 3].map((i) => <li key={i}><Card><Loader variant="skeleton" shape="text" lines={3} label={i === 0 ? 'Loading integrations' : ''} /></Card></li>)}
          </ul>
        ) : <>
          <Field label="Search integrations" className="max-w-md">
            <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} clearLabel="Clear the search" />
          </Field>
          <p role="status" className="m-0 text-sm text-text-muted">{found.length === 1 ? '1 app' : `${found.length} apps`}</p>
          {found.length ? <>
            {list('Connected', connected, 'None of these are connected.')}
            {list('Available', available, 'Every one of these is connected.')}
          </> : (
            <EmptyNoResults query={query.trim()} headingLevel={2} title={(q) => `No apps match “${q}”`}
              description="Try another name, or what you want it to do." onClearFilters={() => setQuery('')} />
          )}
        </>}

        <Dialog alert open={!!asking} onOpenChange={(o) => { if (!o) ask(null); }}
          title={asking ? `Disconnect ${asking.name}?` : 'Disconnect?'}
          description={`${asking?.stops ?? 'It stops working with this workspace.'} You can connect it again at any time.`}>
          <div className="flex flex-col gap-4">
            {disconnectFailed ? <Alert tone="danger">Couldn’t disconnect {asking?.name}. It’s still connected. Try again.</Alert> : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => ask(null)}>Keep it</Button>
              <Button variant="outline" destructive loading={!!asking && busy === asking.id} onClick={disconnect}>Disconnect</Button>
            </div>
          </div>
        </Dialog>
      </main>
      <Toaster />
    </div>
  );
}
