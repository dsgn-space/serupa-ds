# Menubar

An application's menu bar: File, Edit, View along the top of an editor or tool, each opening a menu. The whole bar is one Tab stop, the arrow keys move across it, and with a menu open, ← and → go straight to the next menu, open, as in a desktop app.

```tsx
import { Menubar, MenubarMenu, MenuItem, MenuSub, MenuSeparator } from "serupa-ds";

<Menubar aria-label="Editor">
  <MenubarMenu label="File">
    <MenuItem icon="add" shortcut={['alt', 'N']} onSelect={create}>New</MenuItem>
    <MenuSub icon="share" label="Share">
      <MenuItem icon="mail" onSelect={email}>Email</MenuItem>
    </MenuSub>
    <MenuSeparator />
    <MenuItem icon="print" shortcut={['mod', 'P']} onSelect={print}>Print</MenuItem>
  </MenubarMenu>
  <MenubarMenu label="Edit">
    <MenuItem icon="undo" shortcut={['mod', 'Z']} onSelect={undo}>Undo</MenuItem>
  </MenubarMenu>
</Menubar>
```

## When to use

- An editor or tool with many commands people come back to: a document editor, a report builder, a diagram tool.
- When those commands fall into a few familiar groups (File, Edit, View, Insert, Help) that people expect along the top.

## When not to use

- A few actions on one thing: use a [Menu](../Menu/README.md) behind one button instead.
- Buttons people press often, such as an editor's bold and italic: use a [Toolbar](../Toolbar/README.md), so each is one press away.
- Navigation between an app's pages: use [Navbar](../Navbar/README.md) or [Sidebar](../Sidebar/README.md). A menubar is for commands, not links.
- A phone-sized layout: a row of menus is hard to aim at and to read there. Put the commands in one Menu or a [Drawer](../Drawer/README.md) instead.

## Anatomy

Drawn from the `Open` story.

1. **Bar** (`.dk-menubar`): the row that holds the menus' names, one Tab stop.
2. **Menu name** (`.dk-menubar__item`): opens its menu; pressed while it's open.
3. **Menu** (`.dk-menu`): the menu it opens, a [Menu](../Menu/README.md).

## Usage

- Name the bar (`aria-label`, "Editor"), so screen readers say which menu bar it is.
- Keep to the names people know, in the usual order: File, Edit, View, then your own, then Help. Use one word each where you can.
- Put each command in one place. A command also on a Toolbar is fine; the same command in two menus is not.
- `disabled` keeps a menu in the bar while nothing in it can be used yet, so people learn it's there. Disable single items with MenuItem's own `disabled` rather than the whole menu where you can.
- Each `MenubarMenu` holds what a [Menu](../Menu/README.md) holds: `MenuItem`, `MenuSub`, `MenuGroup`, `MenuSeparator`, `MenuCheckboxItem` and `MenuRadioGroup`. Their props and rules are Menu's. `shortcut` only shows a hint: wire the shortcut yourself.
- `defaultOpen` on one menu opens it on arrival, for a walkthrough or a screenshot.

## Accessibility

- **Role and name:** `role="menubar"`, named by `aria-label` or `aria-labelledby`. Each name is a `menuitem` button with `aria-haspopup="menu"` and `aria-expanded`, and its menu is a `menu` named by it. A disabled menu's name has `aria-disabled` and stays reachable.
- **Keyboard:** below. The bar keeps the last name used as its Tab stop.
- **Pointer:** a click opens or closes a menu, a mouse press opens it so it can be dragged onto an item (as in Menu). While a menu is open, pointing at another name opens that one.
- **Contrast:** names read 4.5:1 on the bar, under the pointer and while open, and the focus ring 3:1, in all six themes (`Menubar.test.tsx`). In forced colors the open name is drawn in Highlight.
- **What's still yours:** the bar's name, wiring the shortcuts you show, and keeping commands where people expect them.

### Keyboard

| Key | On a name in the bar | In an open menu |
| --- | --- | --- |
| → / ← (mirrored in rtl) | The next / previous name, wrapping | Closes it and opens the next / previous menu on its first item (on a `MenuSub`, → opens the submenu instead, and ← in a submenu closes it) |
| ↓ / ↑, Enter, Space | Opens its menu on the first / last item | As in Menu |
| Home, End | The first or last name | The first or last item |
| Letters | The next name starting with them | The next item starting with them |
| Escape | | Closes it; focus goes back to its name |
| Tab | Leaves the bar | Closes it and leaves the bar |

## Props

### Menubar

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `aria-label` | `string` | | The bar's name. Or name it with `aria-labelledby`. |
| `children` | `ReactNode` | | Its `MenubarMenu`s, in order. |
| `id` | `string` | | Goes to the root `<div role="menubar">`. |

`className`, `ref` and other props go to the `<div role="menubar">`. Its `onKeyDown` runs first and can call `preventDefault()` to stop the bar's keys.

### MenubarMenu

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | The menu's name in the bar. |
| `children` | `ReactNode` | | Its items, as in a Menu. |
| `disabled` | `boolean` | `false` | Reachable with the keys, but doesn't open. |
| `defaultOpen` | `boolean` | `false` | Open on arrival. |
| `id` | `string` | | Goes to the name's `<button>`; its menu is named by it. |

`className`, `ref` and other props go to the name's `<button>`. Outside a Menubar it is a plain Menu behind that button.

## Component tokens

Each is an optional override: set it on the page, a container or one Menubar. The list lives in `src/components/Menubar/menubar.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from menubar.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--menubar-bg` | `surface` | The bar's background. |
| `--menubar-border` | `border` | The line under the bar. |
| `--menubar-item-text` | `text` | A menu's name (4.5:1 on bg, on the hover and on the open background). |
| `--menubar-item-bg-hover` | `highlight` | A menu name's background under the pointer. |
| `--menubar-item-bg-open` | `pressed` | The background of the name whose menu is open. |
| `--menubar-focus-ring` | `focus-ring` | The focus ring around a menu's name (3:1 on bg). |
| `--menubar-item-radius` | `radius-control` | A menu name's corners (6px). |
| `--menubar-padding` | `spacing-1` | Space inside the bar, on every side (4px). |
| `--menubar-gap` | `spacing-1` | Space between the menus' names (4px). |
| `--menubar-item-padding-x` | `spacing-3` | Space each side of a menu's name (12px). |
| `--menubar-item-height` | `control-height-sm` | A menu name's height (32px). |
<!-- token-table:end -->
