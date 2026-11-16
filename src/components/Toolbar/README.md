# Toolbar

A set of controls, such as an editor's formatting buttons, that takes one Tab stop instead of one per control. Once focus is in it, the arrow keys move between the controls, so keyboard users get past a long row of buttons in one keystroke.

**Also called:** action bar, button toolbar.

```tsx
import { Toolbar, ButtonGroup, ToggleButton, IconButton, Divider, Menu, MenuItem, Button } from "@diki-stwn/serupa-ds";

<Toolbar aria-label="Text formatting">
  <ButtonGroup aria-label="Style">
    <ToggleButton icon="format_bold" aria-label="Bold" />
    <ToggleButton icon="format_italic" aria-label="Italic" />
  </ButtonGroup>
  <Divider orientation="vertical" />
  <IconButton variant="ghost" icon="link" label="Insert link" />
  <Menu trigger={<Button variant="ghost" rightIcon="expand_more">More</Button>}>
    <MenuItem>Clear formatting</MenuItem>
  </Menu>
</Toolbar>

// a column of tools
<Toolbar aria-label="Drawing tools" orientation="vertical">
  <ToggleButton icon="edit" aria-label="Pen" />
  <ToggleButton icon="ink_eraser" aria-label="Eraser" />
</Toolbar>
```

## When to use

- Several controls that act on the same thing, such as text formatting above an editor, or the tools beside a canvas.
- A row of actions on a selection (Download, Move, Delete) that people use often enough that one Tab stop helps.

## When not to use

- Two or three buttons, such as Cancel and Save: a [ButtonGroup](../ButtonGroup/README.md) with `attached={false}` keeps each one in the Tab order, which is what people expect there.
- One choice out of a few: use [SegmentedControl](../SegmentedControl/README.md) or a [RadioGroup](../Radio/README.md).
- A site's main links: use [Navbar](../Navbar/README.md) or [Sidebar](../Sidebar/README.md). A toolbar is for controls, not navigation.

## Anatomy

Drawn from the `MoreMenu` story.

1. **Toolbar** (`.dk-toolbar`): the row (or column) of controls, on its own surface, with one Tab stop.
2. **More** (`.dk-toolbar__more`): with `overflow`, the button at the end of the row that opens the controls with no room; it shows only while one is hidden.

## Usage

- Put any controls inside, at any depth: Buttons, IconButtons, ToggleButtons, ButtonGroups, a Menu's trigger, a Select or an Input. Set `size` on the toolbar and every button in it takes it, in its ButtonGroups too (a button's own `size` still wins); give a Select or an Input in it the same `size` yourself.
- Use a vertical [Divider](../Divider/README.md) between groups in a row, or a horizontal one in a column. It takes the row's height.
- Disabled controls are skipped by the arrow keys. To keep one reachable so people can find it, use `aria-disabled` instead of `disabled`.
- When a row may not fit (a narrow window, a side panel), set `overflow`: the row stops wrapping, and the controls with no room move into a More menu at the end, which shows only while something is in it. Give the controls that must stay `data-priority` (higher stays longer, default 0); among equals the last moves first. Buttons, IconButtons and ToggleButtons move (a ButtonGroup moves whole, each button its own item, a toggle as a checked item); fields, Selects and Menus stay where they are, and a Divider left with nothing on one side goes with them. Choosing an item presses the control itself. Don't build a More menu by hand for this. (`MoreMenu`)
- Controls added or removed later join the arrow-key order on their own.
- Inside a text field, the arrows, Home and End stay the field's. Tab leaves the field.
- A composite with its own arrow keys, such as a SegmentedControl, keeps them. Prefer ToggleButtons in a ButtonGroup, which the toolbar moves through one by one.

### Do and don't

- **Do:** Group related controls, with a [Divider](../Divider/README.md) between the groups. (`DoGroupControls`)
- **Don't:** Put a form's Cancel and Save in a toolbar: Tab should reach each one, so use a [ButtonGroup](../ButtonGroup/README.md). (`DontFormButtons`)

## Accessibility

- **Role and name:** a `role="toolbar"` with `aria-orientation`. Name it with `aria-label` or `aria-labelledby`, which you need when a page has more than one toolbar.
- **Keyboard:** the [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). It has one Tab stop, the control used last or else the first.

| Key | Moves focus to |
| --- | --- |
| Right / Left arrow | The next or previous control, in a row (mirrored right to left), wrapping at the ends |
| Down / Up arrow | The next or previous control, in a column |
| Home / End | The first or last control |
| Tab / Shift+Tab | Out of the toolbar |

With `overflow`, hidden controls leave the arrow-key order and the More button joins it at the end; a control chosen from its menu is pressed as if clicked, and focus returns to More.

Your `onKeyDown` runs before the toolbar's own keys, so `e.preventDefault()` in it keeps the toolbar from moving focus on that key. A Menu opened from the toolbar keeps its own keys, and closing it returns focus to its trigger.

- **Contrast:** it adds no colors to its controls. Text placed straight inside reads 4.5:1 on its background in every theme (`Toolbar.test.tsx`).
- **What's still yours:** a name for each icon-only control, and a name for the toolbar.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<div role="toolbar">`. |
| `orientation` | `'horizontal'` \| `'vertical'` | `'horizontal'` | A wrapping row, moved through with Left and Right, or a column, moved through with Up and Down. |
| `overflow` | boolean | `false` | In a row, moves the controls with no room into a More menu at the end, instead of wrapping. Lowest `data-priority` first. |
| `moreLabel` | string | `'More'` | The More button's name (`labels.toolbarMore`). |
| `size` | `'sm'` \| `'md'` \| `'lg'` | none | The size of every Button, IconButton and ToggleButton in it that doesn't set its own (24, 32 or 44px). |
| `aria-label` | string | none | What the controls are for ("Text formatting"). |
| `children` | `ReactNode` | | The controls, at any depth. |

`className`, `style`, `ref` and other props go to the `<div>`, which has `data-component="toolbar"` and `data-orientation`.

## Component tokens

Each is an optional override: set it on the page, a container or one Toolbar. The list lives in `src/components/Toolbar/toolbar.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from toolbar.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--toolbar-bg` | `surface` | The background, behind the controls. |
| `--toolbar-text` | `text` | Text color inherited by plain text inside (4.5:1 on bg). |
| `--toolbar-radius` | `radius-control` | The corners. Unset, they are concentric with the controls inside: radius-control plus the padding (10px). |
| `--toolbar-padding` | `spacing-1` | Space inside, on every side (4px). |
| `--toolbar-gap` | `spacing-1` | Space between the controls (4px). |
<!-- token-table:end -->
