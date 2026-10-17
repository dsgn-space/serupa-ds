# IconButton

A button that shows only an icon: a menu trigger, a close button, a toolbar action. It's a [Button](?path=/docs/components-button--docs) with `icon`, and a `label` you can't leave out, because an icon alone has no name for screen readers.

## Usage

```jsx
const { IconButton } = window.Diki;

<IconButton icon="more_vert" label="More actions" onClick={openMenu} />
<IconButton icon="edit" label="Edit" variant="secondary" shape="round" />
<IconButton icon="delete" label="Delete file" destructive />
<IconButton icon="open_in_new" label="Open in a new tab" href={url} target="_blank" />
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `icon` | icon name \| element | required | A custom or Material Symbols name, or any element |
| `label` | string | required | Its `aria-label`, and a `title` tooltip |
| `shape` | `'square'` \| `'round'` | `'square'` | The Button's corners, or a circle |
| `noTitle` | boolean | `false` | Leaves out the `title`, when a Tooltip already shows the label |
| `variant` | as Button | `'ghost'` | Ghost by default, the usual look for an icon on its own |

Every other Button prop works the same: `size` (24, 32 or 44px square), `destructive`, `loading`, `disabled`, `href`, `onClick`, `ref`. A given `title` wins over the label.

## Accessibility

- The label is the button's name: say what it does ("Delete file"), not what it shows ("Trash can").
- Every size is at least 24×24px, the WCAG 2.2 target size.
- The rest is Button's: focus ring, contrast, forced colors and reduced motion (`tools/test/button.mjs`); IconButton's own checks are in `tools/test/icon-button.mjs`.

## Component tokens

Each is an optional override: set it on the page, a container or one button. The list lives in `src/components/IconButton/icon-button.tokens.json` (also in `design-tokens/components/`). Every Button token applies too.

| Token | Default | Use |
| --- | --- | --- |
| `--icon-button-radius-round` | `rounded-full` | The corners of a round icon button (shape="round"). |
