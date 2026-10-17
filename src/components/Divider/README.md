# Divider

A 1px line between content, horizontal or vertical, with an optional label in the middle such as "or".

## Usage

```jsx
const { Divider, Stack } = window.Diki;

<Divider />
<Divider label="or" />
<Stack direction="row" gap={3}>
  <span>Edit</span><Divider orientation="vertical" /><span>Share</span>
</Stack>
<Divider decorative />
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `orientation` | `'horizontal'` \| `'vertical'` | `'horizontal'` | Across the full width, or the height of the row it's in |
| `label` | node | none | Text in the middle of a horizontal line. A vertical divider has no label |
| `decorative` | boolean | `false` | Leaves it out of the accessibility tree |

Without a label, a horizontal divider is an `<hr>`; otherwise a `<div>`. It has no margins: space it with the layout around it. `className`, `style`, `ref` and everything else go to the element, which has `data-component="divider"`.

## Accessibility

- It's a separator to screen readers (an `<hr>`, or `role="separator"` with `aria-orientation`). When it only decorates, such as between items that are already grouped, use `decorative`.
- The label keeps 4.5:1 on `surface` in all six themes (`tools/test/layout.mjs`). The line itself is decoration, so it doesn't need 3:1.
- In Windows high-contrast mode the line uses the text color.

## Component tokens

Each is an optional override: set it on the page, a container or one element. The list lives in `src/components/Divider/divider.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--divider-color` | `border` | The line. |
| `--divider-label-color` | `text-muted` | A label in the line (4.5:1 on surface). |
| `--divider-width` | `border-width-1` | The line's thickness (1px). |
| `--divider-label-gap` | `spacing-3` | Space on each side of a label (12px). |
