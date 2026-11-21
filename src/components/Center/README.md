# Center

Keeps content to a maximum width in the middle of the space it's in, and with `vertical`, in the middle of the screen's height too. Use it for a page with one short task, such as signing in, and for an error or empty page.

**Also called:** centered layout, auth layout.

```tsx
import { Center, Card } from "@diki-stwn/serupa-ds";

<Center as="main" vertical maxWidth="container-sm">
  <Card>…the sign-in form…</Card>
</Center>

<Center intrinsic centerText>…a heading, a line and a button…</Center>
```

## When to use

- A page with one short task: sign in, sign up, reset a password, accept an invite. With `vertical`, the form sits in the middle of the screen.
- An error page, an empty screen, or a short confirmation, with `intrinsic` and `centerText`.
- A narrow column inside something wider, such as a form in a wide Card.

## When not to use

- A page's whole content, header and footer, lined up on the same edges: use [Container](../Container/README.md) instead.
- A column of items with space between them: use [Stack](../Stack/README.md), inside the Center when you need both.
- A band of a long page with its own background: use [PageSection](../PageSection/README.md) instead.

## Usage

- Pick `maxWidth` from the sizing tokens: `container-sm` (384px) for a sign-in form, `container-md` (448px, the default) for a longer form, `container-2xl` (672px) for a short article.
- `vertical` makes it at least the screen's height. Use it once, around a page's content, not inside a scrolling page.
- Center only short text with `centerText`: a heading, one line, a button's row. Keep paragraphs aligned to the start.
- The side padding (16px) is outside the maximum width, so a 384px form stays 384px on a laptop and keeps off the edges on a phone. Set `padded={false}` inside something that already has padding.

### Do and don't

- **Do:** Center one short task, such as signing in, with a maximum width that suits a form. (`DoSingleTask`)
- **Don't:** Center paragraphs: each line starts at a different place, so it's harder to read. (`DontCenterLongText`)

## Accessibility

- **Role and name:** none of its own: a layout box. Use `as="main"` when it holds the page's main content, so people can jump to it.
- **Keyboard:** none: a layout box, not focusable. The reading and Tab order stay the order of its children.
- **Reflow:** the content takes the full width less the padding on a narrow screen, so nothing scrolls sideways at 320px (WCAG 1.4.10). With `vertical`, content taller than the screen grows the box and the page scrolls, so nothing is cut off at 400% zoom.
- **What's still yours:** the page's h1, its landmarks and its skip link (the Build a page guide).

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `maxWidth` | string | `'container-md'` (448px) | The widest the content gets: a sizing token name or a CSS length |
| `vertical` | boolean | `false` | Also centers it from top to bottom, in a box at least as tall as the screen |
| `intrinsic` | boolean | `false` | Each child at its own width, centered, instead of stretched across |
| `centerText` | boolean | `false` | Centers the lines of text too |
| `padded` | boolean | `true` | 16px of side padding outside the maximum width; with `vertical`, 32px above and below too |
| `as` | `'div'` \| `'main'` \| `'section'` \| `'article'` | `'div'` | The element |

A value that isn't on the list falls back to the default. `className`, `style`, `ref` and everything else go to the element, which has `data-component="center"`.

## Component tokens

Each is an optional override: set it on the page, a container or one Center. The list lives in `src/components/Center/center.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from center.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--center-max-width` | `container-md` | The widest the content gets when maxWidth isn't given (448px). |
| `--center-padding-x` | `spacing-4` | Side padding, outside the maximum width (16px). |
| `--center-padding-y` | `spacing-8` | Space above and below with vertical (32px). |
<!-- token-table:end -->
