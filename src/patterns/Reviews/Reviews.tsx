'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Field } from '../../components/Field/Field';
import { Link } from '../../components/Link/Link';
import { Meter } from '../../components/Meter/Meter';
import { Rating } from '../../components/Rating/Rating';
import { Select } from '../../components/Select/Select';
import { ToggleButton } from '../../components/ToggleButton/ToggleButton';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Card } from '../../components/Card/Card';
import { FormattedDate } from '../../components/FormattedDate/FormattedDate';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Reviews: the average and how the stars split, then the reviews themselves, filtered by stars and sorted, a few at a
   time, each one marked helpful or not. For an app to copy. What it carries (WCAG 2.2):
   - 1.1.1, 1.3.1: the average is stars named in words ("4.3 out of 5") with the count beside it; the split is a list of
     meters, each named by its stars, its value in words ("62 reviews, 55%").
   - 1.3.1, 2.4.6: each review is an article named by its title, with its stars, who wrote it, when, and "Bought it"
     as a word.
   - 4.1.3: changing the filter or the order says how many reviews it shows.
   - 4.1.2: Helpful is a toggle button named by the review it's for, pressed or not; the count beside it follows.
   - 2.4.3: Show more reviews moves focus to the first one it adds.
   Loading and counting are the app's job: pass the reviews; onHelpful hears each press. */

export interface Review { id: string; stars: number; title: string; body: string; author: string; date: string; bought: boolean; helpful: number }

export interface ReviewsProps {
  product?: string | undefined;
  reviews?: Review[] | undefined;
  /** How many show at first, and how many more each time. Default: 3. */
  pageSize?: number | undefined;
  /** Hears a Helpful press. */
  onHelpful?: ((id: string, pressed: boolean) => void) | undefined;
  /** Still loading: a placeholder shows instead of the reviews. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load the reviews" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: Review[] = [
  { id: 'r1', stars: 5, title: 'Warm without the bulk', body: 'I wore it on a week of winter hikes. Warm when I stopped, never sweaty when I moved, and it packs into its own pocket.', author: 'Ana L.', date: '2026-02-20', bought: true, helpful: 14 },
  { id: 'r2', stars: 4, title: 'Great, but runs small', body: 'Lovely jacket. I usually wear a medium and needed a large to fit a jumper underneath.', author: 'Chen W.', date: '2026-02-11', bought: true, helpful: 31 },
  { id: 'r3', stars: 2, title: 'Zip broke in a month', body: 'The jacket itself is good, but the zip came off its track after a few weeks. Customer service replaced it quickly.', author: 'Sara H.', date: '2026-01-30', bought: true, helpful: 9 },
  { id: 'r4', stars: 5, title: 'Light and warm', body: 'Exactly what I wanted for travel.', author: 'Kofi M.', date: '2026-01-18', bought: false, helpful: 2 },
  { id: 'r5', stars: 3, title: 'Fine for the price', body: 'Not as warm as my old down jacket, but fine for autumn and spring.', author: 'Lena V.', date: '2026-01-05', bought: true, helpful: 5 },
];
type Sort = 'recent' | 'helpful' | 'high' | 'low';

/** The average stars to one decimal, and how many reviews give each number of stars, 5 first. */
export function starSplit(reviews: Review[]) {
  const counts = [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: reviews.filter((r) => r.stars === s).length }));
  const average = reviews.length ? Math.round((reviews.reduce((a, r) => a + r.stars, 0) / reviews.length) * 10) / 10 : 0;
  return { average, counts };
}

/** The reviews with `stars` (0 for all), in the chosen order. */
export function pickReviews(reviews: Review[], stars: number, sort: Sort) {
  const by: Record<Sort, (a: Review, b: Review) => number> = {
    recent: (a, b) => b.date.localeCompare(a.date),
    helpful: (a, b) => b.helpful - a.helpful,
    high: (a, b) => b.stars - a.stars || b.date.localeCompare(a.date),
    low: (a, b) => a.stars - b.stars || b.date.localeCompare(a.date),
  };
  return reviews.filter((r) => !stars || r.stars === stars).sort(by[sort]);
}

/** The reviews page: a skip link, a header, then main with the h1, the summary, the filters and the reviews. */
export function Reviews({ product = 'Featherlight jacket', reviews = demo, pageSize = 3, onHelpful, loading = false, loadFailed = false, onRetry, online }: ReviewsProps) {
  const locale = useLocale();
  const num = (n: number) => formatNumber(n, locale);
  const [stars, setStars] = React.useState('0');
  const [sort, setSort] = React.useState<Sort>('recent');
  const [shown, setShown] = React.useState(pageSize);
  const [pressed, setPressed] = React.useState<string[]>([]);
  const firstAdded = React.useRef<string | null>(null);
  const { average, counts } = starSplit(reviews);
  const list = pickReviews(reviews, Number(stars), sort);
  const visible = list.slice(0, shown);
  const reviewsWords = (n: number) => (n === 1 ? '1 review' : `${num(n)} reviews`);
  const helpfulWords = (n: number) => (!n ? 'No one has marked this helpful yet' : n === 1 ? '1 person found this helpful' : `${num(n)} people found this helpful`);

  const more = () => { firstAdded.current = list[shown]?.id ?? null; setShown((s) => s + pageSize); };
  React.useEffect(() => {
    if (!firstAdded.current) return;
    document.getElementById(`review-${firstAdded.current}`)?.focus();
    firstAdded.current = null;
  }, [shown]);
  const press = (id: string, on: boolean) => { setPressed((p) => (on ? [...p, id] : p.filter((x) => x !== id))); onHelpful?.(id, on); };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Outdoors</p>
        <Link underline="hover" href="#bag">Bag</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">These are the reviews loaded before you went offline. Marking one helpful needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: product, href: '#product' }, { label: 'Reviews' }]} title={`Reviews of the ${product}`} />
        {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load the reviews" onRetry={() => onRetry?.()} headingLevel={2} /></div>
          : loading ? <Card className="mt-6"><Skeleton shape="text" lines={6} label="Loading reviews" /></Card> : (<>
        <div className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-3">
          <section aria-labelledby="reviews-summary" className="flex flex-col gap-4">
            <h2 id="reviews-summary" className="m-0 text-lg font-semibold">Overall</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Rating readOnly value={average} allowHalf size="lg" />
              <p className="m-0 text-text-muted">{formatNumber(average, locale, { minimumFractionDigits: 1 })} from {reviewsWords(reviews.length)}</p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {counts.map((c) => (
                <li key={c.stars}>
                  <Meter label={c.stars === 1 ? '1 star' : `${num(c.stars)} stars`} showValue size="sm" value={c.count} max={Math.max(1, reviews.length)}
                    formatValue={(v) => `${reviewsWords(v)}, ${formatNumber(reviews.length ? v / reviews.length : 0, locale, { style: 'percent' })}`} />
                </li>
              ))}
            </ul>
            <Link href="#write">Write a review</Link>
          </section>
          <section aria-labelledby="reviews-list" className="flex flex-col gap-4 md:col-span-2">
            <h2 id="reviews-list" className="m-0 text-lg font-semibold">What people say</h2>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Show">
                <Select value={stars} onChange={(e) => { setStars(e.target.value); setShown(pageSize); }}
                  options={[{ value: '0', label: 'All stars' }, ...[5, 4, 3, 2, 1].map((s) => ({ value: String(s), label: s === 1 ? '1 star only' : `${num(s)} stars only` }))]} />
              </Field>
              <Field label="Sort by">
                <Select value={sort} onChange={(e) => { setSort(e.target.value as Sort); setShown(pageSize); }}
                  options={[{ value: 'recent', label: 'Most recent' }, { value: 'helpful', label: 'Most helpful' }, { value: 'high', label: 'Highest stars' }, { value: 'low', label: 'Lowest stars' }]} />
              </Field>
            </div>
            <p role="status" id="reviews-count" className="m-0 text-sm text-text-muted">{list.length ? `Showing ${num(visible.length)} of ${reviewsWords(list.length)}` : 'No reviews with these stars yet.'}</p>
            {visible.map((r) => {
              const on = pressed.includes(r.id);
              return (
                <article key={r.id} aria-labelledby={`review-${r.id}`} className="flex flex-col gap-2 border-b border-border pb-4">
                  <Rating readOnly value={r.stars} size="sm" />
                  <h3 id={`review-${r.id}`} tabIndex={-1} className="m-0 text-base font-semibold outline-none">{r.title}</h3>
                  <p className="m-0 flex flex-wrap items-center gap-2 text-sm text-text-muted">
                    <span>{r.author}</span>·<FormattedDate value={r.date} dateStyle="long" />{r.bought ? <Badge tone="success">Bought it</Badge> : null}
                  </p>
                  <p className="m-0">{r.body}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <ToggleButton size="sm" variant="outline" pressed={on} onPressedChange={(v) => press(r.id, v)} aria-label={`Helpful: ${r.title}`}>Helpful</ToggleButton>
                    <span className="text-sm text-text-muted">{helpfulWords(r.helpful + (on ? 1 : 0))}</span>
                  </div>
                </article>
              );
            })}
            {list.length > shown ? <div><Button variant="secondary" onClick={more}>Show more reviews</Button></div> : null}
          </section>
        </div>
        </>)}
      </main>
    </div>
  );
}
