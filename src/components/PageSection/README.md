# PageSection

One full-width band of a long page, such as a landing page's hero, features, pricing or questions. It gives the band its background, its space above and below, and keeps its content to a Container's width, spaced in a column.

**Also called:** section, band, strip, hero.

```tsx
import { PageSection, Heading, Button } from "@diki-stwn/serupa-ds";

<PageSection spacing="lg" align="center" size="md" aria-labelledby="hero">
  <Heading level={1} id="hero">Plan the work. Ship it together.</Heading>
  <Button size="lg">Start free</Button>
</PageSection>

<PageSection tone="muted" divider aria-labelledby="features">…</PageSection>
```

## When to use

- The bands of a marketing or landing page: a hero, features, pricing, questions, a closing call to action.
- Any long page split into parts that each span the page, such as a help center's home.

## When not to use

- A group of related content inside an app's page: use a [Card](../Card/README.md), or a heading and a [Stack](../Stack/README.md).
- A page's width alone, with no band: use [Container](../Container/README.md) instead.
- A short centered page, such as sign-in: use [Center](../Center/README.md) instead.

## Anatomy

Drawn from the `Playground` story.

1. **Band** (`.srp-page-section`): the full-width `<section>`, with its tone, its spacing above and below, and its divider.
2. **Inner box** (`.srp-page-section__inner`): the Container inside the band, which keeps the content to `size` and lays it out with `gap`.

## Usage

- Alternate `tone="plain"` and `tone="muted"` down a long page, so each band reads as its own. Add `divider` between two plain bands.
- Use `spacing="lg"` for the hero, `md` (the default) for the bands below it, and `sm` for a short one, such as a row of logos.
- Give every band on a page the same `size`, unless it's a hero or a closing call to action, which read better narrower (`md`) and centered (`align="center"`).
- The band's children are spaced 32px apart (`gap`); lay out what's inside each child with a Stack or a Grid.

### Do and don't

- **Do:** Alternate plain and muted bands, so each part of a long page reads as its own. (`DoAlternate`)
- **Don't:** Put two muted bands one after the other: the edge between them disappears. (`DontSameTone`)

## Accessibility

- **Role and name:** a `<section>` by default. Name it with `aria-labelledby` pointing at its heading, so it's a region people can jump to. Use `as="div"` for a band with no heading of its own.
- **Keyboard:** none: a layout box, not focusable.
- **Contrast:** text and muted text read 4.5:1 on the muted band in every theme (`PageSection.test.tsx`).
- **Reflow:** the content wraps inside the Container's width, so nothing scrolls sideways at 320px (WCAG 1.4.10).
- **What's still yours:** one h1 on the page (in the hero), and headings that go down a level at a time in the bands below it.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the band's element (`as`), so a link can point at the section. |
| `tone` | `'plain'` \| `'muted'` | `'plain'` | The page's own background, or a step below it |
| `divider` | boolean | `false` | A line across the top |
| `spacing` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Space above and below: 32px; 48px, 64px from 768px; 64px, 96px from 768px |
| `size` | `'prose'` \| `'md'` \| `'lg'` \| `'xl'` \| `'2xl'` \| `'full'` | `'xl'` | The content's width, a [Container](../Container/README.md) size |
| `align` | `'start'` \| `'center'` | `'start'` | Centers the content and its lines of text |
| `gap` | a spacing step: `0` to `24` | `8` (32px) | The space between the children |
| `as` | `'section'` \| `'div'` \| `'header'` \| `'footer'` \| `'aside'` | `'section'` | The element |

A value that isn't on the list falls back to the default. `className`, `style`, `ref` and everything else go to the outer element, which has `data-component="page-section"`; the content is in a Container with `.srp-page-section__inner`.

## Component tokens

Each is an optional override: set it on the page, a container or one PageSection. The list lives in `src/components/PageSection/page-section.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from page-section.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--page-section-bg-muted` | `surface-sunken` | The background with tone="muted". |
| `--page-section-border` | `border` | The line on top with divider. |
| `--page-section-padding-y-sm` | `spacing-8` | Space above and below with spacing="sm" (32px). |
| `--page-section-padding-y-md` | `spacing-12` | Space above and below with spacing="md", below 768px (48px). |
| `--page-section-padding-y-md-wide` | `spacing-16` | Space above and below with spacing="md", from 768px (64px). |
| `--page-section-padding-y-lg` | `spacing-16` | Space above and below with spacing="lg", below 768px (64px). |
| `--page-section-padding-y-lg-wide` | `spacing-24` | Space above and below with spacing="lg", from 768px (96px). |
| `--page-section-gap` | `spacing-8` | The space between the children when gap isn't given (32px). |
<!-- token-table:end -->
