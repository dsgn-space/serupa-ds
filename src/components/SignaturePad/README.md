# SignaturePad

A place to sign: people draw their signature with a mouse, pen or finger, or type their full name instead. The app gets the signature as SVG (and a PNG from `signatureToPng`), with the typed name.

```tsx
import { Field, SignaturePad, signatureToPng } from "serupa-ds";

<Field label="Sign to accept the terms" error={error}>
  <SignaturePad name="signature" onValueChange={(value) => setSignature(value)} />
</Field>

// later, for an app that stores pictures
const png = signature && await signatureToPng(signature.svg);
```

## When to use

- Accepting terms, a delivery, a consent form or a timesheet, where a signature is expected and a typed name counts as one.
- Anywhere the app keeps the picture of a signature to show or print later.

## When not to use

- A legally qualified electronic signature (one tied to a certificate or an identity check): that is a service's job; use its own flow.
- A plain "I agree": use a [Checkbox](../Checkbox/README.md).
- Collecting a name only: use an [Input](../Input/README.md) with `autoComplete="name"`.

## Anatomy

Drawn from the `Playground` story.

1. **Method switch** (`.dk-signature-pad__method`): a [SegmentedControl](../SegmentedControl/README.md), Draw or Type.
2. **How-to text** (`.dk-signature-pad__how`): what to do; while drawing it points to Type. It describes the group.
3. **Box** (`.dk-signature-pad__box`): an outlined surface with a line near its foot; the strokes, or the typed name, sit on the line.
4. **Actions** (`.dk-signature-pad__actions`): Undo (the last stroke) and Clear (every stroke), while drawing.

## Usage

- Name it: a [Field](../Field/README.md) label ("Sign to accept the terms") or `aria-label`. In a Field, its hint and error describe it.
- Keep Type: it's how people who can't draw with a pointer sign (WCAG 2.5.7 Dragging movements, 2.1.1 Keyboard), and some people prefer it. Treat a typed name as a signature as much as a drawing.
- `onValueChange(value, details)` gives `{ method, svg, name }` (null while empty) after each stroke, undo, clear, typed change or switch, with `details.reason`. The SVG is a standalone document sized to the box, in black, so it prints on paper whatever the theme.
- With `name`, a hidden input sends the SVG with the form ("" while empty), and `form.reset()` empties it. Check that it isn't empty yourself, and show the error in the Field.
- To show a saved signature, pass it back as `defaultValue` (or `value`, controlled): a typed one by its `name`, a drawn one by the SVG SignaturePad made.
- `defaultMethod="type"` starts on the name field, as on a page most people fill in with a keyboard.
- A drawing and a typed name are kept apart while people switch; the value follows the method shown.

## Accessibility

- **Role and name:** a `group` named by its Field label or `aria-label`, described by its how-to text (and a Field's hint and error). The method switch is a radio group named "Signature method"; when the signature is invalid, it and the name field carry `aria-invalid` (a group can't). The drawing box is an image named "Signature area, empty" or "Signature drawn".
- **Keyboard:** Tab reaches the switch; the arrow keys pick Draw or Type. The drawing box isn't a Tab stop, because nothing in it works by keyboard; Type is the keyboard way, and the how-to text says so. In Type, the "Full name" field takes the name. Undo and Clear are buttons; when they empty the box, focus goes back to the switch.
- **Touch:** the page doesn't scroll while a finger draws in the box (`touch-action: none`); it scrolls as usual everywhere else.
- **Contrast:** on the surface, the how-to text and the ink read 4.5:1, and the box outline and the line 3:1, in all six themes (`SignaturePad.test.tsx`). In forced colors, the outline, line and ink use the system text color.
- **What's still yours:** the label, telling people what they're signing, and the error when they haven't.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the root `<div role="group">`. A `<label htmlFor>` can't name a group; inside a Field, the Field's label names it through this id. |
| `value` | `SignatureValue \| null` | | The signature (controlled), as `onValueChange` gave it or as saved before. A drawn one is read back from its SVG's paths. |
| `defaultValue` | `SignatureValue \| null` | | The signature at first (uncontrolled), such as one saved before; `form.reset()` goes back to it. |
| `onValueChange` | `(value: SignatureValue \| null, details: { reason }) => void` | | After each stroke, undo, clear, typed change or switch of method. `reason`: `"draw"`, `"undo"`, `"clear"`, `"type"`, `"method"` or `"reset"`. |
| `defaultMethod` | `"draw" \| "type"` | `"draw"` | How it starts. |
| `name` | `string` | | Sends the SVG with a form in a hidden input. |
| `form` | `string` | | The id of a form elsewhere on the page. |
| `disabled` | `boolean` | `false` | Turns drawing, typing and the buttons off. |
| `invalid` | `boolean` | `false` | `aria-invalid` and a danger outline. Field sets it from its error. |

`SignatureValue` is `{ method: "draw" | "type"; svg: string; name: string }`. `signatureToPng(svg, scale = 2)` resolves to a PNG `Blob` drawn in the browser (null on the server). `className`, `ref` and other props go to the group's `<div>`; `ref.current.focus()` and `autoFocus` focus the method switch.

## Component tokens

Each is an optional override: set it on the page, a container or one SignaturePad. The list lives in `src/components/SignaturePad/signature-pad.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from signature-pad.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--signature-pad-bg` | `surface` | The drawing box's background. |
| `--signature-pad-border` | `field-border` | The drawing box's outline (3:1 on the page). |
| `--signature-pad-border-invalid` | `danger` | The drawing box's outline while the signature is invalid (3:1). |
| `--signature-pad-ink` | `text` | The drawn strokes and the typed name (4.5:1 on bg). |
| `--signature-pad-line` | `text-muted` | The line to sign on (3:1 on bg). |
| `--signature-pad-hint` | `text-muted` | The how-to text under the switch (4.5:1). |
| `--signature-pad-radius` | `radius-control` | The drawing box's corners. |
| `--signature-pad-gap` | `spacing-2` | The space between the switch, the how-to text, the box and the buttons. |
| `--signature-pad-height` | `spacing-40` | The drawing box's height (160px). |
| `--signature-pad-stroke` | `border-width-2` | The drawn strokes' width on screen (the SVG value draws them 2.5px). |
<!-- token-table:end -->
