# Chart

A line, bar or area chart of a few series over the same categories, such as visitors per month or orders per region, or a donut of one series' shares, such as traffic by source. It draws itself as SVG at its box's width, tells a screen reader what it shows, lets the keyboard reach every point, and shows the same numbers as a table at the press of a button.

```tsx
import { Chart } from "serupa-ds";

<Chart
  title="Visitors and sign-ups"
  categories={["Jan", "Feb", "Mar", "Apr"]}
  series={[
    { name: "Visitors", values: [120, 132, 101, 134] },
    { name: "Sign-ups", values: [20, 42, 31, 54] },
  ]}
/>
```

## When to use

- A trend over time (`type="line"`, the default) or a comparison of amounts across a few categories (`type="bar"`).
- Amounts over time that add up to a total, such as orders by channel (`type="area"` with `stacked`), or one amount whose size over time matters (`type="area"`).
- The shares of one whole across a few categories, such as traffic by source (`type="donut"`). Keep it to a handful: past seven, the rest go into one "Other" slice.
- Up to eight series that share the same categories, where the shape of the numbers matters more than each one.

## When not to use

- One number against a known range, such as storage used: use [Meter](../Meter/README.md). A task's progress: [Progress](../Progress/README.md).
- When people need the exact numbers to act on, or more than a handful of series: use a [Table](../Table/README.md).
- Shares that are close to each other, or that people compare closely: bars show the difference better than slices.
- Maps, scatter plots or live streaming data: Chart draws lines, bars, areas and donuts only, for now.

## Anatomy

Drawn from the `Line` story.

1. **Title** (`.dk-chart__title`): what the chart shows, and its name.
2. **Table button** (`.dk-chart__toggle`): shows the same numbers as a table, and back.
3. **Plot** (`.dk-chart__plot`): the SVG, with grid lines and value labels (`.dk-chart__gridline`, `.dk-chart__label`) and the category axis (`.dk-chart__baseline`).
4. **Series** (`.dk-chart__series`): a line (`.dk-chart__line`) with a marker per point (`.dk-chart__marker`), or a bar per value (`.dk-chart__bar`). An area chart adds a filled shape under each line (`.dk-chart__area`). A donut has a slice per category (`.dk-chart__slice`) round the total (`.dk-chart__total`) in place of the grid, the axis and the series.
5. **Legend** (`.dk-chart__legend`): each series' marker or pattern and its name; in a donut, each slice's pattern, name and share (`.dk-chart__key-value`).

While the pointer is over a category or a point has focus, a tooltip beside it lists that category's values.

## Usage

- Give it a `title`, which shows above it and names it. Without one, give it an `aria-label`.
- Keep series to a few, and give each a short name: it's in the legend, the tooltip, the table and each point's name.
- Pass `null` for a value you don't have. The line breaks there and the bar is left out, rather than showing a zero that isn't true.
- Pass `formatValue` for money, percentages or units, so the axis, the tooltip, the table and what's read out all say "$1.2M" the same way.
- `stacked` stands each area on the one before it, so the top line is the total. A point still says its own value.
- A donut draws the first series only, and only its values above zero. Each slice is named with its value and its share ("Search: 4,200 (42%)").
- Bars and areas always start at zero. A line starts at zero too, unless its values sit so far from it that zero would flatten them.
- Put it in a [Card](../Card/README.md) for a dashboard tile. It takes its box's width and the `height` you give it (240px by default).

### Loading, empty and failed

- **Loading:** set `busy` and pass no categories yet. The plot is a placeholder block at its `height`, the table button is there but disabled, and the legend keeps its line, so nothing below the chart moves when the numbers arrive. Name the wait in `loadingLabel` ("Loading visitors"): a screen reader hears it once, after the loader's delay, so a quick load says nothing. When you refresh numbers already shown, keep them in and set `busy`: the chart stays as it is until the new ones arrive.
- **Empty:** in place of the Chart, an [EmptyState](../EmptyState/README.md) that says why there's nothing yet. A chart of zeros reads as a real result.
- **Failed:** in place of the Chart, a danger [Alert](../Alert/README.md) that says what didn't load and offers Retry in `actions`. It's `role="alert"`, so the failure is heard as it appears. On Retry, go back to loading.

```tsx
{state === 'failed' ? <Alert tone="danger" actions={<Button size="sm" onClick={load}>Retry</Button>}>Visitors didn't load.</Alert>
  : state === 'loaded' && !months.length ? <EmptyState size="sm" title="No visitors yet" />
  : <Chart title="Visitors" busy={state === 'loading'} loadingLabel="Loading visitors"
      categories={months} series={[{ name: "Visitors", values: visits }]} />}
```

### Do and don't

- **Do:** Pass `formatValue` for money, percentages or units, so the axis, tooltip, table and what's read out all say "$1.8M". (`DoFormatMoney`)
- **Don't:** Leave money as bare numbers: people count digits to tell a million from a hundred thousand. (`DontRawNumbers`)

## Accessibility

- **Role and name:** a `<figure>` named by its title (`figcaption`). The plot is a group named by its kind ("Line chart") and described by a summary: how many series and points, from which category to which, and each series' lowest and highest value.
- **Keyboard:** the plot is one tab stop, after the table button. Each point is named with its series, category and value ("Visitors, Feb: 132"), and shows its category's values beside it and a focus ring around it.

  | Key | Does |
  | --- | --- |
  | Tab | To the point focused last (or the first point), then out of the chart |
  | ArrowRight | The next category's point in the same series, skipping missing values; ArrowLeft in a right-to-left page |
  | ArrowLeft | The category before; ArrowRight in a right-to-left page |
  | ArrowDown, ArrowUp | The same category in the next or the previous series |
  | Home, End | The series' first or last point |

  In a donut, ArrowRight and ArrowDown go to the next slice, clockwise, and ArrowLeft and ArrowUp to the one before (ArrowLeft and ArrowRight swap in a right-to-left page, where the slices go round the other way). Home and End go to the first and last slice. Its summary adds the total and the smallest and largest share.
- **Not by color alone:** each series has its own marker shape on a line or an area, and its own pattern on a bar or a donut slice after the first, in the legend and tooltip too. A donut's legend also names each slice with its share, in words. The chart colors (chart-1 to chart-8) are 3:1 on the surface, with the chart-gap color between neighbours, in all six themes.
- **The numbers as a table:** "Show as table" swaps the chart for a [Table](../Table/README.md) of the same numbers, sortable by any column, with "No value" where one is missing.
- **Motion:** the line draws in, the bars grow, and areas and slices fade in once, on the first paint; with reduced motion they're drawn at once.
- **Contrast:** labels and title read 4.5:1 on the surface in all six themes (`Chart.test.tsx`). In forced colors the series take the system's colors and the markers and patterns tell them apart.
- **What's still yours:** say in the text around it what the chart shows that matters ("Sign-ups doubled since June"). The summary describes the numbers, not what they mean.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `categories` | `string[]` | | The labels along the bottom, in order. |
| `series` | `{ name: string; values: (number \| null)[] }[]` | | Up to eight, each with a value per category. |
| `type` | `'line' \| 'bar' \| 'area' \| 'donut'` | `'line'` | A donut draws the first series as slices. |
| `stacked` | `boolean` | `false` | With `type="area"`: each series stands on the one before it. |
| `title` | `ReactNode` | | Shown above, and names the chart. |
| `formatValue` | `(value: number) => string` | the locale's number | On the axis, the tooltip, the table and what's read out. |
| `height` | `number` | `240` | The plot's height in pixels. |
| `hideLegend` | `boolean` | `false` | With one series, or when the title names them. |
| `categoryLabel` | `string` | `"Category"` | The first column's heading in the table. |
| `view`, `defaultView`, `onViewChange` | `'chart' \| 'table'` | `'chart'` | Controlled or not. |
| `busy` | `boolean` | `false` | Sets `aria-busy`. With no categories yet, the plot is a placeholder at its height. |
| `loadingLabel` | `string` | `"Loading…"` | Said once as the placeholder appears. |
| `id` | string | none | Goes to the root `<figure>`. |

`className`, `ref` and other props go to the `<figure>`.

## Component tokens

Each is an optional override: set it on the page, a container or one Chart. The list lives in `src/components/Chart/chart.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from chart.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--chart-text` | `text` | The title and the table's text (4.5:1 on the surface). |
| `--chart-tip-bg` | `surface-overlay` | The tooltip's background. |
| `--chart-tip-text` | `text` | The tooltip's text (4.5:1 on tip-bg). |
| `--chart-series-1` | `chart-1` | Series 1's line, markers and bars. Unset, the page's chart-1. |
| `--chart-series-2` | `chart-2` | Series 2's line, markers and bars. Unset, the page's chart-2. |
| `--chart-series-3` | `chart-3` | Series 3's line, markers and bars. Unset, the page's chart-3. |
| `--chart-series-4` | `chart-4` | Series 4's line, markers and bars. Unset, the page's chart-4. |
| `--chart-series-5` | `chart-5` | Series 5's line, markers and bars. Unset, the page's chart-5. |
| `--chart-series-6` | `chart-6` | Series 6's line, markers and bars. Unset, the page's chart-6. |
| `--chart-series-7` | `chart-7` | Series 7's line, markers and bars. Unset, the page's chart-7. |
| `--chart-series-8` | `chart-8` | Series 8's line, markers and bars. Unset, the page's chart-8. |
| `--chart-grid-line` | `chart-grid` | The grid lines. |
| `--chart-axis-line` | `chart-axis` | The zero line, the baseline and the hover cursor (3:1 on the surface). |
| `--chart-label-text` | `chart-label` | The axis labels and the legend (4.5:1 on the surface). |
| `--chart-separator` | `chart-gap` | The ring around markers and bars and the marks in a bar's pattern: the page color, so each series has 3:1 against it. |
| `--chart-focus-ring` | `focus-ring` | The ring around a focused point or bar. |
| `--chart-tip-border` | `border-overlay` | The tooltip's border. |
| `--chart-tip-muted` | `text-muted` | A series' name in the tooltip (4.5:1 on tip-bg). |

**Radius**

| Token | Default | Use |
| --- | --- | --- |
| `--chart-tip-radius` | `radius-control` | The tooltip's corners (6px). |

**Shadow**

| Token | Default | Use |
| --- | --- | --- |
| `--chart-tip-shadow` | `shadow-md` | The tooltip's shadow. |
| `--chart-tip-depth` | `depth-surface` | A tactile brand's hairline edge and, in dark mode, a faint top light, as on every floating pane. None in the flat brands. |

**Border**

| Token | Default | Use |
| --- | --- | --- |
| `--chart-line-width` | `stroke-width-2` | A line's thickness (2). |
| `--chart-focus-width` | `stroke-width-3` | The focus ring around a focused point or bar (3). |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--chart-gap-size` | `spacing-2` | Space between the title, the plot and the legend (8px). |
<!-- token-table:end -->
