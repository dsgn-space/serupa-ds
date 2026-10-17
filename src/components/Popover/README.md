# Popover

A small panel next to its trigger for content people interact with: a short form, filters, details with links. It's a non-modal dialog: the rest of the page stays usable, and it closes on Escape, a click outside, or when focus moves elsewhere.

Use Tooltip for a short hint and Menu for a list of actions; use Dialog when people must finish or dismiss something before going on.

## Usage

```jsx
const { Popover, Button, Field, Input } = window.Diki;

<Popover title="Share" trigger={<Button variant="outline" leftIcon="share">Share</Button>}>
  {(close) => (
    <form onSubmit={(e) => { e.preventDefault(); invite(); close(); }}>
      <Field label="Email"><Input type="email" /></Field>
      <Button type="submit">Invite</Button>
    </form>
  )}
</Popover>

<Popover aria-label="About billing" placement="right-start" initialFocus="panel"
  trigger={<IconButton icon="info" label="About billing" />}>
  You're billed on the 1st of each month.
</Popover>
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `trigger` | element | required | One element that can take focus; it gets `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls` |
| `children` | node, or `(close) => node` | required | The content. The function form gets `close()` for a Done or Cancel button |
| `title` | node | none | A heading at the top that names it |
| `placement` | `'bottom'`, `'top'`, `'left'`, `'right'`, each with `-start` or `-end` | `'bottom'` | Where it goes; it flips and shifts to stay on screen |
| `open`, `onOpenChange` | boolean, function | none | Open it yourself (controlled) |
| `aria-label` | string | none | Its name when there's no title |
| `initialFocus` | `'first'` \| `'panel'` | `'first'` | Focus the first control inside, or the panel itself (for text only) |
| `className`, `style` | | | Go to the panel, which has `data-component="popover"` and `data-side` |

## Accessibility

- The panel is a `role="dialog"` named by its title (or `aria-label`); the trigger has `aria-expanded` and `aria-controls`.
- Opening moves focus inside; Escape and `close()` return it to the trigger. It sits right after the trigger in the tab order, so Tab moves from the trigger into it.
- A click outside or focus moving elsewhere closes it, without moving focus.
- Text and the title keep 4.5:1 on the panel in all six themes (`tools/test/popover.mjs`). With reduced motion it appears without growing in.

## Component tokens

Each is an optional override: set it on the page, a container or one popover. The list lives in `src/components/Popover/popover.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--popover-bg` | `surface` | The panel's background. |
| `--popover-text` | `text` | The panel's text. |
| `--popover-border` | `border` | The panel's border. |
| `--popover-title` | `text` | The title. |
| `--popover-focus-ring` | `focus-ring` | The panel's focus ring, when it takes focus itself. |
| `--popover-shadow` | `shadow-lg` | The panel's shadow. |
| `--popover-radius` | `rounded-lg` | The panel's corners (8px). |
| `--popover-border-width` | `border-width-1` | The panel's border (1px). |
| `--popover-title-size` | `text-sm` | The title (14px). |
| `--popover-title-weight` | `font-semibold` | The title's weight (600). |
| `--popover-width` | `container-3xs` | The panel's width (256px; it never gets wider than the screen). |
| `--popover-padding` | `spacing-4` | Space inside the panel (16px). |
| `--popover-gap` | `spacing-2` | Space under the title (8px). |
| `--popover-offset` | `spacing-2` | The gap between the panel and its trigger (8px). |
| `--popover-z-index` | `z-50` | The stacking level where the browser has no top layer (popover). |
