# ButtonGroup

Related buttons side by side, or stacked: joined into one control with shared borders (the default), or spaced apart. Use it for a set of actions on the same thing (Copy, Paste), a toolbar of ToggleButtons, or a split button.

## Usage

```jsx
const { ButtonGroup, Button, IconButton, ToggleButton } = window.Diki;

<ButtonGroup aria-label="Clipboard">
  <Button variant="outline" leftIcon="content_copy">Copy</Button>
  <Button variant="outline" leftIcon="content_paste">Paste</Button>
</ButtonGroup>

<ButtonGroup attached={false}>
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</ButtonGroup>

<ButtonGroup orientation="vertical" aria-label="Zoom">
  <IconButton variant="outline" icon="add" label="Zoom in" />
  <IconButton variant="outline" icon="remove" label="Zoom out" />
</ButtonGroup>
```

Size and variant stay on each button: give them all the same ones.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `attached` | boolean | `true` | Joins them: shared borders, only the outer corners rounded |
| `orientation` | `'horizontal'` \| `'vertical'` | `'horizontal'` | A row or a column |
| `aria-label` | string | none | What the group is for |

`className`, `style`, `ref` and everything else go to the wrapper, which has `role="group"`, `data-component="button-group"` and `data-orientation`.

## Accessibility

- It's a `role="group"`: name it with `aria-label` when the buttons share a purpose ("Text formatting"), so screen readers announce it on the way in.
- A hovered, focused or pressed button comes to the front, so its border and focus ring are never hidden by its neighbor.
- Each button keeps its own colors and contrast; the group adds none.

## Component tokens

Each is an optional override: set it on the page, a container or one group. The list lives in `src/components/ButtonGroup/button-group.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--button-group-gap` | `spacing-2` | Space between buttons when not attached (8px). |
| `--button-group-overlap` | `border-width-1` | How much attached buttons overlap, so their borders make one line (1px, the button border). |
