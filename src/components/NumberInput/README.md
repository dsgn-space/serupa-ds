# NumberInput

A field for a number, with − and + buttons at the end. People can type freely; the arrow keys and buttons change it by `step`, and it's kept within `min` and `max`. It uses Input's box, sizes and tokens.

```tsx
import { NumberInput } from "@diki/design-system";

<NumberInput aria-label="Quantity" defaultValue={1} min={1} max={99} />

const [price, setPrice] = React.useState<number | null>(9.5);
<NumberInput aria-label="Price" value={price} onValueChange={setPrice} step={0.5} min={0} />
```

## When to use

- A count or an amount people know exactly: a quantity, a price, a number of seats.
- Small changes up or down from a starting value, with the arrow keys or the − and + buttons.

## When not to use

- A value where its place in a range matters more than the exact number: use [Slider](../Slider/README.md).
- Digits that aren't an amount, such as a phone number, a postcode or a card number: use [Input](../Input/README.md) with the right `type` or `inputMode`.

## Usage

- Label it with [Field](../Field/README.md) and put the unit in the label or hint ("Weight (kg)").
- Set `min`, `max` and `step` to the real limits, so the field keeps values within them.
- Match the `size` to the fields and buttons beside it.

## Behavior

- On blur the text is parsed (spaces, a comma decimal and a typographic minus are accepted), clamped and rounded to the step's decimals. Text that isn't a number goes back to the last number.
- A typed number outside the limits isn't reported until blur, so a half-typed number never jumps.
- The buttons are out of the Tab order, since the arrow keys do the same, and are disabled at the limits.

## Accessibility

- `role="spinbutton"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`. It's `type="text"` with `inputMode` numeric or decimal, which avoids the native number field's scroll-wheel and locale problems.
- The − and + keep 3:1 and the number 4.5:1 on the field in all six themes (`tools/test/number-input.mjs`).

### Keyboard

| Key | Does |
| --- | --- |
| ArrowUp, ArrowDown | ± `step` |
| PageUp, PageDown, Shift+Arrow | ± `largeStep` steps |
| Home, End | `min`, `max` (when set) |
| Enter | Tidies the typed number (clamps and rounds it) |

## Props

Every Input prop works (`size`, `invalid`, `leftIcon`, `placeholder`, `disabled`, `readOnly`…), except `type` and `rightIcon`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number \| null` | | Controlled. `null` is an empty field. |
| `defaultValue` | `number \| null` | | Uncontrolled. |
| `onValueChange` | `(value: number \| null) => void` | | As people type (numbers within range), on blur (clamped), and from the keys and buttons. |
| `min`, `max` | `number` | | Limits. The field snaps into them when it loses focus. |
| `step` | `number` | `1` | How much the arrows and buttons change it. Its decimals set how many the value keeps. |
| `largeStep` | `number` | `10` | Steps moved by PageUp, PageDown and Shift with an arrow. |
| `steppers` | `boolean` | `true` | The − and + buttons. |
| `decrementLabel`, `incrementLabel` | `string` | `'Decrease'`, `'Increase'` | The buttons' names. |

`className` and `style` go to the box; `ref` and every other prop go to the `<input>`.

## Component tokens

Each is an optional override: set it on the page, a container or one field. The box uses Input's tokens. The list lives in `src/components/NumberInput/number-input.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--number-input-stepper` | `text-muted` | The − and + icons (3:1 on the field). |
| `--number-input-stepper-hover` | `text` | The icons on hover. |
| `--number-input-stepper-bg-hover` | `secondary` | The buttons' background on hover. |
| `--number-input-stepper-radius` | `rounded-sm` | The buttons' corners (4px). |
| `--number-input-stepper-padding` | `spacing-1` | Space around each button's icon (4px). |
| `--number-input-stepper-gap` | `spacing-0_5` | Space between the − and + buttons (2px). |
