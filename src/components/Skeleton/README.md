# Skeleton

Gray placeholder shapes where content is loading, so the layout is already in place and nothing jumps when the content arrives. Lines stand in for text, a circle for an avatar, a rectangle for an image or a card. It replaces `<Loader variant="skeleton">`, which is deprecated and leaves in the next major.

**Also called:** placeholder, shimmer, loading placeholder.

```tsx
import { Skeleton } from "@diki-stwn/serupa-ds";

<Skeleton />                                    // one line of text-sm, full width
<Skeleton lines={3} />                          // a paragraph: the last line is 60% wide
<Skeleton shape="circle" size="lg" />           // an avatar, 40px
<Skeleton shape="rect" className="h-40" />      // an image or card

// the shape of what's coming: name one skeleton, the rest are decorative
<div className="flex gap-3" aria-busy="true">
  <Skeleton shape="circle" size="lg" label="Loading profile" />
  <Skeleton lines={2} label="" />
</div>
```

## When to use

- The layout of what's coming is known, such as a list, a card, a profile or a table, so placeholders can hold its place while it loads.

## When not to use

- You can't tell what shape the content will take, or the wait is a task rather than content (a search, an AI reply): use [Loader](../Loader/README.md).
- Waits you can measure (uploads, imports): use [Progress](../Progress/README.md).
- A list, table or grid that loads its own rows: Table, List, DataGrid, Kanban and Chart draw their own skeleton rows while `loading` is set.

## Anatomy

Drawn from the `Profile` story.

1. **Skeleton** (`.srp-skeleton`): the whole placeholder, named "Loading" (or your label) for screen readers.
2. **Line** (`.srp-skeleton__line`): one line of text, as tall as the size's text line.
3. **Bone** (`.srp-skeleton__bone`): the gray shape with the sweeping shine.

## Usage

- **text** (default): `lines` lines, each as tall as the size's text line (16, 20 or 24px) with a bar as tall as the type (12, 14 or 16px) and `radius-inner` corners. Full width; with several lines the last is 60% wide, so it reads as a paragraph. Give it a width class (`w-1/2`, `w-48`) for a short line such as a name.
- **circle**: 16, 24 or 40px at `sm`, `md` and `lg`, fully round. `className="size-12"` sets another size.
- **rect**: full width and 96px tall (`--skeleton-rect-height`), `radius-control` corners. Set the size with classes (`h-40`, `w-48 h-32`); for a ratio, `h-auto aspect-video`.
- Lines and rects stretch to their container and shrink beside an avatar in a row, while the circle keeps its size.
- Match the real layout closely and keep it short: a few rows, not a screenful.
- On a dark scrim, photo or video, `tone="inverse"` makes it white.
- If loading fails, replace it with an error message and a way to retry.

The fill is the text color at 10% (`--skeleton-fill`), so it fits any surface and theme. A lighter band (the text color at 5%) sweeps through it from left to right every 2 seconds, easing in and out.

### Show-after delay and minimum time

Like Loader, it waits 300ms before it shows, so a quick load never flashes it; while it waits it is hidden but its shapes keep their space. Once shown it stays at least 500ms: keep it mounted and pass `loading={false}` when the content arrives, rather than removing it, and it renders nothing once the 500ms are up.

## Accessibility

- **Role and name:** a skeleton with a label is a `role="progressbar"` without a value, named by `label` ("Loading…"), and `label` is announced once through the shared polite status region when it appears. `label=""` makes it decorative (`aria-hidden`).
- In a group of skeletons, name one ("Loading profile") and pass `label=""` to the rest, so it's announced once, and set `aria-busy` on the area.
- **Keyboard:** none: it isn't focusable.
- **Contrast:** it's a placeholder, not content: the fill is the text color at 10%, which isn't held to a contrast ratio.
- In forced colors (Windows high contrast) the browser drops background colors, so the bones keep a still `GrayText` fill instead of going blank.
- Under reduced motion it's a still fill, without the shine.
- **What's still yours:** `aria-busy` on the area that's loading, and moving focus sensibly when the content replaces it.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `shape` | `'text'` \| `'circle'` \| `'rect'` | `'text'` | Lines of text, an avatar, or an image or card |
| `lines` | number, 1 to 20 | `1` | With `shape="text"`: how many lines |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Text lines `text-xs`, `text-sm` or `text-base`; the circle 16, 24 or 40px |
| `tone` | `'neutral'` \| `'inverse'` | `'neutral'` | `neutral` takes the text color; `inverse` is white in every theme, for dark scrims and media |
| `label` | string | `'Loading…'` | Its accessible name, announced when it appears. `''` makes it decorative |
| `delay` | number (ms) | `300` | Waits this long before showing. `0` shows it at once |
| `loading` | boolean | `true` | Pass `false` when the content arrives. Once shown, it stays at least 500ms, then renders nothing |
| `id` | string | none | Goes to the root `<span>`. |

`className`, `style`, `ref` and other attributes go to the outer `<span>`, which has `data-component="skeleton"`, `data-shape` and `data-size` for tests.

## Component tokens

Each is an optional override: set it on the page, a container or one Skeleton. The list lives in `src/components/Skeleton/skeleton.tokens.json` (also in `design-tokens/components/`).

```css
.gallery { --skeleton-rect-height: var(--spacing-48); }
```

<!-- token-table:start (made from skeleton.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--skeleton-inverse` | `white` | Color with `tone="inverse"` |
| `--skeleton-size-sm` | `spacing-4` | The circle at size sm (16px) |
| `--skeleton-size-md` | `spacing-6` | The circle at size md (24px) |
| `--skeleton-size-lg` | `spacing-10` | The circle at size lg (40px) |
| `--skeleton-rect-height` | `spacing-24` | Height of the rect when no class sets one (96px) |
| `--skeleton-fill` | `opacity-10` | Strength of the fill (the text color) |
| `--skeleton-shine` | `opacity-5` | Strength of the band that sweeps through it |
| `--skeleton-radius` | `radius-control` | Corners of the rect (6px) |
| `--skeleton-text-radius` | `radius-inner` | Corners of the text lines (4px) |
<!-- token-table:end -->
