# Kbd

Shows a keyboard key or shortcut as keycaps, in help text, tooltips, menus and empty states.

**Also called:** keycap, keyboard key.

```tsx
import { Kbd } from "@diki-stwn/serupa-ds";

<p>Press <Kbd>/</Kbd> to search.</p>
<Kbd keys={["mod", "K"]} />        // ⌘ K on a Mac, Ctrl + K elsewhere
<Button startIcon="search">Search <Kbd keys={["mod", "K"]} size="sm" /></Button>  // inside a control
```

## When to use

- Telling people about a keyboard shortcut: in help text, a tooltip or an empty state.
- Instructions that name a key, such as "Press Enter to send".

## When not to use

- Code, or a command people type: use the native `<code>` element instead.
- A shortcut hint at the end of a menu item: use [Menu](../Menu/README.md)'s `shortcut` prop instead.
- A short label such as a status or a count: use [Badge](../Badge/README.md) instead.

## Anatomy

Drawn from the `InText` story.

1. **Key** (`.srp-kbd__key`): one key, as it's printed on the keyboard.
2. **Plus** (`.srp-kbd__plus`): between keys pressed together.

## Usage

- Pass a combination as `keys`, one key each, and a single key as children.
- Use `mod` for shortcuts that follow the platform, so Mac users see ⌘ and others see Ctrl.
- Kbd only shows the keys: wire the shortcut yourself.

### Named keys

These names (in any case, and with any spaces, `_` or `-`: `page_up` and `Page Up` are `pageup`) show as symbols on Apple devices and as words elsewhere, and screen readers hear the key's name:

| Name | Apple | Elsewhere |
| --- | --- | --- |
| `mod` | ⌘ | Ctrl |
| `cmd`, `meta` | ⌘ | ⊞ |
| `ctrl` | ⌃ | Ctrl |
| `alt`, `option` | ⌥ | Alt |
| `shift` | ⇧ | Shift |
| `enter`, `return` | ↵ | Enter |
| `backspace`, `delete` | ⌫, ⌦ | Backspace, Del |
| `tab`, `esc`, `space` (or `" "`) | ⇥, Esc, Space | Tab, Esc, Space |
| `up`, `down`, `left`, `right` (or `ArrowUp`…`ArrowRight`, as `KeyboardEvent.key` names them) | ↑ ↓ ← → | ↑ ↓ ← → |
| `home`, `end` | ↖ ↘ | Home, End |
| `pageup` (`pgup`), `pagedown` (`pgdn`) | ⇞ ⇟ | PgUp, PgDn |
| `capslock`, `insert` (`ins`), `fn` | ⇪, Ins, fn | Caps Lock, Ins, Fn |

Use `mod` for shortcuts that follow the platform. Any other text shows as it is, and single letters show in capitals.

## Behavior

- Inside a `SerupaProvider` with `platform` set (`"apple"` or `"other"`, worked out on the server from the User-Agent or `Sec-CH-UA-Platform`), the right keys show from the first render, the server's too. Without it, the platform is read in the browser after the page loads, so server-rendered pages show the words first.
- It sits with the text, so it can go inline in a sentence. Every Kbd is 20px tall, so it fits inside any line of 14px text or larger without stretching it, and looks the same in a sentence, a tooltip, Prose, a list of shortcuts and a command's row.
- A one-character key (K, ⌘, ↑) is square, so the keys of a combination line up; a word (Esc, Ctrl) gets 6px each side.
- Inside a control, such as a search button, use `size="sm"`: 16px keys with a thin, light outline and no + between them, so they don't crowd the control's edges.

### Do and don't

- **Do:** Use `mod` for a shortcut that follows the platform: Mac users see ⌘K and others see Ctrl+K. (`DoMod`)
- **Don't:** Write `ctrl` for a shortcut that is ⌘ on a Mac: Mac users press keys that don't work. (`DontHardcodeCtrl`)

## Accessibility

- A combination is one `<kbd>` holding a `<kbd>` per key, as HTML recommends. Symbols are hidden from screen readers and replaced with the key's name, through the `keyName` label (so "Panah atas" and "Spasi" in `idLabels`); the + between keys is hidden.
- Labels and the + keep 4.5:1 in every theme (`Kbd.test.tsx`).
- **Keyboard:** none: it shows keys, it doesn't take them.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<kbd>`. |
| `keys` | `string[]` | | A combination, one key each. Or pass a single key as children. |
| `size` | `'sm' \| 'md'` | `'md'` | `md`: 20px keys, wherever text is around them. `sm`: 16px quiet keys with no +, inside a control such as a search button. |

`className`, `ref` and other props go to the outer `<kbd>`.

## Component tokens

Each is an optional override: set it on the page, a container or one key. The list lives in `src/components/Kbd/kbd.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from kbd.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--kbd-bg` | `surface-sunken` | A key's background. |
| `--kbd-border` | `border-strong` | A key's outline, thicker at the bottom like a keycap. |
| `--kbd-text` | `text` | The key's label (4.5:1 on bg). |
| `--kbd-separator` | `text-muted` | The + between keys in a combination. |
| `--kbd-border-sm` | `border` | size="sm"'s outline, quieter, for a key inside a control such as a search button. |
| `--kbd-radius` | `radius-inner` | A key's corners (4px). |
| `--kbd-height-sm` | `spacing-4` | size="sm" (16px), for a key inside a control such as a search button. |
| `--kbd-height-md` | `spacing-5` | size="md", the default (20px): the one height wherever text is around the key. |
| `--kbd-padding-x` | `spacing-1.5` | Space on each side of a word such as Esc (6px). A one-character key is square instead. |
| `--kbd-gap` | `spacing-1` | Space between keys and the + in a combination (4px). |
| `--kbd-padding-x-sm` | `spacing-1` | size="sm"'s space on each side of a word (4px). |
| `--kbd-gap-sm` | `spacing-0.5` | size="sm"'s space between keys, which has no + (2px). |
| `--kbd-border-bottom-width` | `border-width-2` | A key's bottom edge, thicker like a keycap's (2px; sm uses 1px all round). |
<!-- token-table:end -->
