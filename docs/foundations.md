# Foundations

The source of the Foundations pages in Storybook (`docs/foundations/*.mdx` show these sections by heading).

## Color families

| Group | Families | Character |
| --- | --- | --- |
| Neutrals | `slate`, `gray`, `zinc`, `neutral`, `stone` | Cool (slate) through pure (neutral) to warm (stone) greys. Pick **one** per product; the aliases use `zinc`. |
| Warm | `red`, `orange`, `amber`, `yellow` | Errors, warnings, highlights. |
| Greens | `lime`, `green`, `emerald`, `teal` | Success, positive states. |
| Blues | `cyan`, `sky`, `blue`, `indigo` | Links, primary actions, info. |
| Purples & pinks | `violet`, `purple`, `fuchsia`, `pink`, `rose` | Accents, brand flavour. |

## Naming

A color token's name is also its class suffix: `blue-500` is `bg-blue-500` / `text-blue-500` as classes, and `var(--blue-500)` in CSS.

## Using the shades

- **50–200** — tinted backgrounds, hover fills, subtle badges.
- **300–400** — borders, dividers, decorative accents.
- **500–600** — solid fills, primary buttons, icons.
- **700–950** — text, dark surfaces, text on light tints.

## Contrast

Every token's usage note gives its contrast against white or black text. Rules of thumb:

Text on white, and white text on a fill, both reach 4.5:1 at the same shade (the two are the same pair):

- **500+** — the neutrals: `slate`, `gray`, `zinc`, `neutral`, `stone`.
- **600+** — `red`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`.
- **700+** — `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`.
- On a `-50` / `-100` tint, set text in the same family at **700–900**.

## Themes

Six themes share **one set of foundations**: the same palette, type, spacing, radius, shadows and components. A theme only changes where the alias colors point.

| Theme | Brand hue | Mode |
| --- | --- | --- |
| Blue Light *(default)* | `blue` | light |
| Blue Dark | `blue` | dark |
| Violet Light | `violet` | light |
| Violet Dark | `violet` | dark |
| Emerald Light | `emerald` | light |
| Emerald Dark | `emerald` | dark |

Switch themes with the `data-theme` attribute on any element, e.g. `<html data-theme="violet-dark">`. Everything inside follows: components use aliases only, so they need no changes.

**Brand and mode without JavaScript** — `data-brand` and `data-mode` work on their own, with no script. On `<html>`, or on any element:

```html
<html data-brand="violet" data-mode="auto">           <!-- follows the operating system from the first paint -->
<section data-mode="dark">…</section>                 <!-- a dark section inside a light page -->
<div data-brand="emerald">…</div>                     <!-- another brand for one part of the page -->
```

Each color that changes between themes is a `light-dark()` pair, and `data-mode` sets `color-scheme` (`auto` is `light dark`), so the light or dark value is chosen where the color is used. Server-rendered and React apps get dark mode with nothing to inject and no flash. A page with neither attribute stays light. An element with `data-theme` keeps that flat theme, so it still wins; inside such a page, give a section both `data-brand` and `data-mode` to switch it. Needs `light-dark()`: Chrome and Edge 123, Safari 17.5, Firefox 120.

**More contrast** — `data-contrast="more"` gives 7:1 text (muted text and placeholders included) and stronger borders and field outlines, in every theme. It also applies on its own when the visitor's system asks for more contrast (`prefers-contrast: more`); a page can opt out with `data-contrast="normal"` on `<html>`.

**Density** — `data-density="compact"` makes `md` controls 28px and `lg` 36px (from 32 and 44) for dashboards and data-heavy screens; `sm` stays 24px, the WCAG 2.2 minimum target. Components read the `--control-height-*` tokens, so they need nothing else. `data-density="comfortable"` puts the defaults back for one section.

**Automatic dark mode** — `theme.js` (standalone, no React, `dist/theme.js` in the package) sets `data-theme` for the page from a brand and a mode, follows the visitor's light/dark setting live when the mode is `auto`, and remembers a choice the visitor makes. Load it first in `<head>` so the page never flashes the wrong theme:

```html
<html data-brand="blue" data-mode="auto">   <!-- brand: blue | violet | emerald; mode: auto | light | dark -->
<script src="dist/theme.js"></script>
```

```js
Serupa.theme.set({ mode: 'dark' });          // a theme switcher; remembered in this browser
Serupa.theme.set({ brand: 'violet' });
Serupa.theme.reset();                         // back to the page's data-brand / data-mode
Serupa.theme.get();                           // { brand, mode, theme: 'violet-dark' }
Serupa.theme.onChange(({ theme }) => { … });  // returns an unsubscribe function
```

## Alias tokens

Alias tokens give a colour a **job** instead of a hue. Each one points to a palette colour rather than holding its own value, and that pointer can differ per theme: `primary` is `{blue-600}` in Blue Light and `{violet-400}` in Violet Dark.

**Use aliases in your UI, the palette for the aliases.** Build screens with `primary`, `text`, `border`… and only reach for a palette color like `blue-600` directly when no alias fits; a palette color looks the same in every theme.

`‹brand›` below is `blue`, `violet` or `emerald`. One exception: Emerald Light uses one step darker for `primary` (`emerald-700`), `primary-hover` (`emerald-800`) and `focus-ring` (`emerald-600`), because white text on `emerald-600` is below 4.5:1.

| Alias | Light themes | Dark themes | Use |
| --- | --- | --- | --- |
| `primary` | `‹brand›-600` | `‹brand›-400` | Brand color: primary buttons, links, selected states. |
| `primary-hover` | `‹brand›-700` | `‹brand›-300` | Hover / pressed state of `primary`. |
| `primary-subtle` | `‹brand›-50` | `‹brand›-950` | Brand tint for selected rows and badges. |
| `on-primary` | `white` | `‹brand›-950` | Text and icons on `primary` fills. |
| `secondary` | `zinc-100` | `zinc-800` | Secondary button fill; hover fill for outline and ghost buttons. |
| `secondary-hover` | `zinc-200` | `zinc-700` | Hover state of `secondary`. |
| `surface` | `white` | `zinc-950` | Page and card background. |
| `surface-muted` | `zinc-50` | `zinc-900` | Secondary panels, sidebars, table headers. |
| `surface-inverse` | `zinc-900` | `zinc-50` | Contrasting blocks: tooltips, inverse banners. |
| `text` | `zinc-900` | `zinc-50` | Body text and headings on `surface`. |
| `text-muted` | `zinc-500` | `zinc-400` | Secondary text, captions, placeholders. |
| `text-inverse` | `white` | `zinc-900` | Text on `surface-inverse`. |
| `border` | `zinc-200` | `zinc-800` | Default borders and dividers. |
| `border-strong` | `zinc-300` | `zinc-700` | Emphasised dividers and outlines. Form fields use `field-border`. |
| `focus-ring` | `‹brand›-500` | `‹brand›-400` | Keyboard focus outline, in the brand hue. |
| `success` | `green-600` | `green-500` | Success icons and fills. For success text on light surfaces use `green-700`. |
| `success-subtle` | `green-50` | `green-950` | Success alert / badge background. |
| `warning` | `amber-600` | `amber-500` | Warning icons and fills; put dark text on it. For warning text on light surfaces use `amber-700`. |
| `warning-subtle` | `amber-50` | `amber-950` | Warning alert / badge background. |
| `danger` | `red-600` | `red-600` | Errors, destructive buttons; white text on it. |
| `danger-hover` | `red-700` | `red-700` | Hover / pressed state of `danger`. |
| `on-danger` | `white` | `white` | Text and icons on `danger` fills. |
| `danger-subtle` | `red-50` | `red-950` | Error alert / badge background. |
| `danger-text` | `red-700` | `red-300` | Destructive text and icons on `surface` and danger tints. |
| `danger-subtle-hover` | `red-100` | `red-900` | Hover fill for destructive secondary, outline and ghost buttons. |
| `danger-border` | `red-300` | `red-800` | Border of a destructive outline button. |
| `info` | `sky-700` | `sky-400` | Informational icons and text. |
| `info-subtle` | `sky-50` | `sky-950` | Info alert / badge background. |
| `field` | `white` | `zinc-900` | Background of text inputs, selects and other form fields. |
| `field-border` | `zinc-500` | `zinc-500` | Border of form fields: 3:1+ on `field` and `surface` (WCAG 1.4.11, a control's boundary). |
| `field-border-hover` | `zinc-600` | `zinc-400` | Field border on hover. |
| `placeholder` | `zinc-500` | `zinc-400` | Placeholder text (4.5:1+ on `field`). A hint, never a label. |
| `overlay` | zinc-900 at 50% | zinc-950 at 70% | The dimmed backdrop behind dialogs and drawers. |

### Contrast, checked in every theme

- `on-primary` on `primary`: 5.2–7.9:1. `text-muted` on `surface`: 4.8:1 light, 7.9:1 dark.
- `focus-ring` on `surface`: 3.7:1 or more.
- Dark themes use a light `primary` (brand 400) with dark text (brand 950), because white text on a mid-tone fill fails in dark mode.

### Naming

- `<role>`: the main colour for that job (`primary`, `surface`, `text`, `border`).
- `<role>-hover`, `-muted`, `-strong`, `-subtle`: variants of the same job. `-subtle` is a light tint for backgrounds.
- `on-<role>` / `<role>-inverse`: the colour that goes **on top of** that role (`on-primary` text on a `primary` button).

### Adding an alias

1. Name it after its job, not its colour (`danger`, not `red`).
2. Set its value to `{palette-token}` — the target must exist; an alias of a missing token, or of itself, is dropped.
3. Check contrast: text aliases need 4.5:1 on the surface they sit on (3:1 for icons, borders and focus rings). The palette tokens' usage notes give the ratios.
4. Only colours can be aliases: spacing, radius, shadow and type tokens hold their own values.

### Adding a theme

1. Pick a brand hue from the palette.
2. Give each alias a target in the new theme: copy a Light or Dark column and swap the brand hue.
3. Check `on-primary` on `primary` (4.5:1) and `focus-ring` on `surface` (3:1). Step the brand one shade darker (light) or lighter (dark) if either fails.
4. Nothing else changes: palette, type, spacing, radius, shadows and components are shared.

## Typography

The type scales and font families, named by role (`text-xl`, `font-semibold`, `tracking-tight`, `leading-relaxed`).

**Families**

| Token | Font | Use |
| --- | --- | --- |
| `font-sans` | Inter | Default for UI and body text. |
| `font-serif` | Georgia | Editorial or long-form accents. |
| `font-mono` | Courier New | Code, IDs, tabular figures. |

Fonts ship with the system in `fonts/` and are declared by `tokens.css`: Inter (upright and italic, variable 100–900). Icons are SVGs, not a font. Nothing loads from another server. Georgia and Courier New are pre-installed on most computers.

**Sizes** — each size carries its own line height. Both are tokens in the `fontSize` group (`var(--text-sm)`, `var(--text-sm--line-height)`) that the `text-*` classes and the components read. A `text-*` class sets only size and line height.

**Type styles** — `type-xs` … `type-9xl` (generated into `tokens.css` from the Type scale) set the whole style at once: family, size, line height, weight and letter spacing. Use one for a block of plain text; combine `text-*`, `font-*` and `tracking-*` when you need to vary one property. The two sets never conflict, whatever order the stylesheets load in.

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

**Weights** — three defaults:

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
| color | `text-<color>` for every palette color and alias (`text-blue-600`, `text-primary`, `text-text-muted`), `text-inherit`, `text-current`, `text-transparent` |
| text-decoration-line | `underline`, `overline`, `line-through`, `no-underline` |
| placeholder color | `placeholder-<color>` for every palette color and alias, `placeholder-inherit`, `placeholder-current`, `placeholder-transparent` (use `placeholder-text-muted`) |
| text-decoration-color | `decoration-<color>`, `decoration-current`, `decoration-inherit`, `decoration-transparent` |
| text-decoration-style | `decoration-solid`, `-double`, `-dotted`, `-dashed`, `-wavy` |
| text-decoration-thickness | `decoration-0`, `1`, `2`, `4`, `8`, `decoration-auto`, `decoration-from-font` |
| text-underline-offset | `underline-offset-0`, `1`, `2`, `4`, `8`, `-auto` (and negatives) |
| text-transform | `uppercase`, `lowercase`, `capitalize`, `normal-case` |
| text-overflow | `truncate`, `text-ellipsis`, `text-clip` |
| text-wrap | `text-wrap`, `text-nowrap`, `text-balance`, `text-pretty` |
| text-indent | `indent-<spacing>`, `-indent-<spacing>` |
| tab-size | `tab-0`, `tab-2`, `tab-4`, `tab-8` |
| vertical-align | `align-baseline`, `-top`, `-middle`, `-bottom`, `-text-top`, `-text-bottom`, `-sub`, `-super` |
| white-space | `whitespace-normal`, `-nowrap`, `-pre`, `-pre-line`, `-pre-wrap`, `-break-spaces` |
| word-break | `break-normal`, `break-all`, `break-keep` |
| overflow-wrap | `wrap-break-word`, `wrap-anywhere`, `wrap-normal` |
| hyphens | `hyphens-none`, `hyphens-manual`, `hyphens-auto` |
| content | `content-none` |

Text rules of thumb:

- Set text color with aliases (`text-text`, `text-text-muted`, `text-primary`), not palette colors, so it follows the theme.
- Headings: `text-balance`; paragraphs: `text-pretty`. Numbers in tables: `tabular-nums`.
- Truncate single lines with `truncate`; clamp previews with `line-clamp-2` or `-3`, and make the full text reachable.
- Links in body text: `underline underline-offset-2`. Uppercase labels: `uppercase tracking-wide text-xs font-medium`.

## Iconography

Icons are **Material Symbols**, **Rounded** style, **Fill** on, weight 400, plus custom icons drawn to the same rules. Use no other icon set or style. Each icon is an inline SVG, so there's nothing to load and nothing flashes.

Use the `Icon` component (`<Icon name="delete" />`) or pass a name to Button (`leftIcon="add"`, `icon="settings"`). Every Material Symbol works by name; find one on the Foundations/Icons page in Storybook, which searches all of them and copies the name. You can also pass an icon imported from `serupa-ds/icons` (`icon={RocketLaunch}`). Details are in the Icon guidelines.

- **Sizes:** 14px (`sm` buttons), 16px (`md` buttons, inline with `text-sm`), 20px (`lg` buttons, list rows), 24px (default, toolbars and navigation), 40px+ (empty states).
- **Color:** icons follow the text color. Use `text` or `text-muted` for neutral icons and `success`, `warning`, `danger` or `info` for status.
- **Meaning:** icons are decorative by default. Add an `aria-label` only when the icon carries meaning alone, and give icon-only buttons an `aria-label`.
- **Consistency:** one icon per meaning across the product (always `delete`, never `delete` in one place and `remove` in another).

**Custom icons.** For what Material Symbols doesn't have, draw your own on the same 24×24 grid, in one color, and put the SVGs in `assets/Icons/` (`serupa-sparkle.svg`). `node tools/icons/build.mjs` cleans them and builds them into the components, so `<Icon name="serupa-sparkle" />` and `leftIcon="serupa-sparkle"` work with the same sizes, colors and accessibility as Material Symbols. The build refuses anything unsafe or off-system with the reason. Drawing rules and details are in the Icon guidelines.

## Backgrounds

Background utilities, as classes in `bundle.css`. Backgrounds have no scale of their own: colors come from the palette and alias tokens, so there are no new tokens.

| Property | Classes |
| --- | --- |
| background-attachment | `bg-fixed`, `bg-local`, `bg-scroll` |
| background-clip | `bg-clip-border`, `bg-clip-padding`, `bg-clip-content`, `bg-clip-text` |
| background-color | `bg-<color>` for every palette color and alias (`bg-gray-100`, `bg-surface`, `bg-primary`), `bg-inherit`, `bg-current`, `bg-transparent` |
| background-image | `bg-none`; linear gradients `bg-linear-to-t`, `-tr`, `-r`, `-br`, `-b`, `-bl`, `-l`, `-tl` and `bg-linear-45` (any of 0–315° in 45° steps, negatives too); `bg-radial`; `bg-conic`, `bg-conic-90`… |
| gradient stops | `from-<color>`, `via-<color>`, `to-<color>`; positions `from-0%` … `to-100%` in 5% steps |
| background-origin | `bg-origin-border`, `bg-origin-padding`, `bg-origin-content` |
| background-position | `bg-top-left`, `bg-top`, `bg-top-right`, `bg-left`, `bg-center`, `bg-right`, `bg-bottom-left`, `bg-bottom`, `bg-bottom-right` |
| background-repeat | `bg-repeat`, `bg-repeat-x`, `bg-repeat-y`, `bg-repeat-space`, `bg-repeat-round`, `bg-no-repeat` |
| background-size | `bg-auto`, `bg-cover`, `bg-contain` |

Gradients mix in the OKLab color space, so blends between hues stay bright instead of turning grey: `bg-linear-to-r from-primary to-info`.

Rules of thumb:

- Use alias backgrounds (`bg-surface`, `bg-surface-muted`, `bg-primary-subtle`) so surfaces follow the theme; palette backgrounds look the same in every theme.
- Keep text on a solid background: if text sits on a gradient or image, check contrast at its lightest point, or add a `bg-surface` panel behind it.
- Use gradients sparingly, for heroes and illustrations, not for UI controls.
- Images: `bg-cover bg-center bg-no-repeat` fills a box without distortion.

## Spacing

The spacing scale, named `spacing-<step>`: 1 step = 4px (`spacing-4` = 16px = `p-4`). Steps: `0`, `px` (1px), `0.5`–`3.5` in half steps, `4`–`12`, then `14`, `16`, `20`, `24` … `64`, `72`, `80`, `96` (384px).

- Stay on the scale: `1` (4px), `2` (8px), `3` (12px), `4` (16px), `6` (24px), `8` (32px), `12` (48px) and `16` (64px) cover most layouts.
- Spacing inside a group should be smaller than the spacing between groups.

### Padding and margin

Every spacing step works as padding and margin, as classes in `bundle.css`.

| Padding | Margin | Sets |
| --- | --- | --- |
| `p-` | `m-` | All sides |
| `px-` / `py-` | `mx-` / `my-` | Inline (left and right) / block (top and bottom) |
| `ps-` / `pe-` | `ms-` / `me-` | Inline start / end: follows text direction (left/right in LTR, swapped in RTL) |
| `pbs-` / `pbe-` | `mbs-` / `mbe-` | Block start / end: follows the writing mode |
| `pt-` `pr-` `pb-` `pl-` | `mt-` `mr-` `mb-` `ml-` | One physical side |

- **Values** — every spacing step: `p-4` is `spacing-4` (16px), `mt-0.5` is 2px, `px-px` is 1px.
- **Auto margins** — `m-auto`, `mx-auto` (center a block), `ms-auto` (push to the end of a flex row), and the other sides.
- **Negative margins** — prefix with `-`: `-mt-2` (-8px), `-mx-4`. Use them sparingly, to pull an element into its parent's padding.
- **Space between** — `space-x-4` and `space-y-4` add a gap between children (on every child but the last). Prefer `gap` on flex and grid; use `space-*` for plain stacks. Negative versions exist (`-space-x-2`) for overlapping avatars, and `space-x-reverse` / `space-y-reverse` put the gap on the other side for `flex-row-reverse` and `flex-col-reverse`. These rules have zero specificity, so a margin class on a child still wins.

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
| `rounded-sm` / `rounded` | 4px | Inputs, small buttons, checkboxes |
| `rounded-md` | 6px | Buttons |
| `rounded-lg` | 8px | Cards, menus |
| `rounded-xl` | 12px | Panels |
| `rounded-2xl` | 16px | Modals |
| `rounded-3xl` | 24px | Hero blocks |
| `rounded-4xl` | 32px | Very large surfaces |
| `rounded-full` | 9999px | Pills, avatars |

A container nested inside another should have a smaller radius than its parent.

## Borders and outlines

Border and outline utilities, as classes in `bundle.css`. Widths and offsets are tokens in the `borders` group; colors come from the palette and alias tokens.

| Property | Classes |
| --- | --- |
| border-radius | `rounded-<size>` on all corners; sides `rounded-t-`, `-r-`, `-b-`, `-l-`, `-s-`, `-e-`; corners `rounded-tl-`, `-tr-`, `-br-`, `-bl-`, `-ss-`, `-se-`, `-ee-`, `-es-` |
| border-width | `border` (1px), `border-0`, `-2`, `-4`, `-8`; sides `border-x`, `-y`, `-s`, `-e`, `-bs`, `-be`, `-t`, `-r`, `-b`, `-l` (each with the same widths); between children `divide-x`, `divide-y` (and `-0`, `-2`, `-4`, `-8`, `-reverse`) |
| border-color | `border-<color>` for every palette color and alias, on every side (`border-t-danger`, `border-x-border`); `divide-<color>`; `inherit`, `current`, `transparent` |
| border-style | `border-solid`, `-dashed`, `-dotted`, `-double`, `-hidden`, `-none`; `divide-dashed`… |
| outline-width | `outline` (1px), `outline-0`, `-1`, `-2`, `-4`, `-8` |
| outline-color | `outline-<color>` for every palette color and alias |
| outline-style | `outline-solid`, `-dashed`, `-dotted`, `-double`, `outline-none`, `outline-hidden` (transparent, still visible in forced-colors mode) |
| outline-offset | `outline-offset-0`, `-1`, `-2`, `-4`, `-8` and negatives |

Width classes draw a solid line on the sides they set, so `border` alone draws a box and `border-t-4` only a top line. Style classes (`border-dashed`) change the line of any width class on the same element; on their own they draw nothing. Its color is the text color unless you add one: use `border-border` (the alias) for dividers and `border-border-strong` for inputs.

Rules of thumb:

- Borders: `border border-border` for cards and dividers, `border-field-border` for form fields (`border-danger` when invalid, with the message in `danger-text`), `border-danger-border` for destructive outline buttons.
- Focus: `outline-2 outline-offset-2 outline-focus-ring` on `:focus-visible`. Never remove a focus style without replacing it; prefer `outline-hidden` over `outline-none`.
- Lists and tables: `divide-y divide-border` instead of a border on each row.

## Effects

Effect utilities, as classes in `bundle.css`. Box, inner and text shadows are tokens in the `shadow` group; opacity uses the `opacity` group; blend modes and masks are keywords.

**Shadow names.** `shadow-2xs` → `shadow-xs` → `shadow-sm` → `shadow-md` → `shadow-lg` → `shadow-xl` → `shadow-2xl`, all black at 5–25% opacity. Earlier versions of this system used other names: the old `shadow-sm` is now `shadow-xs` (Button uses it, so buttons look the same), the old bare `shadow` is now `shadow-sm`, and `shadow-inner` is now `inset-shadow-sm`. `shadow` and `shadow-inner` still work.

| Property | Classes | Tokens |
| --- | --- | --- |
| box-shadow | `shadow-2xs` `-xs` `-sm` `-md` `-lg` `-xl` `-2xl` `-none`; inner `inset-shadow-2xs` `-xs` `-sm` `-none`; rings `ring` (1px) `ring-0` `-1` `-2` `-4` `-8`, `ring-inset`, `inset-ring` (and widths), `ring-offset-0` `-1` `-2` `-4` `-8`; colors `shadow-<color>`, `inset-shadow-<color>`, `ring-<color>`, `inset-ring-<color>`, `ring-offset-<color>` for every palette color and alias; `shadow-initial`, `inset-shadow-initial` and `text-shadow-initial` undo a color class | `shadow-*`, `inset-shadow-*` |
| text-shadow | `text-shadow-2xs` `-xs` `-sm` `-md` `-lg` `-none`; `text-shadow-<color>`, `text-shadow-inherit` | `text-shadow-*` |
| opacity | `opacity-0` … `opacity-100` in 5% steps | `opacity-*` |
| mix-blend-mode | `mix-blend-normal` `-multiply` `-screen` `-overlay` `-darken` `-lighten` `-color-dodge` `-color-burn` `-hard-light` `-soft-light` `-difference` `-exclusion` `-hue` `-saturation` `-color` `-luminosity` `-plus-darker` `-plus-lighter` | — |
| background-blend-mode | `bg-blend-normal` … `bg-blend-luminosity` (same list, without the plus modes) | — |
| mask-clip | `mask-clip-border` `-padding` `-content` `-fill` `-stroke` `-view`, `mask-no-clip` | — |
| mask-composite | `mask-add` `mask-subtract` `mask-intersect` `mask-exclude` | — |
| mask-image | `mask-none`; edges `mask-t-from-<%>` `mask-t-to-<%>` (also `-r-` `-b-` `-l-` `-x-` `-y-`); `mask-linear-<angle>` (45° steps, negatives) with `mask-linear-from-<%>` `-to-<%>`; `mask-radial-from-<%>` `-to-<%>` with `mask-circle` `mask-ellipse`, `mask-radial-closest-side` `-closest-corner` `-farthest-side` `-farthest-corner`, `mask-radial-at-<position>`; `mask-conic-<angle>` with `mask-conic-from-<%>` `-to-<%>`. Percentages run 0–100% in 5% steps | — |
| mask-mode | `mask-alpha` `mask-luminance` `mask-match` | — |
| mask-origin | `mask-origin-border` `-padding` `-content` `-fill` `-stroke` `-view` | — |
| mask-position | `mask-top-left` `mask-top` `mask-top-right` `mask-left` `mask-center` `mask-right` `mask-bottom-left` `mask-bottom` `mask-bottom-right` | — |
| mask-repeat | `mask-repeat` `mask-no-repeat` `mask-repeat-x` `mask-repeat-y` `mask-repeat-space` `mask-repeat-round` | — |
| mask-size | `mask-auto` `mask-cover` `mask-contain` | — |
| mask-type | `mask-type-alpha` `mask-type-luminance` (on SVG `<mask>` elements) | — |

**Stacking.** A shadow, an inner shadow, a ring and an inset ring all draw on one element at once: `shadow-md ring-1 ring-border` is a card with a hairline edge. Mask gradients stack too and intersect: `mask-b-from-60% mask-r-from-80%` fades the bottom and the right.

**Colors.** A color class swaps the black for that color at full strength (rings default to the text color). For a soft tint, set the variable directly, e.g. `--dk-shadow-color: color-mix(in oklab, var(--primary) 30%, transparent)`.

**Masks.** `-from-` is where the element is still fully visible and `-to-` where it is fully hidden, measured from the named edge or the gradient's start: `mask-b-from-50%` keeps the top half and fades the bottom half out.

Rules of thumb:

- Elevation: inputs and buttons `shadow-xs`, cards `shadow-sm` (or `shadow-md` on hover), menus and popovers `shadow-lg`, dialogs `shadow-xl`/`shadow-2xl`. Higher elements get bigger shadows.
- Shadows barely show in dark themes: separate surfaces with `border` or `surface-muted` there, or add `ring-1 ring-border`.
- Focus: a ring is fine for focus styles (`ring-2 ring-focus-ring ring-offset-2 ring-offset-surface`), but keep the outline approach from Borders for anything that must show in forced-colors mode.
- `text-shadow-*` only for text over images or video; never on body text over solid surfaces.
- `opacity-50` for disabled controls; don't lower the opacity of text to make it secondary — use `text-muted`.
- Blend modes for illustrations and image treatments (`mix-blend-multiply` to drop a white background), not for UI chrome.
- Masks for fading scroll edges (`mask-b-from-80%` on a scrolling list) and image vignettes (`mask-radial-from-60%`).

## Filters

Filter and backdrop-filter utilities, as classes in `bundle.css`. Scales are tokens in the `filters` group (backdrop opacity uses the `opacity` group); grayscale, invert and sepia need none. Filter classes combine on one element (`blur-sm grayscale`), and so do backdrop classes.

| Property | Classes | Tokens |
| --- | --- | --- |
| blur | `blur-xs` (4px) `-sm` (8px) `-md` (12px) `-lg` (16px) `-xl` (24px) `-2xl` (40px) `-3xl` (64px), `blur-none` | `blur-*` |
| brightness | `brightness-0` `-50` `-75` `-90` `-95` `-100` `-105` `-110` `-125` `-150` `-200` | `brightness-*` |
| contrast | `contrast-0` `-50` `-75` `-100` `-125` `-150` `-200` | `contrast-*` |
| drop-shadow | `drop-shadow-xs` `-sm` `-md` `-lg` `-xl` `-2xl` `-none`; color `drop-shadow-<color>` for every palette color and alias | `drop-shadow-*` |
| grayscale | `grayscale` (100%), `grayscale-0` `-25` `-50` `-75` `-100` | — |
| hue-rotate | `hue-rotate-0` `-15` `-30` `-60` `-90` `-180`, negatives `-hue-rotate-15`… | `hue-rotate-*` |
| invert | `invert` (100%), `invert-0` `-25` `-50` `-75` `-100` | — |
| saturate | `saturate-0` `-50` `-100` `-150` `-200` | `saturate-*` |
| sepia | `sepia` (100%), `sepia-0` `-25` `-50` `-75` `-100` | — |
| filter | `filter-none` turns every filter off | — |
| backdrop-filter | `backdrop-blur-*`, `backdrop-brightness-*`, `backdrop-contrast-*`, `backdrop-grayscale(-*)`, `backdrop-hue-rotate-*` (and negatives), `backdrop-invert(-*)`, `backdrop-opacity-0` … `-100` (5% steps), `backdrop-saturate-*`, `backdrop-sepia(-*)`, `backdrop-filter-none` | same as above, plus the `opacity` group |

Drop shadows follow an element's shape (transparent PNGs, SVG icons, clipped shapes), where `shadow-*` draws a box. A color class such as `drop-shadow-primary` keeps the shadow's size and swaps the black for that color, at full strength; for a softer tint, set `--dk-drop-shadow-color` to a transparent color, e.g. `color-mix(in oklab, var(--primary) 40%, transparent)`.

Backdrop filters change what's behind an element, so they only show through a see-through background, such as `background: color-mix(in oklab, var(--surface) 70%, transparent)`.

Rules of thumb:

- Frosted glass: that translucent `surface` with `backdrop-blur-md backdrop-saturate-150` for sticky headers, `backdrop-blur-sm` for menus and `backdrop-blur-lg` behind dialogs.
- Text over a photo: `brightness-50` or a gradient on the image, then check contrast at the lightest point.
- `grayscale` for disabled or inactive images and logo walls (add `hover:grayscale-0` in your own CSS).
- Blur is expensive on large areas and on scroll. Keep `blur-*` and `backdrop-blur-*` on small or fixed elements, and give text a solid fallback for browsers that skip backdrop filters.
- Use `shadow-*` for cards and panels; save `drop-shadow-*` for icons, illustrations and cut-out images.

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

Transform utilities, as classes in `bundle.css`. Perspective, rotation, scale, skew and zoom are tokens in the `transforms` group; translate uses the spacing scale. `rotate`, `scale` and `translate` set the CSS properties of the same name, so `rotate-45 scale-110 translate-x-2` all apply together.

| Property | Classes | Tokens |
| --- | --- | --- |
| backface-visibility | `backface-visible`, `backface-hidden` | — |
| perspective | `perspective-dramatic` (100px) `-near` (300px) `-normal` (500px) `-midrange` (800px) `-distant` (1200px), `perspective-none` | `perspective-*` |
| perspective-origin | `perspective-origin-center` `-top` `-top-right` `-right` `-bottom-right` `-bottom` `-bottom-left` `-left` `-top-left` | — |
| rotate | `rotate-0` `-1` `-2` `-3` `-6` `-12` `-45` `-90` `-180` and negatives (`-rotate-90`), `rotate-none`; 3D `rotate-x-*` `rotate-y-*` `rotate-z-*` | `rotate-*` |
| scale | `scale-0` `-50` `-75` `-90` `-95` `-100` `-105` `-110` `-125` `-150` `-200`; `scale-x-*` `scale-y-*` `scale-z-*`; negatives mirror (`-scale-x-100`); `scale-3d`, `scale-none` | `scale-*` |
| skew | `skew-0` `-1` `-2` `-3` `-6` `-12`, `skew-x-*` `skew-y-*` and negatives | `skew-*` |
| transform | `transform` (applies rotate-x/y/z and skew), `transform-none`, `transform-gpu`, `transform-cpu` | — |
| transform-box | `transform-border` `transform-content` `transform-fill` `transform-stroke` `transform-view` (what `origin-*` measures from; `transform-fill` for SVG shapes) | — |
| transform-origin | `origin-center` `-top` `-top-right` `-right` `-bottom-right` `-bottom` `-bottom-left` `-left` `-top-left` | — |
| transform-style | `transform-3d` (preserve-3d), `transform-flat` | — |
| translate | `translate-<step>`, `translate-x-<step>`, `translate-y-<step>`, `translate-z-<step>` for every spacing step; fractions `-1/2` … `-11/12` and `-full` (of the element's own size); negatives; `translate-3d`, `translate-none` | `spacing-*` |
| zoom | `zoom-50` `-75` `-90` `-95` `-100` `-105` `-110` `-125` `-150` `-200` | `zoom-*` |

Transforms move how an element is drawn, not where it sits in the layout, so neighbours don't shift. `zoom` is the exception: it changes the element's layout size too.

3D needs three things: a `perspective-*` on the parent, `transform-3d` where children should keep their depth, and `rotate-x-*` or `rotate-y-*` on the element. Add `backface-hidden` to the faces of a flipping card.

Rules of thumb:

- Micro-interactions: `hover:scale-105` on cards, `active:scale-95` on pressed controls, with `transition-transform duration-150`.
- Menus and dialogs enter from `scale-95 opacity-0` to `scale-100 opacity-100`, with `origin-top` for menus that drop down.
- Centre an absolutely positioned element with `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`.
- Rotate disclosure chevrons with `rotate-180` (or `-rotate-90`) instead of swapping icons.
- Animate `translate` and `scale`, not `top` or `width`: they don't trigger layout. Don't use `zoom` for animation.
- Respect reduced motion: drop large movements and 3D flips when the viewer prefers reduced motion.

## Layout

Layout scales as tokens, and layout utilities as classes in `bundle.css` (`.container`, `.flex`, `.grid`, `.sticky`, `.z-30`, `.aspect-video`, `.overflow-hidden`…).

**Breakpoints** — mobile first: styles apply from the breakpoint up.

| Token | Min width | Typical screens |
| --- | --- | --- |
| `screen-sm` | 640px | Large phones in landscape, small tablets |
| `screen-md` | 768px | Tablets |
| `screen-lg` | 1024px | Laptops |
| `screen-xl` | 1280px | Desktops |
| `screen-2xl` | 1536px | Large desktops |

**Responsive classes** — put a breakpoint in front of a layout class to apply it from that width up: `sm:` `md:` `lg:` `xl:` `2xl:`. Start with the phone layout and add what changes on wider screens:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">…</div>
<nav class="hidden md:flex items-center gap-4">…</nav>
<h1 class="text-2xl md:text-4xl">…</h1>
```

Responsive versions exist for the classes that shape a layout: display; flex direction, wrap, grow and shrink; `grid-cols-*`, `col-span-*`, `order-*`; `items-*`, `justify-*`, `self-*`; `gap-*` and padding (`p-`, `px-`, `py-`, `pt-`, `pr-`, `pb-`, `pl-`) at every spacing step; auto margins; `w-auto`, `w-full`, `w-fit`, width fractions, `max-w-*`, `h-auto`, `h-full`; `text-xs` … `text-9xl` and text alignment; position and overflow. Colors, borders and effects have none: they rarely change with screen width, and components handle their own states. For anything else, write a media query with the breakpoint's value (`@media (min-width: 768px)`); CSS variables don't work inside `@media`.

**Container** — `.container` is full width and snaps its max-width to the current breakpoint (640, 768, 1024, 1280, 1536px). It isn't centered and has no padding: add `margin-inline: auto` and a side padding such as `spacing-4` (16px), or `spacing-6` from `md` up.

**Z-index layers** — page-level layers have names, so every menu, dialog and toast stacks the same way. Use them as classes (`z-modal`) or in CSS (`var(--z-modal)`):

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

**Aspect ratio** — `aspect-auto`, `aspect-square` (1 / 1) for avatars and thumbnails, `aspect-video` (16 / 9) for media.

**Columns** — `columns-1` to `columns-12` set a column count; `columns-3xs` (256px) to `columns-7xl` (1280px) fit as many columns as possible of at least that width. Use them for masonry-style lists; use grid for app layouts.

**Every layout utility** in `bundle.css`:

| Property | Classes |
| --- | --- |
| aspect-ratio | `aspect-auto`, `aspect-square`, `aspect-video` (tokens) |
| columns | `columns-1`…`12`, `columns-3xs`…`7xl` (tokens), `columns-auto` |
| break-after / break-before | `break-after-auto` `-avoid` `-all` `-avoid-page` `-page` `-left` `-right` `-column` (and `break-before-*`) |
| break-inside | `break-inside-auto` `-avoid` `-avoid-page` `-avoid-column` |
| box-decoration-break | `box-decoration-clone`, `box-decoration-slice` |
| box-sizing | `box-border`, `box-content` |
| display | `block` `inline-block` `inline` `flex` `inline-flex` `grid` `inline-grid` `contents` `flow-root` `list-item` `hidden`, `table` `inline-table` `table-caption` `table-cell` `table-column` `table-column-group` `table-footer-group` `table-header-group` `table-row-group` `table-row`, `sr-only` `not-sr-only` |
| float / clear | `float-left` `-right` `-start` `-end` `-none`; `clear-left` `-right` `-start` `-end` `-both` `-none` |
| isolation | `isolate`, `isolation-auto` |
| object-fit / object-position | `object-contain` `-cover` `-fill` `-none` `-scale-down`; `object-top-left` `-top` `-top-right` `-left` `-center` `-right` `-bottom-left` `-bottom` `-bottom-right` |
| overflow | `overflow-auto` `-hidden` `-clip` `-visible` `-scroll`, and `overflow-x-*`, `overflow-y-*` |
| overscroll-behavior | `overscroll-auto` `-contain` `-none`, and `overscroll-x-*`, `overscroll-y-*` |
| position | `static` `fixed` `absolute` `relative` `sticky` |
| top / right / bottom / left | `inset-<step>`, `inset-x-` `-y-` `-s-` `-e-` `-bs-` `-be-`, `top-` `right-` `bottom-` `left-` `start-` `end-` for every spacing step, fractions (`top-1/2`), `-full`, `-px`, `-auto`, and negatives (`-top-2`) |
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

- **Numbers** — the spacing scale: `w-4` = `spacing-4` (16px), `h-10` = 40px, `block-8` = 32px. Every spacing step from `0` to `96` exists for every prefix.
- **Container sizes** (width-axis prefixes only) — tokens `container-3xs` (256px) to `container-7xl` (1280px): `max-w-md`, `inline-lg`, `min-w-xs`…
- **Fractions** — `1/2`, thirds, quarters, fifths, sixths and twelfths (tokens `sizing-1-2` … `sizing-11-12`). In CSS the slash is escaped: `.w-1\/2`.
- **Keywords** — `auto` (not for max), `px`, `full`, `screen` (100vw on the inline axis, 100vh on the block axis), `dvw`/`dvh`, `lvw`/`lvh`, `svw`/`svh`, `min`, `max`, `fit`, `none` (max only) and `lh` (one line, height axis).

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


**Control heights** — every control at one size is the same height, so buttons, inputs and selects line up in a row. Components read these tokens; in your own markup use `h-control-sm`, `min-h-control-md` or `size-control-lg` (a square, for icon buttons).

| Token | Value | Use |
| --- | --- | --- |
| `control-height-sm` | 1.5rem (24px) | Small controls; the WCAG 2.2 AA minimum target |
| `control-height-md` | 2rem (32px) | Default buttons, inputs and selects |
| `control-height-lg` | 2.75rem (44px) | Large controls; the comfortable touch target (WCAG 2.5.5) |

## Motion

Transition and animation scales, as tokens in one `transitions` group (`var(--duration-150)`, `var(--ease-out)`, `var(--animate-spin)`) and as matching utility classes in `bundle.css` (`.transition`, `.duration-200`, `.ease-out`, `.animate-pulse`).

**Duration** — `duration-0`, `75`, `100`, `150`, `200`, `300`, `500`, `700`, `1000` (ms).

| Use | Duration | Easing |
| --- | --- | --- |
| Hover, focus, pressed (colors, shadow) | `duration-150` *(default)* | `ease-in-out` |
| Small elements entering: tooltips, dropdowns | `duration-200` | `ease-out` |
| Small elements leaving | `duration-150` | `ease-in` |
| Large elements entering: dialogs, drawers | `duration-300` | `ease-out` |
| Page-level or large surface changes | `duration-500` | `ease-in-out` |

**Easing** — `ease-linear`, `ease-in` (`cubic-bezier(0.4, 0, 1, 1)`), `ease-out` (`cubic-bezier(0, 0, 0.2, 1)`), `ease-in-out` (`cubic-bezier(0.4, 0, 0.2, 1)`, default).

**Delay** — `delay-0` to `delay-1000`, same steps as duration (both in the `transitions` token group). Use `delay-300` or `delay-500` before showing a tooltip.

**Transition properties** — `transition` (the default set: colors, outline and gradient stops, opacity, shadow, transform and translate/scale/rotate, filters, and discrete properties like `display`), `transition-colors`, `transition-opacity`, `transition-shadow`, `transition-transform`, `transition-all`, `transition-none`. Each animates at `duration-150` with `ease-in-out` unless a `duration-*` or `ease-*` class says otherwise, whatever the class order; `duration-initial` and `ease-initial` go back to those defaults. Name the properties you animate; avoid `transition-all` in components because it also animates layout.

**Transition behavior** — `transition-normal`, `transition-discrete`. `transition-discrete` lets `display`, `visibility` and other discrete properties take part, for fading an element in from `hidden`.

**Animations**

| Token | Value | Use |
| --- | --- | --- |
| `animate-spin` | `spin 1s linear infinite` | Turning things: refresh icons, simple spinners. (The Loader component has its own, livelier ring.) |
| `animate-ping` | `ping 1s cubic-bezier(0, 0, 0.2, 1) infinite` | A radar ping behind a notification dot or live badge. |
| `animate-pulse` | `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` | Skeleton placeholders while content loads. |
| `animate-bounce` | `bounce 1s infinite` | A scroll-down hint. Use sparingly. |
| `animate-none` | `none` | Turns an animation off. |

The `spin`, `ping`, `pulse` and `bounce` keyframes ship in `bundle.css`.

Rules of thumb:

- Motion should explain a change, not decorate it. Most UI motion is 150–300ms.
- Enter with `ease-out`, leave with `ease-in`, and change in place with `ease-in-out`.
- Respect reduced motion: `bundle.css` stops `ping`, `pulse` and `bounce` and slows `spin` when the viewer prefers reduced motion. Do the same for your own animations.

## SVG

SVG utilities, as classes in `bundle.css`. Colors come from the palette and alias tokens; stroke widths are the `stroke-width-*` tokens in the `borders` group.

| Property | Classes | Tokens |
| --- | --- | --- |
| fill | `fill-<color>` for every palette color and alias, `fill-none` `fill-current` `fill-inherit` `fill-transparent` | color tokens |
| stroke | `stroke-<color>`, `stroke-none` `stroke-current` `stroke-inherit` `stroke-transparent` | color tokens |
| stroke-width | `stroke-0` `stroke-1` `stroke-2` `stroke-3` `stroke-4` (in the SVG's own units, so they scale with the drawing) | `stroke-width-*` |

Rules of thumb:

- Inline icons and logos: `fill-current` (or `stroke-current` for outline art) so they take the text color, then color the parent with `text-*` aliases. That keeps them in step with the theme.
- Use alias colors (`fill-primary`, `stroke-border`, `fill-success`) for meaning; palette colors are for illustrations and charts.
- Outline drawings: `fill-none stroke-current stroke-2`. Because the width is in the SVG's units, a 24-unit icon drawn at 48px gets a 4px line; add `vector-effect="non-scaling-stroke"` on the shapes for a fixed width.
- The system's icons (Material Symbols and custom icons) already fill with `currentColor`: color them with `text-*` on the icon or its parent.

## Interactivity

Interactivity utilities, as classes in `bundle.css`. They add no tokens: colors come from the palette and alias tokens, `scroll-m-*` and `scroll-p-*` use the spacing scale, and the rest are keywords.

| Property | Classes |
| --- | --- |
| accent-color | `accent-<color>` for every palette color and alias, `accent-auto` `accent-inherit` `accent-current` `accent-transparent` |
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
| scroll-margin | `scroll-m-<step>` and sides `scroll-mx-` `-my-` `-ms-` `-me-` `-mbs-` `-mbe-` `-mt-` `-mr-` `-mb-` `-ml-` for every spacing step; negatives |
| scroll-padding | `scroll-p-<step>` and sides `scroll-px-` `-py-` `-ps-` `-pe-` `-pbs-` `-pbe-` `-pt-` `-pr-` `-pb-` `-pl-` |
| scroll-snap-align | `snap-start` `snap-end` `snap-center` `snap-align-none` |
| scroll-snap-stop | `snap-normal` `snap-always` |
| scroll-snap-type | `snap-x` `snap-y` `snap-both` `snap-none`, with `snap-mandatory` or `snap-proximity` (default) |
| touch-action | `touch-auto` `touch-none` `touch-manipulation`, `touch-pan-x` `-pan-left` `-pan-right` `-pan-y` `-pan-up` `-pan-down` `-pinch-zoom` (these combine) |
| user-select | `select-none` `select-text` `select-all` `select-auto` |
| will-change | `will-change-auto` `-scroll` `-contents` `-transform` |

Rules of thumb:

- Cursors: `cursor-pointer` on anything clickable that isn't a link (Button does this), `cursor-not-allowed` when disabled, `cursor-progress` while loading, `cursor-grab`/`cursor-grabbing` on draggable items, `cursor-text` on editable areas.
- Form controls: `accent-primary` makes checkboxes, radios, range sliders and progress bars match the theme; `caret-primary` colors the text cursor. Use `appearance-none` only when you redraw the control yourself, and keep its focus style.
- Dark themes: put `scheme-dark` on the root (or `scheme-light-dark`) so native scrollbars, inputs and date pickers turn dark too.
- `field-sizing-content` for comment boxes and tag inputs that should grow as people type; give them a `max-h-*`.
- Anchors under a sticky header: `scroll-mt-16` on the targets (or `scroll-pt-16` on the scrolling container) so the header doesn't cover them. Pair `scroll-smooth` with reduced-motion handling.
- Carousels: `snap-x snap-mandatory` on the track and `snap-start` (or `snap-center`) on each slide; `scrollbar-none` only if there are other controls.
- Scrollbars: `scrollbar-thin scrollbar-thumb-border-strong scrollbar-track-transparent` in dense panels; `scrollbar-gutter-stable` stops layouts from jumping when content starts to scroll.
- `pointer-events-none` on decorative overlays and icons inside inputs; never on something that should be reachable by keyboard, since it doesn't stop focus.
- `select-none` on drag handles and buttons, `select-all` on codes and IDs people copy.
- `touch-manipulation` on buttons removes the double-tap zoom delay; `touch-none` on canvases and sliders that handle gestures themselves.
- Use `will-change-transform` only while an animation runs, then remove it.

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
- Focus: use outlines (`outline-2 outline-focus-ring`) or `outline-hidden`, never `outline-none` alone — rings and shadows vanish in forced colors. Button keeps its ring and adds a transparent 2px outline on focus, which only shows in forced colors; its transparent border shows there too.

**Screen-reader text.** Give icon-only controls a name: an `aria-label`, or a `sr-only` span inside the button. For a "Skip to content" link, combine `sr-only` with `focus:not-sr-only` in your own CSS so it appears when tabbed to.
