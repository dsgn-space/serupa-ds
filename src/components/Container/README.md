# Container

Centers a page's content with a maximum width, and side padding that grows with the screen: 16px, 24px from 640px and 32px from 1024px wide.

## Usage

```jsx
const { Container } = window.Diki;

<Container as="main">…</Container>
<Container size="prose">{article}</Container>
<Container size="lg" padded={false}>…</Container>
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `size` | `'prose'` \| `'md'` \| `'lg'` \| `'xl'` \| `'2xl'` \| `'full'` | `'xl'` | The widest it gets: 672px (`container-2xl`, for reading), 768, 1024, 1280 or 1536px (`screen-*`), or no maximum |
| `padded` | boolean | `true` | Side padding that grows with the screen |
| `as` | `'div'` \| `'main'` \| `'section'` \| `'header'` \| `'footer'` \| `'article'` | `'div'` | The element |

`className`, `style`, `ref` and everything else go to the element, which has `data-component="container"` and `data-size`.

## Accessibility

- Use `as="main"` for the page's main content (once per page), so people can jump to it.
- `prose` keeps lines to a comfortable reading length: use it for long text.

## Component tokens

Each is an optional override: set it on the page, a container or one element. The list lives in `src/components/Container/container.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--container-padding-x` | `spacing-4` | Side padding on small screens (16px). |
| `--container-padding-x-sm` | `spacing-6` | Side padding from 640px (24px). |
| `--container-padding-x-lg` | `spacing-8` | Side padding from 1024px (32px). |
