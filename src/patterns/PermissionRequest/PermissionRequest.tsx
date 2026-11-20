'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Alert } from '../../components/Alert/Alert';
import { Icon } from '../../components/Icon/Icon';
import { announce } from '../../internal/announce';
import { useLocale } from '../../internal/provider';

/* Permission request: asks for the camera only when someone chooses to use it, says why first, and has a way on
   when the answer is no. For an app to copy. What it carries:
   - Asked at the moment of use, never on load: the page works without the camera ("Join with audio only"), and the
     browser's question comes only after a press on "Turn on camera".
   - Why, before the browser asks: one sentence on what the camera is for, and one button that opens the browser's
     own question. No second action beside it on that card, and nothing dressed up to look like the browser's.
   - 4.1.3, 2.4.3: each outcome is said (camera on, blocked, not available), the button says what's happening while
     the browser waits, and focus goes on to Join rather than being lost with the button that asked.
   - Blocked is not a dead end: an Alert says where to change it in the browser and offers Try again; the call can
     still go ahead without video. A browser with no camera at all gets an info Alert, not an error.
   Asking the browser (navigator.mediaDevices.getUserMedia) and using the stream are the app's job; here `request`
   stands in for it. */

export type PermissionAnswer = 'granted' | 'denied' | 'unsupported';
export type PermissionStep = 'before' | 'asking' | PermissionAnswer;

export interface PermissionRequestProps {
  /** Where it starts: 'before' (not asked yet, the default), or an answer the browser already gave (the Permissions API's state). */
  initial?: PermissionStep | undefined;
  /** Asks the browser and resolves with the answer. Default: a stand-in that says yes after a moment. */
  request?: (() => Promise<PermissionAnswer>) | undefined;
  /** Called with each answer. */
  onAnswer?: ((answer: PermissionAnswer) => void) | undefined;
}

/* The call's time, in the reader's own clock (3:00 – 3:30 PM, 15:00–15:30): a fixed "15.00" read as neither. */
const callTime = (locale: string | undefined) => {
  const at = (h: number, m: number) => { const d = new Date(2026, 0, 1); d.setHours(h, m, 0, 0); return d; };
  return new Intl.DateTimeFormat(locale, { timeStyle: 'short', numberingSystem: 'latn' }).formatRange(at(15, 0), at(15, 30)).replace(/[\u2009\u202f]/g, ' ');
};

const demo = () => new Promise<PermissionAnswer>((resolve) => { setTimeout(() => resolve('granted'), 600); });
const SAID: Record<PermissionAnswer, string> = {
  granted: 'Camera on.',
  denied: 'Camera blocked by the browser.',
  unsupported: 'This browser can’t share a camera.',
};

/** A "join a call" page that asks for the camera only when it's wanted, explains why first, and copes with a no. */
export function PermissionRequest({ initial = 'before', request = demo, onAnswer }: PermissionRequestProps) {
  const locale = useLocale();
  const [step, setStep] = React.useState<PermissionStep>(initial);
  const [joined, setJoined] = React.useState(false);
  const join = React.useRef<HTMLButtonElement>(null);
  const ask = async () => {
    setStep('asking');
    let answer: PermissionAnswer;
    try { answer = await request(); } catch { answer = 'denied'; }
    setStep(answer);
    announce(SAID[answer]);
    // The button just pressed is gone (or, on Try again, may be): focus goes on to the next step, not to the page's top.
    requestAnimationFrame(() => join.current?.focus());
    onAnswer?.(answer);
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Meet</p>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 outline-none">
        <div className="flex flex-col gap-2">
          <Heading level={1}>Weekly design review</Heading>
          <p className="m-0 text-text-muted">Today, {callTime(locale)} · 6 people invited</p>
        </div>
        <Card as="section" aria-labelledby="camera-title" className="flex flex-col gap-4">
          <Heading level={2} size="lg" id="camera-title">Camera</Heading>
          {step === 'granted' ? (
            <div className="flex min-h-40 items-center justify-center gap-2 rounded-md bg-surface-muted text-text-muted">
              <Icon name="videocam" /> <span>Your camera is on. Others see you when you join.</span>
            </div>
          ) : step === 'denied' ? (
            <Alert tone="warning" title="Your browser is blocking the camera"
              actions={<Button variant="secondary" onClick={ask}>Try again</Button>}>
              To use it, allow the camera for this site in your browser’s site settings (the icon beside the address), then try again. You can still join with audio only.
            </Alert>
          ) : step === 'unsupported' ? (
            <Alert tone="info" title="No camera in this browser">
              This browser can’t share a camera. You can still join with audio only, or open the call on another device.
            </Alert>
          ) : (
            <>
              <p className="m-0 text-sm">Turn on your camera so others in the call can see you. Your browser will ask first, and you can turn it off at any time during the call.</p>
              <div>
                <Button leftIcon="videocam" onClick={ask} loading={step === 'asking'} loadingLabel="Waiting for your browser…">Turn on camera</Button>
              </div>
            </>
          )}
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <Button ref={join} variant={step === 'granted' ? 'primary' : 'secondary'} onClick={() => { setJoined(true); announce('You joined the call.'); }} disabled={joined}>
            {step === 'granted' ? 'Join call' : 'Join with audio only'}
          </Button>
          {joined ? <span className="text-sm text-text-muted">You’re in the call.</span> : null}
        </div>
      </main>
    </div>
  );
}
