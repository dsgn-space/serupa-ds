# StatTile

One key number on a card, for the top of a dashboard: what it is, the number, how it changed since the period before (in words, with an arrow), and an optional trend line. Screen readers hear it in that order, and the trend's numbers in its name.

**Also called:** KPI card, stat card, metric tile, scorecard.

```tsx
import { StatTile } from "@diki-stwn/serupa-ds";

<StatTile
  label="Revenue"
  value="€48,200"
  change={{ amount: "12%", direction: "up" }}
  period="vs last month"
  trend={[38200, 40100, 39500, 42800, 41900, 44600, 46100, 48200]}
/>
```

## When to use

- The few numbers a dashboard leads with, each with how it changed: revenue, orders, active users.
- One number beside a [Chart](../Chart/README.md), as its headline.
- A row of them with a heading: [StatsRow](../../blocks/StatsRow/StatsRow.mdx) lays out two to four, with loading and a failed load.

## When not to use

- A number against a known range or a goal, such as storage used: use [Meter](../Meter/README.md).
- More than a handful of numbers, or numbers people compare row by row: use a [Table](../Table/README.md) or [DescriptionList](../DescriptionList/README.md).
- When the shape over time is the point, with dates and values to read: use a [Chart](../Chart/README.md).

## Anatomy

Drawn from the `Default` story.

1. **Label** (`.dk-stat-tile__label`): what the number is.
2. **Value** (`.dk-stat-tile__value`): the number, large, in tabular figures.
3. **Change** (`.dk-stat-tile__change`): a [Badge](../Badge/README.md) that says "Up 12%" with an arrow, green or red by whether that is good news, and the period beside it.
4. **Trend** (`.dk-stat-tile__trend`): a [Sparkline](../Sparkline/README.md) across the tile.

## Usage

- Format `value` and `change.amount` yourself, as the rest of the page shows numbers: a currency, a percent, a unit.
- Say whether a change is good news with `change.good`. By default a rise is green and a fall red; a rise in costs or a fall in refunds turns that round.
- Give `period` what the change compares with ("vs last month"), so "Up 12%" means something.
- Several tiles in a row go in a list, each `as="li"`, so a screen reader says how many there are. On a phone they stack.
- Tiles that will be compared share one scale only if their trends do: the trend fits its own numbers, so a small change can look large.

### Loading

- Set `loading` while the number loads: a placeholder of the same height takes its place and the tile is `aria-busy`. Name the wait in `loadingLabel` ("Loading revenue"); in a row of tiles, name the first and pass `""` to the rest, so it's said once.

### Do and don't

- **Do:** Say whether a change is good news, so a rise in costs is red. (`DoSayWhatIsGood`)
- **Don't:** Leave every rise green: costs going up isn't good news. (`DontRiseIsAlwaysGood`)

## Accessibility

- **Role and name:** a plain card-like box with no role of its own: it reads label, value, change and period in that order. In a list, `as="li"` makes each one a list item.
- **Not by color alone:** the change says "Up", "Down" or "No change" in words, with an arrow, as well as its color (WCAG 1.4.1).
- **The trend:** an image named by the label, how many periods, and its first, last, low and high values ("Revenue, last 8 periods: from €38,200 to €48,200, low €38,200, high €48,200"), in the provider's language and number format. `trendFormat` sets how they read.
- **Keyboard:** not focusable: it has nothing to do. Put a link to the details beside it, or in the card, when there is one.
- **Contrast:** the label, the value and the period read 4.5:1 on the card in every theme (`StatTile.test.tsx`); the badge keeps its own 4.5:1 and the trend line 3:1.
- **Words:** "Up", "Down", "No change" and the trend's name are labels (`statTileUp`, `statTileDown`, `statTileFlat`, `statTileTrend`), so `<SerupaProvider labels>` and the language packs translate them.
- **What's still yours:** the value's and the amount's formatting, and saying what a change means where it matters ("Revenue is up because of the spring sale").

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | | What the number is. |
| `value` | `ReactNode` | | The number, formatted. |
| `change` | `{ amount: string; direction: 'up' \| 'down' \| 'flat'; good?: boolean }` | | How it changed. `good` defaults to true for up. |
| `period` | `string` | | What the change compares with. |
| `trend` | `number[]` | | Values over time, oldest first; two or more draw a Sparkline. |
| `trendLabel` | `string` | label and period count | The trend's name, before its numbers. |
| `trendFormat` | `Intl.NumberFormatOptions` | | How the trend's numbers read. |
| `loading` | `boolean` | `false` | A placeholder in place of the number, and `aria-busy`. |
| `loadingLabel` | `string` | `"Loading…"` | The placeholder's name; `""` to leave it unnamed. |
| `as` | `'div' \| 'li' \| 'article'` | `'div'` | The element. |
| `id` | string | none | Goes to the card. |

`className`, `ref` and other props go to the tile's element.

## Component tokens

Each is an optional override: set it on the page, a container or one StatTile. The list lives in `src/components/StatTile/stat-tile.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from stat-tile.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--stat-tile-bg` | `surface` | The tile's background, as an outline Card's. |
| `--stat-tile-border` | `border` | The tile's edge. |
| `--stat-tile-label-text` | `text-muted` | The label and the period (4.5:1 on the card). |
| `--stat-tile-value-text` | `text` | The number (4.5:1 on the card). |
| `--stat-tile-value-weight` | `font-semibold` | The number's weight (600). |
| `--stat-tile-label-size` | `text-sm` | The label's and the period's size (text-sm). |
| `--stat-tile-value-size` | `text-2xl` | The number's size (text-2xl). |
| `--stat-tile-value-line-height` | `text-2xl--line-height` | The number's line height. |
| `--stat-tile-padding` | `spacing-5` | Space inside the tile, on every side (20px), as a Card's. |
| `--stat-tile-gap` | `spacing-2` | Space between the label, the number, the change and the trend (8px). |
| `--stat-tile-trend-height` | `spacing-8` | The trend line's height (32px); it takes the tile's width. |
| `--stat-tile-shadow` | `elevation-rest` | The tile's shadow, as a Card at rest. |
| `--stat-tile-radius` | `radius-container` | The tile's corners. |
| `--stat-tile-border-width` | `border-width-1` | The edge's width (1px). |
<!-- token-table:end -->
