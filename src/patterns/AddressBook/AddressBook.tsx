'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { Alert } from '../../components/Alert/Alert';
import { Badge } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { Dialog } from '../../components/Dialog/Dialog';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Toaster, toast } from '../../components/Toast/Toast';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Address book: the addresses you've saved for delivery, one of them the default, each edited, removed or made the
   default in place. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the addresses are a list, each an <address>; the default one says so in words in a badge.
   - 2.4.6: every button names the address it acts on ("Edit Home", "Remove Office", "Make default: Office", each starting with the words it shows).
   - 1.3.5, 3.3.2: the form's fields say what they are for autofill (name, address lines, city, postal code,
     country, phone) and which are optional.
   - 3.3.1, 2.4.3: saving with fields missing shows a summary that takes focus, each problem a link to its field, and
     each field says its own.
   - 3.3.4, 4.1.3: saving shows it's busy and closes the dialog only once the server says so; one that fails says so
     in the dialog and keeps every field. Focus goes back to the button that opened it.
   - 3.3.4: Remove takes the address out at once with Undo; the server hears of it only once the toast goes. The
     default address has no Remove: it says to make another the default first.
   - 4.1.3: making one the default is said in a status that's read out.
   Saving is the app's job: onSave gets the address (with no id when new); resolve with its id, reject when it fails. */

export interface SavedAddress {
  id: string;
  /** What you call it: "Home", "Office". */
  label: string;
  name: string;
  line1: string;
  line2?: string | undefined;
  city: string;
  postalCode: string;
  country: string;
  phone?: string | undefined;
}

export interface AddressBookProps {
  /** The saved addresses. Default: two demo addresses. */
  addresses?: SavedAddress[] | undefined;
  /** The default address's id. Default: the first. */
  defaultId?: string | undefined;
  /** The countries to choose from. Default: a short demo list. */
  countries?: string[] | undefined;
  /** Saves a new or changed address. Resolve with its id; reject when it fails. */
  onSave?: ((address: Omit<SavedAddress, 'id'> & { id?: string | undefined }) => unknown) | undefined;
  /** An address was removed, once its Undo has gone. */
  onRemove?: ((id: string) => void) | undefined;
  onDefaultChange?: ((id: string) => void) | undefined;
  /** The addresses are on their way: placeholders, named once ("Loading addresses"). Default: false. */
  loading?: boolean | undefined;
  /** They failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: SavedAddress[] = [
  { id: 'a1', label: 'Home', name: 'Ana Lima', line1: 'Jl. Braga 12', city: 'Bandung', postalCode: '40111', country: 'Indonesia', phone: '+62 812 3456 7890' },
  { id: 'a2', label: 'Office', name: 'Ana Lima', line1: 'Jl. Asia Afrika 8', line2: 'Floor 5', city: 'Bandung', postalCode: '40112', country: 'Indonesia' },
];
const COUNTRIES = ['Australia', 'Indonesia', 'Malaysia', 'Singapore', 'United Kingdom', 'United States'];
const REQUIRED = ['label', 'name', 'line1', 'city', 'postalCode', 'country'] as const;
const SAY: Record<(typeof REQUIRED)[number], string> = {
  label: 'Give the address a name, like Home.', name: 'Enter the name of who it’s for.', line1: 'Enter the street and number.',
  city: 'Enter the town or city.', postalCode: 'Enter the postal code.', country: 'Choose the country.',
};
type Draft = Omit<SavedAddress, 'id'> & { id?: string | undefined };
const blank: Draft = { label: '', name: '', line1: '', line2: '', city: '', postalCode: '', country: '', phone: '' };

/** What's missing from an address, by field, in the order of the form, or {} when it can be saved. */
export function addressProblems(a: Draft): Partial<Record<(typeof REQUIRED)[number], string>> {
  const out: Partial<Record<(typeof REQUIRED)[number], string>> = {};
  for (const k of REQUIRED) if (!String(a[k] ?? '').trim()) out[k] = SAY[k];
  return out;
}

/** The address book page: a skip link, a header, then main with the h1, the addresses and Add address. */
export function AddressBook({ addresses: start = demo, defaultId, countries = COUNTRIES, onSave, onRemove, onDefaultChange, loading = false, loadFailed = false, onRetry, online }: AddressBookProps) {
  const locale = useLocale();
  const [list, setList] = React.useState(start);
  const [def, setDef] = React.useState(defaultId ?? start[0]?.id);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) { setList(start); setDef(defaultId ?? start[0]?.id); } }
  const [gone, setGone] = React.useState<ReadonlySet<string>>(new Set());
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [makeDefault, setMakeDefault] = React.useState(false);
  const [problems, setProblems] = React.useState<ReturnType<typeof addressProblems>>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const shown = list.filter((a) => !gone.has(a.id));
  const later = (f: () => void) => requestAnimationFrame(f);
  const focusId = (id: string) => () => document.getElementById(id)?.focus();

  const errors: ErrorSummaryItem[] = REQUIRED.filter((k) => problems[k]).map((k) => ({ field: `address-${k}`, message: problems[k] }));

  const open = (a: Draft) => { setDraft(a); setMakeDefault(false); setProblems({}); setFailed(false); };
  const edit = (patch: Partial<Draft>) => { setDraft((d) => (d ? { ...d, ...patch } : d)); setFailed(false); };
  const makeDef = (a: SavedAddress) => { setDef(a.id); onDefaultChange?.(a.id); announce(`${a.label} is now your default address`); later(focusId(`edit-${a.id}`)); };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const found = addressProblems(draft);
    setProblems(found);
    setTries((t) => t + 1);
    if (REQUIRED.some((k) => found[k])) return;
    const out: Draft = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])) as Draft;
    setBusy(true);
    setFailed(false);
    void Promise.resolve().then(() => onSave?.(out)).then((id) => {
      const saved: SavedAddress = { ...out, id: out.id ?? (typeof id === 'string' ? id : `new-${Date.now()}`) };
      setList((l) => (out.id ? l.map((a) => (a.id === out.id ? saved : a)) : [...l, saved]));
      if (makeDefault || !def) { setDef(saved.id); onDefaultChange?.(saved.id); }
      setDraft(null);
      toast({ title: out.id ? `Saved ${saved.label}` : `Added ${saved.label}`, tone: 'success' });
    }, () => setFailed(true)).finally(() => setBusy(false));
  };

  const remove = (a: SavedAddress) => {
    const at = shown.indexOf(a), next = shown[at + 1] ?? shown[at - 1];
    setGone((g) => new Set(g).add(a.id));
    later(next ? focusId(`edit-${next.id}`) : () => heading.current?.focus());
    toast.undo({
      title: `Removed ${a.label}`,
      commit: () => onRemove?.(a.id),
      onUndo: () => { setGone((g) => { const n = new Set(g); n.delete(a.id); return n; }); later(focusId(`remove-${a.id}`)); },
    });
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">These are your saved addresses. Saving a change needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: 'Account', href: '#account' }, { label: 'Addresses' }]} title="Addresses"
          description="Where we deliver. The default one is chosen for you at checkout."
          primary={loading || loadFailed ? undefined : { label: 'Add address', onSelect: () => open(blank) }} />
        <section aria-labelledby="saved" className="flex flex-col gap-4 pt-6">
          <h2 id="saved" ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold outline-none">Saved addresses ({formatNumber(shown.length, locale)})</h2>
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load your addresses" onRetry={() => onRetry?.()} headingLevel={3} />
            : loading ? <Card><Skeleton shape="text" lines={5} label="Loading addresses" /></Card>
            : !shown.length ? <EmptyState icon="location_on" title="No addresses yet" description="Add one, and it’s ready at checkout." headingLevel={3} />
            : (
              <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2">
                {shown.map((a) => {
                  const isDef = a.id === def;
                  return (
                    <li key={a.id} className="flex">
                      <Card className="flex w-full flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="m-0 text-base font-semibold">{a.label}</h3>
                          {isDef ? <Badge tone="info">Default</Badge> : null}
                        </div>
                        <address className="not-italic">
                          <div>{a.name}</div><div>{a.line1}</div>{a.line2 ? <div>{a.line2}</div> : null}
                          <div>{a.city} {a.postalCode}</div><div>{a.country}</div>
                          {a.phone ? <div>{a.phone}</div> : null}
                        </address>
                        {isDef && shown.length > 1 ? <p className="m-0 text-sm text-text-muted">To remove it, make another address the default first.</p> : null}
                        <div className="mt-auto flex flex-wrap gap-2">
                          <Button id={`edit-${a.id}`} size="sm" variant="outline" aria-label={`Edit ${a.label}`} onClick={() => open(a)}>Edit</Button>
                          {isDef && shown.length > 1 ? null : <Button id={`remove-${a.id}`} size="sm" variant="ghost" aria-label={`Remove ${a.label}`} onClick={() => remove(a)}>Remove</Button>}
                          {isDef ? null : <Button size="sm" variant="ghost" aria-label={`Make default: ${a.label}`} onClick={() => makeDef(a)}>Make default</Button>}
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
        </section>

        <Dialog open={!!draft} onOpenChange={(o) => { if (!o && !busy) setDraft(null); }} title={draft?.id ? `Edit ${draft.label || 'address'}` : 'Add an address'}
          description="All fields are needed unless they say they’re optional.">
          {draft ? (
            <form onSubmit={save} noValidate className="flex flex-col gap-4">
              <ErrorSummary key={tries} errors={errors} headingLevel={3} />
              {failed ? <Alert tone="danger">Couldn’t save the address. Try again; everything you entered is still here.</Alert> : null}
              <Field label="Name for this address" id="address-label" hint="Like Home or Office." error={problems.label} required>
                <Input autoComplete="off" value={draft.label} onChange={(e) => edit({ label: e.target.value })} />
              </Field>
              <Field label="Full name" id="address-name" error={problems.name} required>
                <Input autoComplete="shipping name" value={draft.name} onChange={(e) => edit({ name: e.target.value })} />
              </Field>
              <Field label="Street and number" id="address-line1" error={problems.line1} required>
                <Input autoComplete="shipping address-line1" value={draft.line1} onChange={(e) => edit({ line1: e.target.value })} />
              </Field>
              <Field label="Apartment, floor or building" id="address-line2" optional>
                <Input autoComplete="shipping address-line2" value={draft.line2 ?? ''} onChange={(e) => edit({ line2: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Town or city" id="address-city" error={problems.city} required>
                  <Input autoComplete="shipping address-level2" value={draft.city} onChange={(e) => edit({ city: e.target.value })} />
                </Field>
                <Field label="Postal code" id="address-postalCode" error={problems.postalCode} required>
                  <Input autoComplete="shipping postal-code" value={draft.postalCode} onChange={(e) => edit({ postalCode: e.target.value })} />
                </Field>
              </div>
              <Field label="Country" id="address-country" error={problems.country} required>
                <Select autoComplete="shipping country-name" placeholder="Choose a country" options={countries} value={draft.country} onChange={(e) => edit({ country: e.target.value })} />
              </Field>
              <Field label="Phone" id="address-phone" hint="For the courier, if they can’t find you." optional>
                <Input type="tel" autoComplete="shipping tel" value={draft.phone ?? ''} onChange={(e) => edit({ phone: e.target.value })} />
              </Field>
              {draft.id === def || !shown.length ? null : <Checkbox checked={makeDefault} onCheckedChange={setMakeDefault}>Make this my default address</Checkbox>}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" loading={busy}>Save address</Button>
                <Button variant="ghost" onClick={() => setDraft(null)} disabled={busy}>Cancel</Button>
              </div>
            </form>
          ) : null}
        </Dialog>
      </main>
      <Toaster />
    </div>
  );
}
