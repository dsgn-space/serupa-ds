# IconTile

An icon centered in a tinted rounded square (or a circle), to mark what a card, a settings row or an empty state is about at a glance.

```tsx
import { IconTile } from "serupa-ds";

<IconTile icon="cloud_done" tone="primary" />
<IconTile icon="warning" tone="warning" size="lg" />
<IconTile icon="person" shape="circle" size="xl" />
<IconTile icon="lock" tone="danger" label="Locked" />   // says something the text beside it doesn't
```

## When to use

- At the start of a Card's header, a settings row or a feature list, beside the title that says what it is.
- At the top of an EmptyState, as a quieter mark than an Illustration.

## When not to use

- A person or a team: use [Avatar](../Avatar/README.md) instead.
- A status that needs words, such as "Paid" or "Failed": use [Badge](../Badge/README.md) instead.
- An icon inside text or a button: use [Icon](../Icon/README.md) on its own.
- A pressable icon: use [IconButton](../IconButton/README.md) instead.

## Anatomy

Drawn from the `InACard` story.

1. **Tile** (`.dk-icon-tile`): the tinted square, in the tone's fill.
2. **Icon** (`.dk-icon-tile__icon`): centered, in the tone's color.

## Usage

- Pick the `tone` for what the row is about, not for decoration: `neutral` (default) for most things, `primary` for your product's own features, and a status (`success`, `warning`, `danger`, `info`) only when the row is about that state, such as a trial ending.
- `size`: `sm` (32px) beside one line of text, `md` (40px, default) beside a title and a line, `lg` (48px) and `xl` (64px) for an empty state or a feature list.
- Keep the shape the same across a list: squares for things, `shape="circle"` when it sits among Avatars.
- `icon` takes a Material Symbols name, a custom icon or an element, as [Icon](../Icon/README.md) does.

### Do and don't

- **Do:** Pick the `tone` for what the row is about: `neutral` for most things, and a status only where the row is that status. (`DoNeutralTones`)
- **Don't:** Color tiles for decoration: a real warning no longer stands out from the rest. (`DontDecorativeTones`)

## Accessibility

- Decorative by default: the tile is `aria-hidden`, since the title beside it says what the row is. When the icon says something the text doesn't, such as that a row is locked, pass `label`: the tile becomes `role="img"` named by it.
- Every tone keeps its icon at 3:1 or more on its fill, in all six themes (`IconTile.test.tsx`), and the tones differ by icon as well as color when you choose icons that say the state (a warning sign for warning).
- In forced colors (Windows High Contrast), where fills are dropped, an outline keeps the tile's shape.
- **Keyboard:** none: it isn't interactive.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `icon` | string or element | | The icon: a Material Symbols name, a custom icon or any element. |
| `tone` | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'neutral'` | The fill and the icon's color. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 32, 40, 48 or 64px, with a 16, 20, 24 or 32px icon. |
| `shape` | `'square' \| 'circle'` | `'square'` | Rounded corners, or a circle. |
| `label` | string | none | Makes the tile an image with this name; without it, it's hidden from screen readers. |

`id`, `className`, `style`, `ref` and other props go to the `<span>`, which has `data-component="icon-tile"`.

## Component tokens

Each is an optional override: set it on the page, a container or one tile. The list lives in `src/components/IconTile/icon-tile.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from icon-tile.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--icon-tile-neutral-bg` | `secondary` | A neutral tile's fill. |
| `--icon-tile-neutral-icon` | `text-muted` | A neutral tile's icon (3:1 on its fill). |
| `--icon-tile-primary-bg` | `primary-subtle` | A primary tile's fill. |
| `--icon-tile-primary-icon` | `primary` | A primary tile's icon (3:1 on its fill). |
| `--icon-tile-success-bg` | `success-subtle` | A success tile's fill. |
| `--icon-tile-success-icon` | `success-text` | A success tile's icon (3:1 on its fill). |
| `--icon-tile-warning-bg` | `warning-subtle` | A warning tile's fill. |
| `--icon-tile-warning-icon` | `warning-text` | A warning tile's icon (3:1 on its fill). |
| `--icon-tile-danger-bg` | `danger-subtle` | A danger tile's fill. |
| `--icon-tile-danger-icon` | `danger-text` | A danger tile's icon (3:1 on its fill). |
| `--icon-tile-info-bg` | `info-subtle` | An info tile's fill. |
| `--icon-tile-info-icon` | `info-text` | An info tile's icon (3:1 on its fill). |
| `--icon-tile-radius` | `radius-surface` | The corners at sizes md and lg (8px). |
| `--icon-tile-radius-sm` | `radius-control` | The corners at size sm (6px). |
| `--icon-tile-radius-xl` | `radius-container` | The corners at size xl (12px). |
<!-- token-table:end -->

## Related

- [Avatar](../Avatar/README.md): a person's picture or initials.
- [Icon](../Icon/README.md): the icon on its own.
- [EmptyState](../EmptyState/README.md): often starts with an IconTile.
