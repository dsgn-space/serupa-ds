# Illustration

A small line drawing for an empty state, an error page or a finished flow. It's drawn in the theme's own colors, so it fits all six themes and follows a brand's overrides without new artwork.

```tsx
import { EmptyState, Illustration } from "serupa-ds";

<EmptyState icon={<Illustration name="search" />} title="No results for “mars”" description="Check the spelling or try a broader search." />
```

## When to use

- A page or a large panel that's empty, failed or done, where a picture helps the moment read at a glance: a first-run list, no search results, offline, no access, a finished sign-up.

## When not to use

- Inside a card, a table or a menu: there's no room. Use EmptyState's `icon` with an icon name ([EmptyState](../EmptyState/README.md)).
- As the only way to say what happened. The title beside it says that; the picture only supports it.
- For a brand's own artwork: pass that as an element to EmptyState's `icon` instead.

## Anatomy

Drawn from the `Search` story.

1. **Fill** (`.dk-illustration__fill`): the soft shapes, in `--illustration-fill`.
2. **Line** (`.dk-illustration__line`): the outlines, 3:1 on the surface.
3. **Accent** (`.dk-illustration__accent`): the one detail that says what happened, in the primary color.

## Usage

- Pick the picture that matches the title: `empty` for nothing yet, `search` for no results, `error` for a failure, `offline` for no connection, `no-access` for a missing permission, `success` for done.
- One per view. `md` (160px) suits a page, `sm` (96px) a side panel or a dialog, `lg` (224px) a full error page.
- Recolor it with the tokens below, not by editing paths: `--illustration-accent` set to `var(--danger)` makes the error picture red.

## Accessibility

- **Role and name:** hidden from screen readers by default (`aria-hidden`), because the text beside it says the same thing. With `label`, it's `role="img"` with that name: use it only when the picture adds something the text doesn't.
- **Keyboard:** not focusable (`focusable="false"`, also in old Edge).
- **Contrast:** its outlines and accent read 3:1 on the surface in all six themes (`Illustration.test.tsx`), as WCAG 1.4.11 asks of a graphic. In forced colors the lines take the system colors.
- **What's still yours:** the title and description that say what happened, and the action that gets the person out.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `'empty' \| 'search' \| 'error' \| 'offline' \| 'no-access' \| 'success'` | `'empty'` | Which picture. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 96, 160 or 224px wide, at 4:3. |
| `label` | `string` | | Makes it an image with this name. Without it, it's hidden from screen readers. |
| `id` | string | none | Goes to the `<svg>`. |

`className`, `ref` and other props go to the `<svg>`.

## Component tokens

Each is an optional override: set it on the page, a container or one Illustration. The list lives in `src/components/Illustration/illustration.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from illustration.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--illustration-line` | `text-muted` | The outlines (3:1 on the surface behind). |
| `--illustration-fill` | `secondary` | The shapes' soft fill. |
| `--illustration-accent` | `primary` | The one detail that says what happened: the lens, the check, the slash (3:1 on the surface behind). |
| `--illustration-size-sm` | `spacing-24` | size="sm" (96px wide). |
| `--illustration-size-md` | `spacing-40` | size="md" (160px wide). |
| `--illustration-size-lg` | `spacing-56` | size="lg" (224px wide). |
<!-- token-table:end -->
