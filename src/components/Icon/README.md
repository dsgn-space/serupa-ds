# Icon

Shows one icon: from Material Symbols, always in the **Rounded** style with **Fill** on, or one of your own custom icons. Use it on its own or pass an icon name straight to Button's `leftIcon`, `rightIcon` or `icon`.

## Setup

Nothing to load: the font ships with the system as `fonts/MaterialSymbolsRounded-Filled.woff2`, and `tokens.css` declares it. It holds only the filled, weight-400 Rounded style, with optical sizes from 20 to 48, about 1 MB.

## Usage

```jsx
const { Icon, Button } = window.Diki;

<Icon name="home" />                       // 24px, decorative
<Icon name="warning" size={20} style={{ color: 'var(--warning)' }} />
<Icon name="error" aria-label="Error" />   // meaningful: announced as "Error"
<Button leftIcon="add">New project</Button>
<Button variant="ghost" icon="settings" aria-label="Settings" />
```

Find names in the Material Symbols catalog (Rounded style) at fonts.google.com/icons; the font is already here, only the names come from the catalog. Names are lowercase with underscores: `arrow_forward`, `more_vert`.

## Custom icons

For what Material Symbols doesn't have, add your own SVG icons. They work everywhere a Material Symbols name does, with the same sizes, colors and accessibility:

```jsx
<Icon name="diki-sparkle" />
<Button leftIcon="diki-sparkle">Generate</Button>
```

**Draw** each icon so it sits with Material Symbols Rounded:

- A 24×24 frame (`viewBox="0 0 24 24"`) with about 2px of padding around the shape.
- Filled shapes with rounded corners and ends, like the Rounded style. Outlined (stroke) icons work too, at a 2px stroke.
- One color. The build draws every shape in the text color, so icons follow the theme. Parts that should show the background must be holes (a cut-out path, or `fill-rule="evenodd"`), not white shapes.
- Only shapes: outline text and flatten masks, gradients and effects before exporting. Figma's "Export as SVG" and Illustrator's "Export As SVG" both work.

**Add** them:

1. Put the SVG in `assets/Icons/` (the Icons set on the design system page). The file name is the icon's name: lowercase letters and digits, words joined by `-` or `_`, such as `diki-sparkle.svg`. A prefix such as `diki-` keeps your names apart from Material Symbols; a custom icon with the same name as a Material Symbol replaces it everywhere.
2. Run `python3 tools/icons/build.py` (or `python3 tools/icons/build.py path/to/folder`). It writes the icons into `components/bundle.js` and their names into `components/index.d.ts` (`CustomIconName`), so TypeScript autocompletes them.
3. Run it again after changing or removing a file. `python3 tools/icons/build.py --check` fails if the components are out of step, for CI.

The build keeps only the shapes and removes editor leftovers (ids, classes, sizes, Figma and Illustrator metadata). It refuses a file, with the reason, when it holds anything that could run code or load something (scripts, event handlers, links, images), anything that isn't a plain shape (text, gradients, masks, filters, `<use>`), another grid, or a second color. A refused file stops the build, and the components stay as they were.

`Diki.customIcons` lists the custom icons' names.

## Sizes

The same for Material Symbols and custom icons.

| Size | Use | Optical size |
| --- | --- | --- |
| 14px | Inside `sm` buttons | 20 |
| 16px | Inside `md` buttons, inline with `text-sm` | 20 |
| 20px | Inside `lg` buttons, list rows, inputs | 20 |
| 24px | Default: toolbars, navigation, standalone | 24 |
| 40px+ | Empty states, illustrations | 40–48 |

The optical size is the font's own: the browser picks it from the icon's size (`font-optical-sizing: auto`), so small icons get slightly bolder strokes and large ones finer detail. Nothing in the system overrides it.

## Color

Icons take the text color (`currentColor`). Set it with an alias, never a palette color: `text` or `text-muted` for neutral icons, and `success`, `warning`, `danger` or `info` for status icons. Icons that carry meaning need 3:1 contrast against their background.

## Common icons

| Action | Name |
| --- | --- |
| Create / add | `add` |
| Edit | `edit` |
| Delete | `delete` |
| Close | `close` |
| Search | `search` |
| Settings | `settings` |
| More | `more_vert`, `more_horiz` |
| Next / back | `arrow_forward`, `arrow_back` |
| Menu open | `expand_more`, `chevron_right` |
| Success / error / warning / info | `check_circle`, `error`, `warning`, `info` |

## Guidelines

- Use Material Symbols Rounded, filled, and custom icons drawn to the same rules. Don't mix in other icon sets or the Outlined/Sharp styles.
- Before drawing a custom icon, check that Material Symbols doesn't already have one for that meaning.
- Icons are decorative by default (`aria-hidden`). Give an icon an `aria-label` only when it's the sole carrier of meaning, such as a status icon without text.
- One icon per meaning across the product: `delete`, not `delete` in one place and `remove` in another.
