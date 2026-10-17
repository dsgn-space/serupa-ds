# Fab

A floating action button: the one main action of a screen, such as "New project" or "Compose", in a round, raised button fixed to a corner. It's a primary [Button](?path=/docs/components-button--docs), so loading, disabled and focus all work the same.

## Usage

```jsx
const { Fab } = window.Diki;

<Fab icon="add" label="New project" onClick={create} />
<Fab icon="edit" label="Compose" extended />
<Fab icon="chat" label="Help" size="sm" position="bottom-start" />
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `icon` | icon name \| element | required | A custom or Material Symbols name, or any element (24px) |
| `label` | string | required | Shown next to the icon when extended; otherwise its `aria-label` and `title` |
| `extended` | boolean | `false` | Shows the label: a 56px pill instead of a circle |
| `size` | `'md'` \| `'sm'` | `'md'` | 56px or 40px |
| `position` | `'bottom-end'` \| `'bottom-start'` \| `'top-end'` \| `'top-start'` \| `'static'` | `'bottom-end'` | The corner of the screen it's fixed to, 24px in; start and end follow the text direction. `static` leaves it in the page for you to place |

Every other Button prop works the same: `onClick`, `loading`, `disabled`, `destructive`, `ref`. It sits at `z-30`: above the page, under dialogs and toasts.

## Usage guidelines

- One per screen, for the action people come to the screen for. Other actions go in the page.
- Leave room at the end of the content so the FAB never covers the last item.
- On wide screens, a regular Button in the header is often clearer; use the FAB where the main action must stay in reach as people scroll.

## Accessibility

- It's a real `<button>` named by `label`. Put it where it comes in the reading order (often after the main content), since it's fixed but still focused in source order.
- `shadow-lg` at rest and `shadow-xl` on hover lift it off the page; the colors and focus ring are Button's primary (`tools/test/button.mjs`, `tools/test/icon-button.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one FAB. The list lives in `src/components/Fab/fab.tokens.json` (also in `design-tokens/components/`). Button's primary tokens set the colors.

| Token | Default | Use |
| --- | --- | --- |
| `--fab-size` | `spacing-14` | The height (and width, without a label) of a medium FAB (56px). |
| `--fab-size-sm` | `spacing-10` | The height of a small FAB (40px). |
| `--fab-icon-size` | `spacing-6` | The icon (24px). |
| `--fab-shadow` | `shadow-lg` | The raised shadow at rest. |
| `--fab-shadow-hover` | `shadow-xl` | The shadow on hover. |
| `--fab-radius` | `rounded-full` | The corners (round). |
| `--fab-offset` | `spacing-6` | The distance from the corner of the screen (24px). |
| `--fab-padding-x` | `spacing-5` | Padding at the sides of an extended FAB (20px). |
| `--fab-z-index` | `z-30` | The stacking level: above the page, under dialogs and toasts. |
