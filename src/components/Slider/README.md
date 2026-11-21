# Slider

Picks a number, or a range with two thumbs, by dragging along a track or with the keyboard. Use it when the exact number matters less than its place in a range (volume, a price filter); for exact numbers, use NumberInput, or pair the two.

**Also called:** range input, range slider.

```tsx
import { Slider } from "@diki-stwn/serupa-ds";

<Slider aria-label="Volume" defaultValue={50} />

const [price, setPrice] = React.useState<[number, number]>([20, 80]);
<Slider aria-label="Price" value={price} onValueChange={setPrice} max={200} step={5} formatValue={(v) => `$${v}`} />
```

## When to use

- A value where its place in a range matters more than the exact number: volume, brightness, a zoom level.
- A range with two ends, such as a price filter (pass a pair as the value).

## When not to use

- An exact number people type, such as a quantity: use [NumberInput](../NumberInput/README.md), or pair the two.
- A few named options, such as Small, Medium, Large: use [SegmentedControl](../SegmentedControl/README.md) or [radios](../Radio/README.md).

## Anatomy

Drawn from the `Marks` story.

1. **Track** (`.srp-slider__track`): the whole range.
2. **Fill** (`.srp-slider__fill`): the part up to the value.
3. **Thumb** (`.srp-slider__thumb`): drag it, or focus it and use the arrow keys, to set the value.
4. **Mark** (`.srp-slider__mark-label`): a named value along the track.
5. **Value** (`.srp-slider__value`): the value, in words or numbers.

## Usage

- Show a visible label next to it and point `aria-labelledby` at it, or use `aria-label`.
- Use `formatValue` whenever the number has a unit or a currency, so screen readers hear "$40", not "40".
- Update what's on screen in `onValueChange`, and save or fetch in `onValueCommit`, which runs once per change.
- Set `step` to the precision people need, so values snap to sensible numbers.
- In a narrow column, such as a mixer or a level beside a picture, set `orientation="vertical"`. Keep it horizontal everywhere else: a horizontal track is easier to read and to label.
- For a value with a middle, such as a balance or an offset from -10 to +10, set `origin={0}` so the fill starts in the middle and shows which way it leans.
- Use `marks` when a few values matter, such as `[{ value: 0, label: "Off" }, { value: 100, label: "Max" }]`, or `marks` alone for a tick per step on a short scale. Keep the labels short: they sit on one line under the track while there's room, and wrap when it's narrow.
- Use `showValue` when people need to see the number while they drag, and there is no label nearby that shows it.
- Use `inputs` when an exact number matters as much as the rough one, such as a price filter: a number field (`.srp-slider__input`, a [NumberInput](../NumberInput/README.md)) sits beside each thumb, after the track for one and at either end for a range. It brings NumberInput's code with it, so a page that imports Slider and not NumberInput grows by about 6.5 KiB.

## Behavior

- A press anywhere on the track moves the nearest thumb there, and dragging follows the pointer even off the slider. On a touch screen, a swipe across the page that starts on the slider scrolls the page instead (`touch-action: pan-y`, `pan-x` when vertical): the thumb goes back and nothing commits.
- Range thumbs can't cross.
- The thumb grows a little while pressed; it doesn't with `prefers-reduced-motion`.
- `marks` draws a tick for each mark between the ends, and its label centered under it. With labels, the slider is taller by one line of small text, so nothing overlaps what follows. A label longer than its room (the track up to halfway to the next mark, less 8px, `--slider-mark-label-gap`) wraps within it, and the slider grows to hold the extra lines. `true` draws a mark per step, or one per `largeStep` steps past 100 marks. Marks off the track are left out. A press on a label moves the nearest thumb there.
- With `inputs`, a number typed in a field moves its thumb at once, and a thumb that moves rewrites its field. A field takes numbers between `min` and `max` (for a range, up to the other thumb); one past them waits for Enter or for the field to be left, then comes back inside. `onValueCommit` runs when the field is left or Enter pressed after a change, as at the end of a drag. The fields show the number itself in the locale's digits, not `formatValue`'s words.
- `showValue` shows the value, as `formatValue` writes it (without one, the number in the locale's digits: "٤٠" in `ar-EG`), in a small chip over a thumb while it's focused, hovered or dragged. The chip floats and takes no room, so leave space above the slider. Near an end, the chip and the end mark labels move inward, so they stay inside the slider's box.

### Do and don't

- **Do:** Use `formatValue` for a value with a unit or currency, and write the mark labels the same way. (`DoFormatValue`)
- **Don't:** Leave a price or a measurement as a bare number: people and screen readers can't tell its unit. (`DontBareNumber`)

## Accessibility

- The slider takes a press over at least 24px of height (WCAG 2.5.8), past the 20px thumb, without taking more room, and 44px on a touch screen, as Apple and Material ask.
- Each thumb is a native `<input type="range">` (role `slider`) over the drawn one, unseen, with its value, `min`, `max`, `step` and `aria-orientation`. Screen readers' adjust gestures (VoiceOver's swipe up and down, TalkBack's volume keys) work reliably only on a native range, and they move the thumb by `step` and call `onValueCommit` as a key does. A range's thumbs limit each other, and the pair is a named `group`.
- The track, the fill and the thumb's ring keep 3:1 on the page in every theme, so the control can be seen (`Slider.test.tsx`). In forced-colors mode it uses system colors.
- In a [Field](../Field/README.md), the label names the thumb (a range's group) through `aria-labelledby`, and the hint and error describe it. Its own `aria-label` or `aria-labelledby` wins.
- `invalid` sets `aria-invalid` on each thumb and turns the fill and the thumb's ring danger (3:1 on the page in every theme). Color alone doesn't say what's wrong, so put the reason in text next to it: inside a [Field](../Field/README.md), its `error` does both.
- `readOnly` keeps the thumbs in the Tab order with `aria-readonly`, so people can still hear the value, but keys and presses don't change it. With `name`, the value is still sent with the form, which `disabled` doesn't do.
- A slider always has a value, so `required` has nothing to check. It's accepted, so Field's `required` doesn't reach the DOM, and has no effect.
- Marks and the value chip are `aria-hidden`. The thumb's `aria-valuetext` already says the value, and mark labels would be read as stray text. Mark labels keep 4.5:1 on the page, and the chip's text 4.5:1 on the chip, in every theme (`Slider.test.tsx`).
- With `inputs`, each number field is named as its thumb is (the label, or "Minimum" and "Maximum" in a range), so a screen reader hears which value it changes. It's one more Tab stop per thumb.
- `disabled`, or a disabled `<fieldset>` around it, disables the thumbs' range inputs: out of the Tab order, ignoring keys and presses, and left out of the form.

### Keyboard

| Key | Does |
| --- | --- |
| ArrowRight, ArrowUp | + `step` (ArrowLeft raises it in right-to-left pages) |
| ArrowLeft, ArrowDown | − `step` |
| Shift+Arrow, PageUp, PageDown | ± `largeStep` steps |
| Home, End | The ends; a range thumb stops at the other thumb |

Your `onKeyDown` runs before the slider's own keys, so `e.preventDefault()` in it overrides one. `onFocus` and `onBlur` fire when focus enters or leaves the slider, not as it moves between a range's two thumbs, so a form library's "touched on blur" waits until people leave the whole control.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<div>`. A `<label htmlFor>` can't name it; inside a Field, the Field's label names it through this id. |
| `value` | `number \| [number, number]` | | Controlled. A pair makes a range with two thumbs. |
| `defaultValue` | `number \| [number, number]` | `min` | Uncontrolled. |
| `onValueChange` | `(value) => void` | | As it moves. |
| `onValueCommit` | `(value) => void` | | Once when a drag ends or a key press changes it: for saving or fetching. |
| `min`, `max` | `number` | `0`, `100` | |
| `step` | `number` | `1` | Values snap to it. |
| `largeStep` | `number` | `10` | Steps moved by PageUp, PageDown and Shift with an arrow. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 4px track and 16px thumb, 6px and 20px, or 8px and 24px (`lg`, beside lg fields in a form). |
| `disabled` | `boolean` | `false` | |
| `invalid` | `boolean` | `false` | A danger fill and ring, and `aria-invalid` on the thumbs. Field's `error` sets it. |
| `readOnly` | `boolean` | `false` | Focusable and read out, but it doesn't move; the value is still submitted. |
| `formatValue` | `(value: number) => string` | | The words read out for a value (`aria-valuetext`), such as "$40". |
| `thumbLabels` | `[string, string]` | `['Minimum', 'Maximum']` | A range's thumb names. By default the `sliderMinimum` and `sliderMaximum` labels ("Minimum", "Maksimum" in `idLabels`). |
| `marks` | `boolean \| { value: number; label?: ReactNode }[]` | | Ticks on the track: `true` for every step, or the listed values with text under them. Visual only. |
| `showValue` | `boolean` | `false` | The value over the thumb while it's focused, hovered or dragged. Visual only. |
| `inputs` | `boolean` | `false` | A number field beside each thumb, kept in step with it, for typing an exact value. |
| `orientation` | `'horizontal'` \| `'vertical'` | `'horizontal'` | `'vertical'` runs the track bottom to top, min at the bottom, `--slider-length` long; Up and Right raise it, in either direction of text, and the thumbs say `aria-orientation="vertical"`. Mark labels sit to the right of the track, the value chip to its left |
| `origin` | `number` | `min` | Where a single thumb's fill starts: `0` on a -10 to +10 scale fills from the middle toward the thumb, either way. A range ignores it. |
| `name` | `string` | | The thumbs' range inputs take it (two with the same name for a range), so the value is sent with a form. |
| `form` | `string` | | The id of a form it sits outside of: its thumbs submit, and reset, with that form. |
| `required` | `boolean` | | Accepted so Field's `required` doesn't reach the page. A slider always has a value, so it has no effect. |

Name a single slider with `aria-label` or `aria-labelledby`; on a range they name the group. `className`, `ref` and other props go to the root `<div>`. Its `focus()` and `autoFocus` move focus to the first thumb (none when disabled), so a form library that focuses the first invalid field after a failed submit lands on the slider.

## Component tokens

Each is an optional override: set it on the page, a container or one slider. The list lives in `src/components/Slider/slider.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from slider.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--slider-track` | `border-control` | The track (3:1 on the surface, so the control can be seen). |
| `--slider-fill` | `primary` | The selected part of the track. |
| `--slider-thumb-bg` | `field` | The thumb's inside. |
| `--slider-thumb-border` | `primary` | The thumb's ring (3:1 on the surface). |
| `--slider-focus-ring` | `focus-ring` | The thumb's keyboard focus ring. |
| `--slider-invalid` | `danger` | The fill and the thumb's ring when invalid. |
| `--slider-mark` | `field` | The marks' ticks, cut into the track. |
| `--slider-mark-label` | `text-muted` | The marks' text under the track (4.5:1 on the surface). |
| `--slider-value-bg` | `surface-inverse` | showValue's chip over the thumb. |
| `--slider-value-text` | `text-inverse` | showValue's text (4.5:1 on value-bg). |
| `--slider-fill-disabled` | `disabled-surface` | Disabled: the fill, whatever its color when enabled. |
| `--slider-text-disabled` | `disabled-text` | Disabled: the text, icon or mark, in place of fading it (3:1 or more on its background, more with more contrast). |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--slider-track-height-sm` | `spacing-1` | The track's thickness, size="sm" (4px). |
| `--slider-track-height-md` | `spacing-1.5` | The track's thickness, size="md", the default (6px). |
| `--slider-track-height-lg` | `spacing-2` | The track's thickness, size="lg" (8px). |
| `--slider-thumb-size-sm` | `spacing-4` | The thumb, size="sm" (16px). |
| `--slider-thumb-size-md` | `spacing-5` | The thumb, size="md" (20px). |
| `--slider-thumb-size-lg` | `spacing-6` | The thumb, size="lg" (24px). |
| `--slider-input-width` | `spacing-20` | With inputs, each number field's width (80px). |
| `--slider-length` | `spacing-48` | A vertical slider's length, along the track (192px). |
| `--slider-mark-label-gap` | `spacing-2` | The least space between two mark labels; a label that would come closer wraps within its room (8px). |

**Border**

| Token | Default | Use |
| --- | --- | --- |
| `--slider-thumb-border-width` | `border-width-2` | The thumb's ring (2px). |
| `--slider-radius` | `radius-pill` | The track's ends and the thumb. |

**Shadow**

| Token | Default | Use |
| --- | --- | --- |
| `--slider-thumb-shadow` | `elevation-part` | The thumb's shadow. |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--slider-input-gap` | `spacing-3` | With inputs, between the track and each number field (12px). |
<!-- token-table:end -->
