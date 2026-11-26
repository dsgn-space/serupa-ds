# Foundations

The source of the Foundations pages in Storybook (`docs/foundations/*.mdx` show these sections by heading).

## Color families

| Group | Families | Character |
| --- | --- | --- |
| Neutrals | `zinc`, `slate` | `zinc` is the neutral every alias uses; `slate` is a cooler gray for your own CSS. 18.0.0 removed `gray`, `neutral` and `stone`, which nothing used. |
| Warm | `red`, `orange`, `amber`, `yellow` | Errors, warnings, highlights. |
| Greens | `lime`, `green`, `emerald`, `teal` | Success, positive states. |
| Blues | `cyan`, `sky`, `blue`, `indigo` | Links, primary actions, info. |
| Purples & pinks | `violet`, `purple`, `fuchsia`, `pink`, `rose` | Accents, brand flavour. |

## Naming

A palette step is a token, not a class: `var(--blue-500)` in your own CSS. The color classes are the roles (`bg-primary`, `text-text-muted`, `border-border`), white and black, because a role follows the theme and a palette step doesn't (17.0.0 removed `bg-blue-500` and the rest).

## Using the shades

- **50–200**: tinted backgrounds, hover fills, subtle badges.
- **300–400**: borders, dividers, decorative accents.
- **500–600**: solid fills, primary buttons, icons.
- **700–950**: text, dark surfaces, text on light tints.

## Contrast

Every token's usage note gives its contrast against white or black text. Rules of thumb:

Text on white, and white text on a fill, both reach 4.5:1 at the same shade (the two are the same pair):

- **500+**: the neutrals: `zinc` and `slate`.
- **600+**: `red`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`.
- **700+**: `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`.
- On a `-50` / `-100` tint, set text in the same family at **700–900**.

## Themes

Every theme shares **one set of foundations**: the same palette, type, spacing scale and components. A theme is a brand color and a mode, and nothing else: it only changes where the brand colors point, so every corner, shadow, border, surface, space, chart color and motion is the same in all of them. There is a theme for each accent color of the palette, light and dark, 34 in all. Blue is the default.

| Brand | `primary` in light | `primary` in dark | `primary-text` in dark |
| --- | --- | --- | --- |
| `blue` *(default)* | `blue-600` | `#2b6af2` | `blue-400` |
| `red` | `red-700` | `#d13832` | `red-400` |
| `orange` | `orange-700` | `#c94817` | `orange-400` |
| `amber` | `amber-700` | `#bb5915` | `amber-400` |
| `yellow` | `yellow-500`, under `yellow-950` text, in a `yellow-700` edge | `yellow-400`, under `yellow-950` text | `yellow-400` |
| `lime` | `lime-700` | `#538219` | `lime-400` |
| `green` | `green-700` | `#1f8643` | `green-400` |
| `emerald` | `emerald-700` | `#18815f` | `emerald-400` |
| `teal` | `teal-700` | `#1e7e76` | `teal-400` |
| `cyan` | `cyan-700` | `#1b7b97` | `cyan-400` |
| `sky` | `sky-700` | `#1e77b0` | `sky-400` |
| `indigo` | `indigo-600` | `#5d5afa` | `indigo-400` |
| `violet` | `violet-600` | `#8648fa` | `violet-400` |
| `purple` | `purple-600` | `#9a3cf2` | `purple-400` |
| `fuchsia` | `fuchsia-700` | `#b636c3` | `fuchsia-400` |
| `pink` | `pink-700` | `#d02f6b` | `pink-400` |
| `rose` | `rose-700` | `#d4304d` | `rose-400` |

A theme's id is `<brand>-light` or `<brand>-dark`. Switch themes with the `data-theme` attribute on any element, e.g. `<html data-theme="violet-dark">`. Everything inside follows: components use aliases only, so they need no changes.

### The brand shade

`primary` is a fill with white text on it: a primary button, a checked box, the selected day. `primary-text` is the brand as text, a line or an icon: links, ghost and outline buttons, the line under the selected tab. In light themes the two are one shade, the first step of the brand ramp that reaches 4.5:1 every way: under white text, on a white page, and on the tints it sits on as text (its own `primary-subtle` under a selected tag or a primary Badge, and the status tints under a link in an Alert). That is step 600 for `blue`, `indigo`, `violet` and `purple`, and step 700 for the rest: `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `fuchsia`, `pink` and `rose`. So Yellow Light is a deep, golden yellow rather than a bright one. 

**Dark themes keep the light theme's fill.** A dark theme's `primary` is its light theme's shade under the same white text, lightened as far as 3:1 on a raised dark card asks, and always a touch (0.02 of OKLCH lightness) while white text on it keeps 4.5:1, as Apple's system colors are a touch brighter in dark: `blue-600` (#2563eb) becomes #2b6af2, and no brand moves more than a few points of lightness. The status fills (`success`, `warning`, `info`, `danger`) follow the same rule. So a primary button, a Switch that's on and a Progress bar are the same color in both modes, the way a danger button is `red-600` in both. Hover and held down are the light theme's too, lightened as much. Yellow is the one exception, in both modes: a yellow dark enough for white text reads as brown, so Yellow Light fills with `yellow-500` and Yellow Dark with `yellow-400`, both under `yellow-950` text (hover is a little darker in light, a step lighter in dark). `yellow-500` is 1.9:1 on a white page, under the 3:1 a fill with no text on it needs (WCAG 1.4.11), so Yellow Light sets `primary-edge` to `yellow-700` (4.9:1): a 1px edge just inside every such fill, a checked box, a Switch that's on, a Slider, Progress or Meter fill, the selected day or tab, a dot. In every other theme `primary-edge` is transparent and nothing is drawn. A custom mark filled with `primary` takes the same edge: `box-shadow: inset 0 0 0 1px var(--primary-edge)`. Text can't do the same: `blue-600` on a dark card is 3.4:1, so `primary-text` is step 400 in every dark theme. `data-contrast="more"` steps each brand up within its own ramp, to 7:1; a dark theme's fill is then step 300 with its own 950 as the text on it.

The neutral colors, the status colors and the chart colors don't follow the brand. A red theme's primary button and a danger button are both red; where the two meet, the danger one keeps its icon and its wording.

**Brand and mode without JavaScript**: `data-brand` and `data-mode` work on their own, with no script. On `<html>`, or on any element:

Blue is in `tokens.css`. Each other brand is its own file, `brands/<brand>.css`, loaded after `tokens.css`: a page loads only the brands it uses, about 0.6 KB gzipped each, and `brands/all.css` holds every one for a page where people switch brands.

```html
<link rel="stylesheet" href="node_modules/@diki-stwn/serupa-ds/brands/violet.css">   <!-- after tokens.css -->
<html data-brand="violet" data-mode="auto">           <!-- follows the operating system from the first paint -->
<section data-mode="dark">…</section>                 <!-- a dark section inside a light page -->
<div data-brand="emerald">…</div>                     <!-- another brand for one part of the page -->
```

Each color that changes between themes is a `light-dark()` pair, and `data-mode` sets `color-scheme` (`auto` is `light dark`), so the light or dark value is chosen where the color is used. Server-rendered and React apps get dark mode with nothing to inject and no flash. With `base.css`, a section with its own `data-mode`, `data-brand` or `data-theme` also takes that theme's text color and `surface-page` background, so its plain text switches with it (a class on the section still sets its background). When printing, a `data-mode` page or section prints its light colors, since printers drop backgrounds; a flat `*-dark` theme has no light values, so it prints with its backgrounds. A page with neither attribute stays light. An element with `data-theme` keeps that flat theme, so it still wins; inside such a page, give a section both `data-brand` and `data-mode` to switch it. Needs `light-dark()`: Chrome and Edge 123, Safari 17.5, Firefox 120. Older browsers lose the colors of a page or section themed only by `data-brand` and `data-mode`; one with `data-theme` (which `theme.js` sets on the page) keeps them, since the flat themes don't use `light-dark()`.

**More contrast**: `data-contrast="more"` gives 7:1 body text (muted text and placeholders included), stronger borders and field outlines, and a 3px focus ring instead of 2px, in every theme. Status text (`success-text`, `warning-text`, `danger-text`, `info-text`) reaches 7:1 too, on the page, on cards and on its own subtle fill, and the status icon colors step up with it. The brand color steps up within its own hue (brand 800 in light themes, brand 300 in dark, so violet stays violet): links and secondary button labels reach 7:1 on the page and on the brand tint, so does the text on a primary fill, and the focus ring takes brand 700 / 300. Subtle badge labels keep their normal 4.5:1 colors for now. It also applies on its own when the visitor's system asks for more contrast (`prefers-contrast: more`); a page can opt out with `data-contrast="normal"` on `<html>`.

**Density**: `data-density="compact"` is for dashboards and data-heavy screens. It makes `md` controls 28px and `lg` 36px (from 32 and 44); `sm` stays 24px, the WCAG 2.2 minimum target. It also halves the padding of rows and tightens surfaces: table and list rows (`space-row`, 12px to 6px), small tables, data grid cells and sidebar items (`space-item`, 8px to 4px), cards (`space-card`, 20px to 12px), accordions and popovers (`space-content`, 16px to 12px), and dialogs, drawers and large cards (`space-surface`, 24px to 16px). Components read these tokens, so they need nothing else. `data-density="comfortable"` puts the defaults back for one section, such as a settings form inside a compact dashboard. Put it on `<html>` for a whole app, or on one region.

**Roundness**: `data-radius="sharp"` or `data-radius="round"` changes how round every corner is, on any brand, by pointing the radius roles at other steps (see [Corner radius](#corner-radius)). `data-radius="default"` puts the default corners back for one section, and `radius-pill` stays round in all three. A focus ring is an outline, which follows the corner it's drawn around.

**Shadows**: `data-shadow="brand"` tints the box shadows (`shadow-2xs` to `shadow-2xl`): each one's black becomes a deep shade of the brand color, at the same opacity, so raised cards, menus and dialogs sit in the brand rather than in gray. The shade is worked out where the attribute is, so a section with its own `data-brand` needs its own `data-shadow="brand"` too. `data-shadow="neutral"` puts the black back for one section.

**Fluid type**: `data-type-scale="fluid"` lets the heading sizes (`text-2xl` to `text-9xl`, and the `type-*` styles that use them, such as `type-display` and `type-heading-1`) follow the width of the window: 70% of their size on a 320px phone, never under 20px, growing to their full size at 1280px and wider. Body sizes (`text-xl` and smaller) don't change. Each size is a `clamp()` with a `rem` part, so browser zoom still enlarges it. Zooming also narrows the window the sizes follow, so at 200% a heading is about 1.6 times its size and at 300% at least double, which meets WCAG 1.4.4 (body text doubles at 200% as usual). Their line heights follow at the same ratio, rounded up to the 4px grid, so a 21px heading on a phone sits on a 28px line rather than its desktop 36px. `data-type-scale="fixed"` puts the fixed sizes back for one section.

**Automatic dark mode**: `theme.js` (standalone, no React, `dist/theme.js` in the package) sets `data-theme` for the page from a brand and a mode, follows the visitor's light/dark setting live when the mode is `auto`, and remembers a choice the visitor makes. Load it first in `<head>` so the page never flashes the wrong theme:

```html
<html data-brand="blue" data-mode="auto">   <!-- brand: blue, violet, emerald… any accent color; mode: auto | light | dark -->
<script src="dist/theme.js"></script>
```

```js
Serupa.theme.set({ mode: 'dark' });          // a theme switcher; remembered in this browser
Serupa.theme.set({ brand: 'violet' });
Serupa.theme.reset();                         // back to the page's data-brand / data-mode
Serupa.theme.get();                           // { brand, mode, theme: 'violet-dark' }
Serupa.theme.onChange(({ theme }) => { … });  // returns an unsubscribe function
```

After the first paint, where the browser has View Transitions, a switch crossfades the whole page in one View Transition (type `serupa-theme`, for `:active-view-transition-type(serupa-theme)`). Then the new `data-theme` is set, and `onChange` called, when the transition takes its "after" picture, a frame after `set()`; `set()` and `get()` return the new theme at once, so read it from them or from `onChange`, not from the attribute. Several switches in a row end on the last. With reduced motion, in a hidden tab, without View Transitions, and while the app runs a View Transition of its own (which a new one would cut short), a switch is at once.

## Alias tokens

Alias tokens give a color a **job** instead of a hue. Each one points to a palette color rather than holding its own value, and that pointer can differ per theme: `primary` is `{blue-600}` in Blue Light and `{violet-400}` in Violet Dark.

**Use aliases in your UI, the palette for the aliases.** Build screens with `primary`, `text`, `border`… and only reach for a palette color like `blue-600` directly when no alias fits; a palette color looks the same in every theme.

`‹brand›` below is the theme's brand. The lighter ramps sit one step darker in light themes: `primary` is `‹brand›-700` and `primary-hover` `‹brand›-800`; see [The brand shade](#the-brand-shade).

| Alias | Light themes | Dark themes | Use |
| --- | --- | --- | --- |
| `primary` | `‹brand›-600` | `‹brand›-600`, a little lighter | Brand fill: primary buttons, checked boxes, selected days, with `on-primary` on it. |
| `primary-hover` | `‹brand›-700` | `‹brand›-700`, as much lighter | `primary` under the pointer. |
| `primary-pressed` | `‹brand›-800` | `‹brand›-800`, as much lighter | `primary` held down. |
| `primary-text` | `‹brand›-600` | `‹brand›-400` | Brand text, links, icons, lines and borders. |
| `primary-text-hover` | `‹brand›-700` | `‹brand›-300` | `primary-text` under the pointer. |
| `primary-subtle` | `‹brand›-50` | `‹brand›-950` | Brand tint for selected rows and badges. |
| `on-primary` | `white` (`yellow-950` in Yellow Light) | `white` (`yellow-950` in Yellow Dark) | Text and icons on `primary` fills. |
| `primary-edge` | transparent (`yellow-700` in Yellow Light) | transparent | A 1px edge inside a `primary` fill with no text on it, where the fill is under 3:1 on the page. |
| `secondary` | `zinc-100` | `zinc-700` | Secondary button fill; hover fill for outline and ghost buttons. |
| `secondary-hover` | `zinc-200` | `zinc-600` | Hover state of `secondary`. |
| `highlight` | `zinc-100` | `zinc-700` | The highlighted row in a list: a focused Menu item, the active Combobox or TimePicker option, the current Sidebar page. Text and icons keep AA on it; muted text does not, so a highlighted row switches its muted lines to `text`. In a dropdown list a 2px `highlight-indicator` bar at the row's start marks it too, 3:1 on the fill. |
| `pressed` | `zinc-300` | `zinc-600` | The fill while a row, tab, day or page button is held down: one step past its hover. |
| `surface-page` | `white` | `zinc-950` | The page itself: the `<html>` and `<body>` background, and a `data-mode` or `data-theme` section's. The same as `surface` in light; in dark a step below the cards, panels and bars on it, so they and every control sit lighter than the page. |
| `surface` | `white` | `zinc-900` | Card, panel and bar background. |
| `surface-muted` | `zinc-50` | `zinc-950` | Secondary panels, sidebars, table headers, filled Cards and wells: recessed, a step below `surface` in both modes. Never the fill of a control. |
| `surface-control` | `zinc-50` | `zinc-900` | The fill of a control that is its own surface rather than a field: SegmentedControl's track, FileUpload's drop zone. The same as `surface-muted` in light; in dark a step above the page, so a control never looks sunk into it. |
| `surface-hover` | `zinc-100` | `zinc-800` | A row or item under the pointer, a selected row, a striped row (List, Table, InlineEdit), a Sidebar, Navbar or TreeView item under the pointer: a step off `surface`, in light the same as `highlight`. Gray text in such a row reads `text-muted-shaded`. On a filled Card or a `bg-surface-muted` panel, List and InlineEdit rows step up to `surface-raised` instead, since there `surface-hover` would match what's under them. |
| `surface-hover-raised` | `zinc-100` | `#333338` | The same fill on a raised or floating surface (an elevated Card, a Popover, Dialog or Drawer, a Navbar menu panel): in dark a step above `zinc-800`, halfway to `zinc-700`, where muted text still has 4.5:1; in emerald dark halfway from `zinc-900` to `zinc-800`. |
| `surface-raised` | `white` | `zinc-800` | A raised card (Card `elevated`). In dark, where shadows don't show, the lighter surface carries the lift. |
| `surface-overlay` | `white` | `zinc-800` | Anything in the top layer: Menu, Popover, Dialog, Drawer, Toast, and the Combobox, DatePicker and TimePicker lists. |
| `surface-inverse` | `zinc-900` | `zinc-50` | Contrasting blocks: tooltips, inverse banners. |
| `text` | `zinc-900` | `zinc-50` | Body text and headings on `surface`. |
| `text-muted` | `zinc-500` | `zinc-400` | Secondary text, captions, placeholders. |
| `text-muted-shaded` | `zinc-600` | `zinc-400` | Secondary text in a hovered, selected or striped row, where `text-muted` on `zinc-100` would be 4.4:1. List, Table and InlineEdit set it on their shaded rows. |
| `text-inverse` | `white` | `zinc-900` | Text on `surface-inverse`. |
| `border` | `zinc-200` | `zinc-800` | Default borders and dividers, and every card's edge. In dark a quiet step off the `zinc-900` cards and bars it outlines. Never a control's boundary: fields use `field-border`, other controls `border-control`. |
| `border-strong` | `zinc-300` | `zinc-600` | Emphasized dividers and outlines. Form fields use `field-border`. |
| `border-overlay` | `zinc-200` | `zinc-600` | The edge of a top-layer surface; one step stronger than `border` in dark. |
| `focus-ring` | `‹brand›-500` | `‹brand›-400` | Keyboard focus outline, in the brand hue. |
| `success` | `green-600` | `#23a950` | Success icons and fills (3:1): in dark, `green-600` a touch lighter. Not for text: use `success-text`. |
| `success-subtle` | `green-50` | `green-950` | Success alert / badge background. |
| `success-text` | `green-700` | `green-300` | Success text on `surface`, `surface-muted` and `success-subtle` (4.5:1+). Class `text-success-text`. |
| `success-hover` | `green-500` | `#2ecc64` | Hover / pressed state of `success` fills. |
| `on-success` | `green-950` | `green-950` | Text and icons on `success` fills (4.5:1+). |
| `success-subtle-hover` | `green-100` | `green-900` | Hover fill of an interactive `success-subtle` surface. |
| `success-border` | `green-300` | `green-800` | Border of a success outline control or callout. |
| `warning` | `amber-600` | `#e07d17` | Warning icons and fills (in dark, `amber-600` a touch lighter); put dark text on it. Not for text: use `warning-text`. |
| `warning-subtle` | `amber-50` | `amber-950` | Warning alert / badge background. |
| `warning-text` | `amber-700` | `amber-300` | Warning text on `surface`, `surface-muted` and `warning-subtle` (4.5:1+). Class `text-warning-text`. |
| `warning-hover` | `amber-500` | `#fca41d` | Hover / pressed state of `warning` fills. |
| `on-warning` | `amber-950` | `amber-950` | Text and icons on `warning` fills (4.5:1+). |
| `warning-subtle-hover` | `amber-100` | `amber-900` | Hover fill of an interactive `warning-subtle` surface. |
| `warning-border` | `amber-300` | `amber-800` | Border of a warning outline control or callout. |
| `danger` | `red-600` | `#e22e2c` | Errors, destructive buttons; white text on it. In dark, `red-600` a touch lighter. |
| `danger-hover` | `red-700` | `#bf2422` | Hover / pressed state of `danger`. |
| `on-danger` | `white` | `white` | Text and icons on `danger` fills. |
| `danger-subtle` | `red-50` | `red-950` | Error alert / badge background. |
| `danger-text` | `red-700` | `red-300` | Destructive text and icons on `surface` and danger tints. |
| `danger-subtle-hover` | `red-100` | `red-900` | Hover fill for destructive secondary, outline and ghost buttons. |
| `danger-border` | `red-300` | `red-800` | Border of a destructive outline button. |
| `info` | `sky-700` | `#1e77b0` | Informational icons and fills (3:1): in dark, `sky-700` lightened only as far as 3:1 on a raised card. Not for text: use `info-text`. |
| `info-subtle` | `sky-50` | `sky-950` | Info alert / badge background. |
| `info-text` | `sky-700` | `sky-300` | Info text on `surface`, `surface-muted` and `info-subtle` (4.5:1+). Class `text-info-text`. |
| `info-hover` | `sky-800` | `#1d6693` | Hover / pressed state of `info` fills. |
| `on-info` | `white` | `white` | Text and icons on `info` fills (4.5:1+). |
| `info-subtle-hover` | `sky-100` | `sky-900` | Hover fill of an interactive `info-subtle` surface. |
| `info-border` | `sky-300` | `sky-800` | Border of an info outline control or callout. |
| `field` | `white` | `zinc-800` | Background of text inputs, selects and other form fields. In dark, a fill that sets a field apart from the page. |
| `field-raised` | `white` | `#333338` | `field` on a raised or floating surface: Dialog, Drawer, Popover, an elevated Card and `bg-surface-raised` or `bg-surface-overlay` panels set `--field` to it, so in dark a field there steps up from the `zinc-800` surface instead of matching it. Emerald dark keeps `zinc-800` (its overlays are `zinc-900`). |
| `field-readonly` | `zinc-50` | `zinc-900` | Background of read-only and disabled fields: a step flatter than `field`, so they read as not editable. |
| `disabled-text` | `zinc-500` | `zinc-400` | Labels, marks and icons of a disabled control: at least 3:1 on every surface, `zinc-700` / `zinc-300` with more contrast. |
| `disabled-surface` | `zinc-100` | `zinc-800` | Fill of a disabled control that has one (a checked box, a switch track, a slider fill's track). |
| `disabled-border` | `zinc-300` | `zinc-700` | Edge of a disabled control or field. |
| `field-border` | `zinc-300` | `zinc-700` | Border of form fields, soft by design: under the 3:1 WCAG 1.4.11 asks of a control's edge (see [Contrast, checked in every theme](#contrast-checked-in-every-theme)). |
| `field-border-hover` | `zinc-400` | `zinc-600` | Field border on hover: the resting `field-border` one gray step stronger. The accent is kept for focus. |
| `border-control` | `zinc-500` | `zinc-400` | The edge of a control that isn't a field: Slider and Switch tracks, Meter and Progress track edges, Carousel dots, Stepper rings, ColorPicker swatches, FileUpload's drop area, SignaturePad's box. 3:1+ on `surface` (WCAG 1.4.11). |
| `border-control-hover` | `zinc-600` | `zinc-300` | `border-control` on hover (Switch's track). |
| `field-hover` | `zinc-100` | `zinc-700` | A button inside a field under the pointer: the calendar, clock and country buttons, Input's icon actions, NumberInput's steppers. |
| `field-pressed` | `zinc-200` | `zinc-600` | The same button held down. |
| `field-border-invalid` | `red-600` | `red-600` | An invalid field's border: `danger`, 3:1+ on `field`. |
| `placeholder` | `zinc-500` | `zinc-400` | Placeholder text, and other muted text inside a field (a prefix, a suffix, a count): 4.5:1+ on `field`. A hint, never a label. |
| `overlay` | zinc-900 at 50% | zinc-950 at 70% | The dimmed backdrop behind dialogs and drawers. |
| `picture-edge` | black at 10% | white at 10% | A hairline just inside a photo's edge (Image, Avatar), so a picture with a white or black background keeps its shape on a page of the same color. |

### Contrast, checked in every theme

- `on-primary` on `primary`: 4.8–6.5:1, 7.6:1 in Yellow Light and 9.5:1 in Yellow Dark. `text-muted` on `surface`: 4.8:1 light, 7.9:1 dark.
- `focus-ring` on `surface`: 3.7:1 or more.
- **A deliberate exception: the form field border.** A field's resting border (`field-border`, zinc-300 in light and zinc-700 in dark, a step lighter than the zinc-800 fill) is about 1.5:1 in light and 1.4:1 to 1.9:1 in dark, under the 3:1 WCAG 1.4.11 asks of a control's edge. It's a design choice for calmer forms. What still marks a field: its label, its fill in dark, the stronger border on hover, the focus ring at 3:1, and the danger border when invalid at 3:1. More contrast (`data-contrast="more"`, or the system's own setting) brings back a 3:1+ border (zinc-700 in light, zinc-300 in dark). If your product must conform to 1.4.11 without that setting, set `--field-border` to `var(--border-control)`. The checks hold the border to 1.3:1 so it never fades out entirely. Every other control's edge, `border-control`, keeps 3:1.
- Dark themes fill with the light theme's `primary` under white text, a little lighter where 3:1 on a raised card asks it; brand text there is `primary-text` (brand 400), since the fill's shade is 3.4:1 as text on a dark card.

### Naming

- `<role>`: the main color for that job (`primary`, `surface`, `text`, `border`).
- `<role>-hover`, `-muted`, `-strong`, `-subtle`: variants of the same job. `-subtle` is a light tint for backgrounds.
- `on-<role>` / `<role>-inverse`: the color that goes **on top of** that role (`on-primary` text on a `primary` button).

### Adding an alias

1. Name it after its job, not its color (`danger`, not `red`).
2. Set its value to `{palette-token}`. The target must exist; an alias of a missing token, or of itself, is dropped.
3. Check contrast: text aliases need 4.5:1 on the surface they sit on (3:1 for icons, borders and focus rings). The palette tokens' usage notes give the ratios.
4. Only colors can be aliases: spacing, radius, shadow and type tokens hold their own values.

### A theme from your brand color

`serupa-brand` comes with the package and makes a light and a dark theme from one color:

```sh
npx serupa-brand acme "#0f766e" -o src/acme-theme.css
```

A theme is its colors: corners are their own setting (`data-radius`), and motion its own tokens. Load the file after `tokens.css`, then set `data-theme="acme-light"` or `"acme-dark"`, or `data-brand="acme"` with `data-mode`. With theme.js, name the brand on the page too: `<html data-brands="acme" data-brand="acme" data-mode="auto">`.

It makes the brand's eleven shades, 50 to 950, from the color's hue, with the color itself among them. Then each brand alias takes the shade that passes the same contrast as the shipped themes: white text on `primary` and `primary-text` on the page at 4.5:1, the dark fill 3:1 on a raised card, the focus ring at 3:1, and 7:1 for more contrast. The color is `primary` when it passes. Everything else (neutrals, status colors, shadows, type) stays the system's own. `--corners` sets the theme's corners, and `data-radius` beats it. `--motion brisk` makes every surface and change one step quicker on the duration scale (a dialog enters in 150ms instead of 200ms), and `--motion calm` one step slower (300ms). The spinner, the placeholder pulse, the press and the waits keep their pace, and every exit stays shorter than its enter. A color no shade of which can pass says so, and makes no file.

### Adding a theme

1. Pick a brand hue from the palette.
2. Give each alias a target in the new theme: copy a Light or Dark column and swap the brand hue.
3. Check `on-primary` on `primary` (4.5:1), `primary-text` on `surface` (4.5:1) and `focus-ring` on `surface` (3:1). Step the brand one shade darker in light if one fails; `node tools/test/brand.mjs` says what the dark fills must be.
4. Nothing else changes: palette, type, spacing, radius, shadows and components are shared.

## Typography

The type scales and font families, named by role (`text-xl`, `font-semibold`, `tracking-tight`, `leading-relaxed`).

**Families**

| Token | Font | Use |
| --- | --- | --- |
| `font-sans` | Inter | Default for UI and body text. |
| `font-heading` | Unset: headings use `font-sans` | Your own face for headings: the display and heading roles, Heading, and Dialog and Drawer titles read it. |
| `font-serif` | Georgia | Editorial or long-form accents. |
| `font-mono` | The system's monospace: SF Mono, Menlo, Consolas or Liberation Mono | Code, IDs, tabular figures. A bare `<kbd>` uses `font-sans`, like `<Kbd>`. |

**Your own heading face.** Set `--font-heading` to the face, or faces, to try first: `:root { --font-heading: "Fraunces"; }`. Name faces only, not a generic family such as `serif`: the language's sans stack follows it, so a character the face doesn't have, such as Japanese or Arabic text, still finds its Noto font. Body text stays in `font-sans`.

Fonts ship with the system in `fonts/` and are declared by `tokens.css`: Inter (upright and italic, variable 100–900). Icons are SVGs, not a font. Nothing loads from another server. Georgia and Courier New are pre-installed on most computers.

**Sizes**: each size carries its own line height. Both are tokens in the `fontSize` group (`var(--text-sm)`, `var(--text-sm--line-height)`) that the `text-*` classes and the components read. A `text-*` class sets only size and line height.

**Type styles**: `type-xs` … `type-9xl` (generated into `tokens.css` from the Type scale) set the whole style at once: family, size, line height, weight and letter spacing. From `type-2xl` up they carry `tracking-tight`, and from `type-6xl` up `tracking-tighter`, so a large style reads as set as tightly as a Heading of that size. Use one for a block of plain text; combine `text-*`, `font-*` and `tracking-*` when you need to vary one property. The two sets never conflict, whatever order the stylesheets load in.

| Class | Size | Line height |
| --- | --- | --- |
| `text-xs` | 12px | 16px |
| `text-sm` | 14px | 20px |
| `text-base` | 16px | 24px |
| `text-lg` | 18px | 28px |
| `text-xl` | 20px | 28px |
| `text-2xl` | 24px | 32px |
| `text-3xl` | 30px | 36px |
| `text-4xl` | 36px | 40px |
| `text-5xl` – `text-9xl` | 48, 60, 72, 96, 128px | 1 (tight) |

**Type roles**: styles named for what the text is for, built from the same sizes, weights and tracking. Prefer a role to a size style: it carries the weight and tracking the system uses for that job, so a page title set with a class matches a `<Heading level={1}>`.

| Class | Size / line height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| `type-display` | 48px / 1.1 | 600 | tight | Hero and marketing headlines. Two lines don't touch, unlike `type-5xl` (line height 1). |
| `type-heading-1` | 30px / 36px | 600 | tight | Page title; `<Heading level={1}>` |
| `type-heading-2` | 24px / 32px | 600 | tight | Page section title; `<Heading level={2}>` |
| `type-heading-3` | 20px / 28px | 600 | normal | Subsection; `<Heading level={3}>` |
| `type-heading-4` | 18px / 28px | 600 | normal | Group title; `<Heading level={4}>`, Dialog and Drawer titles; a section inside an app screen (below) |
| `type-title` | 16px / 24px | 600 | normal | Card, list and EmptyState titles |
| `type-body` | 16px / 24px | 400 | normal | Running text |
| `type-body-sm` | 14px / 20px | 400 | normal | UI text: controls, cells, menus, descriptions |
| `type-label` | 14px / 20px | 500 | normal | Field labels, table headers, tabs |
| `type-caption` | 12px / 16px | 400 | normal | Hints, timestamps, footnotes (with `text-muted`) |
| `type-overline` | 12px / 16px, uppercase | 600 | widest | An eyebrow above a title |
| `type-code` | 14px / 20px, `font-mono` | 400 | normal | Inline code and code blocks |

**Section headings on app screens**: a page's own sections (a marketing page, a long document) take `type-heading-2`, 24px. On an app screen, where the page title is already the 30px `h1` and its sections are forms, lists and panels, a section's `h2` is 18px: `<Heading level={2} size="lg">`, or `text-lg font-semibold` on a plain `h2`. Every pattern does this. The confirmation that replaces a form after it's sent ("Message sent") keeps 24px, since it's the screen's news.

Each role is also a `font` shorthand token (`var(--text-type-label)`) and a typography token in `design-tokens/`.

**Weights**: three defaults:

| Token | Weight | Use |
| --- | --- | --- |
| `font-normal` | Regular (400) | Body text, long-form reading, inputs. |
| `font-medium` | Medium (500) | Buttons, labels, tabs, table headers, emphasis inside body text. |
| `font-semibold` | Semibold (600) | Headings and titles at every size. |

Reach for these first, and use only these in components. The other weights stay available for special cases such as marketing pages, display type or charts: `font-thin` (100), `font-extralight` (200), `font-light` (300), `font-bold` (700), `font-extrabold` (800) and `font-black` (900). Load Inter with the full range (`family=Inter:wght@100..900`), or just `400;500;600` on pages that only use the defaults.

**Tracking** `tracking-tighter` (-0.05em) to `tracking-widest` (0.1em); **leading** `leading-none` (1) to `leading-loose` (2), plus fixed `leading-3` to `leading-10` (12–40px).

Rules of thumb:

- Body text: `text-base` in `font-sans`, `font-normal`; long-form reading: add `leading-relaxed`.
- Headings: `font-semibold`, with `tracking-tight` from `text-2xl` up.
- `text-5xl` and larger have a line height of 1: add `leading-tight` if a heading can wrap.
- Don't go below `text-xs` (12px), and keep body text at `text-sm` or larger.
- A hint or an error under a control is `text-sm` (14px), with a 16px icon centered on its first line, whatever the control's size: Field, FileUpload and InlineEdit draw it this way. `text-xs` is for details inside a compact part, such as a file's size in a list or the details and error inside an Attachment.

### Text utilities

Every typography property has classes in `bundle.css`. The values that form a scale are tokens in the `typography` group: weights, tracking, leading, font stretch, underline thickness and offset, line clamp and tab size.

| Property | Classes |
| --- | --- |
| font-family | `font-sans`, `font-serif`, `font-mono` |
| font-size | `text-xs` … `text-9xl` (each with its default line height) |
| font-smoothing | `antialiased`, `subpixel-antialiased` |
| font-style | `italic`, `not-italic` |
| font-weight | `font-thin` … `font-black` (defaults: `font-normal`, `font-medium`, `font-semibold`) |
| font-stretch | `font-stretch-ultra-condensed` … `font-stretch-ultra-expanded`; percentages `font-stretch-50%` `-75%` `-90%` `-95%` `-100%` `-105%` `-110%` `-125%` `-150%` `-200%` |
| font-variant-numeric | `normal-nums`, `ordinal`, `slashed-zero`, `lining-nums`, `oldstyle-nums`, `proportional-nums`, `tabular-nums`, `diagonal-fractions`, `stacked-fractions` (they combine) |
| font-feature-settings | No classes: set it in CSS, e.g. `font-feature-settings: "cv11"` |
| letter-spacing | `tracking-tighter` … `tracking-widest` |
| line-clamp | `line-clamp-1` … `line-clamp-6`, `line-clamp-none` |
| line-height | `leading-none`, `-tight`, `-snug`, `-normal`, `-relaxed`, `-loose`, and `leading-<spacing>` |
| list-style-image / position / type | `list-image-none`; `list-inside`, `list-outside`; `list-disc`, `list-decimal`, `list-none` |
| text-align | `text-left`, `-center`, `-right`, `-justify`, `-start`, `-end` |
| color | `text-<color>` for every role (`text-primary-text`, `text-text-muted`), `text-white`, `text-black`, `text-inherit`, `text-current`, `text-transparent` |
| text-decoration-line | `underline`, `overline`, `line-through`, `no-underline` |
| placeholder color | `placeholder-<color>` for every role, white and black, `placeholder-inherit`, `placeholder-current`, `placeholder-transparent` (use `placeholder-text-muted`) |
| text-decoration-color | `decoration-<color>`, `decoration-current`, `decoration-inherit`, `decoration-transparent` |
| text-decoration-style | `decoration-solid`, `-double`, `-dotted`, `-dashed`, `-wavy` |
| text-decoration-thickness | `decoration-0`, `1`, `2`, `4`, `8`, `decoration-auto`, `decoration-from-font` |
| text-underline-offset | `underline-offset-0`, `1`, `2`, `4`, `8`, `-auto` (and negatives) |
| text-transform | `uppercase`, `lowercase`, `capitalize`, `normal-case` |
| text-overflow | `truncate`, `text-ellipsis`, `text-clip` |
| text-wrap | `text-wrap`, `text-nowrap`, `text-balance`, `text-pretty` |
| text-indent | `indent-<spacing>`, `-indent-<spacing>` |
| vertical-align | `align-baseline`, `-top`, `-middle`, `-bottom`, `-text-top`, `-text-bottom`, `-sub`, `-super` |
| white-space | `whitespace-normal`, `-nowrap`, `-pre`, `-pre-line`, `-pre-wrap`, `-break-spaces` |
| word-break | `break-normal`, `break-all`, `break-keep` |
| overflow-wrap | `wrap-break-word`, `wrap-anywhere`, `wrap-normal` |
| hyphens | `hyphens-none`, `hyphens-manual`, `hyphens-auto` |
| content | `content-none` |

Text rules of thumb:

- Set text color with aliases (`text-text`, `text-text-muted`, `text-primary-text`), not palette colors, so it follows the theme.
- Headings: `text-balance`; paragraphs: `text-pretty`. Numbers in tables: `tabular-nums`.
- Japanese: with `base.css`, a heading inside `lang="ja"` breaks between phrases (`word-break: auto-phrase`), so a word isn't split across lines. Chrome and Edge 119 and later do this; other browsers break as before.
- Truncate single lines with `truncate`; clamp previews with `line-clamp-2` or `-3`, and make the full text reachable.
- Links in body text: `underline underline-offset-2`. Uppercase labels: `uppercase tracking-wide text-xs font-medium`.

## Iconography

Icons are **Material Symbols**, **Rounded** style, **Fill** on, weight 400, plus custom icons drawn to the same rules. Use no other icon set or style. Each icon is an inline SVG, so there's nothing to load and nothing flashes.

Use the `Icon` component (`<Icon name="delete" />`) or pass a name to Button (`startIcon="add"`, `icon="settings"`). Every Material Symbol works by name; find one on the Foundations › Icons page of the docs, which searches all of them and copies the name. You can also pass an icon imported from `@diki-stwn/serupa-ds/icons` (`icon={RocketLaunch}`). Details are in the Icon guidelines.

- **Sizes:** the `icon-size-*` tokens, `<Icon size="xs">` to `"xl"`: 14px (`sm` buttons, `text-xs`), 16px (`md` buttons, inline with `text-sm`), 20px (`lg` buttons, list rows, `text-base`), 24px (default, toolbars and navigation), 40px (empty states).
- **Weight:** match the text beside the icon: weight 400 as drawn for regular and medium text, `weight="semibold"` or `weight="bold"` (the `icon-weight-*` tokens) next to semibold or bold text and headings.
- **Color:** icons follow the text color. Use `text` or `text-muted` for neutral icons and `success`, `warning`, `danger` or `info` for status.
- **Meaning:** icons are decorative by default. Add an `aria-label` only when the icon carries meaning alone, and give icon-only buttons an `aria-label`.
- **Consistency:** one icon per meaning across the product (always `delete`, never `delete` in one place and `remove` in another). The components already use these, so an app that uses them too matches:

  | Meaning | Icon | Not |
  | --- | --- | --- |
  | Add, create | `add` | `add_circle`, `add_box` (except a large empty-state call to action) |
  | Edit | `edit` | `edit_note`, `create` |
  | Delete | `delete` | `delete_forever`, `remove`, `close` |
  | Close, dismiss, clear | `close` | `cancel`, `clear` |
  | Done, selected | `check` | `done` |
  | Search | `search` | `manage_search` |
  | Filter | `filter_list` | `filter_alt`, `tune` (keep `tune` for settings of a view) |
  | More actions on a row, an item or a card | `more_vert` | `more_horiz` |
  | More actions at the end of a bar (Toolbar, PageHeader) | `more_horiz` | `more_vert` |
  | Expand, open a list | `expand_more` | `keyboard_arrow_down`, `arrow_drop_down` |
  | Forward, next, drill in | `chevron_right` (`chevron_left` back), mirrored in right-to-left | `navigate_next`, `arrow_forward_ios` |
  | Opens elsewhere | `open_in_new` | `launch` |
  | Copy | `content_copy` | `file_copy` |
  | Download, upload | `download`, `upload` (`upload_file` in a drop zone) | `file_download`, `cloud_upload` |
  | Load again | `refresh` | `sync` (keep `sync` for syncing with another place) |
  | A date | `calendar_today` (`date_range` for a range) | `event` |
  | A calendar view | `calendar_month` | `calendar_today` |
  | A time, a schedule | `schedule` | `access_time` |
  | A person, an account | `person` | `account_circle` |
  | Settings | `settings` | `build`, `tune` |
  | A text document | `description` (`article` for a help or docs page) | `draft` |
  | Code | `code` | `draft` |
  | A file of another kind | `draft` | `insert_drive_file` |
  | A folder | `folder` (`folder_open` when open) | `topic` |
  | Error, warning, information, success | `error`, `warning`, `info`, `check_circle` | `report`, `warning_amber`, `info_outline`, `task_alt` |

  The one exception is inside a marker too small for its usual icon: Stepper's error step shows `priority_high` in its circle, because `error` is itself a circle.

**Custom icons.** For what Material Symbols doesn't have, draw your own on the same 24×24 grid, in one color, and put the SVGs in `assets/Icons/` (`serupa-sparkle.svg`). `node tools/icons/build.mjs` cleans them and builds them into the components, so `<Icon name="serupa-sparkle" />` and `startIcon="serupa-sparkle"` work with the same sizes, colors and accessibility as Material Symbols. The build refuses anything unsafe or off-system with the reason. Drawing rules and details are in the Icon guidelines.

## Backgrounds

Background utilities, as classes in `bundle.css`. Backgrounds have no scale of their own: the colors are the role tokens, so there are no new tokens.

| Property | Classes |
| --- | --- |
| background-attachment | `bg-fixed`, `bg-local`, `bg-scroll` |
| background-clip | `bg-clip-border`, `bg-clip-padding`, `bg-clip-content`, `bg-clip-text` |
| background-color | `bg-<color>` for every role (`bg-surface`, `bg-primary`), `bg-white`, `bg-black`, `bg-inherit`, `bg-current`, `bg-transparent` |
| background-image | `bg-none` |
| background-origin | `bg-origin-border`, `bg-origin-padding`, `bg-origin-content` |
| background-position | `bg-top-left`, `bg-top`, `bg-top-right`, `bg-left`, `bg-center`, `bg-right`, `bg-bottom-left`, `bg-bottom`, `bg-bottom-right` |
| background-repeat | `bg-repeat`, `bg-repeat-x`, `bg-repeat-y`, `bg-repeat-space`, `bg-repeat-round`, `bg-no-repeat` |
| background-size | `bg-auto`, `bg-cover`, `bg-contain` |

There are no gradient classes (17.0.0): write a gradient in your own CSS from the role tokens, `background: linear-gradient(in oklab to right, var(--primary), var(--info))`. OKLab keeps blends between hues bright instead of gray.

Rules of thumb:

- Use role backgrounds (`bg-surface`, `bg-surface-muted`, `bg-primary-subtle`) so surfaces follow the theme.
- Keep text on a solid background: if text sits on a gradient or image, check contrast at its lightest point, or add a `bg-surface` panel behind it.
- Use gradients sparingly, for heroes and illustrations, not for UI controls.
- Images: `bg-cover bg-center bg-no-repeat` fills a box without distortion.

**The fill behind a ring.** Avatar's status dot, the avatars in an AvatarGroup, Badge's indicator dot and Chart's bars, slices and markers are set apart by a ring or gap in the color behind them, so the ring disappears into the surface they're on. `--surface-behind` says what that color is. The page sets it to `surface-page`, and every surface (Card, Menu, Popover, Dialog, Drawer, Table, List, Navbar, Sidebar and the other bars and panels) sets it to its own fill. On a box of your own with a background, set it there as well: `.my-panel { background: var(--primary-subtle); --surface-behind: var(--primary-subtle); }`.

## Spacing

The spacing scale, named `spacing-<step>`: 1 step = 4px (`spacing-4` = 16px = `p-4`). Steps: `0`, `px` (1px), `0.5`–`3.5` in half steps, `4`–`12`, then `14`, `16`, `20`, `24` … `64`, `72`, `80`, `96` (384px).

- Stay on the scale: `1` (4px), `2` (8px), `3` (12px), `4` (16px), `6` (24px), `8` (32px), `12` (48px) and `16` (64px) cover most layouts.
- Spacing inside a group should be smaller than the spacing between groups.

**Roles.** Ten steps have names for what they space, for layouts and your own components: `space-inline` (4px, an icon and its label), `space-related` (8px, the parts of one control, or items that belong together such as a label and its input), `space-content` (16px, the default padding and gap), `space-card` (20px, a card's padding), `space-row` (12px, the block padding of a table or list row), `space-item` (8px, the block padding of a denser row: a small table's, a data grid's cell, a sidebar item), `space-surface` (24px, the padding of a dialog, a drawer or a large card), `space-section` (32px, between the sections of a long-form page), `space-page` (24px, an app screen's page header, sections and cards) and `space-band` (64px, a long-form or marketing page's bands and its page header). The last three are the page rhythms in [Spacing rhythm](#page-layout).

Dialog, Drawer and Card `padding="lg"` read `space-surface` for their padding; Popover, HoverCard, Tour and Accordion read `space-content`; Card reads `space-card`; Table and List rows read `space-row`; and small tables, DataGrid cells and Sidebar items read `space-item`. So setting a role on `:root` (or on a part of the page) makes them denser or roomier with it, and the compact density does exactly that. A component's own token still wins: `--dialog-padding` changes only dialogs. `space-inline`, `space-related`, `space-section`, `space-page` and `space-band` are names for your own layouts; no component reads them yet.

### Padding and margin

Every spacing step works as padding and margin, as classes in `bundle.css`.

| Padding | Margin | Sets |
| --- | --- | --- |
| `p-` | `m-` | All sides |
| `px-` / `py-` | `mx-` / `my-` | Inline (left and right) / block (top and bottom) |
| `ps-` / `pe-` | `ms-` / `me-` | Inline start / end: follows text direction (left/right in LTR, swapped in RTL) |
| `pbs-` / `pbe-` | `mbs-` / `mbe-` | Block start / end: follows the writing mode |
| `pt-` `pr-` `pb-` `pl-` | `mt-` `mr-` `mb-` `ml-` | One physical side |

- **Values**: every spacing step: `p-4` is `spacing-4` (16px), `mt-0.5` is 2px, `px-px` is 1px.
- **Auto margins**: `m-auto`, `mx-auto` (center a block), `ms-auto` (push to the end of a flex row), and the other sides.
- **Negative margins**: prefix with `-`: `-mt-2` (-8px), `-mx-4`. Use them sparingly, to pull an element into its parent's padding.
- **Space between**: `space-x-4` and `space-y-4` add a gap between children (on every child but the last). Prefer `gap` on flex and grid; use `space-*` for plain stacks. Negative versions exist (`-space-x-2`) for overlapping avatars, and `space-x-reverse` / `space-y-reverse` put the gap on the other side for `flex-row-reverse` and `flex-col-reverse`. These rules have zero specificity, so a margin class on a child still wins.

Rules of thumb:

- Pad containers, gap their children: give a card `p-4` or `p-6` and lay out its contents with `gap` or `space-y-*`, rather than margins on each child.
- Prefer the logical classes (`ps-`, `pe-`, `ms-`, `me-`) in components, so they work in right-to-left languages.
- Center page content with `mx-auto` plus a max width.

## Corner radius

The corner radius scale. `rounded-sm` is 4px; the 2px step is `rounded-xs`.

| Token | Value | Use |
| --- | --- | --- |
| `rounded-none` | 0 | Square |
| `rounded-xs` | 2px | Tags, small chips |
| `rounded-sm` | 4px | Inputs, small buttons, checkboxes |
| `rounded-md` | 6px | Buttons |
| `rounded-lg` | 8px | Cards, menus |
| `rounded-xl` | 12px | Panels |
| `rounded-2xl` | 16px | Modals |
| `rounded-3xl` | 24px | Hero blocks |
| `rounded-4xl` | 32px | Very large surfaces |
| `rounded-full` | 9999px | Pills, avatars |

A container nested inside another should have a smaller radius than its parent.

**Roles.** The components don't name a step of the scale: they name what the corner belongs to. Use the roles for your own components too, so a brand that wants softer or sharper corners changes five tokens and every component follows.

| Role | Step | What it rounds |
| --- | --- | --- |
| `radius-inner` | `rounded-sm` (4px) | A small part inside or beside a control: a checkbox, a key, a clear or stepper button, a segmented control's indicator, the focus ring of a link in text, inline code |
| `radius-control` | `rounded-md` (6px) | Buttons, inputs, selects, tabs, badges, tooltips, and the items of a menu, list box, sidebar or tree |
| `radius-surface` | `rounded-lg` (8px) | Alerts, tables, lists, accordions, drop zones, and the floating surfaces: menus, popovers, list boxes, toasts |
| `radius-container` | `rounded-xl` (12px) | Cards, dialogs, drawers and carousels |
| `radius-pill` | `rounded-full` | Tracks and thumbs, steps, round buttons and swatches |

**Roundness.** `data-radius` on the page or a section reshapes the four roles at once, in every theme:

| Role | `sharp` | Default | `round` |
| --- | --- | --- | --- |
| `radius-inner` | 2px | 4px | 6px |
| `radius-control` | 2px | 6px | 12px |
| `radius-surface` | 4px | 8px | 16px |
| `radius-container` | 4px | 12px | 24px |

Each component's own radius token (`--button-radius`, `--menu-radius`…) defaults to its role, so one component can still be set apart. The `serupa/radius-through-role` Stylelint rule holds the components to this: a corner that names `rounded-sm` up to `rounded-4xl` fails lint. `rounded-none`, `rounded-xs` (the hairline curve of a text mark, such as Highlight) and `rounded-full` pass.

## Borders and outlines

Border and outline utilities, as classes in `bundle.css`. Widths and offsets are tokens in the `borders` group; colors come from the palette and alias tokens.

| Property | Classes |
| --- | --- |
| border-radius | `rounded-<size>` on all corners; sides `rounded-t-`, `-r-`, `-b-`, `-l-`, `-s-`, `-e-`; corners `rounded-tl-`, `-tr-`, `-br-`, `-bl-`, `-ss-`, `-se-`, `-ee-`, `-es-` |
| border-width | `border` (1px), `border-0`, `-2`, `-4`, `-8`; sides `border-x`, `-y`, `-s`, `-e`, `-bs`, `-be`, `-t`, `-r`, `-b`, `-l` (each with the same widths); between children `divide-x`, `divide-y` (and `-0`, `-2`, `-4`, `-8`, `-reverse`) |
| border-color | `border-<color>` for every role, white and black, on all four sides (a top-only colored edge is `border-t border-danger`: only the top has a width); `divide-<color>`; `inherit`, `current`, `transparent` |
| border-style | `border-solid`, `-dashed`, `-dotted`, `-double`, `-hidden`, `-none`; `divide-dashed`… |
| outline-width | `outline` (1px), `outline-0`, `-1`, `-2`, `-4`, `-8` |
| outline-color | `outline-<color>` for every role, white and black |
| outline-style | `outline-solid`, `-dashed`, `-dotted`, `-double`, `outline-none`, `outline-hidden` (transparent, still visible in forced-colors mode) |
| outline-offset | `outline-offset-0`, `-1`, `-2`, `-4`, `-8` and negatives |

Width classes draw a solid line on the sides they set, so `border` alone draws a box and `border-t-4` only a top line. Style classes (`border-dashed`) change the line of any width class on the same element; on their own they draw nothing. Its color is the text color unless you add one: use `border-border` (the alias) for dividers and `border-border-strong` for inputs.

Rules of thumb:

- Borders: `border border-border` for cards and dividers, `border-field-border` for form fields (`border-danger` when invalid, with the message in `danger-text`), `border-danger-border` for destructive outline buttons.
- Focus: one recipe everywhere, `outline: var(--focus-ring-width) solid var(--focus-ring); outline-offset: var(--focus-ring-offset)` on `:focus-visible` (the utilities `outline-2 outline-offset-2 outline-focus-ring` give the same). An outline follows the corner radius and its gap is transparent, so the ring reads on tinted backgrounds such as an Alert, Card or Navbar, and forced-colors mode draws it. Use an inset ring only where an outline would be clipped, as in Tabs. Never remove a focus style without replacing it; prefer `outline-hidden` over `outline-none`.
- Lists and tables: `divide-y divide-border` instead of a border on each row.

## Effects

Effect utilities, as classes in `bundle.css`. Box shadows are tokens in the `shadow` group; opacity uses the `opacity` group. There are no mask, blend-mode, text-shadow or inner-shadow classes (17.0.0): write those properties in your own CSS.

**Shadow names.** `shadow-2xs` → `shadow-xs` → `shadow-sm` → `shadow-md` → `shadow-lg` → `shadow-xl` → `shadow-2xl`, all black at 5–25% opacity. Earlier versions of this system used other names: the old `shadow-sm` is now `shadow-xs` (Button uses it, so buttons look the same), and the old bare `shadow` is now `shadow-sm`. `shadow` still works, and `shadow-inner` draws an inner shadow.

| Property | Classes | Tokens |
| --- | --- | --- |
| box-shadow | `shadow-2xs` `-xs` `-sm` `-md` `-lg` `-xl` `-2xl` `-none`; rings `ring` (1px) `ring-0` `-1` `-2` `-4` `-8`, `ring-inset`, `ring-offset-0` `-1` `-2` `-4` `-8`; colors `shadow-<color>`, `ring-<color>`, `ring-offset-<color>` for every role, white and black; `shadow-initial` undoes a color class | `shadow-*` |
| opacity | `opacity-0` … `opacity-100` in 5% steps | `opacity-*` |

**Stacking.** A shadow and a ring draw on one element at once: `shadow-md ring-1 ring-border` is a card with a hairline edge.

**Colors.** A color class swaps the black for that color at full strength (rings default to the text color). For a soft tint, set the variable directly, e.g. `--srp-shadow-color: color-mix(in oklab, var(--primary) 30%, transparent)`.

Rules of thumb:

- Elevation: inputs and buttons `shadow-xs`, cards `shadow-sm` (or `shadow-md` on hover), menus and popovers `shadow-lg`, dialogs `shadow-xl`/`shadow-2xl`. Higher elements get bigger shadows.
- Shadows barely show in dark themes, so elevation there comes from the surface: put raised content on `surface-raised` with a `border` edge, and anything in the top layer on `surface-overlay` with a `border-overlay` edge. Both are white in light themes, so the same classes work in every theme.
- Focus: use the outline recipe from Borders, not a ring. A `ring-offset` paints its gap in one color, which shows as a band on any tinted background, and box-shadow rings disappear in forced-colors mode.
- `opacity-disabled` (50%) for a disabled thing of your own whose colors you don't choose, such as a picture or a user's color swatch. Serupa's controls draw disabled in neutral colors instead (`disabled-text`, `disabled-surface`, `disabled-border`; see States), which stay readable where a fade may not. Don't lower the opacity of text to make it secondary: use `text-muted`.

## Elevation and layers

How things sit above one another: the page, raised cards, floating menus and dialogs. Elevation is shown three ways at once, so it reads in every theme: the surface color, an edge, and a shadow.

**The levels**

| Level | What sits there | Surface | Edge | Shadow |
| --- | --- | --- | --- | --- |
| 0 · Page | The page itself; Navbar, Sidebar and tables on it | `surface-page` behind; `surface` for the bars and tables | `border` between regions | none |
| 0 · Recessed | Side panels, table headers, filled Cards, wells | `surface-muted`, a step below `surface` in every theme | none | none, or an inner shadow (`shadow-inner`) for an input well |
| 1 · Resting | Outline Cards, Buttons, inputs | `surface` (fields: `field`) | `border` (fields: `field-border`) | `shadow-xs` |
| 2 · Raised | Elevated Cards, a card while it's dragged or hovered | `surface-raised` | `border` | `shadow-md` |
| 3 · Floating | Menu, Popover, Combobox, DatePicker and TimePicker lists, Toast | `surface-overlay` | `border-overlay` | `shadow-lg` |
| 4 · Modal | Dialog and Drawer, over the `overlay` backdrop | `surface-overlay` | `border-overlay` | `shadow-xl` |
| Inverse | Tooltip | `surface-inverse` | none | `shadow-md` |

- Higher means bigger shadow and, in dark themes, a lighter surface; recessed is darker than the page in both modes. Don't skip the surface and edge and rely on the shadow alone.
- Keep to one raised level per region. A card inside a card stays at level 1; give the inner one `filled` or no border instead of a second shadow.
- Elevation means "this is above the page", not "this is important". Use color and type for emphasis.

**Roles.** The components take their shadow from a role named for the level, not from a step of the shadow scale: `elevation-rest` (level 1, `shadow-xs`), `elevation-raised` (level 2 and the tooltip, `shadow-md`), `elevation-overlay` (level 3, `shadow-lg`) and `elevation-modal` (level 4, `shadow-xl`). The light is above the page, so a shadow falls toward what the surface sits over: `elevation-modal-up` for a panel against the bottom edge (a bottom sheet), and `elevation-modal-left` and `elevation-modal-right` for one against the right or left edge, cast toward the page. Drawer picks the one for its side. `elevation-part` (`shadow-sm`) lifts a part over the control it sits on: a slider thumb, a segmented control's indicator, carousel arrows, a table head once rows scroll under it. Give your own surfaces the same roles. They follow `data-shadow="brand"` like the shadows they name, in a section as well as on the page.

**Light and dark**

In light themes, shadows carry the lift: `surface-raised` and `surface-overlay` are white like `surface`, with the same `zinc-200` edge. In dark themes (a `zinc-950` page under `zinc-900` cards), shadows hardly show, so a raised surface steps up to `zinc-800`, and an overlay's edge to `zinc-600`. Because the tokens change with the theme, the same classes work in both: `bg-surface-overlay border border-border-overlay shadow-lg` is a correct floating panel in every theme.

In forced-colors mode, backgrounds and shadows are replaced, so only the edge survives. Every floating surface has a real border for that reason; keep it if you restyle one.

**Layers and z-index**

- The floating components (Menu, Popover, Tooltip, the Combobox, DatePicker, DateRangePicker and TimePicker lists) and the modal ones (Dialog, Drawer) open in the browser's **top layer** (`popover` and `showModal()`). The top layer is above every z-index on the page, so they can't be hidden by a parent's `overflow: hidden` or a high z-index, and you never need to raise them. Toasts move into an open Dialog or Drawer so they stay visible and clickable there.
- Your own fixed and sticky elements use the named layers (`z-sticky`, `z-dropdown`, `z-overlay`, `z-modal`, `z-popover`, `z-toast`, `z-tooltip`, listed in Layout under Utility classes), so they stack in the same order as the components.
- Use the numbered steps (`z-10`, `z-20`) only inside one component, such as a badge over an avatar. Wrap that component in `isolate` so its z-indexes can't compete with the page's.
- A new stacking context traps z-index: `transform`, `filter`, `opacity` below 1, `isolation: isolate` and `position: sticky` with a z-index all create one. If something won't come to the front, look for one of these on an ancestor before raising a number.

## Filters

There are no filter classes (17.0.0 removed `blur-*`, `brightness-*`, `grayscale`, `drop-shadow-*`, `backdrop-*` and the rest: nothing in the system used them). The scales are still tokens in the `filters` group, for your own CSS:

```css
.frosted { background: color-mix(in oklab, var(--surface) 70%, transparent); backdrop-filter: blur(var(--blur-md)) saturate(150%); }
.logo-wall img { filter: grayscale(100%); }
```

Rules of thumb:

- Backdrop filters only show through a see-through background, as above. Give the text a solid fallback for browsers that skip them.
- Blur is expensive on large areas and on scroll: keep it on small or fixed elements.
- Text over a photo: darken the image (`filter: brightness(50%)`) or lay a gradient over it, then check contrast at the lightest point.
- Use `shadow-*` for cards and panels; save `filter: drop-shadow()` for icons, illustrations and cut-out images.

## Tables

Table utilities, as classes in `bundle.css`. They add no tokens: `border-spacing` uses the spacing scale, and the rest are keywords.

| Property | Classes |
| --- | --- |
| border-collapse | `border-collapse` (cells share borders), `border-separate` (each cell has its own) |
| border-spacing | `border-spacing-<step>`, `border-spacing-x-<step>`, `border-spacing-y-<step>` for every spacing step (`0`, `px`, `0.5` … `96`); only works with `border-separate` |
| table-layout | `table-auto` (columns fit their content), `table-fixed` (columns follow the first row or set widths, ignoring content) |
| caption-side | `caption-top`, `caption-bottom` |

Rules of thumb:

- Data tables: `border-collapse` with `divide-y divide-border` on `<tbody>` or `border-b border-border` on rows, `text-sm`, and `px-3 py-2` cells.
- Use `border-separate border-spacing-2` (or `border-spacing-y-2` for row cards) when cells need their own rounded corners or backgrounds.
- `table-fixed` with column widths (`w-1/3`, `w-24`) keeps long content from pushing columns around and renders faster for big tables; pair it with `truncate` in cells.
- Put numbers in `tabular-nums text-right` cells, and give every table a `<caption>` or an `aria-label` describing it.

## Transforms

The translate classes, as classes in `bundle.css`, use the spacing scale. They set the CSS `translate` property, so they don't clash with a `rotate` or `scale` of your own. 17.0.0 removed the rotate, scale, skew, perspective, origin and zoom classes (nothing in the system used them); the scales are still tokens in the `transforms` group, for your own CSS (`rotate: var(--rotate-45)`).

| Property | Classes | Tokens |
| --- | --- | --- |
| translate | `translate-x-<step>` and `translate-y-<step>` for every spacing step; fractions `-1/2` … `-11/12` and `-full` (of the element's own size); negatives; `translate-none` | `spacing-*` |

Transforms move how an element is drawn, not where it sits in the layout, so neighbors don't shift.

Rules of thumb:

- Micro-interactions: show a press as a darker color, one step past hover, not a shrink, as the components do (see States): a shrink is hard to see under a finger and breaks the look of small controls. In your own CSS (utilities have no `hover:` or `active:` prefix):

  ```css
  @media (hover: hover) { .pressable:hover { background: var(--secondary); } }
  .pressable:active { background: var(--secondary-hover); }
  ```
- Center an absolutely positioned element with `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`.
- Rotate a disclosure chevron in your own CSS (`rotate: 180deg`) instead of swapping icons.
- Animate `translate`, `scale` and `rotate`, not `top` or `width`: they don't trigger layout.
- Respect reduced motion: drop large movements and 3D flips when the viewer prefers reduced motion.

## Page layout

How to lay out a page: the breakpoints it adapts at, the containers that hold its content, and the spacing between its parts. The tokens and classes are in Layout under Utility classes; this is how to use them together.

**Breakpoints**

Design for a phone first, then add what changes on wider screens. The five breakpoints are minimum widths:

| Breakpoint | From | Layout it usually gets |
| --- | --- | --- |
| (none) | 0 | One column. Navigation behind Navbar's menu button. 16px side padding. |
| `sm` | 640px | Still one column; forms and cards can sit two to a row. 24px side padding. |
| `md` | 768px | Two columns. Navbar shows its links. |
| `lg` | 1024px | A Sidebar beside the content, or three columns of cards. 32px side padding. |
| `xl` | 1280px | Content reaches its container's width; extra space goes to the margins. |
| `2xl` | 1536px | Only for dense data: wide tables, dashboards. |

- Change the layout where the content needs it, not at every breakpoint. Two or three changes are usually enough.
- Test at 320px wide. WCAG 1.4.10 asks that content reflows without scrolling sideways at that width (400% zoom on a 1280px screen); only data tables, maps and diagrams may scroll.
- For a component that sits in places of different widths (a card in a sidebar and in the main column), let its width decide, not the screen's: Grid's `columns="auto"` and `minColumnWidth`, or a container query (`@container`).

**Navigation by width**

Give an app's main places the navigation that fits the window, and keep the same places in the same order at every width:

| Width | Navigation | Why |
| --- | --- | --- |
| Below `md` (under 768px) | BottomNav for three to five places, or Navbar's menu button for more | A thumb reaches the bottom of a phone, and the page keeps its whole width |
| `md` to `lg` (768 to 1023px) | Sidebar with `collapsed`: a 64px icon rail | A tablet or a narrow window has room for icons, not for a column of names |
| From `lg` (1024px) | The full Sidebar | The names fit, so people read where to go instead of recognising icons |

- Switch on the window's width, not the device: a narrow desktop window gets the rail too. BottomNav hides from `md` by itself (`hideFrom`); collapse the Sidebar below `lg` and hide it below `md`.
- Let people still collapse the full Sidebar by hand, and keep their choice.
- The Page shell pattern's AdaptiveNavigation story does all three: resize the window to see it switch.

**Containers**

Wrap each band of the page (header, main content, footer) in a Container of the same `size`, so their edges line up.

| Content | Container | Max content width |
| --- | --- | --- |
| Articles, help pages, settings forms | `size="prose"` | 672px, about 70 characters a line |
| A page of cards or a form with a side panel | `size="lg"` | 1024px |
| Most app pages (the default) | `size="xl"` | 1280px |
| Dashboards and wide tables | `size="2xl"` | 1536px |
| A layout that brings its own margins, such as a full-bleed hero | `size="full"` | none |

- Keep reading text within `prose` width even on a wide page: put a long description in its own `prose` block.
- The maximum is the content's: the side padding sits outside it, and grows to the screen's safe area where a notch is. The padding follows the screen's width, so in a narrow pane use `padded={false}` and pad the pane itself.
- Don't nest Containers. Inside one, lay things out with Stack and Grid.
- An app shell (Sidebar and Navbar) fills the window; put a Container inside the content area, not around the shell.

**Spacing rhythm**

Use spacing to show what belongs together: the closer two things are, the more related they look. Pick from a few steps of the spacing scale and use them the same way on every page.

Pages come in two rhythms. An app screen (a dashboard, a list and its detail, settings, a form, a sign-in page) is dense: people work in it and scan it, so its page header, sections and cards all sit one step apart, `space-page` (24px). A long-form or marketing page (an article, a landing page, docs) is read top to bottom, so its sections and bands get room to breathe: `space-section` (32px) between sections and `space-band` (64px) between bands and after the page header. Inside a section the two rhythms are the same.

| Between | Step | App screen | Long-form and marketing page |
| --- | --- | --- | --- |
| An icon and its label; a label and its control | `1` to `2` | 4–8px | 4–8px |
| Fields in a form; items in a list; lines of a card | `3` to `4` | 12–16px | 12–16px |
| A section's heading and the groups under it | `4` | 16px (`space-content`) | 16–24px |
| Groups inside a section; cards in a grid | `6` | 24px | 24px |
| Sections of a page | `6` / `8` | 24px (`space-page`) | 32–48px (`space-section`) |
| The page header and the content; bands | `6` / `10` to `16` | 24px (`space-page`) | 40–64px (`space-band`) |

- Space inside a group is always smaller than the space between groups. If two gaps are equal, the groups stop reading as groups. On an app screen, sections and the cards in a grid are both 24px apart: a section's heading, 16px above its content, is what groups it.
- Pad the container and gap its children: a Card has `p-6`, and its contents sit in a Stack with `gap={3}` or `gap={4}`. Don't add margins to each child.
- On small screens, step a long-form page's big gaps down one step: `gap-8 md:gap-16`. An app screen keeps 24px at every width.
- Compact density (`data-density="compact"`) shrinks controls, rows and the padding inside cards and dialogs, not the space between your page's sections: that stays 24px, so the page keeps its groups.
- The patterns follow this: every app pattern puts 24px between its page header, its sections and its cards; Article, a long-form page, puts 32–40px between its parts.

**A typical app page**

```jsx
<div style={{ display: 'flex', minHeight: '100vh' }}>
  <Sidebar header={<Logo src="/logo.svg" alt="Acme" />}>…</Sidebar>
  <Container as="main" size="xl" className="py-8">
    <Stack gap={6}>   {/* space-page: an app screen's header, sections and cards sit 24px apart */}
      <Stack gap={2}><Heading level={1}>Projects</Heading><Text tone="muted">12 active</Text></Stack>
      <Grid columns="auto" gap={6}>{cards}</Grid>
    </Stack>
  </Container>
</div>
```

## Layout

Layout scales as tokens, and layout utilities as classes in `bundle.css` (`.container`, `.flex`, `.grid`, `.sticky`, `.z-30`, `.aspect-video`, `.overflow-hidden`…).

**Breakpoints**: mobile first: styles apply from the breakpoint up.

| Token | Min width | Typical screens |
| --- | --- | --- |
| `screen-sm` | 640px | Large phones in landscape, small tablets |
| `screen-md` | 768px | Tablets |
| `screen-lg` | 1024px | Laptops |
| `screen-xl` | 1280px | Desktops |
| `screen-2xl` | 1536px | Large desktops |

**Responsive classes**: put a breakpoint in front of a layout class to apply it from that width up: `sm:` `md:` `lg:` `xl:`. These four are the only prefixes: there are no `hover:`, `focus:`, `active:` or `dark:` classes, so write those states in your own CSS (the themes already handle dark). Start with the phone layout and add what changes on wider screens:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">…</div>
<nav class="hidden md:flex items-center gap-4">…</nav>
<h1 class="text-2xl md:text-4xl">…</h1>
```

Responsive versions exist for the classes that shape a layout: display; flex direction, wrap, grow and shrink; `grid-cols-*`, `col-span-*`, `order-*`; `items-*`, `justify-*`, `self-*`; `gap-*` and padding (`p-`, `px-`, `py-`, `pt-`, `pr-`, `pb-`, `pl-`) at every spacing step; auto margins; `w-auto`, `w-full`, `w-fit`, width fractions, `max-w-*`, `h-auto`, `h-full`; `text-xs` … `text-9xl` and text alignment; position and overflow. Colors, borders and effects have none: they rarely change with screen width, and components handle their own states. For anything else, write a media query with the breakpoint's value (`@media (min-width: 768px)`); CSS variables don't work inside `@media`.

**Container**: `.container` is full width and snaps its max-width to the current breakpoint (640, 768, 1024, 1280, 1536px). It isn't centered and has no padding: add `margin-inline: auto` and a side padding such as `spacing-4` (16px), or `spacing-6` from `md` up.

**Z-index layers**: page-level layers have names, so every menu, dialog and toast stacks the same way. Use them as classes (`z-modal`) or in CSS (`var(--z-modal)`):

| Token | Value | Layer |
| --- | --- | --- |
| `z-sticky` | 20 | Sticky headers, toolbars and side navigation |
| `z-dropdown` | 30 | Dropdown menus and select lists, above sticky bars |
| `z-overlay` | 40 | The `overlay` backdrop behind a dialog |
| `z-modal` | 50 | Dialogs and drawers |
| `z-popover` | 60 | Popovers opened from inside a dialog |
| `z-toast` | 70 | Toasts, above dialogs |
| `z-tooltip` | 80 | Tooltips, above everything |

The numbered steps `z-0` … `z-50` and `z-auto` are for local stacking inside one component (a badge over an avatar), not for page layers.

**Aspect ratio**: `aspect-auto`, `aspect-square` (1 / 1) for avatars and thumbnails, `aspect-video` (16 / 9) for media.

**Every layout utility** in `bundle.css`:

| Property | Classes |
| --- | --- |
| aspect-ratio | `aspect-auto`, `aspect-square`, `aspect-video` (tokens) |
| box-decoration-break | `box-decoration-clone`, `box-decoration-slice` |
| box-sizing | `box-border`, `box-content` |
| display | `block` `inline-block` `inline` `flex` `inline-flex` `grid` `inline-grid` `contents` `flow-root` `list-item` `hidden`, `table` `inline-table` `table-caption` `table-cell` `table-column` `table-column-group` `table-footer-group` `table-header-group` `table-row-group` `table-row`, `sr-only` `not-sr-only` |
| float / clear | `float-left` `-right` `-start` `-end` `-none`; `clear-left` `-right` `-start` `-end` `-both` `-none` |
| isolation | `isolate`, `isolation-auto` |
| object-fit / object-position | `object-contain` `-cover` `-fill` `-none` `-scale-down`; `object-top-left` `-top` `-top-right` `-left` `-center` `-right` `-bottom-left` `-bottom` `-bottom-right` |
| overflow | `overflow-auto` `-hidden` `-clip` `-visible` `-scroll`, and `overflow-x-*`, `overflow-y-*` |
| overscroll-behavior | `overscroll-auto` `-contain` `-none`, and `overscroll-x-*`, `overscroll-y-*` |
| position | `static` `fixed` `absolute` `relative` `sticky` |
| top / right / bottom / left | `inset-<step>`, `inset-x-` `-y-` `-s-` `-e-` `-bs-` `-be-`, `top-` `right-` `bottom-` `left-` `start-` `end-` for every spacing step, fractions (`top-1/2`), `-full`, `-px`, `-auto`, and negatives (`-top-2`); `start-` and `end-` are the same as `inset-s-` and `inset-e-`, and follow the text direction |
| visibility | `visible` `invisible` `collapse` |
| z-index | `z-0` … `z-50`, `z-auto`, named layers `z-sticky` … `z-tooltip` (tokens), negatives `-z-10` |
| containment | `contain-none` `-content` `-strict` `-size` `-inline-size` `-layout` `-paint` `-style` (the last five combine); `@container` and `@container-normal` mark a container for container queries |

For responsive changes, write your own media queries with the breakpoint values.

## Flexbox and grid

Flexbox and grid utilities, as classes in `bundle.css`. Most are keywords; the few values that aren't on another scale are tokens in the `flexGrid` group (`flex-auto`, `grid-auto-fr`, `order-first`…). `order-first` and `order-last` are -9999 and 9999.

| Property | Classes |
| --- | --- |
| flex-basis | `basis-<spacing>`, `basis-1/2` (fractions), `basis-xs`…`basis-7xl` (container), `basis-auto`, `basis-full` |
| flex-direction | `flex-row`, `flex-row-reverse`, `flex-col`, `flex-col-reverse` |
| flex-wrap | `flex-nowrap`, `flex-wrap`, `flex-wrap-reverse` |
| flex | `flex-1`…`flex-12`, fractions `flex-1/2`…`flex-11/12`, `flex-auto`, `flex-initial`, `flex-none` |
| flex-grow / flex-shrink | `grow`, `grow-0`…`grow-12`, `shrink`, `shrink-0`…`shrink-12` |
| order | `order-1`…`order-12`, `-order-*`, `order-first`, `order-last`, `order-none` |
| grid-template-columns / rows | `grid-cols-1`…`12`, `grid-rows-1`…`12`, `-none`, `-subgrid` |
| grid-column / grid-row | `col-span-1`…`12`, `col-span-full`, `col-start-1`…`13`, `col-end-1`…`13`, `-auto` (and `row-*` the same) |
| grid-auto-flow | `grid-flow-row`, `-col`, `-dense`, `-row-dense`, `-col-dense` |
| grid-auto-columns / rows | `auto-cols-auto`, `-min`, `-max`, `-fr`, `-<spacing>` (and `auto-rows-*`) |
| gap | `gap-<spacing>`, `gap-x-<spacing>`, `gap-y-<spacing>` |
| justify-content | `justify-start`, `-end`, `-center`, `-between`, `-around`, `-evenly`, `-stretch`, `-normal`, `-center-safe`, `-end-safe` |
| justify-items / justify-self | `justify-items-*`, `justify-self-*` (start, end, center, stretch, normal/auto, safe variants) |
| align-content | `content-start`, `-end`, `-center`, `-between`, `-around`, `-evenly`, `-baseline`, `-stretch`, `-normal`, `-center-safe`, `-end-safe` |
| align-items / align-self | `items-*`, `self-*` (start, end, center, baseline, baseline-last, stretch, auto, safe variants) |
| place-content / items / self | `place-content-*`, `place-items-*`, `place-self-*` |

The `-safe` variants (`justify-center-safe`, `items-end-safe`…) fall back to the start when the content doesn't fit, so nothing overflows out of reach.

Rules of thumb:

- One dimension (a row of buttons, a toolbar, a stack) → flex. Two dimensions (cards, dashboards, forms) → grid.
- Space children with `gap-*` from the spacing scale, not margins: `gap-2` inside controls, `gap-4` between related items, `gap-6`–`gap-8` between groups.
- Card grids: `grid grid-cols-1 gap-4`, widening with media queries to 2, 3 or 4 columns. Equal columns use `minmax(0, 1fr)`, so long content can't stretch them.
- Push one item to the end of a row with `ms-auto` or `justify-between`; center anything with `place-items-center`.
- Avoid `order-*` for content that's read in sequence: screen readers and keyboard focus follow the source order, not the visual one.

## Sizing

The full sizing set: **width**, **min-width**, **max-width**, **height**, **min-height**, **max-height**, **inline-size**, **min-inline-size**, **max-inline-size**, **block-size**, **min-block-size** and **max-block-size**. Every one takes the same scale, so tokens hold the scale once and `bundle.css` has a class for each property × value.

| Property | Class prefix |
| --- | --- |
| width / min-width / max-width | `w-` / `min-w-` / `max-w-` |
| height / min-height / max-height | `h-` / `min-h-` / `max-h-` |
| inline-size / min / max | `inline-` / `min-inline-` / `max-inline-` |
| block-size / min / max | `block-` / `min-block-` / `max-block-` |
| width and height together | `size-` |

Inline and block sizes follow the writing direction: in left-to-right horizontal text, inline is width and block is height. Prefer them in components that must work in other writing modes. `.block` and `.inline` (display) stay separate from `.block-*` and `.inline-*` (size).

**The scale**

- **Numbers**: the spacing scale: `w-4` = `spacing-4` (16px), `h-10` = 40px, `block-8` = 32px. Every spacing step from `0` to `96` exists for every prefix.
- **Container sizes** (width-axis prefixes only): tokens `container-3xs` (256px) to `container-7xl` (1280px): `max-w-md`, `inline-lg`, `min-w-xs`…
- **Fractions**: `1/2`, thirds, quarters, fifths, sixths and twelfths (tokens `sizing-1-2` … `sizing-11-12`). In CSS the slash is escaped: `.w-1\/2`.
- **Keywords**: `auto` (not for max), `px`, `full`, `screen` (100vw on the inline axis, 100vh on the block axis), `dvw`/`dvh`, `lvw`/`lvh`, `svw`/`svh`, `min`, `max`, `fit`, `none` (max only) and `lh` (one line, height axis).

**Container scale**

| Token | Value | Use |
| --- | --- | --- |
| `container-3xs` | 16rem (256px) | Narrow popovers, sidebars |
| `container-2xs` | 18rem (288px) | Sidebars, filter panels |
| `container-xs` | 20rem (320px) | Small dialogs, popover cards |
| `container-sm` | 24rem (384px) | Sign-in forms, narrow dialogs |
| `container-md` | 28rem (448px) | Standard dialogs |
| `container-lg` | 32rem (512px) | Wide dialogs, forms |
| `container-xl` | 36rem (576px) | Side panels, form pages |
| `container-2xl` | 42rem (672px) | Settings pages, long forms |
| `container-3xl` | 48rem (768px) | Article and document bodies with images |
| `container-4xl` | 56rem (896px) | Content pages |
| `container-5xl` | 64rem (1024px) | Dashboards with a sidebar |
| `container-6xl` | 72rem (1152px) | Wide app layouts |
| `container-7xl` | 80rem (1280px) | Marketing and full app shells |
| `container-prose` | 65ch | `max-w-prose`: body text at about 65 characters per line |

Rules of thumb:

- Cap running text at `max-w-prose` so lines stay readable.
- Dialogs: `max-w-md` by default, `max-w-sm` for confirmations, `max-w-lg` or `max-w-xl` for forms.
- Page content: `max-w-7xl` centered, or `.container`.
- Use `min-h-dvh` rather than `h-screen` for full-height mobile layouts, so the browser bar doesn't cut the bottom off.
- Give flex and grid children that hold text `min-w-0`, so long words wrap instead of overflowing.
- Pick `wrap-break-word` for text that sits in a table cell, a button or a row beside other text. `wrap-anywhere` lets the box shrink below its longest word, so there it breaks words mid-word ("Downlo/ad") while there is still room. Keep `wrap-anywhere` for a box that must fit a narrow column whatever it holds, such as a card with a long URL in a flex row: both break a word too long for a line of its own.


**Control heights**: every control at one size is the same height, so buttons, inputs and selects line up in a row. Components read these tokens; in your own markup use `h-control-sm`, `min-h-control-md` or `size-control-lg` (a square, for icon buttons).

| Token | Value | Use |
| --- | --- | --- |
| `control-height-sm` | 1.5rem (24px) | Small controls; the WCAG 2.2 AA minimum target |
| `control-height-md` | 2rem (32px) | Default buttons, inputs and selects |
| `control-height-lg` | 2.75rem (44px) | Large controls; the comfortable touch target (WCAG 2.5.5) |

## Motion

Motion explains a change: where a menu came from, that a press registered, that something is still loading. It never decorates and never makes anyone wait. Most of it takes 100–300ms.

**Should it animate?** Ask before choosing a duration. Motion earns its place by doing one of these, and only these:

- **Shows where something came from or went**: a menu growing from its button, a drawer sliding from its edge, a row gliding to its new place.
- **Confirms the hand was felt**: a press scaling down, a switch thumb travelling, a check popping in.
- **Shows that something is still happening**: a spinner, a placeholder's pulse, an indeterminate bar.
- **Joins two states that would otherwise jump**: a panel opening, an indicator sliding between segments, a fill arriving at its value.

If none fits, it doesn't move. How often someone sees it decides how much it may move:

| How often | Examples | Motion |
| --- | --- | --- |
| Hundreds of times a day | Typing, a key held in a list, hover across a toolbar, a menu opened again and again | None, or a color change at `motion-hover`. Never a delay, never a scale or slide that has to finish before the next one. |
| Many times a session | Opening a menu, popover or select; a toggle; a tab | Short: the `-sm` roles, `ease-enter` / `ease-exit`. |
| Now and then | A dialog, a drawer, a toast, a page's first list of results | The `-md` and `-lg` roles; a stagger is allowed here. |
| Rarely | A first-run hint, a task finished, an upload done | The one place for `ease-celebrate`. |

**Budget.** At most two or three things move at once on a screen, and only one of them is the one the eye should follow. A screen where a chart draws in, numbers change, a toast rises and a list staggers in all at the same moment says nothing, because nothing stands out. When a change sets off several, keep the one that explains what happened (the row that moved, the total that changed) and let the rest change at once. A loop (a spinner, a placeholder's pulse) counts toward the budget for as long as it runs, so a page of skeletons pulses as one group, never each card on its own beat. Check a full screen, not one component: open the Dashboard and Notifications patterns, do the most common action, and count what moves.

**Direction.** Where something moves tells people where it came from, so pick the direction to match. A surface tied to a control grows from that control: a menu from its button, a popover from its trigger, a tooltip from what it describes. A surface that belongs to the whole app has a fixed place and arrives the same way each time, wherever it was opened from: toasts from their corner, a command palette from the top, a drawer from its edge. Moving forward (the next step, a page deeper) slides one way and going back slides the other, mirrored in right-to-left pages. An exit runs the entrance backwards, shorter and fading as it goes. It may also vanish at once: a tooltip, a hover card or a menu closed by a choice can go in the same frame, since no one watches them leave.

**Keyboard.** An action someone repeats from the keyboard (arrow keys through a list, a calendar or a tab list; Tab through a form; a shortcut) should answer at once: focus and selection move in the same frame, with no slide or fade to wait for. What a key opens or closes answers at once too: a menu, popover, combobox list or date or time picker opened by Enter, Space or an arrow is there in the first frame, and one closed by Escape is gone in the same frame. A pointer or a tap keeps the enter and the exit, because there the motion shows where the surface came from. The same goes for the Tabs line or fill and the SegmentedControl selection: picked by an arrow they jump, and clicked they slide. Each reads the last input through `src/internal/lastInput.ts` (the layers through `useExit`) and puts `data-instant` on itself, and its CSS leaves out the starting style and the exit transition under it.

**Turned down.** Examples of motion this system says no to, and why: a menu's items arriving one by one (people open menus all day, and the last item would be late every time); a hover lift on every card in a grid (the page shimmers as the pointer crosses it); a dialog that bounces as it opens (overshoot is for small things); a toast that wobbles (it would be the tenth one today); a delay before a dropdown opens on click (it reads as lag); a page fading in on every navigation (it slows what people do most). Effects popular in motion libraries, turned down for the same reasons: a button pulled toward the pointer, a card tilting under it, a custom cursor or a spotlight following it (pointer only: nothing for the keyboard or touch, and the target moves while someone aims at it); a highlight gliding behind each item as the pointer crosses a menu or list (seen hundreds of times a day; Tabs and SegmentedControl glide only when clicked); icons that grow as the pointer nears them, as in a dock (the one being aimed at moves); glows and light trails running round a border, and text that scrambles, waves or shimmers in place (decoration that pulls the eye and slows reading; Loader's text shine is a loading state, not decoration); and a row of logos or quotes scrolling without end (it moves for more than five seconds, so WCAG 2.2.2 asks for a pause, and people can't read what keeps leaving).

**Reviewing motion.** A note on a pull request's motion says what it does now, what it should do, and which rule says so, so the change can be checked against the rule rather than a taste:

| Before | After | Why |
| --- | --- | --- |
| Menu items arrive one by one over 250ms | They appear with the menu | Opened many times a session: no stagger |
| The panel closes over `motion-enter-md` | It closes over `motion-exit-md` | An exit takes about two thirds of its enter |
| ArrowDown slides the highlight to the next option | The highlight moves in the same frame | A key repeated from the keyboard answers at once |

Transition and animation tokens are in one `transitions` group (`var(--duration-150)`, `var(--ease-enter)`, `var(--animate-spin)`), with matching utility classes in `bundle.css` (`.transition`, `.duration-200`, `.ease-enter`, `.animate-pulse`). Components use the **roles**. A duration role names what is moving rather than how long it takes, and points at a step of the scale, so one change to a role moves every component that uses it. Easing has no scale behind it: the easing roles are the only curves, each named for what it moves.

**Roles**

| Role | Today | What moves |
| --- | --- | --- |
| `motion-press` | `duration-100` | A control answering while it's held down (Button scales down). |
| `motion-release` | `duration-300` | A press let go coming back to size with `ease-enter`, settling with no overshoot (Button, Badge). |
| `motion-hover` | `duration-150` | Hover and focus changes on a control that stays put: colors, borders, shadows. |
| `motion-enter-sm` | `duration-150` | A small surface appearing: tooltips, popovers, menus, date pickers. |
| `motion-enter-md` | `duration-200` | A medium surface appearing: dialogs, toasts. |
| `motion-enter-lg` | `duration-300` | A large surface appearing: drawers, sheets. |
| `motion-exit-sm` / `-md` / `-lg` | `duration-100` / `150` / `200` | The same surfaces leaving. |
| `motion-change-sm` | `duration-150` | A small part changing in place: a chevron turning, a slider thumb growing, a row gliding to its place. |
| `motion-change-md` | `duration-200` | A panel opening or collapsing in place, an indicator sliding: Accordion, Sidebar, SegmentedControl, Tabs. |
| `motion-change-lg` | `duration-300` | Something travelling far: a progress or meter fill moving to its value, a carousel slide. |
| `motion-loop-spinner` | `duration-700` | One turn of a spinner, the one spinner speed: Loader's ring (and so Button, Badge and SearchInput), Switch and the circular Progress while they load. Under reduced motion they stand still and breathe over twice this. |
| `motion-loop-placeholder` | `duration-1000` | One pass of a loading placeholder's pulse (Image while it loads). |
| `motion-loop-blink` | `duration-1000` | One blink of a text caret (PinInput). |
| `motion-loop-progress` | `duration-1200` | One pass of an indeterminate progress bar. |
| `motion-stagger` | `delay-50` | The gap between items of a group arriving one after another: list rows, toasts, grid cards. |
| `motion-stagger-limit` | `delay-300` | The longest any staggered item waits, so a long list still arrives within a moment. |
| `motion-sequence` | `delay-50` | The offset between the steps of one entrance: a dialog's or drawer's backdrop starts, then its panel. Exits don't sequence. |
| `ease-enter` | `cubic-bezier(0.25, 1, 0.5, 1)` | Something appearing: quick off the mark, then a long smooth landing. |
| `ease-exit` | `cubic-bezier(0.25, 1, 0.5, 1)` | Something leaving: at full speed from the first frame, then easing off as it fades. An ease-in starts slowly, and the first frames after a close are the ones people watch, so closing felt sluggish. |
| `ease-move` | `cubic-bezier(0.65, 0, 0.35, 1)` | Something that stays on screen and changes: a thumb sliding, a panel resizing, a color changing. |
| `ease-settle` | `cubic-bezier(0.16, 1, 0.3, 1)` | Something arriving at a new value or let go by the hand: a fill, a slide, a drawer dropped. Most of the travel at once, then a long glide to rest. |
| `ease-pop` | `cubic-bezier(0.34, 1.36, 0.64, 1)` | Something small popping into place: a check mark, a count, a dot. Overshoots by about 4%, then settles. |
| `ease-spring` | a spring, damping 0.6 | A press let go springing back, or a thumb or indicator landing: a real spring that overshoots and settles. |
| `ease-fling` | `cubic-bezier(0.33, 1, 0.68, 1)` | Something the hand let go of mid-motion carrying on to rest at the hand's speed: a drawer or carousel slide flicked. |
| `ease-celebrate` | a spring, damping 0.3 | A small, rare moment worth celebrating: a success check landing, a count bumping, an item snapping into its slot after a drag. Wobbles, then settles. |

`tools/test/motion-tokens.mjs` fails component CSS that writes its own duration, delay or easing (a `250ms`, a `cubic-bezier()`) instead of a token, and component CSS that takes the duration scale itself (`var(--duration-150)`) instead of a role; `duration-0` and `ease-linear` are allowed, and what hasn't moved to a role yet is listed in the check. It also checks that each duration role names a step of the scale, that the easing tokens are only the roles, and that every exit is shorter than its enter. In an app, `@diki-stwn/serupa-ds/stylelint`'s `serupa/no-raw-motion` does the same for your own CSS: it flags a `0.3s ease` or a `cubic-bezier()` in `transition` and `animation`, and `transition: all`, and names the role to use (see Getting started).

**What to animate.** Move things with `opacity`, `translate`, `scale` and `rotate`: the browser runs them on the compositor, off the main thread, so they stay smooth while the page is busy. A small `filter: blur()` (`blur-xs`) is fine for a short swap. Don't animate `width`, `height`, `inset`, `margin` or `padding`: each frame lays out the page again, and what's around it moves too. Grow a panel with `grid-template-rows` from `0fr` to `1fr`, or clip it, as Accordion does. Don't loop `background-position`, `mask-position` or `box-shadow` (a shimmer, a glow): they repaint every frame; paint the gradient once and slide it with `translate` instead. Name the properties that move (`transition: opacity …, translate …`), never `all`, which also animates whatever else happens to change, a theme switch included.

**Waits.** Some waits live in JavaScript, because CSS can't express them: how long before a spinner shows, or how long a tooltip waits for the pointer to rest. They are named once in `src/internal/timing.ts`, so two that must agree can't drift apart. For example, Button's busy wait is Loader's default delay. The `serupa/no-literal-delay` lint rule fails a number written into a `setTimeout` or `setInterval` in a component.

| Wait | Value | What it's for |
|---|---|---|
| `spinnerDelay` | 300ms | Before a loading indicator appears, so a quick wait doesn't flash one: Loader's default `delay`, Button's `loading`. |
| `spinnerMinShown` | 500ms | Once a loading indicator shows, it stays at least this long. |
| `feedbackHold` | 2000ms | How long a "done" state holds: Button's `successText`, CopyButton's "Copied". |
| `hoverIntent` | 400ms | The pointer rests this long before a tooltip shows (Tooltip's default `delay`). |
| `hoverLeave` | 100ms | A tooltip waits this long after the pointer leaves, so moving onto it keeps it open. |
| `hoverWarm` | 300ms | After a tooltip closes, the next one opens at once for this long. |
| `cardIntent` | 500ms | The pointer rests this long on a link, or focus stays on it, before its HoverCard opens (its default `openDelay`). |
| `cardLeave` | 300ms | A HoverCard waits this long after the pointer or focus leaves it and its link (its default `closeDelay`). |
| `submenuIntent` | 150ms | The pointer rests this long on a menu item before its submenu opens or closes. |
| `typingPause` | 250ms | Typing pauses this long before Combobox's `loadOptions` runs (its default `debounce`). |
| `announcePause` | 700ms | Combobox waits this long after the options change before saying how many there are. |
| `quickArrival` | 250ms | A picture that arrives this soon after mount appears without Image's fade. |
| `holdDelay`, `holdRepeat` | 400ms, 50ms | A held NumberInput step button waits, then repeats. |
| `clickAfterDrag` | 500ms | After a Splitter drag, the click the browser sends is ignored for this long. |
| `repeatQuiet` | 1000ms | The same toast again within this long is a repeat, not a new toast. |
| `relativeTick` | 15s | How often RelativeTime refreshes. |

**Timing**

- Bigger surfaces take longer, because they travel further: a tooltip enters in 150ms, a dialog in 200ms, a drawer in 300ms.
- An exit takes about two thirds of its enter. What was closed should get out of the way, and nobody waits to watch it go.
- Feedback for an action (a press, a toggle, a check) starts within a frame and takes 100ms or less, so the control feels like it answered the hand.
- Nothing over 300ms answers a click. `duration-500` and longer are for loops and large page-level changes only.

**Easing.** Most of what makes motion feel smooth is its curve. Enter with `ease-enter`, leave with `ease-exit`, change in place with `ease-move`, and arrive at a new value with `ease-settle`. Pop small things into place with `ease-pop`, and let a press go with `ease-spring`. Spinners and progress bars turn at constant speed (`ease-linear`). Steps (`steps()`, `step-end`) are for ticking spinners.

- **Exits ease out too.** A closed surface should be mostly gone in the first frames, because that is when the eye is on it. An ease-in spends those frames barely moving and saves its speed for the end, when nobody is watching any more. So `ease-exit` is the same strong ease-out as `ease-enter`, over the shorter exit duration. Something the hand sends off the screen, like a toast swiped away, carries on with `ease-fling`.
- **Strength.** The ease-out roles differ in how much of their travel they do at the start: `ease-fling` is gentle, `ease-enter` firm and `ease-settle` hard. A stronger curve makes the same duration feel quicker and smoother, so surfaces enter with `ease-enter` and values arrive with `ease-settle`.
- **Overshoot.** `ease-pop` passes the end by about 4% and comes back; keep it for small things (a check, a dot, a count), never a dialog or a page.
- **Elastic.** `ease-celebrate` wobbles: it overshoots by about 37%, swings back and settles over a few bounces. It's delightful once and tiring the tenth time, so it has rules of its own. Use it for a small thing at a rare, good moment: a success check landing, a count bumping, an item dropped into its slot, a first-run hint arriving. Give it `motion-change-lg` or longer so the wobble reads. Never use it for surfaces (menus, popovers, dialogs, drawers), for page or layout moves, for hover or press, or for anything people do over and over. Animate `scale` or `translate`, not size. Under reduced motion it's off, like every overshoot.
- **Springs.** `ease-spring` and `ease-celebrate` are damped springs written as CSS `linear()`, generated by `tools/tokens/spring.mjs` (damping ratio 0.6 and 0.3). A spring settles in the duration you give it, so give it about twice the motion it answers: a press held for `motion-press` springs back over `motion-change-md`. Browsers without `linear()` (before Chrome 113, Safari 17.2, Firefox 112) use their default `ease`, which still arrives.
- **Fling.** What the hand lets go of mid-motion (a drawer swiped, a carousel flicked) carries on at the hand's speed and slows to rest, instead of jumping to a speed of its own. The speed is the pointer's over its last 100ms, and the settle runs on `ease-fling` for 3 × distance ÷ speed, since that curve starts at three times its average speed (between 150 and 400ms).
- **Interruptible.** Animate opening and closing with transitions, not keyframes. A transition turns around from where it is when the state flips half way (a menu closed while it opens), where a keyframe animation jumps to its start. The overlays enter from `@starting-style` for this reason.

**Sequencing.** Animate one thing at a time where you can. When a group must arrive together, as with a page's first list of results or a loader's dots, stagger them by `motion-stagger` (50ms) and cap the wait at `motion-stagger-limit` (300ms), so items past the sixth arrive together. Stagger only a group seen now and then: never a menu's items or a stack of toasts, which people open over and over and would wait for every time. The `stagger` utility does this: put it on the parent, and each child gets `animation-delay` and `--srp-stagger-delay` (for a transition of your own) from its place, with `sibling-index()` where the browser has it. A surface's content appears with it, never after it. Hover and focus changes start at once (no delay). Tooltips wait 400ms before showing (their `delay` prop), so passing the pointer over a toolbar doesn't flash them.

**Layout changes.** When things move to a new place (a list reordered or filtered, a card expanded, a grid switched to a list), let them glide there instead of jumping: run the change inside `withViewTransition(() => …)` and mark what should travel with `view-transition-name`, or the `view-transition-match` class, which names each element after itself. The browser does the measuring (FLIP), off the main thread, over `motion-change-md` with `ease-move` (set for every View Transition in `base.css`). Under reduced motion nothing travels; the old and new states crossfade. Where View Transitions are missing the change just happens. `view-transition-none` keeps an element out of it.

Two kinds of layout change get a direction:

- **Open in place.** When a list item opens into its own view (a message, an order, a file), give the item's title and the new view's heading the same `view-transition-name`, only while that item is the open one, so the title is seen to travel to its place and back again on close. Return focus to the item on close. The ListDetail pattern does this on a phone.
- **Steps.** When a flow moves between steps (an import, a checkout, a setup wizard), give the panel that changes a `view-transition-name` and `view-transition-class: step`, and run the change with `withViewTransition(update, { types: ['forward'] })`, or `['back']` for Back. The next step comes in from the end and the one before from the start, mirrored right to left, over `motion-enter-md` and `motion-exit-md` (the rules are in `base.css`). Starting over goes forward: it is a new run, not a return. The DataImport pattern does this.

**Motion you run from JavaScript.** CSS transitions and animations follow reduced motion through these tokens on their own. A smooth scroll, a count going up or anything else you move from a script doesn't, so check `useReducedMotion()` first and jump straight to the end when it's true (Guides › Hooks and helpers has an example).

**Performance.** Animate `opacity`, `transform`, `translate`, `scale` and `rotate`, which the compositor runs without laying the page out again. Animate colors only on small controls. Never animate `width`, `height`, `top`, `left`, margins or padding, and avoid `transition-all`, which animates them too. The one exception is a disclosure panel's height (Accordion), where a jump of everything below reads as a glitch: one panel, only while it moves, never under reduced motion.

**Reduced motion.** When the viewer prefers reduced motion (`prefers-reduced-motion: reduce`), surfaces appear and leave with a fade or not at all, with no sliding or scaling. Loops stop moving: the components' spinners stand still and breathe (opacity) over twice `motion-loop-spinner`, so progress still shows, because a spinner that stops completely reads as stuck; the `animate-spin` utility turns three times slower (`animate-spin-reduced`). `bundle.css` stops `ping` and `pulse`, slows `spin`, turns `animate-enter` into a plain fade and drops the `stagger` delays. Every component's own animations do the same, and yours should too.

**An app's own "Reduce motion" setting.** Put `data-motion="reduce"` on `<html>` and everything gets exactly what the system setting gives: the same fades, still spinners and instant moves, in the components, `base.css` and the utilities. Use it for a "Reduce motion" switch in your app's settings, for people who want less motion in your app without changing it for their whole device. On a section, it reduces motion inside that section. It only ever reduces: there is no attribute that brings motion back when the system asks for less. Save the choice with the rest of the person's settings and set the attribute before the first paint. In JavaScript, `useReducedMotion()` follows both, and `prefersReducedMotion(el)` answers once, for an event handler.

**Scales.** These are what the duration roles point at, and what utility classes use.

- **Duration:** `duration-0`, `75`, `100`, `150`, `200`, `300`, `500`, `700`, `1000`, `1200` (ms).
- **Easing:** no scale: the roles above (`ease-enter` to `ease-celebrate`) and `ease-linear` are every easing token and `ease-*` class. 15.x had a scale of raw curves too (`ease-in-out`, `ease-out-quart`, `ease-spring-snappy` and the rest); 16.0.0 removed them, and `serupa-migrate` moves each to the role with its curve.
- **Delay:** `delay-0` to `delay-1000`, in the same steps as duration, plus `delay-50` for a stagger step.

**Transition properties**: `transition` (the default set: colors, outline and gradient stops, opacity, shadow, transform and translate/scale/rotate, filters, and discrete properties like `display`), `transition-colors`, `transition-opacity`, `transition-shadow`, `transition-transform`, `transition-all`, `transition-none`. Each animates at `duration-150` with `ease-move` unless a `duration-*` or `ease-*` class says otherwise, whatever the class order; `duration-initial` and `ease-initial` go back to those defaults. Name the properties you animate; avoid `transition-all` in components because it also animates layout.

**Transition behavior**: `transition-normal`, `transition-discrete`. `transition-discrete` lets `display`, `visibility` and other discrete properties take part, for fading an element in from `hidden`.

**Animations**

| Token | Value | Use |
| --- | --- | --- |
| `animate-spin` | `spin 1s linear infinite` | Turning things: refresh icons, simple spinners. (The Loader component has its own, livelier ring.) |
| `animate-ping` | `ping 1s cubic-bezier(0, 0, 0.2, 1) infinite` | A radar ping behind a notification dot or live badge. |
| `animate-pulse` | `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` | Skeleton placeholders while content loads. |
| `animate-enter` | `enter` over `motion-enter-md` with `ease-enter` | Content arriving: it fades in as it rises 8px into place. With `stagger` on the parent, the items arrive one after another. Under reduced motion it only fades. |
| `animate-none` | `none` | Turns an animation off. |

The `spin`, `ping`, `pulse`, `enter` and `fade-in` keyframes ship in `bundle.css`.

```html
<ul class="stagger">
  <li class="animate-enter">Arrives first</li>
  <li class="animate-enter">50ms later</li>
  <li class="animate-enter">100ms later</li>
</ul>
```

## SVG

SVG utilities, as classes in `bundle.css`. Colors come from the palette and alias tokens; stroke widths are the `stroke-width-*` tokens in the `borders` group.

| Property | Classes | Tokens |
| --- | --- | --- |
| fill | `fill-<color>` for every role, white and black, `fill-none` `fill-current` `fill-inherit` `fill-transparent` | color tokens |
| stroke | `stroke-<color>`, `stroke-none` `stroke-current` `stroke-inherit` `stroke-transparent` | color tokens |
| stroke-width | `stroke-0` `stroke-1` `stroke-2` `stroke-3` `stroke-4` (in the SVG's own units, so they scale with the drawing) | `stroke-width-*` |

Rules of thumb:

- Inline icons and logos: `fill-current` (or `stroke-current` for outline art) so they take the text color, then color the parent with `text-*` aliases. That keeps them in step with the theme.
- Use role colors (`fill-primary`, `stroke-border`, `fill-success`) for meaning; for a palette color in an illustration, use its token in the SVG (`fill="var(--blue-500)"`).
- Outline drawings: `fill-none stroke-current stroke-2`. Because the width is in the SVG's units, a 24-unit icon drawn at 48px gets a 4px line; add `vector-effect="non-scaling-stroke"` on the shapes for a fixed width.
- The system's icons (Material Symbols and custom icons) already fill with `currentColor`: color them with `text-*` on the icon or its parent.

## States

Every interactive component moves through the same eight states, in this order of precedence (a later one wins):

| State | When | How it looks | Tokens |
| --- | --- | --- | --- |
| Rest | Nothing is happening | The component's own colors | — |
| Hover | A pointer is over it (`:hover`, only on devices that hover) | A neutral fill (`secondary`, `surface-hover` or `highlight`), or darker text | `secondary`, `surface-hover`, `highlight` |
| Pressed | It's held down (`:active`, or Space and Enter on a Button) | One step past hover, as a color, never a shrink: `pressed` for rows, tabs, days and page buttons; `primary-pressed`, `primary-subtle-pressed`, `secondary-hover` and `danger-pressed` for buttons; `field-border-pressed` and `border-control-pressed` for checkboxes, radios and switches; a wash of the text color over a linked card. A shrink is hard to see under a finger and reads as a glitch on a small control, so only Slider's thumb changes size, growing while it's dragged | `pressed`, `primary-pressed`, `danger-pressed`, the `…-bg-pressed` component tokens |
| Focus | Keyboard focus (`:focus-visible`) | A 2px `focus-ring` outline, 2px out (inset where the box clips it) | `focus-ring`, `focus-ring-width`, `focus-ring-offset` |
| Selected | It's the current choice (`aria-selected`, `aria-current`, `aria-checked`, `aria-pressed`) | `primary` fill or indicator, or `highlight` for the current page in a list | `primary`, `on-primary`, `highlight` |
| Dragged | It's being moved, by pointer or by keyboard (SortableList, Kanban) | Lifted to level 2: a `primary` border and the `elevation-raised` shadow, a `grabbing` cursor; a `Highlight` outline in forced colors | `primary`, `elevation-raised` |
| Disabled | It can't be used (`disabled`, `aria-disabled`) | Neutral colors at full opacity: `disabled-text` for labels and marks (at least 3:1 on every surface), `disabled-surface` for a fill, `disabled-border` for an edge; a `not-allowed` cursor and no hover or pressed | `disabled-text`, `disabled-surface`, `disabled-border` |
| Invalid | Its value is wrong (`aria-invalid`) | A `danger` border or edge, with a danger focus ring; the fill stays, so on and off still read correctly | `danger`, `danger-text` |

Focus shows on top of every other state, and disabled turns hover and pressed off. A component's README lists its own values under "States".

## Interactivity

Interactivity utilities, as classes in `bundle.css`. Colors are the role colors, `scroll-m-*` and `scroll-p-*` use the spacing scale, `state-layer` uses the `opacity-state-*` tokens, and the rest are keywords.

| Property | Classes |
| --- | --- |
| accent-color | `accent-<color>` for every role, white and black, `accent-auto` `accent-inherit` `accent-current` `accent-transparent` |
| appearance | `appearance-none` `appearance-auto` |
| caret-color | `caret-<color>`, `caret-inherit` `caret-current` `caret-transparent` |
| color-scheme | `scheme-normal` `scheme-light` `scheme-dark` `scheme-light-dark` `scheme-only-light` `scheme-only-dark` |
| cursor | `cursor-auto` `-default` `-pointer` `-wait` `-text` `-move` `-help` `-not-allowed` `-none` `-context-menu` `-progress` `-cell` `-crosshair` `-vertical-text` `-alias` `-copy` `-no-drop` `-grab` `-grabbing` `-all-scroll` `-col-resize` `-row-resize` `-n-resize` `-e-resize` `-s-resize` `-w-resize` `-ne-resize` `-nw-resize` `-se-resize` `-sw-resize` `-ew-resize` `-ns-resize` `-nesw-resize` `-nwse-resize` `-zoom-in` `-zoom-out` |
| field-sizing | `field-sizing-fixed` `field-sizing-content` (inputs and textareas that grow with their content) |
| pointer-events | `pointer-events-auto` `pointer-events-none` |
| resize | `resize` `resize-x` `resize-y` `resize-none` |
| scroll-behavior | `scroll-smooth` `scroll-auto` |
| scrollbar-color | `scrollbar-thumb-<color>` and `scrollbar-track-<color>` (set both; the other defaults to transparent) |
| scrollbar-width | `scrollbar-auto` `scrollbar-thin` `scrollbar-none` |
| scrollbar-gutter | `scrollbar-gutter-auto` `scrollbar-gutter-stable` `scrollbar-gutter-both` |
| scroll-margin | `scroll-m-<step>` and sides `scroll-mx-` `-ms-` `-me-` `-mt-` for every spacing step |
| scroll-padding | `scroll-p-<step>` and sides `scroll-px-` `-ps-` `-pe-` `-pt-` |
| scroll-snap-align | `snap-start` `snap-end` `snap-center` `snap-align-none` |
| scroll-snap-stop | `snap-normal` `snap-always` |
| scroll-snap-type | `snap-x` `snap-y` `snap-both` `snap-none`, with `snap-mandatory` or `snap-proximity` (default) |
| state-layer | `state-layer`: the element's text color over its own background at `opacity-state-hover` (8%) on hover, `opacity-state-pressed` (12%) while pressed and `opacity-state-dragged` (16%) with `data-state="dragging"`, under its content; nothing when disabled or in forced colors |
| touch-action | `touch-auto` `touch-none` `touch-manipulation`, `touch-pan-x` `-pan-left` `-pan-right` `-pan-y` `-pan-up` `-pan-down` `-pinch-zoom` (these combine) |
| user-select | `select-none` `select-text` `select-all` `select-auto` |
| will-change | `will-change-auto` `-scroll` `-contents` `-transform` |

Rules of thumb:

- Cursors: the components read four tokens, `--cursor-interactive` (`pointer`), `--cursor-disabled` (`not-allowed`), `--cursor-grab` and `--cursor-grabbing`, so one line on `:root` changes them everywhere (`--cursor-interactive: default` for a desktop-app feel). Write `var(--cursor-interactive)` in your own CSS too: the `serupa/no-raw-cursor` stylelint rule warns about the written-out keywords. `cursor-pointer` on anything clickable that isn't a link (Button does this), `cursor-not-allowed` when disabled, `cursor-progress` while loading, `cursor-grab`/`cursor-grabbing` on draggable items, `cursor-text` on editable areas.
- Form controls: `accent-primary` makes checkboxes, radios, range sliders and progress bars match the theme; `caret-primary` colors the text cursor. Use `appearance-none` only when you redraw the control yourself, and keep its focus style.
- `state-layer` gives the system's hover, pressed and dragged states to a surface whose color serupa doesn't know: a tile in a category color, a brand panel, a row tinted by data. Put it on the clickable element itself; its text color sets the tint, so check that text against the background as usual. Components keep their own tuned hover colors.
- Dark themes: put `scheme-dark` on the root (or `scheme-light-dark`) so native scrollbars, inputs and date pickers turn dark too.
- `field-sizing-content` for comment boxes and tag inputs that should grow as people type; give them a `max-h-*`.
- Anchors under a sticky header: `scroll-mt-16` on the targets (or `scroll-pt-16` on the scrolling container) so the header doesn't cover them. Pair `scroll-smooth` with reduced-motion handling.
- Carousels: `snap-x snap-mandatory` on the track and `snap-start` (or `snap-center`) on each slide; `scrollbar-none` only if there are other controls.
- Scrollbars: `scrollbar-thin scrollbar-thumb-border-strong scrollbar-track-transparent` in dense panels; `scrollbar-gutter-stable` stops layouts from jumping when content starts to scroll.
- `pointer-events-none` on decorative overlays and icons inside inputs; never on something that should be reachable by keyboard, since it doesn't stop focus.
- `select-none` on drag handles and buttons, `select-all` on codes and IDs people copy. The components do the same: a double-click on a button, a menu item, a tag you pick, or the label of a checkbox, radio or switch highlights no words, while field labels, cells and other text stay selectable.
- `touch-manipulation` on buttons removes the double-tap zoom delay; `touch-none` on canvases and sliders that handle gestures themselves.
- Use `will-change-transform` only while an animation runs, then remove it.

## Content and voice

How the words in a product built with the system should read: buttons, labels, hints, errors, empty states, confirmations and the words the components say on their own. Write plainly, for someone who is busy and may be using a screen reader, a translation tool or a small screen. Each example has its Indonesian beside the English: the same rules hold in both, and In Indonesian, at the end, adds the ones only Indonesian needs.

**Voice**

- Plain and direct. Short sentences, everyday words, one idea per sentence.
- Say "you" to the person and talk about what they can do, not about the system.
- No "please", no "sorry" for routine things, no exclamation marks, no jokes in errors.
- Never blame the person. "That date is before the start date", not "You entered an invalid date".
- Point to things by their name, never by shape, color, position or sound alone: "Select Save", not "Select the button below"; "Check the start date", not "Fix the red field". Someone using a screen reader, a zoomed screen or a different layout can't see "below" or "red" (WCAG 1.3.3).
- Leave out words that tell the reader something should be quick for them: "simply", "just", "obviously", "of course", "easy". When it isn't quick for them, the word makes them feel slow; when it is, the word adds nothing. "Add an email address", not "Just add an email address".
- Leave out "your" and "my" where the page already says whose it is: "Favorites", "Settings", not "My favorites", "Your settings". Keep them only where two people's things meet, such as "Your files" beside "Shared with you".
- Use plain, neutral terms: "allow list" and "block list", not "whitelist" and "blacklist"; "main" and "replica" (or "primary" and "secondary"), not "master" and "slave".

**Tone for the moment**

The voice stays the same; the tone moves with what just happened to the person.

| Moment | Tone | English | Indonesian |
| --- | --- | --- | --- |
| A routine thing worked | Brief, done | Changes saved | Perubahan disimpan |
| Something is under way | What's happening, with … | Saving… | Menyimpan… |
| A mistake the person can fix | Calm, says how | Enter a password with at least 12 characters | Masukkan kata sandi minimal 12 karakter |
| A failure they can't fix | Honest, says what happens next | We couldn't reach the server. Your changes are kept and will be sent when you're back online. | Server tidak dapat dihubungi. Perubahan Anda tetap tersimpan dan akan dikirim saat Anda kembali online. |
| Something that can't be undone | Plain, names what's lost | Delete 3 files? This can't be undone. | Hapus 3 file? Tindakan ini tidak dapat dibatalkan. |
| A first visit, nothing here yet | Inviting, one next step | Add your first customer | Tambahkan pelanggan pertama Anda |

**Words to use**

One word for one act, so a form reads in one voice and someone using voice control can say what they see. The components' own words follow this list, in both languages.

| Use | Not | Indonesian | For |
| --- | --- | --- | --- |
| choose | pick, select | pilih | taking one or more options from a set: "Choose a date", "Pilih tanggal" |
| select | click, tap, press | pilih (not "klik", "ketuk") | acting on a control whatever the input: "Select Save". Also for selecting items or text to act on them: "Select all rows", "Pilih semua baris" |
| enter | type, input, fill in | masukkan (not "ketik", "isi") | putting a value in a field: "Enter your email", "Masukkan email Anda" |
| sign in, sign out | log in, login, log out | masuk, keluar | starting and ending a session: "Sign in", "Masuk" |
| remove | delete | hapus, keluarkan | taking something out of a list or a field, when the thing itself stays: a Badge's remove button, "Hapus Desain" |
| delete | remove | hapus | destroying the thing itself, usually after a confirmation: "Delete project", "Hapus proyek" |

**Capitalization and punctuation**

- Sentence case everywhere: titles, buttons, labels, menu items, tabs and column headings. "Save changes", not "Save Changes". Proper nouns keep their capitals.
- No full stop on a label, button, heading or single-line hint. Use one when a message has more than one sentence, and on Alert and Toast bodies.
- The ellipsis character (…), not three dots. Use it for something in progress ("Loading…", "Saving…") and on a menu item or button that asks for more before it acts ("Rename…").
- Avoid ampersands, slashes and abbreviations people have to decode: "and", "or", "for example".
- American spelling, as the tokens, props and CSS already spell it: color, center, behavior, organization, neighbor. One spelling keeps the docs in one voice, and a search for "color" finds every page about it.

**Buttons and links**

- Start with a verb that says what happens: "Save", "Send invite", "Delete project". Avoid "OK", "Yes", "Submit" and "Click here".
- Use the same verb in the title and the button: a dialog titled "Delete project?" has a "Delete" button, not "Confirm".
- A link says where it goes: "Billing settings", not "Learn more" on its own. If several links on a page would read the same, give each a distinct name.
- Icon-only buttons need a name (`aria-label`) that is the same verb you'd write on a text button.

| What it does | Write | Indonesian | Not |
| --- | --- | --- | --- |
| Keeps a form's changes | Save changes | Simpan perubahan | OK, Submit, Kirim formulir |
| Sends something to someone | Send invite | Kirim undangan | Submit, Lanjutkan |
| Destroys the thing | Delete project | Hapus proyek | Yes, Ya, Confirm, Konfirmasi |
| Leaves without changing anything | Cancel | Batal | No, Tidak, Close |
| Asks for more before it acts | Rename… | Ganti nama… | Rename (when a dialog follows) |
| Tries a failed thing again | Try again | Coba lagi | Retry?, Ulangi? |
| Brings a file in or out | Upload file, Download report | Unggah file, Unduh laporan | Upload, Download (alone, when it isn't clear what) |
| Opens another page | Billing settings | Pengaturan tagihan | Learn more, Selengkapnya, Click here, Klik di sini |

**Labels and hints**

- A field label is a noun phrase: "Email", "Start date", "Project name". Don't use the placeholder as the label; it disappears as soon as someone types.
- A hint says what's expected before someone gets it wrong: "At least 12 characters", "As shown on your ID".
- Mark both kinds of field: a `*` on each required one (Field's `required`) and "(optional)" on each optional one (Field's `optional`), and say once before the form what the `*` means. People skim past a note at the top, so each field says what it is.

**Errors**

Say what happened and how to fix it, in that order, next to the thing that needs fixing.

| Instead of | Write | Indonesian |
| --- | --- | --- |
| Invalid input | Enter a date after 1 Jan 2026 | Masukkan tanggal setelah 1 Jan 2026 |
| Error 413 | report.pdf is larger than 10 MB | report.pdf lebih dari 10 MB |
| This field is required | Enter your email | Masukkan email Anda |
| Something went wrong | We couldn't save your changes. Try again. | Perubahan Anda tidak dapat disimpan. Coba lagi. |
| photo.heic: this type of file isn’t accepted. | photo.heic isn’t a PNG or JPG. | photo.heic bukan PNG atau JPG. |
| Passwords do not match | Enter the same password in both fields | Masukkan kata sandi yang sama di kedua kolom |
| Username already exists | That username is taken. Try another. | Nama pengguna itu sudah dipakai. Coba yang lain. |

In Indonesian, "Kolom ini wajib diisi" and "Terjadi kesalahan" are the same mistakes as "This field is required" and "Something went wrong": say what to enter or what failed.

- Put a field's error in Field's `error`, so it's tied to the control and read with it.
- If nothing the person does will fix it, say so and say what happens next: "We couldn't reach the server. Your changes are kept and will be sent when you're back online."
- Don't show an error while someone is still typing. Check on blur or on submit.

**Empty states and confirmations**

- An empty state says what will be here and how to add the first one: "No projects yet" and a "Create project" button.
- A confirmation names the thing and the consequence: "Delete Website redesign? Its 12 tasks are deleted too." Keep destructive confirmations for actions that can't be undone; for the rest, act and offer Undo in a Toast.

| Where | English | Indonesian |
| --- | --- | --- |
| Empty list, first visit | No projects yet. Create project | Belum ada proyek. Buat proyek |
| Empty search or filter | No results for "laporan". Clear filters | Tidak ada hasil untuk "laporan". Hapus filter |
| Nothing left to do | No new notifications | Tidak ada notifikasi baru |
| Confirm, title | Delete Website redesign? | Hapus Website redesign? |
| Confirm, body | Its 12 tasks are deleted too. This can't be undone. | 12 tugas di dalamnya juga akan terhapus. Tindakan ini tidak dapat dibatalkan. |
| Confirm, buttons | Delete, Cancel | Hapus, Batal |
| Unsaved changes | Discard changes? Your edits to this page haven't been saved. Discard, Keep editing | Buang perubahan? Perubahan di halaman ini belum disimpan. Buang, Lanjut mengedit |
| Undo instead of confirming | Project archived. Undo | Proyek diarsipkan. Urungkan |

A confirmation's title asks with the verb on its button, in both languages: "Hapus Website redesign?" has a "Hapus" button, not "Ya" or "OK".

**Numbers, dates and units**

The Data formats page has the full rules, with money, missing values and masked values.

- Let the locale write them. `SerupaProvider`'s `locale` sets how the date and time components show and read dates; use `Intl.NumberFormat` and `Intl.DateTimeFormat` with the same locale for your own text.
- In English, write dates with the month as a word, "24 Oct 2026", so they can't be read as day-month or month-day. Use relative dates ("2 hours ago", "Yesterday") only where the exact time doesn't matter, and give the exact one in a tooltip or title.
- Numerals for every number, "3 files", not "three files". Group thousands ("12,400").
- A space between a number and its unit, "12 MB", "30 s", except % and °. `formatFileSize()` writes file sizes this way.
- Ranges with an en dash and no spaces: "1–5", "Mon–Fri".

**The words the components say**

Close buttons, loading text, pagination and the other built-in words come from one set, below. `<SerupaProvider labels>` replaces any of them for a subtree, and each component's own prop (`closeLabel`, `dismissLabel`, `loadingLabel`, …) still wins for one instance. `idLabels` is the full Indonesian set. `labels` and `icons` can be written inline (`labels={{ close: "Tutup" }}`): a re-render with the same contents doesn't re-render the components under the provider.

- Overlays close with "Close" (Dialog, Drawer); notices go away with "Dismiss" (Alert, Toast).
- Loading is "Loading…" everywhere; give a specific one when you can: `loadingLabel="Saving…"`.
- When you change one, keep the patterns above: a verb for a button, sentence case, no full stop.

**In Indonesian**

`idLabels` and any Indonesian copy follow the rules above, and these as well.

- **Anda, not kamu.** Address the person as "Anda", with a capital A wherever it falls in the sentence ("Zona waktu Anda"). A button or a hint needs neither: the plain verb says it ("Simpan", "Pilih file"). Don't switch to "kamu" for a casual product. A product with that voice changes the labels through `<SerupaProvider labels>`, every one of them, so the two never mix on one screen.
- **Buttons are the base verb:** "Simpan", "Kirim", "Hapus", "Coba lagi". The me- form is for something under way, with the ellipsis: "Menyimpan…", "Memuat…". A done thing takes di-: "3 dihapus", "Disalin".
- **No "silakan", "mohon" or "maaf"** in the words the components say, as no "please" or "sorry" in English.
- **Loanwords.** Use the Indonesian word people already use on their phones and computers: "unduh", "unggah", "kata sandi", "salin", "pengaturan", "pencarian". Keep the loanword where it is the everyday word and the Indonesian one would make people stop: "file", "email", "online", "offline", "slide", "filter". Pick one word for each thing and use it everywhere: "file", not "file" in one place and "berkas" in another; "pilihan", not "pilihan" and "opsi". Loanwords aren't set in italics in an interface, and Indonesian affixes don't go on English words ("mengunggah", not "meng-upload").
- **Plurals.** A number already says there's more than one, so the noun stays as it is: "3 file", "12 pesan baru", never "3 file-file". `plural()` takes the same form for one and many.
- **Dates and times.** Day, month, year, with no comma: "24 Okt 2026" or "24 Oktober 2026". Times use a full stop, "14.30", as `Intl.DateTimeFormat` writes for `id-ID`. Let the locale write both.
- **Numbers and money.** A full stop groups thousands and a comma marks decimals: "12.400", "2,5 MB". Rupiah goes before the amount, and whole rupiah need no ",00": "Rp 12.400" (`maximumFractionDigits: 0`). Let `Intl.NumberFormat` with `id-ID` write them; never build one by hand from the English form.
- **Ranges.** In a sentence write "sampai" ("3 sampai 12"); in a short label use an en dash with no spaces ("1–5"), as in English.

## Data formats

How values read on a screen: numbers, money, dates, values that are missing and values that are partly hidden. One app writes each kind one way everywhere, and the reader's locale decides the marks, so "Rp 1.200.000" and "IDR 1,200,000.00" never meet on the same page. Content and voice covers the words around them.

**Numbers**

| Value | Write it | With |
| --- | --- | --- |
| A count or a measurement | Grouped digits, as the locale groups them: "12,400" in English, "12.400" in Indonesian | `FormattedNumber`, `formatNumber()` |
| A large count where the exact figure doesn't matter at a glance | Short, "1.2M", with the full number in its tooltip | `format="compact"` |
| A share | A percentage, with as many decimals as the decision needs and no more: "46%", "12.3%" | `format="percent"` |
| A change | Its sign, and its direction in words where color shows it too: "+3.1%", "Up 12%" | `options={{ signDisplay: "always" }}` |
| A measurement with a unit | A space before the unit, except % and °: "12 MB", "50 km/h" | `format="unit"`, `format="bytes"`, `formatFileSize()` |
| Progress through a set | Both numbers: "12 of 30" in a sentence, "12/30" in a tight label | `plural()` for the words |
| A code that only looks like a number (an order number, a phone number, a postcode) | As it is, never grouped | plain text |

- In a table, a column of numbers aligns to the end with tabular digits (`align="end"` on its cells and its header), so the digits line up and two rows compare at a glance. Text columns align to the start.
- Give every number in a column the same number of decimals.
- Round for reading and keep the exact value where someone can reach it: a tooltip, the detail page or the export.

**Money**

- The amount and its currency always go together. With one currency in the app, the symbol is enough ("Rp 12.400", "$19.99"). When two or more can appear, write the code so "$" can't be read as the wrong dollar ("US$19.99", or "USD 19.99" with `options={{ currencyDisplay: "code" }}`).
- The currency sets the decimals: two for dollars, none for rupiah or yen. `format="currency"` knows; don't add ",00" by hand.
- A total is exact. Shorten ("Rp 1,2 jt") only on a chart axis or a summary tile, with the exact amount one step away.
- Negative amounts take a minus sign, and say what they are in words: "Refund −Rp 50.000". Never color alone.

**Dates and times**

| Value | Write it | With |
| --- | --- | --- |
| A day | The month as a word, so it can't be read two ways: "24 Oct 2026" | `FormattedDate`, `formatDate()` |
| A day and a time | The locale's own order and clock, 12 or 24 hours: "24 Oct 2026, 14:30" | `timeStyle="short"` |
| A time people must match across places | The time zone with it: "14:30 WIB", "9:00 AM GMT+7" | `options={{ timeZoneName: "short" }}` with the parts, or `timeStyle="long"` |
| A range | An en dash, with spaces only when either side has one: "1–5 Oct", "24 Oct 2026 – 3 Jan 2027" | `to` |
| Something recent, where how long ago matters more than when | Words, then the date after a week: "3 minutes ago", "Yesterday", "24 Oct 2026" | `RelativeTime` |
| Time left until a deadline | A count that runs down | `Countdown` |

- Use relative time for activity (a comment, a notification, "last saved") and the exact date for anything people look up, compare or act on by date: an invoice, a deadline, a booking, a log.
- A relative time always carries the exact one: RelativeTime puts it in the tooltip. Where the exact time matters, show it as text.
- Never write a date as numbers alone ("03/04/2026") or to a fixed pattern (`YYYY-MM-DD`) in the interface. Keep that pattern for exports, file names and the `datetime` attribute.
- Send and store dates with their offset (ISO 8601 with `Z` or `+07:00`) and format them in the reader's zone on the screen.

**Missing values**

- A value that isn't there shows an em dash (`—`), never an empty cell: an empty cell reads as "still loading" or "nothing went wrong", and a screen reader says nothing at all. Give it words for screen readers ("Not set", "No data"), with `VisuallyHidden` beside a dash that has `aria-hidden`.
- Zero is a value. Write "0", not a dash.
- Say why when the reason matters: "Not set" (nobody entered it), "Not applicable", "No access". A dash can't tell them apart.
- While a value loads, show a skeleton in its place (`<Skeleton>`), not a dash that later turns into a number.

**Hidden and partly hidden values**

Mask what a passer-by, a screenshot or a shared screen shouldn't show. Keep just enough for the owner to recognize it.

| Value | Keep | Example |
| --- | --- | --- |
| A card or account number | The last four digits | •••• 1208 |
| A phone number | The country code and the last three or four | +62 ••• ••• 402 |
| An email address | The first character and the domain | a•••@example.com |
| A name | The first character of each part | A••• W••• |
| A national id or tax number | The last four | •••• •••• •••• 2233 |
| A key, a token or a one-time code | Its first few characters, or nothing | sk_live_•••• |
| An amount people chose to hide | Nothing | •••••• |

- Use the bullet "•", not an asterisk, and a fixed number of them: the count shouldn't give away the length.
- Say what's hidden in words for screen readers ("Card ending in 1208"), since a row of bullets is read as "bullet bullet bullet" or skipped.
- A Show button reveals it for the person who owns it, says "Show" or "Hide" with what it acts on ("Show card number") and hides it again when they leave the page. Don't reveal on hover.
- Mask on the server when the reader isn't allowed to see the value. Masking in the browser only hides it from people looking at the screen.

## Ethical design

A product built with the system asks for people's time, money and data honestly. Each choice is one the person makes for themselves, with what it costs in plain sight, and a "no" counts as much as a "yes". These rules sit beside Content and voice and Accessibility: a page can pass WCAG and still push someone into a choice they didn't mean to make.

**Choices of equal weight**

- Two answers to one question look alike: the same kind of button, side by side, in the same words ("Accept analytics cookies", "Reject analytics cookies"). Neither is a link, a paler color or one more step away. ConsentBanner works this way.
- A recommended option says so in words ("Recommended"), and the others stay as clear to see and to choose.
- A safe default (staying signed in, keeping a draft) can be the main button. A choice that earns the product money or data can't be the only one that looks like a button.

**No confirmshaming**

- The way out starts with a verb that says what it does, as any button does: "Skip", "Keep my current plan", "Close offer". Never "No, I don't want to save money" or "I prefer to pay full price".
- No guilt, no sad faces, no "Are you sure you want to miss out?".

**Nothing extra ticked for them**

- Extras are off until the person turns them on: newsletters, add-ons, insurance, a tip, sharing with partners. A Checkbox or Switch for one of them starts unchecked.
- Agreeing to the terms and agreeing to marketing are separate questions. Never fold one into the other.
- The cheapest way to get what they came for is the default (standard delivery, monthly billing, the plan they're on), unless they choose otherwise.

**Leaving takes no more than joining**

- Canceling, unsubscribing, deleting an account or turning notifications off takes no more steps than signing up or turning them on, and happens in the product, not by phone or email.
- Say when a plan renews and what it will cost before someone chooses it, and how to cancel.
- One confirmation is enough. No offer screens between the person and the button they asked for, and no "Contact us to cancel".

**Honest time and numbers**

- A timer counts down to something real, such as a session ending or a code expiring, and says what happens at zero. No timers that start again on reload, and no "offer ends in 10:00" that never ends.
- Scarcity and popularity are true, current and checkable: "3 left" only when there are 3, "Popular with teams" only when it is.
- The price shown is the price paid. Delivery, fees and taxes show before the last step, and the total on the button or next to it is the total charged.
- Counts are true counts: an unread badge counts things the person hasn't seen, never a made-up nudge to come back.

**Their data, their call**

- Ask for data when it's needed and say why ("For the receipt and the delivery updates"). Mark what's optional.
- Keep only what the feature needs, for as long as it needs it, and say what's kept in the browser (SECURITY.md lists what the components store).

When a pattern breaks one of these, the fix is in the pattern, not in the words around it.

## Accessibility standard

The target is **WCAG 2.2 level AA**, in every theme, at any zoom up to 400%, with a keyboard, a screen reader, a touch screen, and in forced-colors (high-contrast) mode. The components meet their share of it; a page meets the rest only if the app does its part. This is who does what.

**What the system guarantees**

- **Contrast.** Text, placeholder, icon, control-border and focus-ring colors meet 4.5:1 or 3:1 in every theme; the foundation check measures every pair on every change. `data-contrast="more"` (or the system's "increase contrast" setting) raises body, muted, placeholder, status and brand-colored text to 7:1.
- **Keyboard.** Every component works with the keys its pattern in the ARIA Authoring Practices expects: Tab into it, arrows inside composite widgets (menus, tabs, lists, calendars), Enter and Space to act, Escape to close. On a phone, the Back gesture or button closes what's open the way Escape does, innermost first: a Menu, Popover, picker list, HoverCard or Tour step, the Navbar's small-screen menu and its NavbarMenu panels, as well as a Dialog or Drawer (modal or not), before it leaves the page. Each README has a Keyboard table.
- **Focus.** Focus is always visible: a 2px ring in the brand color, plus an outline that survives forced colors. Inside a strong fill (`bg-primary`, `bg-danger`, `bg-surface-inverse`) the ring takes the fill's text color, so it still stands out at 3:1; a light surface nested inside such a fill should set `--focus-ring` back itself. Dialogs and drawers move focus in, keep it there, and return it to the button that opened them. Menus and lists return focus to their button when they close.
- **Names, roles and states.** Each component renders the right element or ARIA role and keeps `aria-expanded`, `aria-selected`, `aria-invalid`, `aria-current` and the rest in step. Built-in buttons have names (the words in Content and voice), and Field ties a control to its label, hint and error.
- **Announcements.** Loading, toasts and other status changes are announced through live regions that work inside an open Dialog too. One rule sets how urgent each is: **danger interrupts, everything else waits.** A danger Alert is `role="alert"`, a danger toast and a failed save (SaveStatus) are said at once; info, success, neutral and warning are `role="status"` or polite, and wait for a pause. A warning that must stop people before they act passes `role="alert"` itself.
- **Focus on open and close.** Dialog, Drawer and Popover take the same two props: `initialFocus`, a ref to the element inside that takes focus when it opens, and `finalFocus`, a ref to where focus goes when it closes, used while that element is still on the page (else focus goes back to the trigger).
- **Target size.** Buttons, fields and other sized controls are at least 24px tall (2.5.8), including `sm` and compact density; `lg` is 44px for touch-first screens. On a touch screen, buttons, pages in Pagination, and checkbox, radio, switch and slider rows take a press 44px across whatever their size, without moving anything; between two neighbors side by side the press goes to the nearer one. Buttons in a row keep their full 44px above and below, so where a row wraps, a press between its lines goes to the line below. The items of a menu or menubar, the options of a Combobox, TimePicker, CascadeSelect or MentionInput, and the rows of a TreeView or Sidebar are 44px high on a touch screen. A checkbox, radio or switch takes clicks on its label too; one without a visible label is smaller than 24px, so leave space around it (the spacing exception in 2.5.8).
- **Reflow and zoom.** Components fit a 320px-wide screen and wrap instead of clipping, and sizes are in `rem`, so text zoom works.
- **Fields on iOS.** Safari on iPhone and iPad zooms into a focused field whose text is under 16px. There, Input, Textarea and Select (and the components built on them) draw their own text at 16px at every size, keeping the box height. Don't stop the zoom with `maximum-scale=1` in the viewport tag: it also stops pinch zoom, which WCAG 1.4.4 needs.
- **Motion.** Under `prefers-reduced-motion`, components stop their animations and keep at most a short fade, and `base.css` makes every other transition on the page near-instant. Nothing flashes.
- **Forced colors and RTL.** Borders, focus and selected states stay visible in forced colors, and layouts use logical properties, so right-to-left languages mirror correctly.
- **Dragging.** Anything you can drag also works without dragging (2.5.7): Slider takes arrow keys and clicks on the track, and FileUpload has a Choose button.

These are checked on every change: axe on every Storybook story in every theme, the contrast pairs, and component tests for keyboard, focus, names and announcements.

**What the app must do**

The system can't know your content, your page structure or your flows. For a page to meet WCAG 2.2 AA, the app must:

- **Page.** Set `<html lang>`, a unique `<title>` per page, and landmarks: one `main` (Container `as="main"`), a `nav` per navigation (Navbar and Sidebar render one), a header and a footer. Add a "Skip to content" link.
- **Headings.** One `h1` per page and no skipped levels. Heading's `level` sets the element; its look can differ.
- **Names.** Give every field a visible label (Field), every IconButton a `label`, every meaningful Image `alt` text (and `alt=""` for decoration), and every link text that says where it goes.
- **Errors.** Write errors that say what's wrong and how to fix it, next to the field; on submit, move focus to the first error or a summary. Don't ask people to re-enter what they already gave in the same flow (3.3.7), and don't make sign-in depend on a memory or puzzle test (3.3.8).
- **Color.** Don't use color alone to carry meaning in your own content: charts, status dots and links in text need a second cue.
- **Focus in single-page apps.** After a route change, move focus to the new page's heading or `main`, and announce it. After deleting an item, move focus to the next item or the list.
- **Your own CSS.** Keep the focus ring (never `outline: none` alone), keep targets at 24px, and keep sticky headers from covering the focused element (`scroll-padding-top`).
- **Media and time.** Captions and transcripts for audio and video; a way to pause anything that moves for more than 5 seconds; a warning and a way to extend before a session times out.
- **Help.** Put help links and contact details in the same place on every page (3.2.6).
- **Test.** Use the keyboard alone through each flow, try a screen reader (VoiceOver, NVDA), zoom to 400%, and turn on forced colors. Automated checks find about a third of problems.

## Accessibility

Accessibility utilities, as classes in `bundle.css`. They add no tokens.

| Property | Classes |
| --- | --- |
| forced-color-adjust | `forced-color-adjust-auto` (default: the browser swaps in the viewer's high-contrast colors), `forced-color-adjust-none` (keep this element's own colors) |
| screen-reader only | `sr-only` (hidden on screen, still read aloud), `not-sr-only` (undo it, e.g. on focus) |

**Forced colors** is the high-contrast mode in Windows and some browsers: the viewer picks a small set of system colors and the browser replaces backgrounds, text and borders with them, and drops shadows and background images. The system's alias colors mean nothing there, so design for it:

- Leave `forced-color-adjust-auto` almost everywhere. Use `forced-color-adjust-none` only where the color *is* the content: color swatches and pickers, palette previews, charts with a legend, brand logos.
- Inside a `forced-color-adjust-none` element, add a border or text label so the meaning doesn't rely on color alone.
- Shadows and fills disappear, so anything that is only separated by a shadow or background needs a border too (`border` with a `transparent` color still draws in forced colors).
- Selected, active and current marks: fills and the bars drawn with a shadow disappear, so the components mark these states with an outline in a system color, one recipe each. The option the keyboard is on in a list (`aria-activedescendant`) is a focus mark: `outline: var(--focus-ring-width) solid Highlight` drawn inside the option, so a scrolling list doesn't clip it. A selected row, option or tree item takes `outline: var(--outline-width-2) solid Highlight`, also drawn inside. The current page or place in navigation takes `var(--outline-width-2) solid CanvasText`. Pressed buttons and selected days fill with `Highlight` and `HighlightText` instead. An outline is always sized by an `outline-width` token (or `focus-ring-width`), never a `border-width` one; the `serupa/outline-width-token` lint rule checks it.
- Focus: use outlines (`outline-2 outline-focus-ring`) or `outline-hidden`, never `outline-none` alone, because rings and shadows vanish in forced colors. Button keeps its ring and adds a transparent 2px outline on focus, which only shows in forced colors; its transparent border shows there too.

**Screen-reader text.** Give icon-only controls a name: an `aria-label`, or a `sr-only` span inside the button. For a "Skip to content" link, wrap it in `<VisuallyHidden focusable>`, which hides it until it's tabbed to and then shows it.
