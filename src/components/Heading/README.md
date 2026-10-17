# Heading

A heading, `h1` to `h6`, in the system's type. `level` sets the element, which is what screen readers and the page's outline see; `size` sets the look. So a card's title can be an `h3` that looks like body text, or a page's `h1` can be small.

## Usage

```jsx
const { Heading } = window.Diki;

<Heading level={1}>Projects</Heading>
<Heading>Recent activity</Heading>                 {/* h2 */}
<Heading level={3} size="base">Billing</Heading>  {/* an h3 at text-base */}
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `level` | `1`–`6` | `2` | The element. Keep the levels in order down the page, without skipping |
| `size` | `'sm'` \| `'base'` \| `'lg'` \| `'xl'` \| `'2xl'` \| `'3xl'` \| `'4xl'` \| `'5xl'` | the level's | A step of the type scale, with its line height. Each level's own: 1 `3xl`, 2 `2xl`, 3 `xl`, 4 `lg`, 5 `base`, 6 `sm` |

Every heading is `font-semibold` in `text`, with no margins (space it with the layout). `2xl` and up are tracked tight (`tracking-tight`), and long headings wrap in balanced lines. `className`, `style`, `ref` and everything else go to the heading, which has `data-component="heading"`.

## Accessibility

- Pick the level from the page's outline, never from the look: that's what `size` is for.
- One `h1` per page, naming it.
- Headings keep 4.5:1 on `surface` in all six themes (`tools/test/typography.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one heading. The list lives in `src/components/Heading/heading.tokens.json` (also in `design-tokens/components/`). A `--heading-size-*` override changes the size only; the line height stays the level's.

| Token | Default | Use |
| --- | --- | --- |
| `--heading-text` (was `--heading-color`, which still works until 5.0.0) | `text` | The heading's color. |
| `--heading-weight` | `font-semibold` | The weight of every level (600). |
| `--heading-size-1` | `text-3xl` | The size of a level 1 heading (text-3xl). |
| `--heading-size-2` | `text-2xl` | The size of a level 2 heading (text-2xl). |
| `--heading-size-3` | `text-xl` | The size of a level 3 heading (text-xl). |
| `--heading-size-4` | `text-lg` | The size of a level 4 heading (text-lg). |
| `--heading-size-5` | `text-base` | The size of a level 5 heading (text-base). |
| `--heading-size-6` | `text-sm` | The size of a level 6 heading (text-sm). |
