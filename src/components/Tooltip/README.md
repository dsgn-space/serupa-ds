# Tooltip

A short hint about one element, shown while it's hovered or focused: what an icon button does, a keyboard shortcut, why something is unavailable. It sits next to the element in the browser's top layer, so nothing on the page can cover or clip it.

## Usage

```jsx
const { Tooltip, IconButton, Button } = window.Diki;

<Tooltip content="Download as PDF">
  <IconButton icon="download" label="Download" noTitle />
</Tooltip>

<Tooltip content="Ctrl + S" placement="bottom">
  <Button>Save</Button>
</Tooltip>

// the tooltip is the only name: role="label"
<Tooltip content="Settings" role="label">
  <button className="…"><Icon name="settings" /></button>
</Tooltip>
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `content` | node | required | A short line of text. No links or buttons: people can't reach them |
| `children` | one element | required | Something that takes focus: a Button, IconButton or link. It gets the events and the `aria-` wiring, and keeps its own handlers and ref |
| `placement` | `'top'` \| `'bottom'` \| `'left'` \| `'right'`, each with `-start` or `-end` | `'top'` | Where it goes. It flips to the other side when there's no room and slides to stay on screen |
| `delay` | number | `400` | Milliseconds the pointer rests before it shows. Keyboard focus shows it at once |
| `role` | `'description'` \| `'label'` | `'description'` | Adds to the element's name (`aria-describedby`), or is its name (`aria-labelledby`) |
| `open`, `onOpenChange` | boolean, function | | Control it yourself |
| `disabled` | boolean | `false` | Never shows |

`className` and `style` go to the tooltip, which has `role="tooltip"`, `data-component="tooltip"`, `data-state` and `data-side`.

## Accessibility

- It shows on keyboard focus as well as hover, and only for the focus ring (not after a click).
- WCAG 1.4.13: Escape hides it from anywhere, the pointer can move onto it without it closing, and it stays until the pointer or focus leaves.
- Don't put anything only in a tooltip that people need to do the task: touch screens have no hover.
- A disabled `<button>` can't take focus or hover events: wrap it in a `<span tabIndex={0}>`, or use `aria-disabled` instead.
- The text keeps 4.5:1 on the tooltip in all six themes (`tools/test/tooltip.mjs`). In forced-colors mode it gets a border.

## Component tokens

Each is an optional override: set it on the page, a container or one tooltip. The list lives in `src/components/Tooltip/tooltip.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--tooltip-bg` | `surface-inverse` | The background: the inverse surface, so it stands out in light and dark themes. |
| `--tooltip-text` (was `--tooltip-color`, which still works until 5.0.0) | `text-inverse` | The text (4.5:1 on the background). |
| `--tooltip-shadow` | `shadow-md` | The shadow. |
| `--tooltip-radius` | `rounded-md` | The corners (6px). |
| `--tooltip-padding-x` | `spacing-2` | Padding at the sides (8px). |
| `--tooltip-padding-y` | `spacing-1` | Padding at the top and bottom (4px). |
| `--tooltip-offset` | `spacing-1_5` | The gap between the tooltip and what it describes (6px). |
| `--tooltip-max-width` | `spacing-60` | The widest a tooltip gets before it wraps (240px). |
| `--tooltip-z-index` | `z-50` | The stacking level where the browser has no top layer (popover). |
