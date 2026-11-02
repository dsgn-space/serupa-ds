# Sparkline

A small trend line that sits in a sentence, a table cell or a stat card, with a dot on the latest value. Screen readers hear what it measures and its first, last, low and high numbers, since the shape alone doesn't say them.

```tsx
import { Sparkline } from "serupa-ds";

<Sparkline data={[12, 14, 11, 15, 18, 16, 21]} label="Sign-ups, last 7 weeks" />
```

## When to use

- A trend next to the number it belongs to: a stat card's "1,240 sign-ups", a row in a table of accounts, a line of text.
- Many small trends side by side, on one scale (`min` and `max`), to compare their shapes at a glance.

## When not to use

- When the reader needs exact values, dates or more than one series: use a chart with axes and a table view.
- For one value against a range or a goal: use [Meter](../Meter/README.md) or [Progress](../Progress/README.md).

## Anatomy

Drawn from the `Area` story.

1. **Area** (`.dk-sparkline__area`): with `area`, the fill under the line.
2. **Line** (`.dk-sparkline__line`): the values, oldest on the left, 2px wide whatever the box's shape.
3. **Dot** (`.dk-sparkline__dot`): the latest value.

## Usage

- Give `label` the measure and the period ("Revenue, last 12 weeks"): the summary adds the numbers.
- Show the latest number as text beside it. The sparkline is the shape of the trend, not the place to read a value.
- Pass `format` (Intl.NumberFormat options) so the summary reads the numbers as the page shows them: a currency, a percent, a unit.
- Several sparklines that will be compared need the same `min` and `max`, or each fills its own box and a small change looks as large as a big one.
- Its size is set by `--sparkline-width` and `--sparkline-height`: set them in em to follow the text around it.

## Accessibility

- **Role and name:** `role="img"`, named by `label` and a summary: "Sign-ups: from 12 to 21, low 11, high 21", in the provider's number format. The words are a label (`sparklineSummary`), so `<SerupaProvider labels>` and the language packs translate them.
- **Keyboard:** not focusable: it has nothing to do. The numbers are in its name.
- **Contrast:** its line reads 3:1 on the surface in all six themes (`Sparkline.test.tsx`), as WCAG 1.4.11 asks of a graphic. In forced colors the line and the dot take CanvasText.
- **What's still yours:** the latest value as text beside it, and a table or a chart with axes where the exact numbers matter. Its trend is in its color and shape only, so don't let the color carry a meaning (red for down) the text doesn't say.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `data` | `number[]` | | The numbers, oldest first. Anything not finite is left out. |
| `label` | `string` | | What it measures. Its accessible name starts with it. |
| `format` | `Intl.NumberFormatOptions` | | How the numbers read in the summary. |
| `area` | `boolean` | `false` | Fills under the line. |
| `min` | `number` | the lowest value | The bottom of the scale. |
| `max` | `number` | the highest value | The top of the scale. |
| `id` | string | none | Goes to the `<svg>`. |

`className`, `ref` and other props go to the `<svg>`.

## Component tokens

Each is an optional override: set it on the page, a container or one Sparkline. The list lives in `src/components/Sparkline/sparkline.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from sparkline.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--sparkline-line` | `chart-1` | The line and the end dot (3:1 on the surface behind). |
| `--sparkline-area` | `chart-seq-1` | The fill under the line, with area. |
| `--sparkline-width` | `spacing-20` | The width (80px). |
| `--sparkline-height` | `spacing-5` | The height (20px). |
| `--sparkline-dot` | `spacing-1.5` | The end dot's diameter (6px). |
<!-- token-table:end -->
