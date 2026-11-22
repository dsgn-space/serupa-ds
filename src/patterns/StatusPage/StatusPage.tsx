'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Link } from '../../components/Link/Link';
import { StatusTracker, type StatusDay, type StatusState } from '../../components/StatusTracker/StatusTracker';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { FormattedDate } from '../../components/FormattedDate/FormattedDate';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Status page: is it working now, each service's last 90 days, what's being done about a problem, and email updates.
   For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 1.4.1: the overall state leads, in words, as an alert's title; each service's state is a word in a badge,
     never a color alone; each day of its strip is named in words by StatusTracker.
   - 1.3.1, 2.4.6: each service and each incident is named by its heading; an incident's updates are an ordered list,
     newest first, each with its time in a <time>.
   - 3.3.1, 4.1.3: subscribing with a wrong email says so next to the field; subscribed, it says so in a status and
     what to expect.
   Knowing the state is the app's job: pass the services, their days, and the incidents. */

export type ServiceState = 'up' | 'degraded' | 'down';
export interface Service { id: string; name: string; state: ServiceState; days: StatusDay[] }
export interface Incident { id: string; title: string; services: string[]; resolved: boolean; updates: { at: string; status: string; text: string }[] }

export interface StatusPageProps {
  services?: Service[] | undefined;
  incidents?: Incident[] | undefined;
  /** Adds an email to the updates list. Reject when it can't be added. */
  onSubscribe?: ((email: string) => unknown) | undefined;
  /** The services are still loading: a placeholder in their place. Default: false. */
  loading?: boolean | undefined;
  /** The services failed to load: a "Couldn’t load the status" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads them again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

/** `count` days ending on `end` (YYYY-MM-DD), oldest first: up, except the days given by how many days before the end. */
export function serviceDays(end: string, count: number, events: Record<number, { state: StatusState; note?: string }> = {}): StatusDay[] {
  const [y, m, d] = end.split('-').map(Number) as [number, number, number];
  return Array.from({ length: count }, (_, i) => {
    const back = count - 1 - i;
    const date = new Date(y, m - 1, d - back);
    return { date, state: events[back]?.state ?? 'up', note: events[back]?.note };
  });
}

/** The worst state of the services: one down makes it down, else one degraded makes it degraded. */
export function overallState(services: Service[]): ServiceState {
  return services.some((s) => s.state === 'down') ? 'down' : services.some((s) => s.state === 'degraded') ? 'degraded' : 'up';
}

const END = '2026-03-12';
const demoServices: Service[] = [
  { id: 'api', name: 'API', state: 'up', days: serviceDays(END, 90, { 34: { state: 'down', note: 'Outage, 38 minutes' }, 61: { state: 'degraded', note: 'Slow responses' } }) },
  { id: 'dashboard', name: 'Dashboard', state: 'up', days: serviceDays(END, 90, { 34: { state: 'degraded', note: 'Sign-in failing for some' } }) },
  { id: 'webhooks', name: 'Webhooks', state: 'degraded', days: serviceDays(END, 90, { 0: { state: 'degraded', note: 'Deliveries delayed' } }) },
  { id: 'email', name: 'Email delivery', state: 'up', days: serviceDays(END, 90) },
];
const demoIncidents: Incident[] = [
  { id: 'i3', title: 'Webhooks delivered late', services: ['webhooks'], resolved: false, updates: [
    { at: '2026-03-12T10:40', status: 'Monitoring', text: 'The backlog is clearing; deliveries are about 2 minutes late and catching up.' },
    { at: '2026-03-12T09:55', status: 'Identified', text: 'A queue worker stopped after a deploy. We’ve restarted it and are adding more.' },
    { at: '2026-03-12T09:20', status: 'Investigating', text: 'Some webhooks are arriving up to 20 minutes late. Nothing is lost.' },
  ] },
  { id: 'i2', title: 'API down for 38 minutes', services: ['api', 'dashboard'], resolved: true, updates: [
    { at: '2026-02-06T15:12', status: 'Resolved', text: 'A database failover took longer than it should. Everything is back, and we’re changing how failover is tested.' },
    { at: '2026-02-06T14:34', status: 'Investigating', text: 'The API is returning errors. The dashboard can’t sign people in.' },
  ] },
];
const STATE: Record<ServiceState, { word: string; tone: 'success' | 'warning' | 'danger' }> = {
  up: { word: 'Working', tone: 'success' },
  degraded: { word: 'Slow or partly working', tone: 'warning' },
  down: { word: 'Not working', tone: 'danger' },
};
const TITLE: Record<ServiceState, string> = {
  up: 'Everything is working',
  degraded: 'Some things are slow or partly working',
  down: 'Some things aren’t working',
};

/** The status page: a skip link, a header, then main with the h1, the overall state, incidents, services and updates. */
export function StatusPage({ services = demoServices, incidents = demoIncidents, onSubscribe, loading = false, loadFailed = false, onRetry, online }: StatusPageProps) {
  const locale = useLocale();
  const [email, setEmail] = React.useState('');
  const [problem, setProblem] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState('');
  const overall = overallState(services);
  const open = incidents.filter((i) => !i.resolved);
  const past = incidents.filter((i) => i.resolved);
  const names = (ids: string[]) => ids.map((id) => services.find((s) => s.id === id)?.name ?? id).join(', ');

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    const wrong = !v ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter an email address like name@example.com.';
    setProblem(wrong);
    setDone('');
    if (wrong) { document.getElementById('status-email')?.focus(); return; }
    setBusy(true);
    void Promise.resolve().then(() => onSubscribe?.(v)).then(() => { setDone(`Subscribed. Updates go to ${v}.`); setEmail(''); },
      () => setProblem('Couldn’t subscribe you. Try again in a moment.')).finally(() => setBusy(false));
  };

  const incident = (i: Incident) => (
    <article key={i.id} aria-labelledby={`incident-${i.id}`} className="flex flex-col gap-3 text-sm">
      <h3 id={`incident-${i.id}`} className="m-0 text-base font-semibold">{i.title}</h3>
      <p className="m-0 text-sm text-text-muted">Affects {names(i.services)}</p>
      <ol className="m-0 flex list-none flex-col gap-3 border-s-2 border-border ps-4">
        {i.updates.map((u) => (
          <li key={u.at}>
            <p className="m-0"><strong>{u.status}</strong> · <FormattedDate value={u.at} options={{ day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }} className="text-sm text-text-muted" /></p>
            <p className="m-0">{u.text}</p>
          </li>
        ))}
      </ol>
    </article>
  );

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme status</p>
        <Link underline="hover" href="#support">Contact support</Link>
      </header>
      <Container as="main" size="md" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">This is the status from when the page loaded. It may have changed.</OfflineBanner>
          <PageHeader title="Acme status" description="How our services are doing now and over the last 90 days." />
          {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load the status" onRetry={() => onRetry?.()} headingLevel={2} /></div>
            : loading ? <Card className="mt-6"><Skeleton shape="text" lines={6} label="Loading the status" /></Card> : (<>
          <div className="flex flex-col gap-8 pt-6">
            <Alert tone={STATE[overall].tone} title={TITLE[overall]}>
              {open.length ? `${open.length === 1 ? 'An incident is' : `${formatNumber(open.length, locale)} incidents are`} open; the latest updates are below.` : 'No open incidents.'}
            </Alert>
            {open.length ? (
              <section aria-labelledby="status-now" className="flex flex-col gap-4">
                <h2 id="status-now" className="m-0 text-lg font-semibold">Open incidents</h2>
                {open.map((i) => <Card key={i.id}>{incident(i)}</Card>)}
              </section>
            ) : null}
            <section aria-labelledby="status-services" className="flex flex-col gap-4">
              <h2 id="status-services" className="m-0 text-lg font-semibold">Services</h2>
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {services.map((s, n) => (
                  <li key={s.id}>
                    <Card className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="m-0 text-base font-semibold">{s.name}</h3>
                        <Badge tone={STATE[s.state].tone}>{STATE[s.state].word}</Badge>
                      </div>
                      <StatusTracker label={s.name} days={s.days} legend={n === services.length - 1} />
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
            {past.length ? (
              <section aria-labelledby="status-past" className="flex flex-col gap-4">
                <h2 id="status-past" className="m-0 text-lg font-semibold">Past incidents</h2>
                {past.map((i) => incident(i))}
              </section>
            ) : null}
            <section aria-labelledby="status-updates" className="flex flex-col gap-4">
              <h2 id="status-updates" className="m-0 text-lg font-semibold">Get updates by email</h2>
              <form onSubmit={subscribe} noValidate className="flex max-w-md flex-col items-start gap-3" aria-labelledby="status-updates">
                <Field label="Email" id="status-email" hint="We email when an incident starts, changes or ends. Unsubscribe from any email." error={problem || undefined} className="w-full">
                  <Input type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setProblem(''); }} />
                </Field>
                <Button type="submit" loading={busy}>Subscribe</Button>
              </form>
              <p role="status" id="status-subscribed" className="m-0">{done}</p>
            </section>
          </div>
          </>)}
        </Stack>
      </Container>
    </div>
  );
}
