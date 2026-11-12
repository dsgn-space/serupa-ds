# Logo

The product's logo at a set height, with a version for dark themes and a small mark for narrow screens. The browser fetches only the version it shows.

```tsx
import { Logo } from "serupa-ds";

<a href="/" aria-label="Acme home">
  <Logo src="/logo.svg" darkSrc="/logo-dark.svg" markSrc="/mark.svg" markDarkSrc="/mark-dark.svg" variant="auto" alt="" />
</a>
```

## When to use

- The brand at the start of a [Navbar](../Navbar/README.md) or [Sidebar](../Sidebar/README.md), on a sign-in page, or in a footer.
- Where the logo must follow the theme: a dark version in dark themes, without code that reads the theme.

## When not to use

- A picture of content, such as a photo or a chart: use [Image](../Image/README.md), which keeps a frame, a placeholder and a fallback.
- A person or a team: use [Avatar](../Avatar/README.md).
- A brand that is only text: put the name in the link, styled as you like.

## Anatomy

Drawn from the `Default` story.

1. **Picture** (`.dk-logo__picture`): with a dark version or a mark, a `<picture>` that offers them to the browser ahead of the full logo. It takes no room of its own.
2. **Logo** (`.dk-logo`): the `<img>`, at the size's height, named by `alt`.

## Usage

- Give it the full logo (`src`) drawn for a light background, and, where it can be shown on dark, `darkSrc`. A theme with no dark version shows `src` as is, so pick one that reads on both if you have only one.
- `markSrc` (and `markDarkSrc`) is the small square symbol. `variant="mark"` always shows it; `variant="auto"` shows it below `collapseBelow` (768px by default, where Navbar folds its links) and the full logo from there up.
- `size` sets the height (24, 32 or 40px); the width follows the picture's shape. SVG files keep it sharp at every size.
- It isn't a link. Put it in the app's link home (a router link, or `<a href="/">`), name the link ("Acme home") and pass `alt=""`, so a screen reader doesn't read the name twice.

### Do and don't

- **Do:** Give it `darkSrc` (and `markDarkSrc`) wherever it can show on dark. (`DoDarkVersion`)
- **Don't:** Ship only the light logo: in a dark theme it's dark on dark. (`DontNoDarkVersion`)

## Accessibility

- **Role and name:** an `img` named by `alt`, the brand's name. With `alt=""` inside a named link, it's left out and the link carries the name.
- **Keyboard:** none of its own: it isn't focusable. The link it sits in takes focus and shows its ring.
- **Contrast:** the logo's own colors are the picture's. A dark version for dark themes keeps it readable there (WCAG 1.4.11 asks 3:1 for the parts needed to recognise it, though logotypes are exempt from 1.4.3).
- **What's still yours:** `alt`, the link's name, and versions that read on light and dark backgrounds.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | | The full logo, for a light background. |
| `alt` | `string` | | The brand's name; `""` inside a named link. |
| `darkSrc` | `string` | | The full logo for a dark background, shown in a dark theme (or when the screen prefers dark, where the theme follows it). |
| `markSrc` | `string` | | The small mark alone, for narrow spaces. |
| `markDarkSrc` | `string` | | The small mark for a dark background. |
| `variant` | `'full' \| 'mark' \| 'auto'` | `'full'` | `auto` shows the mark below `collapseBelow`. Without `markSrc`, always the full logo. |
| `collapseBelow` | `'sm' \| 'md' \| 'lg'` | `'md'` | With `auto`: below 640, 768 or 1024px the mark shows. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | The height: 24, 32 or 40px. |

`className`, `id`, `ref` and other props (`width`, `height`, `loading`, `fetchPriority`) go to the `<img>`.

## Component tokens

Each is an optional override: set it on the page, a container or one Logo. The list lives in `src/components/Logo/logo.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from logo.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--logo-height-sm` | `spacing-6` | Its height at size sm (24px): a compact bar or a footer. |
| `--logo-height-md` | `spacing-8` | Its height at size md (32px), the default: a Navbar or Sidebar. |
| `--logo-height-lg` | `spacing-10` | Its height at size lg (40px): a sign-in page or a splash. |
<!-- token-table:end -->
