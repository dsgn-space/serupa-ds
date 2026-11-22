'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Dialog } from '../../components/Dialog/Dialog';
import { Field } from '../../components/Field/Field';
import { Link } from '../../components/Link/Link';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { Textarea } from '../../components/Textarea/Textarea';
import { Toaster, toast } from '../../components/Toast/Toast';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Loader } from '../../components/Loader/Loader';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { formatDate } from '../../components/FormattedDate/FormattedDate';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Approvals: the requests waiting on you (expenses, leave, purchases), each with what you need to decide, approved in
   one press with Undo, or declined with a reason the asker will read. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: each request is an article whose heading names who asked and for what; its details are a list of terms.
   - 2.4.6, 4.1.2: Approve and Decline start with their visible words and go on to name the request.
   - 3.3.4: approving can be undone while its toast is up, and nothing is sent until it closes; declining asks for a
     reason first, in a dialog that says the asker will read it.
   - 3.3.1: declining without a reason says what's missing at the field.
   - 2.4.3: once a request is decided, focus goes to the next one's heading, or to the list's when none is left.
   - 4.1.3: switching between Waiting and Decided says how many each holds; Undo says the request is back.
   - 1.4.1: a decision is a word (Approved, Declined), never only a color.
   Sending the decision is the app's job: onDecide gets it once the Undo time is over. */

export type RequestKind = 'expense' | 'leave' | 'purchase';
export interface ApprovalRequest { id: string; who: string; kind: RequestKind; what: string; amount?: number | undefined; days?: number | undefined; asked: string; note?: string | undefined }
export interface Decision { id: string; approved: boolean; reason?: string | undefined }

export interface ApprovalsProps {
  requests?: ApprovalRequest[] | undefined;
  /** The money amounts are in. Default: "USD". */
  currency?: string | undefined;
  /** Sends a decision, once its Undo time is over. */
  onDecide?: ((decision: Decision) => void) | undefined;
  /** Still loading: a placeholder shows instead of the requests. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load your requests" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: ApprovalRequest[] = [
  { id: 'r1', who: 'Dewi Lestari', kind: 'expense', what: 'Taxi to the Jakarta client visit', amount: 46.5, asked: '2026-11-14', note: 'Receipt attached. The train wasn’t running.' },
  { id: 'r2', who: 'Kofi Mensah', kind: 'leave', what: 'Annual leave, 22 to 26 December', days: 5, asked: '2026-11-13' },
  { id: 'r3', who: 'Lena Vogel', kind: 'purchase', what: 'A second monitor for design work', amount: 329, asked: '2026-11-12', note: 'The one on the approved list.' },
];
const KIND: Record<RequestKind, string> = { expense: 'Expense', leave: 'Leave', purchase: 'Purchase' };

/** The id whose heading takes focus once one is decided: the next waiting one, else the one before, else none. */
export function nextAfter(ids: string[], id: string): string | null {
  const i = ids.indexOf(id);
  const rest = ids.filter((x) => x !== id);
  if (!rest.length) return null;
  return rest[Math.min(Math.max(i, 0), rest.length - 1)]!;
}

/** The approvals page: a skip link, a header, then main with the h1, Waiting or Decided, and the requests. */
export function Approvals({ requests = demo, currency = 'USD', onDecide, loading = false, loadFailed = false, onRetry, online }: ApprovalsProps) {
  const locale = useLocale();
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency });
  const day = (iso: string) => formatDate(iso, locale, { options: { day: 'numeric', month: 'long' } });
  const [decided, setDecided] = React.useState<Decision[]>([]);
  const [show, setShow] = React.useState<'waiting' | 'decided'>('waiting');
  const [declining, setDeclining] = React.useState<ApprovalRequest | null>(null);
  const [reason, setReason] = React.useState('');
  const [reasonError, setReasonError] = React.useState('');
  const [focusTo, setFocusTo] = React.useState<{ id: string | null } | null>(null);
  const listHeading = React.useRef<HTMLHeadingElement>(null);
  const after = React.useRef<HTMLElement | null>(null);
  const waiting = requests.filter((r) => !decided.some((d) => d.id === r.id));
  const done = decided.map((d) => ({ d, r: requests.find((r) => r.id === d.id)! }));
  const title = (r: ApprovalRequest) => `${r.who}: ${r.what}`;
  const heading = (id: string | null): HTMLElement | null => (id ? document.getElementById(`approval-${id}`) : listHeading.current);

  const decide = (r: ApprovalRequest, d: Decision) => {
    const next = nextAfter(waiting.map((w) => w.id), r.id);
    setDecided((now) => [d, ...now]);
    toast.undo({
      title: `${d.approved ? 'Approved' : 'Declined'} ${r.who}’s ${KIND[r.kind].toLowerCase()}`,
      commit: () => onDecide?.(d),
      onUndo: () => { setDecided((now) => now.filter((x) => x.id !== d.id)); setShow('waiting'); setFocusTo({ id: r.id }); announce(`${title(r)} is back in Waiting`); },
    });
    return next;
  };
  const approve = (r: ApprovalRequest) => setFocusTo({ id: decide(r, { id: r.id, approved: true }) });
  const decline = () => {
    if (!declining) return;
    if (!reason.trim()) { setReasonError(`Say why, so ${declining.who} knows what to change.`); return; }
    const next = decide(declining, { id: declining.id, approved: false, reason: reason.trim() });
    after.current = heading(next);
    setDeclining(null);
  };
  React.useEffect(() => {
    if (focusTo) (focusTo.id ? document.getElementById(`approval-${focusTo.id}`) : listHeading.current)?.focus();
  }, [focusTo]);

  const details = (r: ApprovalRequest) => (
    <DescriptionList className="text-sm">
      <DescriptionItem term="Kind">{KIND[r.kind]}</DescriptionItem>
      {r.amount !== undefined ? <DescriptionItem term="Amount">{money(r.amount)}</DescriptionItem> : null}
      {r.days !== undefined ? <DescriptionItem term="Days">{r.days === 1 ? '1 working day' : `${formatNumber(r.days, locale)} working days`}</DescriptionItem> : null}
      <DescriptionItem term="Asked">{day(r.asked)}</DescriptionItem>
      {r.note ? <DescriptionItem term="Note">{r.note}</DescriptionItem> : null}
    </DescriptionList>
  );

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme People</p>
        <Link underline="hover" href="#team">Your team</Link>
      </header>
      <Container as="main" size="md" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">These are the requests loaded before you went offline. Approving or declining needs a connection.</OfflineBanner>
          <PageHeader title="Approvals" description={loading || loadFailed ? undefined : waiting.length ? `${waiting.length === 1 ? '1 request is' : `${formatNumber(waiting.length, locale)} requests are`} waiting on you.` : 'Nothing is waiting on you.'} />
          {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load your requests" onRetry={() => onRetry?.()} headingLevel={2} /></div>
            : loading ? <Card className="mt-6"><Loader variant="skeleton" shape="text" lines={6} label="Loading requests" /></Card> : (<>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <SegmentedControl aria-label="Show" value={show} onValueChange={setShow}
              options={[{ value: 'waiting', label: 'Waiting' }, { value: 'decided', label: 'Decided' }]} />
            <p role="status" id="approvals-shown" className="m-0 text-sm text-text-muted">
              {show === 'waiting' ? `${formatNumber(waiting.length, locale)} waiting` : `${formatNumber(done.length, locale)} decided`}
            </p>
          </div>
          <section aria-labelledby="approvals-list" className="flex flex-col gap-4 pt-4">
            <h2 id="approvals-list" ref={listHeading} tabIndex={-1} className="m-0 text-xl font-semibold outline-none">{show === 'waiting' ? 'Waiting' : 'Decided'}</h2>
            {show === 'waiting' ? (
              waiting.length ? waiting.map((r) => (
                <Card key={r.id} as="article" padding="sm" aria-labelledby={`approval-${r.id}`} className="gap-3">
                  <h3 id={`approval-${r.id}`} tabIndex={-1} className="m-0 text-base font-semibold outline-none">{title(r)}</h3>
                  {details(r)}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => approve(r)} aria-label={`Approve ${title(r)}`}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => { setReason(''); setReasonError(''); setDeclining(r); }} aria-label={`Decline ${title(r)}`}>Decline</Button>
                  </div>
                </Card>
              )) : <p className="m-0 text-text-muted">You’re all caught up. New requests show here.</p>
            ) : (
              done.length ? done.map(({ d, r }) => (
                <Card key={r.id} as="article" padding="sm" aria-labelledby={`approval-${r.id}`} className="gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 id={`approval-${r.id}`} tabIndex={-1} className="m-0 text-base font-semibold outline-none">{title(r)}</h3>
                    <Badge tone={d.approved ? 'success' : 'danger'}>{d.approved ? 'Approved' : 'Declined'}</Badge>
                  </div>
                  {details(r)}
                  {d.reason ? <p className="m-0 text-sm">Your reason: {d.reason}</p> : null}
                </Card>
              )) : <p className="m-0 text-text-muted">You haven’t decided anything yet.</p>
            )}
          </section>
          <Dialog open={!!declining} onOpenChange={(open) => { if (!open) setDeclining(null); }} finalFocus={after}
            title={declining ? `Decline ${declining.who}’s ${KIND[declining.kind].toLowerCase()}?` : ''}
            description={declining ? `${declining.what}. ${declining.who} will read your reason.` : ''}>
            <div className="flex flex-col gap-4">
              <Field label="Why are you declining it?" id="approval-reason" error={reasonError || undefined} required>
                <Textarea value={reason} onChange={(e) => { setReason(e.target.value); setReasonError(''); }} />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button destructive onClick={decline}>Decline</Button>
                <Button variant="outline" onClick={() => setDeclining(null)}>Cancel</Button>
              </div>
            </div>
          </Dialog>
          </>)}
        </Stack>
      </Container>
      <Toaster />
    </div>
  );
}
