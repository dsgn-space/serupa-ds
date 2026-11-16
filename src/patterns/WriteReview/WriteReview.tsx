'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { Image } from '../../components/Image/Image';
import { Input } from '../../components/Input/Input';
import { Link } from '../../components/Link/Link';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { Rating } from '../../components/Rating/Rating';
import { Textarea } from '../../components/Textarea/Textarea';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Write a review: stars, a few words and, if you like, photos, for something you bought; then a thank-you that says
   when it will show. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: what's being reviewed is named first, with its picture; the stars are a group of radios named by the
     question, each star named by its number.
   - 3.3.2: the review says how long it needs to be and what helps others; the name says how it will show.
   - 3.3.1, 2.4.3: sending with problems shows a summary at the top that takes focus, each problem a link to its field
     (the stars' link lands on a star).
   - 3.3.4, 4.1.3: Send shows it's busy; one that can't be sent says so and keeps everything, the photos too.
   - 2.4.3: once sent, the thank-you's heading takes focus, and says reviews are read before they show, and when.
   Sending is the app's job: onSend gets the review; reject when it can't be sent. */

export interface ReviewDraft {
  stars: number | null;
  title: string;
  body: string;
  /** "yes" or "no": would recommend it. Optional. */
  recommend: string;
  /** How the name shows: "Ana L.". */
  name: string;
  photos: File[];
}

export interface WriteReviewProps {
  /** What's reviewed. Default: a demo product. */
  product?: { name: string; image: string; bought: string } | undefined;
  /** The name it shows by default. Default: "Ana L.". */
  defaultName?: string | undefined;
  /** Sends the review. Reject when it can't be sent. */
  onSend?: ((review: ReviewDraft) => unknown) | undefined;
}

const shirt = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#d6cfc0"/><path d="M150 90 L110 110 L70 170 L115 195 L130 175 V320 H270 V175 L285 195 L330 170 L290 110 L250 90 Q200 130 150 90Z" fill="#f5f0e6"/></svg>');
const demo = { name: 'Linen shirt, sand, size M', image: shirt, bought: '2026-02-02' };
const MIN = 30, MAX = 2000;
const FIELDS = ['stars', 'body', 'name'] as const;
type Problems = Partial<Record<(typeof FIELDS)[number], string>>;

/** What's wrong with a review, by field, in the order of the form, or {} when it can be sent. */
export function reviewProblems(r: ReviewDraft): Problems {
  const out: Problems = {};
  if (!r.stars) out.stars = 'Choose how many stars.';
  const n = r.body.trim().length;
  if (n < MIN) out.body = n ? `Say a little more: at least ${MIN} characters, so it helps others.` : 'Write your review.';
  else if (n > MAX) out.body = `Shorten your review to ${MAX} characters.`;
  if (!r.name.trim()) out.name = 'Enter the name to show with your review.';
  return out;
}

/** The review page: a skip link, a header, then main with the h1, what's reviewed, and the form or the thank-you. */
export function WriteReview({ product = demo, defaultName = 'Ana L.', onSend }: WriteReviewProps) {
  const locale = useLocale();
  const [r, setR] = React.useState<ReviewDraft>({ stars: null, title: '', body: '', recommend: '', name: defaultName, photos: [] });
  const [problems, setProblems] = React.useState<Problems>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const edit = (patch: Partial<ReviewDraft>) => { setR((now) => ({ ...now, ...patch })); setFailed(false); };
  const errors: ErrorSummaryItem[] = FIELDS.filter((f) => problems[f]).map((f) => ({ field: `review-${f}`, message: problems[f] }));

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = reviewProblems(r);
    setProblems(found);
    setTries((t) => t + 1);
    if (Object.keys(found).length) return;
    setBusy(true);
    const out = { ...r, title: r.title.trim(), body: r.body.trim(), name: r.name.trim() };
    void Promise.resolve().then(() => onSend?.(out)).then(() => setSent(true), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (sent) answer.current?.focus(); }, [sent]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link href="#orders">Your orders</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-2xl flex-col px-4 py-8 outline-none">
        <PageHeader breadcrumb={[{ label: 'Your orders', href: '#orders' }, { label: 'Write a review' }]} title="Write a review" />
        <div className="flex flex-col gap-6 pt-6">
          <Card padding="sm" className="flex flex-row items-center gap-4">
            <Image src={product.image} alt="" ratio="square" rounded className="w-16 shrink-0" />
            <div className="min-w-0">
              <p className="m-0 font-semibold wrap-break-word">{product.name}</p>
              <p className="m-0 text-sm text-text-muted">Bought <time dateTime={product.bought}>{new Date(`${product.bought}T00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
            </div>
          </Card>
          {sent ? (
            <section aria-labelledby="review-sent" className="flex flex-col items-start gap-3">
              <h2 id="review-sent" ref={answer} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">Thank you for your review</h2>
              <p className="m-0">We read every review before it shows, usually within 2 days. It will show as {r.name.trim()}; we’ll email you if we can’t show it, and why.</p>
              <Link href="#orders">Back to your orders</Link>
            </section>
          ) : (
            <form onSubmit={send} noValidate aria-label="Your review" className="flex flex-col gap-4">
              <ErrorSummary key={tries} errors={errors} />
              <Field label="How many stars?" error={problems.stars} required>
                <Rating id="review-stars" size="lg" value={r.stars} onValueChange={(v) => edit({ stars: v })} />
              </Field>
              <Field label="Title" id="review-title" hint="A few words that sum it up." optional>
                <Input maxLength={80} value={r.title} onChange={(e) => edit({ title: e.target.value })} />
              </Field>
              <Field label="Your review" id="review-body" hint={`At least ${MIN} characters. What did you like, and what didn’t you? How does it fit?`} error={problems.body} required>
                <Textarea rows={6} maxLength={MAX} showCount value={r.body} onChange={(e) => edit({ body: e.target.value })} />
              </Field>
              <Field label="Would you recommend it?" group optional>
                <RadioGroup name="review-recommend" orientation="horizontal" value={r.recommend} onValueChange={(v: string) => edit({ recommend: v })}>
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </RadioGroup>
              </Field>
              <Field label="Photos" optional>
                <FileUpload id="review-photos" multiple maxFiles={4} maxSize={10 * 1024 * 1024} accept="image/*" thumbnails hint="Up to 4, 10 MB each. Leave out faces other than yours."
                  files={r.photos} onFilesChange={(f) => edit({ photos: f })} />
              </Field>
              <Field label="Show it as" id="review-name" hint="Your first name and an initial is enough." error={problems.name} required>
                <Input autoComplete="nickname" value={r.name} onChange={(e) => edit({ name: e.target.value })} className="max-w-64" />
              </Field>
              <div className="flex flex-col items-start gap-3">
                {failed ? <Alert tone="danger">Couldn’t send your review. Try again; everything, the photos too, is still here.</Alert> : null}
                <Button type="submit" loading={busy}>Send review</Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
