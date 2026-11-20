# FormattedDate

Writes a date, a time or a range of dates the way the reader's language does: "November 20, 2026" in English, "20 November 2026" in Indonesian, "٢٠ نوفمبر ٢٠٢٦" in Egyptian Arabic. A `"yyyy-mm-dd"` day stays that day in every time zone, and a moment is shown in the reader's own time.

**Also called:** date format, date display, formatted time.

```tsx
import { FormattedDate, formatDate } from "@diki-stwn/serupa-ds";

<FormattedDate value="2026-11-20" />                                        // "Nov 20, 2026"
<FormattedDate value="2026-11-20" dateStyle="long" />                       // "November 20, 2026"
<FormattedDate value={order.placedAt} dateStyle="long" timeStyle="short" />  // "November 20, 2026 at 9:30 AM", in the reader's time
<FormattedDate value="2026-11-20" to="2026-11-22" />                        // "Nov 20 – 22, 2026"
<FormattedDate value={meeting.at} timeStyle="short" dateStyle={false} timeZone="Asia/Jakarta" />  // "4:30 PM"
<FormattedDate value="2026-11-20" options={{ month: "long", year: "numeric" }} />  // "November 2026"

formatDate("2026-11-20", "id", { dateStyle: "long" })                      // "20 November 2026", outside React or in a Server Component
```

## When to use

- Any date people read or act on: a due date, the day an order was placed, an invoice's date, a column of dates in a table.
- An event's dates, or a stay's, as a range: the month and year are said once.

## When not to use

- How long ago or how soon, when that matters more than the day ("3 minutes ago", "in 2 days"): [RelativeTime](../RelativeTime/README.md), which switches to the date itself after a week.
- How long something takes ("1 hr, 30 min"): [Duration](../Duration/README.md).
- A date people type or pick: [DateField](../DateField/README.md) or [DatePicker](../DatePicker/README.md).

## Usage

- `value` is a `Date`, a timestamp in milliseconds, an ISO date and time (`"2026-11-20T09:30:00Z"`), or a plain `"yyyy-mm-dd"` day. Pass a day as that string: `new Date("2026-11-20")` is UTC midnight, which is the 19th west of Greenwich, while `"2026-11-20"` is the 20th everywhere.
- `dateStyle` is `'medium'` by default; `'full'`, `'long'` and `'short'` say more or less, and `false` leaves the date out for a time on its own. `timeStyle` adds the time of day; a `"yyyy-mm-dd"` day has none, so it's left out there.
- `to` makes a range: "Nov 20 – 22, 2026", "Nov 28 – Dec 3, 2026". A range that starts and ends on the same day is written once.
- `timeZone` writes a moment in that IANA zone ("Asia/Jakarta"), the way a venue's local time is shown to someone elsewhere. Without it, a moment is in the reader's zone.
- `options` takes any other `Intl.DateTimeFormat` option. With one of the parts (`weekday`, `year`, `month`, `day`, `hour`, `minute`…), only those parts are written, and `dateStyle` and `timeStyle` are left out, as Intl asks: `{ month: "long", year: "numeric" }` is "November 2026".
- The words follow the locale from `SerupaProvider` (or the `locale` prop, or the browser's), with its own digits and month names.
- A value it can't read, or a day not on the calendar ("2026-02-31"), shows nothing; in development it warns once (`date-value`). Options Intl rejects, such as a `timeZone` of "WIB", write a medium date with a `date-options` warning, rather than throwing and unmounting the page.

## Behavior

- Rendered on the server, a moment with no `timeZone` is written in UTC, since the server can't know the reader's zone, and the page hydrates with the same text. Right after, it's rewritten in the reader's zone. A `"yyyy-mm-dd"` day, and a moment with `timeZone`, are the same on the server and in the browser and never change. Pass `timeZone` when the server knows the reader's zone, so the first text is the final one.
- It's inline text in the surrounding font and color, and wraps like the sentence around it.
- It takes the direction of its own words (`dir="auto"`), so an English date in a right-to-left page keeps its order.

## Accessibility

- **Role and name:** a `<time>` whose text is the date in words and whose `datetime` is the machine-readable day (`"2026-11-20"`) or instant (`"2026-11-20T09:30:00.000Z"`). A range is a `<span>` with a `<time>` for each end's own words.
- **Keyboard:** none: inline text, not focusable.
- **Contrast:** it takes the surrounding text's color, so it reads as the text around it does.
- **What's still yours:** say what the date is ("Due", "Placed on"), in the words beside it. Use `'long'` or `'full'` where a short date could be misread: "11/12/26" is 12 November in the UK and 11 December in the US.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<time>` (the `<span>` for a range). |
| `value` | `Date \| number \| string` | | The moment, or a `"yyyy-mm-dd"` day. |
| `to` | `Date \| number \| string` | | Where a range ends. |
| `dateStyle` | `'full' \| 'long' \| 'medium' \| 'short' \| false` | `'medium'` | How much of the date; `false` for none. |
| `timeStyle` | `'full' \| 'long' \| 'medium' \| 'short'` | none | The time of day too. |
| `timeZone` | `string` | the reader's | An IANA zone a moment is written in. |
| `options` | `Intl.DateTimeFormatOptions` | | Any other Intl option; with parts, they write it alone. |
| `locale` | `string` | the provider's, else the browser's | When it differs from the provider's, the element carries `lang`. |

Every other prop, `className` and `ref` go to the `<time>` (the `<span>` for a range), which has `data-component="formatted-date"`.

## Component tokens

None: it uses the surrounding text's font and color.
