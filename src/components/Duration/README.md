# Duration

How long something takes or took, written the way the reader's locale writes it: "1 hr, 30 min", "1 jam, 30 menit", "1 hour, 30 minutes", "1h 30m" or "1:30:00". It's a `<time>` with the duration for machines in `datetime` ("PT1H30M").

**Also called:** formatted duration, time span, elapsed time.

```tsx
import { Duration, formatDuration } from "@diki-stwn/serupa-ds";

<p>Prep <Duration value={recipe.prepMinutes} unit="minute" /></p>             // "Prep 1 hr, 15 min"
<Duration value={video.seconds} display="digital" />                            // "12:04"… read as "12 minutes, 4 seconds"
<Duration value={week.totalMinutes} unit="minute" largest="hour" display="long" /> // "38 hours, 30 minutes"

formatDuration(5400, "id", { display: "long" })   // "1 jam, 30 menit", for a title or a chart label
```

## When to use

- A length of time on its own: a recipe's prep, a lesson, a video, a flight, a timesheet's total, how long a job ran.
- Anywhere you'd otherwise build "1 h 30 min" by hand: it gets every locale's words, plurals and order right.

## When not to use

- Time left until a moment, ticking: use [Countdown](../Countdown/README.md).
- How long ago or until a date ("3 days ago", "in 2 hours"): use [RelativeTime](../RelativeTime/README.md).
- A time of day or a date: use `Intl.DateTimeFormat`, or the date components.

## Usage

- Give `value` and its `unit` (`'second'` by default; `'millisecond'`, `'minute'`, `'hour'` or `'day'`). It's rounded to `smallest`, which defaults to that unit (minutes for hours and days, so 1.5 hours is "1 hr, 30 min"), so minutes never grow seconds.
- `display`: `'short'` (default, "1 hr, 30 min"), `'long'` ("1 hour, 30 minutes"), `'narrow'` ("1h 30m"), or `'digital'` ("1:30:00", for media and stopwatches). A clock under an hour starts at the minutes ("0:45", "12:04"); `largest="hour"` keeps the hours ("0:00:45") so a column of clocks has the same parts.
- `largest` stops the units there and lets it keep counting: `largest="hour"` writes 36 hours rather than "1 day, 12 hours", as a timesheet does. A clock counts hours by default.
- Units that are 0 are left out ("2 hr", not "2 hr, 0 min"); a duration of 0 is "0 min" in the smallest unit.
- `formatDuration(value, locale, options)` gives the same text outside React, and `isoDuration(value, options)` the `datetime`.

### Do and don't

- **Do:** Give the unit you have and let it write the words: `<Duration value={75} unit="minute" />` is "1 hr, 15 min" in English and "1 j, 15 mnt" in Indonesian. (`Displays`)
- **Don't:** A clock where it could be read as a time of day: "1:30" beside a date. Use the words there. (`Digital`)

## Accessibility

- **Role and name:** a `<time>` with `datetime`, read as its text. A clock is hidden from screen readers and carries the long words in its place ("1 hour, 30 minutes"), so "1:30:00" is never read as half past one.
- **Keyboard:** none: inline text, not focusable.
- Each unit's number and word stay together, so a narrow column wraps only between units.
- With a `locale` of its own it carries that locale's direction (`dir`) with its `lang`, so English words in a right-to-left page keep their order ("1 hr, 15 min", not "hr, 15 min 1").
- **What's still yours:** saying what the duration is of, in the words around it ("Prep", "Running time").

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<time>`. |
| `value` | `number` | | How long, in `unit`. A negative one is written as its size; NaN renders an empty element. |
| `unit` | `'millisecond' \| 'second' \| 'minute' \| 'hour' \| 'day'` | `'second'` | The unit `value` is in. |
| `display` | `'long' \| 'short' \| 'narrow' \| 'digital'` | `'short'` | How it's written. |
| `smallest` | `'second' \| 'minute' \| 'hour' \| 'day'` | the unit given (`'minute'` for hours and days) | The finest unit shown; the rest is rounded to it. |
| `largest` | `'second' \| 'minute' \| 'hour' \| 'day'` | `'day'` (`'hour'` with `'digital'`, left out under an hour) | The biggest unit shown; more of it keeps counting. |
| `locale` | `string` | the provider's, else the browser's | When it differs from the provider's, the element carries `lang`. |

Every other prop, `className` and `ref` go to the `<time>`, which has `data-component="duration"`, and `dk-duration--digital` for a clock.

## Component tokens

None: it uses the surrounding text's font and color, with tabular digits for a clock.
