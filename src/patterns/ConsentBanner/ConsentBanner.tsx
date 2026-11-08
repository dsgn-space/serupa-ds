'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { announce } from '../../internal/announce';

/* Consent banner: asks once whether optional cookies may be set, and lets the answer be changed at any time.
   For an app to copy. What it carries (WCAG 2.2):
   - 2.4.11: the banner sits at the top of the page in the normal flow, not over it, so it never hides the focused
     element, whatever is focused and however far the page is zoomed (1.4.10).
   - 2.1.2: it isn't a dialog and doesn't trap focus. Tab goes through it and on into the page; the page works
     without an answer, and no optional cookie is set until there is one.
   - Accept and reject are the same kind of button, side by side, in the same words ("Accept analytics cookies",
     "Reject analytics cookies"): neither is hidden behind a link or a paler color (3.2.4, and the law's "as easy to
     refuse as to accept").
   - 4.1.3, 2.4.3: after an answer, the banner says what was chosen and where to change it; focus moves to that
     message, so it's read, and "Hide this message" moves focus to main, never back to the page's start.
   - The choice can be changed later from "Cookie settings" (linked from the banner, the message and the footer),
     and saving there is announced.
   Setting or clearing the cookies themselves, and loading the analytics script only after "accept", is the app's
   job; here `onChange` is told. */

export type ConsentChoice = 'accepted' | 'rejected';

export interface ConsentBannerProps {
  /** The answer already given, from the cookie the app keeps. Without one, the banner asks. */
  initial?: ConsentChoice | null | undefined;
  /** Keeps the answer in localStorage under this key, so the banner doesn't ask again after a reload. */
  saveKey?: string | undefined;
  /** Called with each answer: set or clear the analytics cookies and load or unload the script. */
  onChange?: ((choice: ConsentChoice) => void) | undefined;
}

function load(key: string | undefined): ConsentChoice | null {
  if (!key) return null;
  try {
    const v = window.localStorage.getItem(key);
    return v === 'accepted' || v === 'rejected' ? v : null;
  } catch { return null; }
}
function save(key: string | undefined, choice: ConsentChoice) {
  if (!key) return;
  try { window.localStorage.setItem(key, choice); } catch { /* private mode or full: the banner asks again next time */ }
}

const SETTINGS = 'cookie-settings';
const said = (c: ConsentChoice) => `You’ve ${c === 'accepted' ? 'accepted' : 'rejected'} analytics cookies.`;

/** A page with a cookie banner at its top, a cookie settings section and a footer link back to it. */
export function ConsentBanner({ initial, saveKey, onChange }: ConsentBannerProps) {
  const [choice, setChoice] = React.useState<ConsentChoice | null>(() => load(saveKey) ?? initial ?? null);
  // 'ask' shows the question, 'told' the message after an answer, 'gone' nothing.
  const [banner, setBanner] = React.useState<'ask' | 'told' | 'gone'>(() => (choice ? 'gone' : 'ask'));
  const [draft, setDraft] = React.useState<ConsentChoice>(choice ?? 'rejected');
  const message = React.useRef<HTMLDivElement | null>(null);

  const decide = (c: ConsentChoice) => { setChoice(c); setDraft(c); save(saveKey, c); onChange?.(c); };
  const answer = (c: ConsentChoice) => { decide(c); setBanner('told'); };
  React.useEffect(() => { if (banner === 'told') message.current?.focus(); }, [banner]);
  const hide = () => { setBanner('gone'); document.getElementById('main')?.focus(); };
  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    decide(draft);
    if (banner === 'ask') setBanner('gone');
    announce(`Your cookie settings were saved. ${said(draft)}`);
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      {banner === 'gone' ? null : (
        <section aria-labelledby="consent-title" className="border-b border-border bg-surface px-4 py-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {banner === 'ask' ? (
              <>
                <Heading level={2} id="consent-title" className="text-lg">Cookies on Acme</Heading>
                <p className="m-0 text-sm">We use essential cookies to make the site work. We’d also like to set analytics cookies to learn how the site is used, so we can make it better. We won’t set them unless you accept.</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={() => answer('accepted')}>Accept analytics cookies</Button>
                  <Button onClick={() => answer('rejected')}>Reject analytics cookies</Button>
                  <Link href={`#${SETTINGS}`}>Choose your cookies</Link>
                </div>
              </>
            ) : (
              <div ref={message} tabIndex={-1} className="flex flex-col gap-3 outline-none">
                <Heading level={2} id="consent-title" className="text-lg">Cookies on Acme</Heading>
                <p className="m-0 text-sm">{said(choice ?? draft)} You can <Link href={`#${SETTINGS}`}>change your cookie settings</Link> at any time.</p>
                <div><Button variant="secondary" onClick={hide}>Hide this message</Button></div>
              </div>
            )}
          </div>
        </section>
      )}
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 outline-none">
        <div className="flex flex-col gap-2">
          <Heading level={1}>Garden tools that last</Heading>
          <p className="m-0 text-text-muted">Spades, forks and shears made to be mended, not thrown away. <Link href="#shop">Shop the range</Link> or <Link href="#repairs">book a repair</Link>.</p>
        </div>
        <Card as="section" aria-labelledby={`${SETTINGS}-title`} id={SETTINGS} className="flex flex-col gap-4">
          <Heading level={2} id={`${SETTINGS}-title`}>Cookie settings</Heading>
          <p className="m-0 text-sm">Essential cookies keep you signed in and remember what’s in your basket. They’re always on, because the site doesn’t work without them.</p>
          <form onSubmit={saveSettings} className="flex flex-col gap-4">
            <Field label="Use analytics cookies?" hint="They tell us which pages are visited and for how long. Nothing that names you." group>
              <RadioGroup name="analytics" value={draft} onValueChange={(v) => setDraft(v)}>
                <Radio value="accepted">Yes, use analytics cookies</Radio>
                <Radio value="rejected">No, don’t use analytics cookies</Radio>
              </RadioGroup>
            </Field>
            <div><Button type="submit">Save cookie settings</Button></div>
          </form>
        </Card>
      </main>
      <footer className="border-t border-border bg-surface px-4 py-4 text-sm">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-x-6 gap-y-2">
          <span>© 2026 Acme</span>
          <Link href={`#${SETTINGS}`}>Cookie settings</Link>
        </div>
      </footer>
    </div>
  );
}
