'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Checkbox, CheckboxGroup } from '../../components/Checkbox/Checkbox';
import { Field } from '../../components/Field/Field';
import { Link } from '../../components/Link/Link';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Loader } from '../../components/Loader/Loader';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Download your data: choose what to include and in which format, see how big it will be, ask for it, and download
   it once it's ready, before its link runs out. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: what to include is a group of checkboxes named by its question, with one that picks them all; each says
     what it holds and how big it is, as its description.
   - 3.3.2, 4.1.3: the size of what's chosen is said as it changes, and the format says what each opens in.
   - 3.3.1, 2.4.3: asking with nothing chosen shows a summary at the top that takes focus, linked to the group.
   - 3.3.4, 4.1.3: Ask shows it's busy; a request that can't be taken says so and keeps the choices.
   - 2.4.3, 4.1.3: once asked, the exports heading takes focus and the new export says it's being prepared.
   - 1.4.1: each export's state is a word (Preparing, Ready, Expired), never only a color; a ready one's link names
     its date and size, and says when it stops working.
   Making the file is the app's job: onRequest gets the request; reject when it can't be taken. */

export interface DataPart { id: string; label: string; holds: string; bytes: number }
export type ExportFormat = 'json' | 'csv';
export interface PastExport { id: string; asked: string; parts: string[]; format: ExportFormat; bytes: number; state: 'preparing' | 'ready' | 'expired'; expires?: string | undefined; href?: string | undefined }
export interface ExportRequest { parts: string[]; format: ExportFormat }

export interface DataExportProps {
  /** What can be included, each with what it holds and its size in bytes. */
  parts?: DataPart[] | undefined;
  /** Exports asked for before, newest first. */
  exports?: PastExport[] | undefined;
  /** Today, as YYYY-MM-DD: the date a new request is marked with. Default: today. */
  today?: string | undefined;
  /** Takes the request. Reject when it can't be taken. */
  onRequest?: ((request: ExportRequest) => unknown) | undefined;
  /** Your past exports are still loading: a placeholder in their place. Default: false. */
  loading?: boolean | undefined;
  /** Your past exports failed to load: a "Couldn’t load your exports" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads them again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const demoParts: DataPart[] = [
  { id: 'profile', label: 'Profile and settings', holds: 'Your name, email, preferences and sign-in history', bytes: 240_000 },
  { id: 'projects', label: 'Projects', holds: 'Every project, its tasks and comments', bytes: 18_400_000 },
  { id: 'files', label: 'Files', holds: 'Everything you uploaded, in its own format', bytes: 1_320_000_000 },
  { id: 'messages', label: 'Messages', holds: 'Your conversations and their attachments', bytes: 86_000_000 },
];
const demoExports: PastExport[] = [
  { id: 'e2', asked: '2026-11-12', parts: ['profile', 'projects'], format: 'json', bytes: 18_640_000, state: 'ready', expires: '2026-11-19', href: '#export-e2' },
  { id: 'e1', asked: '2026-09-02', parts: ['profile', 'projects', 'files', 'messages'], format: 'csv', bytes: 1_380_000_000, state: 'expired' },
];
const FORMATS: { value: ExportFormat; label: string; opens: string }[] = [
  { value: 'json', label: 'JSON', opens: 'For moving to another app, or for developers' },
  { value: 'csv', label: 'CSV', opens: 'Opens in a spreadsheet, such as Excel or Numbers' },
];
const STATE = { preparing: { word: 'Preparing', tone: 'info' }, ready: { word: 'Ready', tone: 'success' }, expired: { word: 'Expired', tone: 'neutral' } } as const;

/** How big the chosen parts are together, in bytes. */
export function exportSize(parts: DataPart[], chosen: string[]) {
  return parts.filter((p) => chosen.includes(p.id)).reduce((sum, p) => sum + p.bytes, 0);
}

/** A size in the largest unit that keeps it at 1 or more, in the locale's words: "240 kB", "1.3 GB". */
export function sizeWords(bytes: number, locale?: string) {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
  let i = 0;
  let n = bytes;
  while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
  return formatNumber(n, locale, { style: 'unit', unit: units[i], unitDisplay: 'short', maximumFractionDigits: n < 10 && i ? 1 : 0 });
}

/** The page: a skip link, a header, then main with the h1, the choices, and the exports asked for before. */
export function DataExport({ parts = demoParts, exports = demoExports, today, onRequest, loading = false, loadFailed = false, onRetry }: DataExportProps) {
  const locale = useLocale();
  const day = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const size = (b: number) => sizeWords(b, locale);
  const [chosen, setChosen] = React.useState<string[]>(parts.map((p) => p.id));
  const [format, setFormat] = React.useState<ExportFormat>('json');
  const [problem, setProblem] = React.useState('');
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [list, setList] = React.useState(exports);
  const [asked, setAsked] = React.useState(0);
  const listHeading = React.useRef<HTMLHeadingElement>(null);
  const total = exportSize(parts, chosen);
  const errors: ErrorSummaryItem[] = problem ? [{ field: 'export-parts', message: problem }] : [];
  const labelOf = (id: string) => parts.find((p) => p.id === id)?.label ?? id;

  const request = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = chosen.length ? '' : 'Choose at least one thing to include.';
    setProblem(found);
    setTries((t) => t + 1);
    if (found) return;
    setBusy(true);
    const req: ExportRequest = { parts: chosen, format };
    void Promise.resolve().then(() => onRequest?.(req)).then(() => {
      const on = today ?? new Date().toISOString().slice(0, 10);
      setList((now) => [{ id: `new-${now.length}`, asked: on, parts: chosen, format, bytes: total, state: 'preparing' }, ...now]);
      setAsked((n) => n + 1);
    }, () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (asked) listHeading.current?.focus(); }, [asked]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Projects</p>
        <Link href="#settings">Settings</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-2xl flex-col px-4 py-8 outline-none">
        <PageHeader breadcrumb={[{ label: 'Settings', href: '#settings' }, { label: 'Download your data' }]} title="Download your data"
          description="Get a copy of what you’ve put in Acme Projects. We’ll email you when it’s ready, and the link works for 7 days." />
        {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load your exports" onRetry={() => onRetry?.()} headingLevel={2} /></div>
          : loading ? <Card className="mt-6"><Loader variant="skeleton" shape="text" lines={6} label="Loading your exports" /></Card> : (<>
        <form onSubmit={request} noValidate aria-label="What to download" className="flex flex-col gap-4 pt-6">
          <ErrorSummary key={tries} errors={errors} />
          <Field label="What should it include?" group error={problem || undefined} required>
            <CheckboxGroup id="export-parts" variant="card" value={chosen} onValueChange={(v: string[]) => { setChosen(v); setProblem(''); setFailed(false); }}>
              <Checkbox selectAll>Everything</Checkbox>
              {parts.map((p) => <Checkbox key={p.id} value={p.id} description={`${p.holds}. About ${size(p.bytes)}.`}>{p.label}</Checkbox>)}
            </CheckboxGroup>
          </Field>
          <Field label="Format" group>
            <RadioGroup name="export-format" value={format} onValueChange={(v: string) => setFormat(v as ExportFormat)}>
              {FORMATS.map((f) => <Radio key={f.value} value={f.value} description={f.opens}>{f.label}</Radio>)}
            </RadioGroup>
          </Field>
          <Card padding="sm" variant="filled">
            <p className="m-0" aria-live="polite" id="export-size">
              {chosen.length ? <>Your download will be about <strong>{size(total)}</strong>.</> : 'Choose what to include to see its size.'}
            </p>
          </Card>
          <div className="flex flex-col items-start gap-3">
            {failed ? <Alert tone="danger">Couldn’t ask for your data. Try again; your choices are still here.</Alert> : null}
            <Button type="submit" loading={busy}>Ask for my data</Button>
          </div>
        </form>
        <section aria-labelledby="export-list" className="flex flex-col gap-3 pt-10">
          <h2 id="export-list" ref={listHeading} tabIndex={-1} className="m-0 text-xl font-semibold outline-none">Your exports</h2>
          {asked ? <p role="status" id="export-asked" className="m-0">We’re preparing your data. We’ll email you when it’s ready to download.</p> : null}
          {list.length ? (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {list.map((x) => (
                <li key={x.id}>
                  <Card padding="sm" className="flex-row flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="m-0 font-semibold">Asked for on {day(x.asked)}</p>
                      <p className="m-0 text-sm text-text-muted">{x.parts.map(labelOf).join(', ')}. {x.format.toUpperCase()}, about {size(x.bytes)}.</p>
                      {x.state === 'ready' && x.expires ? <p className="m-0 text-sm">The link works until {day(x.expires)}.</p> : null}
                      {x.state === 'expired' ? <p className="m-0 text-sm">Its link has run out. Ask again to get a new one.</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone={STATE[x.state].tone}>{STATE[x.state].word}</Badge>
                      {x.state === 'ready' && x.href ? (
                        <Button href={x.href} variant="outline" size="sm" aria-label={`Download export of ${day(x.asked)}, ${size(x.bytes)}`}>Download</Button>
                      ) : null}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          ) : <p className="m-0 text-text-muted">You haven’t asked for your data yet.</p>}
        </section>
        </>)}
      </main>
    </div>
  );
}
