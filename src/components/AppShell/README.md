# AppShell

The frame around an app's pages: a skip link, the header, the sidebar, main, the footer and a bottom navigation, laid out and kept in place as the page scrolls. Each page then only fills in main.

**Also called:** app layout, page shell, application frame.

```tsx
import { AppShell, Navbar, Sidebar, SidebarItem } from "@diki-stwn/serupa-ds";

<AppShell
  header={<Navbar sticky brand="Acme">…</Navbar>}
  sidebar={<Sidebar aria-label="Workspace">…</Sidebar>}
  footer="© 2026 Acme"
  background="muted"
>
  <Heading level={1}>Dashboard</Heading>
  …
</AppShell>
```

## When to use

- An app with several pages people move between, where the navigation stays put and only the content changes.
- A settings page, a dashboard, a list beside its detail: anything inside a signed-in app.

## When not to use

- A sign-in, sign-up or error page with no navigation: use [Center](../Center/README.md) as main instead.
- A marketing page of full-width bands: use a [Navbar](../Navbar/README.md), [PageSection](../PageSection/README.md)s and a Footer instead.
- Two columns inside a page, such as filters beside results: use [SidebarLayout](../SidebarLayout/README.md) inside main.

## Usage

- Pass a sticky [Navbar](../Navbar/README.md) as `header`: the sidebar then sticks below it and is the screen's height less the bar, with its own scroll. With a header that doesn't stick, the sidebar runs down beside main and the footer.
- Pass a [Sidebar](../Sidebar/README.md) as `sidebar`. It's gone below `sidebarFrom` (640px by default), so put its links in the Navbar's menu or a [BottomNav](../BottomNav/README.md) for phones, with `hideFrom` set to the same width.
- Set `background="muted"` when the page is built from Cards or panels: a dashboard, settings in Card sections, a board, a list beside its detail. Keep `plain` for a page people read or fill in (the Build a page guide, "The page's background").
- Pass the footer's content, not a `<footer>`: AppShell renders the footer landmark.
- `padded` gives main 16px of padding, 24px from 640px and 32px from 1024px. Set `padded={false}` for content that brings its own, such as a full-bleed map.

### Do and don't

- **Do:** Use the muted background behind a page built from Cards. (`DoMutedCards`)
- **Don't:** Put Cards on the plain background: their edges barely show. (`DontPlainCards`)

## Accessibility

- **Landmarks:** your header (a Navbar is a banner), the sidebar's `nav`, one `main` and one `footer` (contentinfo). Give the Sidebar a name of its own ("Workspace"), told apart from the Navbar's.
- **Skip link:** "Skip to content" is the first Tab stop. It moves focus into main, past the header and the sidebar (WCAG 2.4.1); main has `tabindex="-1"` so focus lands there in every browser, with no outline of its own.
- **Focus not hidden:** a sticky Navbar sets the page's scroll padding, so a focused element in main is never under the bar (2.4.11).
- **Contrast:** text reads 4.5:1 on main's plain and muted backgrounds, and the footer's muted text on its own, in every theme (`AppShell.test.tsx`).
- **Reflow:** below `sidebarFrom` the sidebar gives its room to main, so nothing scrolls sideways at 320px (1.4.10). Keep its links reachable in the Navbar's menu or a BottomNav.
- **What's still yours:** the page's one h1 in main, the page's title, and moving focus after a route change with `announcePage()`.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `header` | ReactNode | none | The bar across the top: a Navbar |
| `sidebar` | ReactNode | none | Beside main, on the start side: a Sidebar |
| `sidebarFrom` | `'sm'` \| `'md'` \| `'lg'` | `'sm'` | The width the sidebar shows from: 640, 768 or 1024px |
| `children` | ReactNode | none | The page's content, in main |
| `footer` | ReactNode | none | The footer's content, below main |
| `bottomNav` | ReactNode | none | A BottomNav for phones, last in the page |
| `background` | `'plain'` \| `'muted'` | `'plain'` | main's background |
| `padded` | boolean | `true` | Padding around main's content |
| `skipLink` | boolean | `true` | A "Skip to content" link first in the page |
| `mainId` | string | `'main'` | main's id, the skip link's target |

A value that isn't on the list falls back to the default. `className`, `style`, `ref` and everything else go to the outer `<div>`, which has `data-component="app-shell"`.

## Component tokens

Each is an optional override: set it on the page, a container or one AppShell. The list lives in `src/components/AppShell/app-shell.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from app-shell.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--app-shell-bg` | `surface` | The page's background, and main's with background="plain". |
| `--app-shell-bg-muted` | `surface-muted` | main's background with background="muted". |
| `--app-shell-text` | `text` | The text (4.5:1 on bg and bg-muted). |
| `--app-shell-border` | `border` | The line above the footer. |
| `--app-shell-footer-text` | `text-muted` | The footer's text (4.5:1 on bg). |
| `--app-shell-padding` | `spacing-4` | Padding around main's content on small screens (16px). |
| `--app-shell-padding-sm` | `spacing-6` | Padding around main's content from 640px (24px). |
| `--app-shell-padding-lg` | `spacing-8` | Padding around main's content from 1024px (32px). |
| `--app-shell-footer-padding` | `spacing-6` | Padding inside the footer (24px). |
<!-- token-table:end -->
