# Calendar

A month of days to pick one from, with full keyboard navigation. DatePicker shows one in a popup; use Calendar on its own for an always-visible picker, such as in a booking page or a side panel.

**Also called:** date grid, month view.

```tsx
import { Calendar } from "@diki-stwn/serupa-ds";

const [day, setDay] = React.useState<Date | null>(null);
<Calendar value={day} onValueChange={setDay} min={new Date()} />
<Calendar defaultValue={new Date(2025, 2, 10)} isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6} />
```

## When to use

- Picking a day is the main task on the page or panel, such as choosing a booking day.
- People should see which days are free or blocked before they choose.
- There's room to keep the month on screen while people look at other details beside it.

## When not to use

- A date field in a form: use [DatePicker](../DatePicker/README.md), which opens a Calendar only when needed.
- A start and an end date: use [DateRangePicker](../DateRangePicker/README.md); Calendar picks one day.
- A date people know by heart, such as a date of birth: use an [Input](../Input/README.md) with a format hint.

## Anatomy

Drawn from the `MonthYearPicker` story.

1. **Header** (`.srp-calendar__header`): the month shown and the ways to change it.
2. **Month and year** (`.srp-calendar__menus`): menus to jump to another month or year. Without them, the heading (`.srp-calendar__heading`) opens a grid of months (`.srp-calendar__periods`).
3. **Previous and next** (`.srp-calendar__nav`): move one month back or forward.
4. **Grid** (`.srp-calendar__grid`): the days of the month in weeks, with the weekday names above.
5. **Selected day** (`.srp-calendar__day--selected`): the chosen date.
6. **Day of another month** (`.srp-calendar__day--outside`): days before and after the month, to fill the weeks.

## Usage

- Put a heading or a line of text near it saying what the day is for ("Pick a delivery day"): the grid is named by its month title only.
- Block days with `min`, `max` and `isDateDisabled` so people see them before they pick, rather than refusing a day afterwards.
- Set `autoFocus` only when the Calendar appears because people asked for it, such as in a panel they just opened.
- Leave `locale` and `weekStartsOn` unset in most products so names and the first day follow the visitor's browser.
- Set `calendar` where people date things in another calendar: `"persian"` in Iran and Afghanistan, `"islamic-umalqura"` for Hijri dates in Saudi Arabia, `"buddhist"` in Thailand, `"japanese"` for era years. The grid then shows that calendar's months, with their own first and last days, and the title, the day names and the month and year grids follow it. Values stay `Date`s, and digits stay Latin. A locale's own calendar (`th`, `fa`, or a `-u-ca-` extension) isn't followed on its own: name it here.
- The weekday headers use the locale's short names, or its one-letter names where the short name is the full word or two words (Arabic, Persian, Hebrew, Vietnamese), so they fit their 32px columns. Screen readers always hear the full name.

## Behavior

- Always six weeks tall, so the layout doesn't jump between months. Days of the months before and after are muted and can be picked.
- Today is in primary and semibold. The selected day is filled in primary. The weeks are 4px apart (`--calendar-row-gap`).
- In a range (RangeCalendar, DateRangePicker), the days between the ends are one square band per week, and each end is rounded only on its outer side, where it joins the band.
- With `presets`, a group of shortcut buttons named "Shortcuts" follows the days: beside them, or under them below 640px. The one the value matches is pressed (`aria-pressed`), and one whose day can't be picked is disabled.
- The heading ("March 2025") is a button: it opens the year's months, three by four, and their heading ("2025") opens twelve years. Pick a year for its months, and a month for its days: a date of birth in 1990 is four clicks from today. The previous and next buttons turn a year, or twelve years, there. Focus keeps its day of the month (the 17th in August to the 17th in the month picked). The months and years keep the days' size, so the calendar doesn't jump. Not in DateRangePicker's two months side by side, which turn together, nor with `monthYearPicker`.
- With `monthYearPicker`, the header shows a Month and a Year menu in place of the title, so people can jump years at once (a date of birth, an expiry). Years run from `min` to `max`, or from 100 years back to 10 ahead when unset; months outside `min` and `max` are disabled. Off by default.
- Today follows the clock: a calendar left open past midnight moves today to the new day without needing a re-render.
- Today is the visitor's day, not the server's. A server-rendered page marks it once it hydrates, since the server's date can differ (a UTC server and a visitor in Jakarta before 7am). Until then, the Tab stop is on the value or on the month's first day. With no value and no `defaultMonth`, the month shown at first is today's on each side. Around a month's turn that differs between the server and the visitor: the page hydrates on the month the server drew (the title carries it as `data-month`), and the visitor's month shows right after, with no mismatch; `onMonthChange` is called with it. A controlled `month` is left as it is.

### Do and don't

- **Do:** Put a heading or a line of text near it that says what the day is for ("Pick a delivery day"). (`DoSayWhatFor`)
- **Don't:** Show it on its own: the grid is named by its month only, so nobody knows what the day is for. (`DontUnexplained`)

## Accessibility

- A `role="grid"` table named by the month title, which is `aria-live` so screen readers hear the new month. The days have one Tab stop.
- The heading button is named by the month it shows and described by what it does ("Choose a month", in the month grid "Choose a year"). The month and year grids are `role="grid"` too, named by the hidden title, which says "2025" or "2016–2027" as the view changes. Months are shown short and read in full ("March 2025").
- Each day is named by its full date ("Monday, March 10, 2025"). The selected cell is `aria-selected`, today is `aria-current="date"`, and refused days are `aria-disabled` (in `disabled-text` and struck through).
- Weekday headers show the short name, and screen readers read the full one ("Monday", from visually hidden text, and in `abbr`), since "Mon" or "M" is read letter by letter or not at all by some.
- Text keeps 4.5:1 and the selected fill 3:1 in every theme (`Calendar.test.tsx`).
- In forced colors (Windows high contrast) the selected day is drawn in Highlight with HighlightText, exactly as set, so the browser's text backplate can't hide its number. The same goes for DatePicker's and DateRangePicker's pop-ups.

### Keyboard

| Key | Moves to |
| --- | --- |
| ← → | The day before or after (mirrored right to left). |
| ↑ ↓ | The same day a week before or after. |
| Home, End | The start or end of the week. |
| PageUp, PageDown | The same day a month before or after. With Shift, a year. |
| Enter, Space | Picks the focused day. |
| Escape | In the months or years: back a level (the years to the months, the months to the days, with focus on the heading). Inside DatePicker's popup it doesn't close the popup. |

In the months and years the same keys move by a month or a year: the arrows one, or a row of three up or down (mirrored right to left); Home and End to the row's ends; PageUp and PageDown a year, or twelve years; Enter or Space picks, a year opening its months and a month its days.

Moving past the shown month shows the next one. No key moves focus past `min` or `max`: a move that would, stops on that day.

A month arrow that reaches the month holding `min` or `max` turns disabled, so focus moves to the other arrow instead of falling back to the top of the page. DatePicker and DateRangePicker do the same.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<div>`. |
| `value` / `defaultValue` | `Date \| string \| null` | | The selected day, controlled or not: a Date (its time is ignored) or a plain `"yyyy-mm-dd"` string for that local day. |
| `onValueChange` | `(date: Date, iso: string) => void` | | Called with the picked day (local midnight) and the same day as `"yyyy-mm-dd"`. |
| `month` / `defaultMonth` | `Date` | the selected day's month, or today's | The month shown: any day in it. |
| `onMonthChange` | `(month: Date) => void` | | Called with the first of the newly shown month. |
| `min`, `max` | `Date \| string` | | Days outside can't be picked, and the month buttons stop there. A Date or `"yyyy-mm-dd"`. |
| `presets` | `boolean \| DatePreset[]` | | Shortcuts in a list after the days: `true` for Today, Tomorrow and In a week, or your own `{ label, value }`. Picking one picks its day and shows its month. |
| `monthYearPicker` | `boolean` | `false` | Shows native Month and Year menus in the header instead of the title. The title stays for screen readers and still names the grid. |
| `isDateDisabled` | `(date: Date) => boolean` | | Days to refuse, such as weekends or holidays. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `2` | The month title's heading level, to fit the page's outline where the calendar sits inline (under an `h2`, say 3). |
| `locale` | `string` | the nearest `SerupaProvider`'s, else the browser's (en-US until a server-rendered page hydrates) | Month and weekday names, and the first day of the week. When it differs from the provider's, the month title and the grid carry `lang`, so screen readers read the names in that language; the nav buttons keep the page's. |
| `calendar` | `'gregory'` `'persian'` `'islamic-umalqura'` `'islamic-civil'` `'islamic-tbla'` `'indian'` `'buddhist'` `'japanese'` `'roc'` | `'gregory'` | The calendar system the months follow. Persian, Hijri and Indian have months of their own; Buddhist, Japanese and ROC share the Gregorian months and count years their way. Values stay `Date`s. |
| `weekStartsOn` | `0`–`6` | the locale's | 0 is Sunday. |
| `weekNumbers` | boolean | `false` | A narrow column of ISO 8601 week numbers before the days (the week holding each row's Thursday), for planning by week. Each number is its row's header, read as "Week 12" with the days; the days take its width off their share of a narrow screen. |
| `autoFocus` | `boolean` | `false` | Focus the selected day (or today) when it appears. |
| `previousLabel`, `nextLabel` | `string` | `"Previous month"`, `"Next month"` | The month buttons' names. |

`className`, `ref` and other props go to the outer `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one calendar. The list lives in `src/components/Calendar/calendar.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from calendar.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--calendar-title-color` | `text` | The month and year. |
| `--calendar-menu-border` | `field-border` | The Month and Year menus' border (`monthYearPicker`). |
| `--calendar-menu-bg` | `field` | The Month and Year menus' fill (`monthYearPicker`). |
| `--calendar-presets-border` | `border` | The line between the days and the `presets` shortcuts. |
| `--calendar-weekday-color` | `text-muted` | The weekday names (4.5:1 on surface). |
| `--calendar-week-color` | `text-muted` | The week numbers, with weekNumbers (4.5:1 on surface). |
| `--calendar-day-color` | `text` | Days of the shown month. |
| `--calendar-outside-color` | `text-muted` | Days of the months before and after. |
| `--calendar-outside-color-hover` | `text` | A day of the months before and after, under the pointer: full text, so it keeps 4.5:1 on the hover fill. |
| `--calendar-day-bg-hover` | `secondary` | A day or preset under the pointer, as Pagination's pages. |
| `--calendar-day-bg-pressed` | `pressed` | A day while it's pressed, one step past hover. |
| `--calendar-today-color` | `primary` | Today's number (4.5:1 on surface). |
| `--calendar-today-color-hover` | `text` | Today's number under the pointer: full text, as primary drops under 4.5:1 on the hover fill in dark. It stays semibold. |
| `--calendar-bg-selected` | `primary` | The selected day. |
| `--calendar-color-selected` | `on-primary` | Its number. |
| `--calendar-range-bg` | `primary-subtle` | Days between the start and end of a range (DateRangePicker). |
| `--calendar-range-color` | `text` | Their numbers (4.5:1 on range-bg). |
| `--calendar-focus-ring` | `focus-ring` | A day's keyboard focus ring. |
| `--calendar-text-disabled` | `disabled-text` | Disabled: the text, icon or mark, in place of fading it (3:1 or more on its background, more with more contrast). |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--calendar-day-size` | `control-height-md` | Each day's square (32px). |
| `--calendar-week-width` | `spacing-7` | The week number column, with weekNumbers (28px); the days give up its width on a narrow screen. |

**Radius**

| Token | Default | Use |
| --- | --- | --- |
| `--calendar-day-radius` | `radius-control` | A day's corners (6px). |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--calendar-gap` | `spacing-2` | Space between the header and the days (8px). |
| `--calendar-row-gap` | `spacing-1` | Space between the weeks (4px), so the rows read apart and a range is a band per week; the month and year grids keep the same height. |

**Type**

| Token | Default | Use |
| --- | --- | --- |
| `--calendar-title-weight` | `font-semibold` | The month and year (600). |
| `--calendar-today-weight` | `font-semibold` | Today's number (600). |
<!-- token-table:end -->
