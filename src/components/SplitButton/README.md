# SplitButton

A main action joined to an arrow button that opens a menu of other ways to do it: Publish, with Schedule and Save as draft one click away. The common choice stays one click; the others don't take room of their own.

**Also called:** button with dropdown, split dropdown button.

```tsx
import { SplitButton, MenuItem } from "@diki-stwn/serupa-ds";

<SplitButton onClick={publish} menuLabel="More publish options" menu={<>
  <MenuItem onSelect={schedule}>Schedule</MenuItem>
  <MenuItem onSelect={saveDraft}>Save as draft</MenuItem>
</>}>Publish</SplitButton>
```

## When to use

- One action people take most of the time, with a few variations of it: Save and Save a copy, Send and Send later, Merge and Squash and merge.

## When not to use

- Actions that aren't ways to do the same thing: use separate [Button](../Button/README.md)s or a [ButtonGroup](../ButtonGroup/README.md).
- No main action, only a list of choices: use a [Menu](../Menu/README.md) on one Button.
- Picking one option that stays chosen: use [Select](../Select/README.md) or [SegmentedControl](../SegmentedControl/README.md).

## Anatomy

Drawn from the `Default` story.

1. **Main button** (`.dk-btn`): runs the main action (`onClick`) and shows its label.
2. **Menu button** (`.dk-split-button__menu`): the arrow, named by `menuLabel`, which opens the menu.

## Usage

- Label the main button with the action itself ("Publish"), and the menu with what it holds ("More publish options").
- Put the variations in the menu, not unrelated actions, and keep it short: three to five items.
- Give both halves one variant (the `variant` prop does). Two primary halves get an edge between them in their text color.
- Use `loading` while the main action runs: the main button shows a Loader and can't be pressed twice; the menu stays usable.

### Do and don't

- **Do:** Put other ways of doing the main action in the menu: Schedule, Save as draft. (`DoVariations`)
- **Don't:** Put unrelated actions there: nobody looks for Rename or Delete behind Publish. Use a [Menu](../Menu/README.md) of its own. (`DontUnrelated`)

## Accessibility

- **Role and name:** a `role="group"` (name it with `aria-label` when the page has several) holding two buttons. The main one is named by its label; the arrow by `menuLabel`, with `aria-haspopup="menu"` and `aria-expanded`, and the same words as a tooltip.
- **Keyboard:** Tab reaches each half. Enter or Space on the main button runs it; on the arrow, Enter, Space or Down opens the menu on its first item and Up on its last. Escape closes it and puts focus back on the arrow (from Menu).
- **Contrast:** each half keeps Button's colors and contrast in every theme. The edge between two primary halves is decoration, so it has no minimum.
- **What's still yours:** a `menuLabel` that says what the menu holds, and an `aria-label` on the group when there are several on the page.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the wrapper `<div>`. |
| `children` | `ReactNode` | | Required. The main action's label |
| `onClick` | `(event) => void` | | Runs the main action |
| `menu` | `ReactNode` | | Required. `MenuItem`, `MenuGroup` and `MenuSeparator` |
| `menuLabel` | `string` | | Required. The arrow button's name ("More publish options") |
| `variant` | `'primary'` \| `'secondary'` \| `'outline'` | `'primary'` | Both halves |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Both halves |
| `destructive` | `boolean` | `false` | The danger color, for a main action that deletes or can't be undone |
| `leftIcon` | icon | | An icon before the main label |
| `disabled` | `boolean` | `false` | Turns off both halves |
| `loading` | `boolean` | `false` | The main button shows a Loader and can't be pressed again; the menu stays usable |
| `placement` | placement | `'bottom-end'` | Where the menu opens |
| `open`, `defaultOpen`, `onOpenChange` | | | The menu's open state, as on Menu |

`aria-label` and `aria-labelledby` name the group. `className`, `ref` and other props go to the wrapper `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one SplitButton. The list lives in `src/components/SplitButton/split-button.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from split-button.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--split-button-divider` | `opacity-40` | How strong the edge between two primary halves is: their text color at this opacity (40%). |
<!-- token-table:end -->
