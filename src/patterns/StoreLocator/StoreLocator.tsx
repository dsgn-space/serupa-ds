'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Badge } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Field } from '../../components/Field/Field';
import { Link } from '../../components/Link/Link';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { Switch } from '../../components/Switch/Switch';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Store locator: find a shop by town or postcode, or by where you are, with each one's distance, whether it's open
   now, its hours and directions. A list, not a map alone, so it works with any screen reader and at any zoom. For an
   app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: the search is a labelled landmark; the results are a list, each shop named by its heading.
   - 1.4.1: "Open now" or "Closed now" is said in words in a badge, with when it next opens or closes, not a color.
   - 4.1.3: how many shops match, and in what order, is said in a status line as the search or the filter changes.
   - 3.3.1: when the browser can't give your location, it says so next to the button and what to do instead.
   - 2.5.3: each Directions link's name ends with its shop ("Directions: Acme Kemang").
   - A map is an extra the app can add beside the list; nothing here needs one.
   Finding where someone is, and the shops, are the app's: locate stands in for the browser's location. */

export interface Store {
  id: string;
  name: string;
  address: string;
  /** Words people search by: town, district, postcode. */
  area: string;
  lat: number;
  lng: number;
  /** Opening hours for each day, Sunday first: ["10:00", "21:00"], or null when closed all day. */
  hours: ([string, string] | null)[];
  phone: string;
}

export interface StoreLocatorProps {
  /** The shops. Default: demo shops in Jakarta. */
  stores?: Store[] | undefined;
  /** Now, for open or closed. Default: the time it renders. */
  now?: Date | undefined;
  /** Where the person is. Default: the browser's geolocation. Reject when it can't be had. */
  locate?: (() => Promise<{ lat: number; lng: number }>) | undefined;
}

const week = (open: string, close: string, sunday: [string, string] | null = ['11:00', '18:00']) =>
  [sunday, ...Array.from({ length: 6 }, () => [open, close] as [string, string])];
const demo: Store[] = [
  { id: 's1', name: 'Acme Kemang', address: 'Jl. Kemang Raya 8, South Jakarta 12730', area: 'Kemang South Jakarta 12730', lat: -6.2607, lng: 106.8137, hours: week('10:00', '21:00'), phone: '+62 21 555 0101' },
  { id: 's2', name: 'Acme Sudirman', address: 'Jl. Jend. Sudirman 21, Central Jakarta 10220', area: 'Sudirman Central Jakarta 10220', lat: -6.2088, lng: 106.8227, hours: week('08:00', '20:00', null), phone: '+62 21 555 0102' },
  { id: 's3', name: 'Acme Kelapa Gading', address: 'Jl. Boulevard Raya 3, North Jakarta 14240', area: 'Kelapa Gading North Jakarta 14240', lat: -6.1588, lng: 106.9056, hours: week('10:00', '22:00'), phone: '+62 21 555 0103' },
  { id: 's4', name: 'Acme Bandung', address: 'Jl. Braga 40, Bandung 40111', area: 'Braga Bandung 40111', lat: -6.9175, lng: 107.6191, hours: week('09:00', '21:00'), phone: '+62 22 555 0104' },
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** The distance between two points in km, along the earth's surface. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Whether a shop is open at a time, and when that changes, in words: "Open now · closes 21:00". */
export function openState(store: Store, at: Date): { open: boolean; words: string } {
  const mins = (t: string) => { const [h, m] = t.split(':').map(Number); return h! * 60 + m!; };
  const day = at.getDay(), now = at.getHours() * 60 + at.getMinutes(), today = store.hours[day];
  if (today && now >= mins(today[0]) && now < mins(today[1])) return { open: true, words: `closes ${today[1]}` };
  if (today && now < mins(today[0])) return { open: false, words: `opens ${today[0]}` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7, h = store.hours[d];
    if (h) return { open: false, words: `opens ${i === 1 ? 'tomorrow' : DAYS[d]} ${h[0]}` };
  }
  return { open: false, words: 'closed for now' };
}

/** The shops whose name or area has every word searched for. */
export function matchStores(stores: readonly Store[], q: string): Store[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return stores.filter((s) => words.every((w) => `${s.name} ${s.area} ${s.address}`.toLowerCase().includes(w)));
}

const fromBrowser = () => new Promise<{ lat: number; lng: number }>((ok, no) => {
  if (!navigator.geolocation) { no(new Error('none')); return; }
  navigator.geolocation.getCurrentPosition((p) => ok({ lat: p.coords.latitude, lng: p.coords.longitude }), no, { timeout: 10000 });
});

/** The store locator: a skip link, a header, then main with the h1, the search, and the shops. */
export function StoreLocator({ stores = demo, now, locate = fromBrowser }: StoreLocatorProps) {
  const locale = useLocale();
  const at = now ?? new Date();
  const [q, setQ] = React.useState('');
  const [here, setHere] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = React.useState(false);
  const [noLocation, setNoLocation] = React.useState(false);
  const [openOnly, setOpenOnly] = React.useState(false);
  const matched = matchStores(stores, q).filter((s) => !openOnly || openState(s, at).open);
  const shown = here ? [...matched].sort((a, b) => distanceKm(here, a) - distanceKm(here, b)) : matched;
  const km = (s: Store) => formatNumber(distanceKm(here!, s), locale, { maximumFractionDigits: 1 });

  const findMe = () => {
    setLocating(true); setNoLocation(false);
    void locate().then((p) => { setHere(p); setQ(''); }, () => setNoLocation(true)).finally(() => setLocating(false));
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link href="#help">Help</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-3xl flex-col px-4 py-8 outline-none">
        <PageHeader title="Find a shop" description="Collect an order, return something, or try it on first." />
        <div className="flex flex-col gap-6 pt-6">
          <div role="search" aria-label="Shops" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Town or postcode" className="min-w-0 flex-1">
                <SearchInput value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />
              </Field>
              <Button variant="secondary" loading={locating} onClick={findMe}>Use my location</Button>
            </div>
            {noLocation ? <Alert tone="warning">Couldn’t get your location. Your browser may have been asked not to share it; search by town or postcode instead.</Alert> : null}
            <Switch checked={openOnly} onCheckedChange={setOpenOnly}>Open now only</Switch>
          </div>
          <p id="store-count" role="status" className="m-0 text-text-muted">
            {shown.length === 1 ? '1 shop' : `${formatNumber(shown.length, locale)} shops`}{here && shown.length ? ', nearest first' : ''}
          </p>
          {shown.length ? (
            <ul role="list" className="m-0 flex list-none flex-col gap-4 p-0">
              {shown.map((s) => {
                const st = openState(s, at);
                return (
                  <Card as="li" key={s.id} aria-labelledby={`store-${s.id}`} className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 id={`store-${s.id}`} className="m-0 text-lg font-semibold">{s.name}</h2>
                      {here ? <span className="text-text-muted">{km(s)} km away</span> : null}
                    </div>
                    <p className="m-0">{s.address}</p>
                    <p className="m-0 flex flex-wrap items-center gap-2">
                      <Badge tone={st.open ? 'success' : 'neutral'}>{st.open ? 'Open now' : 'Closed now'}</Badge>
                      <span className="text-text-muted">{st.words}</span>
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer">Opening hours</summary>
                      <DescriptionList layout="split" className="mt-2 max-w-xs">
                        {DAYS.map((d, i) => (
                          <DescriptionItem key={d} term={d} emphasis={i === at.getDay()}>{s.hours[i] ? `${s.hours[i][0]} to ${s.hours[i][1]}` : 'Closed'}</DescriptionItem>
                        ))}
                      </DescriptionList>
                    </details>
                    <p className="m-0 flex flex-wrap gap-x-4 gap-y-2">
                      <Link href={`https://www.openstreetmap.org/directions?to=${s.lat}%2C${s.lng}`} aria-label={`Directions: ${s.name}`}>Directions</Link>
                      <Link href={`tel:${s.phone.replace(/\s/g, '')}`} aria-label={`Call ${s.name}: ${s.phone}`}>Call {s.phone}</Link>
                    </p>
                  </Card>
                );
              })}
            </ul>
          ) : (
            <EmptyState variant="dashed" headingLevel={2} title="No shops match"
              description={openOnly ? 'None that match are open now. Turn off “Open now only” to see the rest.' : 'Try a town or a postcode near you, or use your location.'} />
          )}
        </div>
      </main>
    </div>
  );
}
