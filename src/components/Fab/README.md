# Fab

A floating action button: the one main action of a screen, such as "New project" or "Compose", in a round, raised button fixed to a corner. It's a primary [Button](../Button/README.md), so loading, disabled and focus all work the same.

**Also called:** floating action button.

```jsx
import { Fab } from '@diki-stwn/serupa-ds';

<Fab icon="add" label="New project" onClick={create} />
<Fab icon="edit" label="Compose" extended />
<Fab icon="chat" label="Help" size="sm" placement="bottom-start" />
```

## When to use

- The one action people come to a screen for, such as "New project" or "Compose".
- When that action must stay in reach as people scroll.

## When not to use

- On wide screens, a regular [Button](../Button/README.md) in the header is often clearer.
- Any other action on the same screen: use a [Button](../Button/README.md) in the page, since there's only one FAB per screen.
- An icon action in a toolbar or a row: use [IconButton](../IconButton/README.md).

## Anatomy

Drawn from the `ExtendedAuto` story. It's a primary [Button](../Button/README.md), so its icon and label are Button's.

1. **Button** (`.dk-fab`): the round, raised primary button, fixed to a corner of the screen; extended, a pill with the label.
2. **Label** (`.dk-fab__label`): with `extended="auto"`, the label's text in a box that folds to nothing while the page scrolls down and opens again on the way up.

## Usage

- One per screen, for the action people come to the screen for. Other actions go in the page.
- Leave room at the end of the content so the FAB never covers the last item.
- On a phone, an extended FAB covers a lot of a long list. `extended="auto"` folds it to its icon while the page scrolls down and opens it again on the way back up or at the top, so the label is there when people look for the action and out of the way while they read. It's named by its label either way. The width changes at once and the label fades in, or appears at once with reduced motion.

## Placement

- The offset is measured from the safe area. On a phone with a home bar or a notch, and with `viewport-fit=cover` in the viewport meta tag, the button sits above the bar instead of under it.

### Do and don't

- **Do:** Use one FAB, for the action people come to the screen for. (`DoOneFab`)
- **Don't:** Put several FABs on one screen: they compete and cover the content. (`DontSeveral`)

## Accessibility

- It's a real `<button>` named by `label`. Put it where it comes in the reading order (often after the main content), since it's fixed but still focused in source order.
- `shadow-lg` at rest and `shadow-xl` on hover lift it off the page; the colors and focus ring are Button's primary (checked in Button's tests and `Fab.test.tsx`).
- While it's fixed to a corner, the page gets that much scroll padding at that edge (the FAB's size and twice its offset, 104px by default), so what the keyboard focuses scrolls into view clear of it, not under it (WCAG 2.4.11). With a sticky Navbar at the top, the larger padding wins.
- It isn't printed: fixed to the viewport, it would repeat on every page.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the button, in its place in the source order (not where it floats) |
| Enter, Space | Press it |

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<button>`. |
| `icon` | icon name \| element | required | A custom or Material Symbols name, or any element (24px) |
| `label` | string | required | Shown next to the icon when extended; otherwise its `aria-label`, and a Tooltip on hover and keyboard focus |
| `extended` | boolean \| `'auto'` | `false` | Shows the label: a 56px pill instead of a circle. In a corner it is never wider than the screen less its offset on both sides, so a long label ends in an ellipsis. `'auto'`: shrinks to the 56px circle while the page scrolls down, and shows the label again scrolling up or at the top |
| `size` | `'md'` \| `'sm'` | `'md'` | 56px or 40px |
| `placement` | `'bottom-end'` \| `'bottom-start'` \| `'top-end'` \| `'top-start'` \| `'static'` | `'bottom-end'` | The corner of the screen it's fixed to, 24px in; start and end follow the text direction. `static` leaves it in the page for you to place |

Every other Button prop works the same: `onClick`, `loading`, `disabled`, `destructive`, `ref`. It sits at `z-30`: above the page, under dialogs and toasts.

## Component tokens

Each is an optional override: set it on the page, a container or one FAB. The list lives in `src/components/Fab/fab.tokens.json` (also in `design-tokens/components/`). Button's primary tokens set the colors.

<!-- token-table:start (made from fab.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--fab-size` | `spacing-14` | The height (and width, without a label) of a medium FAB (56px). |
| `--fab-size-sm` | `spacing-10` | The height of a small FAB (40px). |
| `--fab-icon-size` | `spacing-6` | The icon (24px). |
| `--fab-label-max` | `container-xs` | How wide an extended="auto" FAB's label can open (320px); it folds to 0 while the page scrolls down. |
| `--fab-shadow` | `elevation-overlay` | The raised shadow at rest. |
| `--fab-shadow-hover` | `elevation-modal` | The shadow on hover. |
| `--fab-radius` | `radius-pill` | The corners (round). |
| `--fab-offset` | `spacing-6` | The distance from the corner of the screen (24px). |
| `--fab-padding-x` | `spacing-5` | Padding at the sides of an extended FAB (20px). |
| `--fab-z-index` | `z-30` | The stacking level: above the page, under dialogs and toasts. |
<!-- token-table:end -->
