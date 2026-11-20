# FabMenu

A floating action button that opens a few related actions, such as "New document", "New folder" and "Upload a file", when a screen's main action comes in kinds. It's a [Fab](../Fab/README.md) whose press opens a [Menu](../Menu/README.md), so each action shows its words, on touch too.

**Also called:** speed dial, FAB menu.

```tsx
import { FabMenu } from "@diki-stwn/serupa-ds";

<FabMenu icon="add" label="Create" actions={[
  { label: "New document", icon: "description", onSelect: newDoc },
  { label: "New folder", icon: "create_new_folder", onSelect: newFolder },
  { label: "Upload a file", icon: "upload", onSelect: upload },
]} />
```

## When to use

- A screen's main action comes in a few kinds people pick between: create a document, a folder or an upload.
- On a phone, where those would otherwise be three buttons fighting for the bottom of the screen.

## When not to use

- One main action: use a [Fab](../Fab/README.md), which does it in one press.
- More than six actions, or actions with nothing in common: use a [Menu](../Menu/README.md) from a button in the page, or put them in the page itself.
- On wide screens with room in the header: a [Button](../Button/README.md) or a split button there is easier to find.

## Usage

- Give it 3 to 6 `actions`, each with short words that say what it makes or does ("New folder", not "Folder"). The words always show: an icon alone is a guess.
- `label` names the Fab and the menu ("Create"). Pick an `icon` that says "more than one thing", such as `add`.
- It's fixed to a corner like a Fab (`placement`), and the actions open toward the middle of the screen: above a Fab at the bottom, under one at the top, lined up with its outer edge, 8px off it (`--fab-menu-offset`).
- Every Fab prop works the same (`extended`, `size`, `disabled`, `loading`). `open` and `onOpenChange` open it yourself.
- A `disabled` action is still read and reached, so people learn it's there; `destructive` paints one in danger colors.

## Accessibility

- **Role and name:** the Fab is a button with `aria-haspopup="menu"` and `aria-expanded`, named by `label`. The actions are `menuitem`s in a `role="menu"` with the same name.
- **Keyboard:** Enter, Space or Down on the Fab opens it on the first action, Up on the last; Up and Down move, Home and End go to the ends, a letter jumps to the action that starts with it, Enter or Space picks, and Escape, Tab, a pick or a press outside closes it. Closing puts focus back on the Fab. It's [Menu](../Menu/README.md#accessibility)'s keyboard.
- **Contrast:** the Fab keeps [Fab](../Fab/README.md)'s and the actions [Menu](../Menu/README.md)'s, in every theme.
- **What's still yours:** a `label` that says what the actions have in common, and words for each one that make sense read alone.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the Fab's `<button>`. |
| `actions` | `FabMenuAction[]` | | `{ label, icon?, onSelect, disabled?, destructive? }`, 3 to 6. |
| `icon` | `IconSource` | | The Fab's icon. |
| `label` | `string` | | The Fab's name, and the menu's. |
| `placement` | `'bottom-end'` \| `'bottom-start'` \| `'top-end'` \| `'top-start'` \| `'static'` | `'bottom-end'` | The corner it's fixed to; the actions open toward the middle. |
| `open` | `boolean` | | Open it yourself (controlled), with `onOpenChange`. |
| `onOpenChange` | `(open: boolean) => void` | | Called when it opens or closes. |

`extended`, `size`, `disabled`, `className`, `ref` and the other [Fab](../Fab/README.md) props go to the Fab's `<button>`.

## Component tokens

Each is an optional override: set it on the page, a container or one FabMenu. The list lives in `src/components/FabMenu/fab-menu.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from fab-menu.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--fab-menu-offset` | `spacing-2` | The space between the Fab and its menu (8px). |
<!-- token-table:end -->
