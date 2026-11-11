# IconButton

A button that shows only an icon: a menu trigger, a close button, a toolbar action. It's a [Button](../Button/README.md) with `icon`, and a `label` you can't leave out, because an icon alone has no name for screen readers.

```jsx
const { IconButton } = window.Serupa;

<IconButton icon="more_vert" label="More actions" onClick={openMenu} />
<IconButton icon="edit" label="Edit" variant="secondary" shape="round" />
<IconButton icon="delete" label="Delete file" destructive />
<IconButton icon="open_in_new" label="Open in a new tab" href={url} target="_blank" />
```

## When to use

- An action whose icon people know at a glance: close, search, settings, more actions.
- Toolbars, table rows and card headers, where a labeled button would take too much room.
- A menu trigger, such as the "More actions" button that opens a [Menu](../Menu/README.md).

## When not to use

- An action whose icon isn't widely understood: use a [Button](../Button/README.md) with a label and a `leftIcon`.
- A setting that stays on or off, such as bold or mute: use [ToggleButton](../ToggleButton/README.md) with `icon` and `aria-label`.
- The one main action of a screen that must stay in reach while people scroll: use [Fab](../Fab/README.md).

## Usage

- Write the `label` as the action ("Delete file"). It also shows in a [Tooltip](../Tooltip/README.md) when people point at the button or reach it with Tab, so sighted keyboard and touch users can tell what an icon does, not only screen reader users. A native `title` showed only after the mouse rested on it.
- For a tooltip that says more than the label ("Delete file (can't be undone)"), wrap the button in your own Tooltip: it replaces the built-in one (the button then has `aria-describedby`), so only one shows.
- Set `hideTitle` where visible text right beside the button already says the label, so the same words don't pop up next to themselves.
- Give icon buttons in one row the same `size` and `variant`, and match the size of the buttons and fields beside them.
- Use `shape="round"` only where round buttons are the pattern; square follows Button's corners.

## Accessibility

- The label is the button's name: say what it does ("Delete file"), not what it shows ("Trash can").
- The built-in tooltip is the button's label (Tooltip's `role="label"`), so screen readers say the name once, not again as a description. It shows on focus as well as hover, stays while the pointer moves onto it, and Escape hides it (WCAG 1.4.13).
- Every size is at least 24×24px, the WCAG 2.2 target size.
- The rest is Button's: focus ring, contrast, forced colors and reduced motion (checked in Button's tests); IconButton's own checks are in `IconButton.test.tsx`.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the button |
| Enter, Space | Press it |

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<button>`. |
| `icon` | icon name \| element | required | A custom or Material Symbols name, or any element |
| `label` | string | required | Its `aria-label`, and a Tooltip on hover and focus. An `aria-label` passed instead (from JavaScript, or props spread from a Button) is used as the label |
| `shape` | `'square'` \| `'round'` | `'square'` | The Button's corners, or a circle |
| `hideTitle` | boolean | `false` | Leaves out the tooltip, when visible text beside it already shows the label (a Tooltip of your own replaces it by itself). |
| `variant` | as Button | `'ghost'` | Ghost by default, the usual look for an icon on its own |

Every other Button prop works the same: `size` (24, 32 or 44px square), `destructive`, `loading`, `disabled`, `href`, `onClick`, `ref`. A given `title` shows instead of the tooltip.

## Component tokens

Each is an optional override: set it on the page, a container or one button. The list lives in `src/components/IconButton/icon-button.tokens.json` (also in `design-tokens/components/`). Every Button token applies too.

<!-- token-table:start (made from icon-button.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--icon-button-radius-round` | `radius-pill` | The corners of a round icon button (shape="round"). |
<!-- token-table:end -->
