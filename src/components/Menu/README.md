# Menu

A list of actions behind a button: a row's "More" menu, an "Actions" dropdown, a user menu. It follows the WAI-ARIA menu button pattern and opens next to its button in the browser's top layer.

## Usage

```jsx
const { Menu, MenuItem, MenuGroup, MenuSeparator, Button, IconButton } = window.Diki;

<Menu trigger={<Button variant="secondary" rightIcon="expand_more">Actions</Button>}>
  <MenuItem icon="edit" shortcut="⌘E" onSelect={edit}>Edit</MenuItem>
  <MenuItem icon="content_copy" onSelect={duplicate}>Duplicate</MenuItem>
  <MenuItem href="/share" icon="link">Share link</MenuItem>
  <MenuSeparator />
  <MenuGroup label="Danger zone">
    <MenuItem icon="delete" destructive onSelect={remove}>Delete</MenuItem>
  </MenuGroup>
</Menu>

<Menu trigger={<IconButton icon="more_vert" label="Row actions" />} placement="bottom-end">…</Menu>
```

## Props

### Menu

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `trigger` | one element | required | The button that opens it. It gets `aria-haspopup`, `aria-expanded`, `aria-controls` and the keys, and keeps its own handlers and ref |
| `children` | nodes | required | `MenuItem`, `MenuGroup` and `MenuSeparator` |
| `placement` | as Tooltip | `'bottom-start'` | Where it opens; it flips when there's no room and slides to stay on screen |
| `open`, `onOpenChange` | boolean, function | | Control it yourself |
| `aria-label` | string | | The menu's name. Without it, the button's text names it |

### MenuItem

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `onSelect` | `(event) => void` | | Runs when it's chosen (click, Enter or Space). The menu then closes and focus goes back to the button, unless you call `event.preventDefault()` |
| `icon` | icon name \| element | | A muted 16px icon before the label |
| `shortcut` | string | | A hint at the end, such as `⌘K` (wire the shortcut yourself) |
| `destructive` | boolean | `false` | Danger colors |
| `disabled` | boolean | `false` | Still reachable with the keys (so people learn it exists), but can't be chosen |
| `href` | string | | Makes it a link (the `configure({ link })` component) |

`MenuGroup` takes a `label` (a small heading that names the group); `MenuSeparator` is a line. Every part takes `className`, `style` and `ref`.

## Keyboard

| Key | On the button | In the menu |
| --- | --- | --- |
| Enter, Space | Opens it on the first item | Chooses the item |
| ↓ / ↑ | Opens it on the first / last item | The next / previous item, wrapping |
| Home, End | | The first or last item |
| A letter | | The next item starting with it |
| Escape | | Closes it; focus goes back to the button |
| Tab | | Closes it and moves on |

Hovering an item highlights it, and a press outside closes the menu.

## Accessibility

- `role="menu"` with `menuitem`s, `group`s and `separator`s; only the highlighted item takes focus.
- Use a Menu for actions. To pick a value use Select, and for navigation links a plain list of links.
- Labels, shortcuts and group headings keep 4.5:1 (also on the highlighted item) and icons 3:1, in all six themes (`tools/test/menu.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one menu. The list lives in `src/components/Menu/menu.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--menu-bg` | `surface` | The menu's background. |
| `--menu-border-color` | `border` | The menu's border. |
| `--menu-item-color` | `text` | An item's label. |
| `--menu-item-bg-active` | `secondary` | The highlighted item's background (hover and keyboard). |
| `--menu-muted` | `text-muted` | Icons, shortcuts and group labels (4.5:1 on surface; the highlighted item's shortcut turns to item-color). |
| `--menu-danger` | `danger-text` | A destructive item's label and icon. |
| `--menu-danger-bg-active` | `danger-subtle` | A highlighted destructive item's background. |
| `--menu-separator` | `border` | The line between groups. |
| `--menu-shadow` | `shadow-lg` | The menu's shadow. |
| `--menu-radius` | `rounded-lg` | The menu's corners (8px). |
| `--menu-item-radius` | `rounded-md` | An item's corners (6px). |
| `--menu-border-width` | `border-width-1` | The menu's border. |
| `--menu-min-width` | `spacing-48` | The narrowest a menu gets (192px). |
| `--menu-item-height` | `control-height-md` | An item's height (32px). |
| `--menu-padding` | `spacing-1` | Padding inside the menu (4px). |
| `--menu-item-padding-x` | `spacing-2` | Padding at an item's sides (8px). |
| `--menu-item-gap` | `spacing-2` | Space between an item's icon, label and shortcut (8px). |
| `--menu-offset` | `spacing-1` | The gap between the menu and its button (4px). |
| `--menu-z-index` | `z-50` | The stacking level where the browser has no top layer (popover). |
