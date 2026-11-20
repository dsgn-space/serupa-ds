import * as React from 'react';
import { afterEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Countdown } from '../components/Countdown/Countdown';
import { RelativeTime } from '../components/RelativeTime/RelativeTime';
import { ChatDivider, ChatMessage } from '../components/Chat/Chat';

// Building an Intl formatter costs about as much as using it twenty times. What formats in every render (a Countdown
// each second, every RelativeTime in a list, every Chat message) builds each one once, then keeps it.
const KINDS = ['NumberFormat', 'DateTimeFormat', 'RelativeTimeFormat', 'ListFormat'] as const;
const real = Object.fromEntries(KINDS.map((k) => [k, Intl[k]])) as Record<(typeof KINDS)[number], unknown>;
let built = 0;
function counting() {
  for (const k of KINDS) {
    const C = real[k] as new (...a: unknown[]) => object;
    const Counted = function (this: unknown, ...a: unknown[]) { built++; return new C(...a); } as unknown as typeof C;
    Object.setPrototypeOf(Counted, C); (Counted as { prototype: unknown }).prototype = C.prototype;
    (Intl as unknown as Record<string, unknown>)[k] = Counted;
  }
}
afterEach(() => { for (const k of KINDS) (Intl as unknown as Record<string, unknown>)[k] = real[k]; });

test('rendering again with new values builds no new Intl formatters: Countdown, RelativeTime, ChatMessage, ChatDivider', async () => {
  const ui = (n: number) => (
    <div>
      <Countdown label="Offer ends in" seconds={300 - n} format="words" />
      <Countdown label="Code expires in" seconds={300 - n} />
      <RelativeTime date={Date.now() - (n + 2) * 60_000} />
      <ChatMessage role="assistant" branches={3} branch={1 + (n % 3)} onBranchChange={() => undefined}>Reply {n}</ChatMessage>
      <ChatDivider date={new Date(2025, 0, 10 + n)} />
    </div>
  );
  const screen = await render(ui(0));
  await screen.rerender(ui(1));   // the first values of each kind build their formatters
  counting();
  for (let n = 2; n < 8; n++) await screen.rerender(ui(n));
  expect(built).toBe(0);
});
