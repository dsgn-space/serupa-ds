# Countdown

Shows the time left until a moment, as a clock ("4:59") or in words ("4 minutes, 59 seconds"), and keeps itself up to date. It says the time aloud at a few steps (5 minutes, 1 minute, 10 seconds…) and when it ends, never every second.

```tsx
import { Countdown } from "serupa-ds";

<p>Offer ends in <Countdown to={offer.endsAt} label="Offer ends in" endText="The offer has ended" /></p>
<Countdown to={exam.endsAt} label="Time left" format="words" announceAt={[600, 300, 60]} onEnd={submit} />
<Countdown seconds={server.secondsLeft} label="Your seat is held for" />   // the app keeps the clock
```

## When to use

- A deadline people act against, minutes or hours away: a held seat or basket, a sale that ends today, a timed test, a code that expires.
- A time limit someone needs to know about to finish in time (WCAG 2.2.1): say how long, and warn before it ends.

## When not to use

- Days or weeks away, where seconds ticking add nothing: say the date, or how far it is in words with [RelativeTime](../RelativeTime/README.md) ("in 3 days").
- A pressure tactic: a timer that restarts on reload, or a deadline that isn't real. Show a countdown only for a limit that exists.
- A session about to time out: that's a warning [Dialog](../Dialog/README.md) with a way to stay (the Session time-out pattern), which can hold a Countdown.

## Usage

- Pass `to`, the moment it ends (a `Date`, a timestamp in ms or an ISO string), and it keeps its own clock. Or pass `seconds`, the time left, when your app keeps the clock (a timer the server owns, or one that's paused): it shows that and doesn't tick.
- `label` names it, in the page's language: what it counts down to, "Offer ends in", "Time left". Say the same words in the text beside it, as in the first example.
- `format="clock"` (default) is "4:59", or "1:04:59" from an hour. `format="words"` is "4 minutes, 59 seconds", in the reader's language; use it where a clock could be misread as a time of day.
- `endText` takes the time's place when it ends ("The offer has ended"), and is said aloud. `onEnd` is called once when it reaches zero, or as it mounts when `to` has already passed.
- `countdownClock(seconds, locale)` and `countdownWords(seconds, locale)` give the same text outside React.

## Behavior

- Every Countdown on the page runs on one shared clock, twice a second, which stops when none is mounted.
- It says the time aloud, politely, as it crosses each of `announceAt`'s steps (in seconds; default 3600, 1800, 600, 300, 120, 60, 30 and 10), once each. A tab that slept through several steps says only where it is now. `[]` says nothing until it ends.
- A page that opens on a countdown already over says nothing: the time is there to read.
- Rendered on the server, it shows the time left at the request, hydrates without a mismatch, and ticks from there.
- An invalid `to` or `seconds` shows nothing; in development it warns once in the console.

## Accessibility

- **Role and name:** a `<time role="timer">` with a machine-readable `datetime` ("PT299S"), named by `label` and the time left in words: "Offer ends in: 4 minutes, 59 seconds", so a screen reader never reads "4:59" as a time of day.
- A timer isn't a live region: one that spoke every second would drown out everything else. It speaks only at its steps and when it ends (4.1.3).
- **Keyboard:** none: inline text, not focusable.
- **What's still yours:** a time limit people can turn off, adjust or extend, warned of with at least 20 seconds to act (2.2.1), and keeping what they typed when it ends. Don't make the countdown the only way someone learns it ended: change the page too.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<time>`. |
| `to` | `Date \| number \| string` | | When it ends; it keeps its own clock. Pass this or `seconds`. |
| `seconds` | `number` | | The time left, when your app keeps the clock. It doesn't tick. |
| `label` | `string` | | What it counts down to, in the page's language. Names it, and starts each announcement. |
| `format` | `'clock' \| 'words'` | `'clock'` | "4:59" or "4 minutes, 59 seconds". |
| `announceAt` | `number[]` | an hour, 30, 10, 5, 2 and 1 minutes, 30 and 10 seconds | The times left, in seconds, at which it's said aloud. |
| `endText` | `string` | the time at zero | Shown and said when it ends. |
| `onEnd` | `() => void` | | Called once when it reaches zero. |
| `locale` | `string` | the provider's, else the browser's | When it differs from the provider's, the element carries `lang`. |

Every other prop, `className` and `ref` go to the `<time>`, which has `data-component="countdown"`, and `dk-countdown--ended` once it ends.

## Component tokens

None: it uses the surrounding text's font and color, with tabular digits.
