'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Button } from '../../components/Button/Button';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { Field } from '../../components/Field/Field';
import { Heading } from '../../components/Heading/Heading';
import { Link } from '../../components/Link/Link';
import { Prose } from '../../components/Prose/Prose';
import { ScrollArea } from '../../components/ScrollArea/ScrollArea';
import { SignaturePad, type SignatureValue } from '../../components/SignaturePad/SignaturePad';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Sign agreement: an agreement to read in a box of its own, a box to tick that you agree, and your signature, drawn or
   typed. For an app to copy. What it carries (WCAG 2.2):
   - 2.1.1: the agreement scrolls in a ScrollArea that is a Tab stop and a region named by its title, so the keyboard
     can read all of it; the page doesn't need it scrolled to the end before you sign.
   - 2.5.7, 2.1.1: the signature can be typed instead of drawn (SignaturePad's Type), so nobody needs to drag.
   - 3.3.2: what signing means is said next to the button, before it's pressed.
   - 3.3.1, 2.4.3: signing with something missing shows a summary that takes focus, each problem a link to its field.
   - 3.3.4, 4.1.3: Sign shows it's busy; a signature that can't be sent says so and keeps what was filled in; once
     signed, the answer's heading takes focus.
   Storing the signature is the app's job: onSign gets it; reject when it can't be sent. */

export interface SignAgreementProps {
  /** The agreement's title: the h1. Default: a demo freelance agreement. */
  title?: string | undefined;
  /** The agreement itself, as paragraphs (or any content). Default: the demo's terms. */
  children?: React.ReactNode;
  /** Who signs, for the page's description. Default: Ana Lima. */
  signer?: string | undefined;
  /** Sends the signature. Reject when it can't be sent. */
  onSign?: ((signature: SignatureValue) => unknown) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoTerms = (
  <>
    <h2>1. The work</h2>
    <p>You design the screens set out in the brief, in two rounds of changes, and hand over the files when they’re approved.</p>
    <h2>2. Payment</h2>
    <p>Acme pays half when this is signed and half when the files are handed over, within 14 days of each invoice.</p>
    <h2>3. Who owns what</h2>
    <p>Once paid for, the designs belong to Acme. You can show them in your portfolio after the product launches.</p>
    <h2>4. Keeping things private</h2>
    <p>Neither of us shares what we learn about the other’s business, during the work or after it.</p>
    <h2>5. Ending early</h2>
    <p>Either of us can end this with 14 days’ notice in writing. Acme pays for the work done up to then.</p>
  </>
);

/** What's missing before signing, in the order of the fields. */
export function signProblems(agreed: boolean, signature: SignatureValue | null): ErrorSummaryItem[] {
  const out: ErrorSummaryItem[] = [];
  if (!agreed) out.push({ field: 'sign-agree', message: 'Tick the box to say you agree.' });
  if (!signature) out.push({ field: 'sign-signature', message: 'Sign: draw your signature, or choose Type and type your name.' });
  return out;
}

/** The signing page: a skip link, a header, then main with the h1, the agreement, and the signature. */
export function SignAgreement({ title = 'Design work agreement', children = demoTerms, signer = 'Ana Lima', onSign, online }: SignAgreementProps) {
  const [agreed, setAgreed] = React.useState(false);
  const [signature, setSignature] = React.useState<SignatureValue | null>(null);
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>([]);
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [signed, setSigned] = React.useState(false);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const problem = (field: string) => errors.find((e) => e.field === field)?.message;

  const sign = (e: React.FormEvent) => {
    e.preventDefault();
    const found = signProblems(agreed, signature);
    setErrors(found);
    setTries((t) => t + 1);
    setFailed(false);
    if (found.length || !signature) return;
    setBusy(true);
    void Promise.resolve().then(() => onSign?.(signature)).then(() => setSigned(true), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (signed) answer.current?.focus(); }, [signed]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#documents">Documents</Link>
      </header>
      <Container as="main" size="md" className="py-8 outline-none" id="main">
        <Stack gap={6}>
          <OfflineBanner online={online} placement="inline">You can read the agreement. Signing it needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Documents', href: '#documents' }, { label: title }]} title={title}
            description={`For ${signer} to sign. Read it through, then sign at the end.`} />
          {signed ? (
            <section aria-labelledby="sign-done" className="flex flex-col items-start gap-3">
              <Heading level={2} size="lg" id="sign-done" ref={answer} tabIndex={-1} className="outline-none">Signed</Heading>
              <p className="m-0">Thanks, {signer}. We’ve emailed you a copy of the signed agreement.</p>
              <Button href="#documents" variant="secondary">Back to documents</Button>
            </section>
          ) : (
            <>
              <ScrollArea aria-label={title} fade className="max-h-96 rounded-lg border border-border p-4">
                <Prose>{children}</Prose>
              </ScrollArea>
              <form onSubmit={sign} noValidate aria-label="Sign" className="flex flex-col gap-4">
                <ErrorSummary key={tries} errors={errors} />
                <Field error={problem('sign-agree')}>
                  <Checkbox id="sign-agree" checked={agreed} onCheckedChange={(on) => { setAgreed(on); setErrors((x) => x.filter((p) => p.field !== 'sign-agree')); }}>
                    I’ve read the agreement and I agree to it
                  </Checkbox>
                </Field>
                <Field label="Your signature" id="sign-signature" error={problem('sign-signature')} required>
                  <SignaturePad value={signature} onValueChange={(v) => { setSignature(v); if (v) setErrors((x) => x.filter((p) => p.field !== 'sign-signature')); }} />
                </Field>
                <div className="flex flex-col items-start gap-3">
                  {failed ? <Alert tone="danger">Couldn’t send your signature. Try again; nothing is lost.</Alert> : null}
                  <p className="m-0 text-sm text-text-muted">Signing here is the same as signing on paper.</p>
                  <Button type="submit" loading={busy}>Sign the agreement</Button>
                </div>
              </form>
            </>
          )}
        </Stack>
      </Container>
    </div>
  );
}
