# FormattedNumber

Writes a number the way the reader's language does: `1.234,5` in Indonesian, `1,234.5` in English, `١٬٢٣٤٫٥` in Egyptian Arabic. It also writes short numbers (1.2K), percentages, money, file sizes and units, so a page doesn't mix localized dates with English numbers.

```tsx
import { FormattedNumber, formatNumber } from "serupa-ds";

<FormattedNumber value={1234.5} />                                   // "1,234.5"
<FormattedNumber value={1234567} format="compact" />                 // "1.2M", with "1,234,567" as its tooltip
<FormattedNumber value={0.456} format="percent" />                   // "46%"
<FormattedNumber value={19.99} format="currency" currency="USD" />    // "$19.99" in en, "US$19,99" in id
<FormattedNumber value={1500000} format="bytes" />                   // "1.5 MB"
<FormattedNumber value={50} format="unit" unit="kilometer-per-hour" />  // "50 km/h"
<FormattedNumber value={0.031} format="percent" options={{ signDisplay: "always", maximumFractionDigits: 1 }} />  // "+3.1%"

formatNumber(1234, "id-ID", { format: "compact" })                  // "1,2 rb", outside React or in a Server Component
```

## When to use

- Any number people read: counts, totals, prices, percentages, sizes, measurements, in text or in a table.
- Large counts where the exact figure doesn't matter at a glance (followers, views): `format="compact"`.

## When not to use

- A number people type: use [NumberInput](../NumberInput/README.md), which formats as they type.
- Codes that only look like numbers (an order number, a phone number, a postcode): write them as they are, since grouping would change them.
- A share of a task that's in progress: use [Progress](../Progress/README.md); a level within a range: [Meter](../Meter/README.md).

## Usage

- The words follow the locale from `SerupaProvider` (or the `locale` prop, or the browser's), including its digits.
- `percent` takes a fraction, as `Intl.NumberFormat` does: `0.45` is 45%. Divide by 100 first if your value is already a percentage.
- `currency` needs `currency`, an ISO 4217 code. The amount uses that currency's usual minor units (2 for USD and EUR, 0 for JPY); pass `options={{ maximumFractionDigits: 0 }}` to drop them, or `minimumFractionDigits: 2` to show them. Without a code it writes a plain number.
- `bytes` steps by 1000, like `formatFileSize`, with one decimal under 10 ("1.5 MB") and none above ("820 kB"). A size that rounds up to 1000 takes the next unit (999,999 is "1 MB", not "1,000 kB"), and bytes are whole ("2 byte" for 1.5). Steps of 1000, as macOS, iOS and Android count and as the SI names kB, MB and GB mean, so 1,500,000 bytes is "1.5 MB". Write a limit as `5_000_000` to have it read "5 MB"; `5 * 1024 * 1024` reads "5.2 MB".
- `unit` takes any unit `Intl.NumberFormat` knows (`"celsius"`, `"liter"`, `"kilometer-per-hour"`), written short.
- `options` takes any other `Intl.NumberFormat` option and wins over the format's own: `maximumFractionDigits`, `signDisplay`, `currencyDisplay: "name"`, `compactDisplay: "long"`.
- Options Intl rejects, such as a currency `"US"` or a unit `"km/h"`, write the plain number with a `number-options` warning in development, rather than throwing and unmounting the page.
- Each locale and set of options builds its `Intl.NumberFormat` once and keeps it, so a long table of numbers re-renders without building thousands of formatters.
- In a table column, numbers line up on tabular digits; align the column to the end too.
- `animate` makes a changed value show what moved: only the characters that differ from the last value fade in out of a slight blur ("Rp 1.485.000" to "Rp 1.500.000" fades "500"). Use it for a number that changes now and then while someone watches it: a cart total, a dashboard figure after a filter, a count after an action. Leave it off for a value that ticks every second (a timer, a live price), where the fade would never settle, and in long tables.

### Do and don't

- **Do:** Pass `percent` a fraction, as `Intl.NumberFormat` takes it: `0.45` is 45%. (`DoFraction`)
- **Don't:** Pass a value that's already a percentage: 45 comes out as 4,500%. Divide by 100 first. (`DontWholePercent`)

## Accessibility

- It's a `<data>` whose `value` holds the number for machines; screen readers read its words.
- A compact number's full value is in `title`, which shows on hover but isn't reliably read out. Where the exact figure matters, show it as text.
- It doesn't wrap: "Rp 150.000" stays on one line.
- With `animate`, the changed characters stay inline text, so a screen reader still reads one number. The change isn't announced: when it matters, say it with `announce()` as well. With reduced motion, the characters change at once.
- **Keyboard:** none: inline text, not focusable.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<data>`. |
| `value` | `number \| bigint` | | The number. `NaN` renders an empty `<data>`. |
| `format` | `'decimal' \| 'compact' \| 'percent' \| 'currency' \| 'bytes' \| 'unit'` | `'decimal'` | How to write it. |
| `currency` | `string` | | With `currency`: the ISO 4217 code, `"IDR"`, `"USD"`. |
| `unit` | `string` | | With `unit`: a unit `Intl.NumberFormat` knows. |
| `options` | `Intl.NumberFormatOptions` | | Any other options; they win. |
| `animate` | `boolean` | `false` | When the value changes, the characters that changed fade in over `motion-change-sm`. |
| `locale` | `string` | the provider's, else the browser's | When it differs from the provider's, the element carries `lang`, so screen readers read the number in that language. |
Every other prop, `className` and `ref` go to the `<data>`, which has `data-component="formatted-number"` and `data-format`. Your own `title` wins over the compact tooltip.

`formatNumber(value, locale?, options?)` gives the same words outside React, and in a Server Component; `options` takes `format` and every `Intl.NumberFormat` option.

## Component tokens

None: it uses the surrounding text's font and color, with tabular digits. With `animate`, the change uses the `motion-change-sm` role, `ease-enter` and `blur-xs`.
