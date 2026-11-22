# StatusTracker

A strip of bars, one a day, for uptime or a job's history: up, degraded, down or no data, told apart by shape as well as color. Each day can be reached by keyboard or pointer and is said in words ("Sep 25, 2026: Down. Outage, 42 minutes"), and a summary line sums it up ("96.5% up over 90 days, 3 incidents").

**Also called:** uptime bar, uptime tracker, status page bar.

```jsx
import { StatusTracker } from '@diki-stwn/serupa-ds';

<StatusTracker label="API" days={[
  { date: "2026-11-04", state: "up" },
  { date: "2026-11-05", state: "degraded", note: "Slow responses" },
  { date: "2026-11-06", state: "down", note: "Outage, 42 minutes" },
]} />

<StatusTracker label="Nightly build" days={runs} summary={`Last failure ${lastFailure}`} legend={false} />
```

## When to use

- A status page or a service's detail page: how it has done over the last 30 or 90 days.
- The history of a scheduled job, a check or a backup, one bar a run.

## When not to use

- A value over time: use a [Sparkline](../Sparkline/README.md) or a [Chart](../Chart/README.md).
- Only the state right now: a [Badge](../Badge/README.md) with a dot says it.
- A list of incidents people read: use a [Timeline](../Timeline/README.md).

## Anatomy

Drawn from the `Playground` story.

1. **Day** (`.srp-status-tracker__day`): one bar. Up is solid, degraded striped, down half as tall, no data an outline.
2. **Caption** (`.srp-status-tracker__caption`): the focused or pointed day in words.
3. **Summary** (`.srp-status-tracker__summary`): the share of days up and the number of incidents, or your own line.
4. **Legend** (`.srp-status-tracker__legend`): the four states with their shapes.

## Usage

- Give days oldest first, one entry for each day in the range, with `state: "none"` for days without data so the strip's length stays true.
- Add a `note` to each bad day: what happened and for how long. It's said with the day.
- The summary counts degraded and down days as incidents, and the share of days up among the days with data. Pass `summary` for your own measure (minutes of downtime, say), or `null` for none.
- With more days than fit, the strip scrolls sideways in its own box, starting at the latest day.

### Do and don't

- **Do:** Give the days without data `state: "none"`, so they show as unknown. (`ThirtyDays`)
- **Don't:** Count them as up: the strip and the share then claim uptime nobody measured. (`DontGuessUp`)

## Accessibility

- **Role and name:** the strip is a list named by `label`; each day is an item named with its date, its state in words and its note. State is shown by shape too, not by color alone (WCAG 1.4.1).
- **Keyboard:** the strip is one tab stop, on the latest day; see the table.
- **Contrast:** the bars keep 3:1 against the page, the caption 4.5:1, the summary and legend 4.5:1, in every theme (`StatusTracker.test.tsx`). In forced-colors mode the bars are drawn in the system's text color, the stripes kept.
- **What's still yours:** a `label` that says what is tracked, and notes that say what happened.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the latest day (one stop for the strip) |
| ← → | The day before or after (mirrored right to left) |
| Home, End | The first or latest day |
| Escape | Hides the caption |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `days` | `StatusDay[]` | | `{ date, state, note? }`, oldest first; `date` a Date or "yyyy-mm-dd", `state` `'up'`, `'degraded'`, `'down'` or `'none'` |
| `label` | `string` | | What it tracks; names the strip |
| `summary` | `ReactNode \| null` | worked out | The line under the strip; `null` for none |
| `legend` | `boolean` | `true` | The key to the four states |
| `id` | `string` | | Goes to the root `<div>`. |

`className`, `ref` and other props go to the root `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one StatusTracker. The list lives in `src/components/StatusTracker/status-tracker.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from status-tracker.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--status-tracker-up` | `success` | An up day's bar (3:1 on the page). |
| `--status-tracker-degraded` | `warning` | A degraded day's stripes and outline (3:1). |
| `--status-tracker-down` | `danger` | A down day's bar (3:1). |
| `--status-tracker-none` | `border-control` | A day without data: its outline (3:1). |
| `--status-tracker-text` | `text` | The caption (4.5:1). |
| `--status-tracker-muted` | `text-muted` | The summary and legend (4.5:1). |
| `--status-tracker-focus-ring` | `focus-ring` | The ring around the focused day. |
| `--status-tracker-radius` | `rounded-xs` | A bar's corners (2px). |
| `--status-tracker-gap` | `spacing-0.5` | Space between bars (2px). |
| `--status-tracker-height` | `spacing-8` | The bars' height (32px). |
<!-- token-table:end -->
