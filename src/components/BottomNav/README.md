# BottomNav

A bar of three to five main destinations fixed along the bottom of a phone screen, where a thumb reaches: each an icon over a short label, the current page marked. From 768px up it hides by default, where [Navbar](../Navbar/README.md) shows its links.

**Also called:** tab bar, bottom navigation bar.

```tsx
import { BottomNav, BottomNavLink } from "serupa-ds";

<BottomNav label="Main">
  <BottomNavLink href="/" icon="home">Home</BottomNavLink>
  <BottomNavLink href="/inbox" icon="inbox" active>Inbox</BottomNavLink>
  <BottomNavLink as={RouterLink} to="/account" icon="person">Account</BottomNavLink>
</BottomNav>
```

## When to use

- An app people use on a phone with three to five top-level places they switch between often.

## When not to use

- Two places, or more than five: use [Tabs](../Tabs/README.md) for two, and [Navbar](../Navbar/README.md)'s menu or a [Sidebar](../Sidebar/README.md) for more.
- Actions, such as "New message": use a [Fab](../Fab/README.md) or a Button. Every item here goes somewhere.
- Steps in a flow, or filters on one page: use [Tabs](../Tabs/README.md) or [SegmentedControl](../SegmentedControl/README.md).

## Anatomy

Drawn from the `Playground` story.

1. **Bar** (`.dk-bottom-nav`): the navigation landmark, fixed along the bottom of a narrow screen, clear of a phone's home bar.
2. **List** (`.dk-bottom-nav__list`): the destinations, side by side in equal widths.
3. **Link** (`.dk-bottom-nav__link`): one destination; the current page is shaded and has `aria-current="page"`.
4. **Icon** (`.dk-bottom-nav__icon`): the destination's icon, in a pill that is shaded on the current page.
5. **Label** (`.dk-bottom-nav__label`): the destination's name, always shown under its icon.
6. **Spacer** (`.dk-bottom-nav__spacer`): holds the bar's height at the end of the page, so the bar never covers the last content.

## Usage

- **Links:** BottomNavLink takes an `icon` and a label of one or two short words; `active` marks the current page. `as` renders your router's link, typed with its props, or set it once with `configure({ link })`.
- **Widths:** `hideFrom` is the width from which it hides: `'md'` (768px, default), `'sm'` (640px), `'lg'` (1024px) or `false` to keep it at every width. Show the same destinations in the Navbar or Sidebar above that width.
- **Room on the page:** while it shows, a spacer before it takes its height at the end of the page, so the last content scrolls clear of it, and `scroll-padding-bottom` keeps anything focused or scrolled to from hiding under it.
- **Other things on the bottom edge:** a bottom [Toaster](../Toast/README.md), [OfflineBanner](../OfflineBanner/README.md) and [Fab](../Fab/README.md) move up above the bar while it shows.
- **Safe areas:** on phones with a home indicator it adds `env(safe-area-inset-bottom)` under the links (and the side insets in landscape). Pages need `viewport-fit=cover` in their viewport meta for the browser to report them.
- Keep the order the same on every page, and one BottomNav per page.

### Do and don't

- **Do:** Give each link an `icon` and one or two short words ("Home", "Inbox"). (`DoShortLabels`)
- **Don't:** Write long labels: they wrap and crowd the bar on a phone. (`DontLongLabels`)

## Accessibility

- **Role and name:** a `<nav>` landmark named by `label`, with a list of links, so screen readers say how many there are. The current one has `aria-current="page"`. Icons are hidden; the label is each link's name.
- **Keyboard:** each link is a Tab stop, in order; the focus ring is drawn inside the link so the bar doesn't cut it.
- **Target size:** each link fills its column and the bar's 64px height.
- **Contrast:** labels and the current page read 4.5:1 on the bar in all six themes (`BottomNav.test.tsx`). In forced-colors mode the current page keeps an outline.
- **Print:** it and its spacer are hidden.
- **What's still yours:** short labels that make sense alone, `active` on the right link, and the same destinations reachable above `hideFrom`.

## Props

### BottomNav

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | | The landmark's name ("Main") |
| `hideFrom` | `'sm'` \| `'md'` \| `'lg'` \| `false` | `'md'` | The width from which it hides |
| `children` | `ReactNode` | | Three to five BottomNavLink |
| `id` | string | none | Goes to the `<nav>`. |

`className`, `ref` and other props go to the `<nav>`.

### BottomNavLink

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `icon` | icon name, icon or element | | Over the label |
| `active` | `boolean` | `false` | The current page |
| `as` | component | `configure({ link })` or `'a'` | Your router's link |
| `children` | `ReactNode` | | The label |

Other props, such as `href` or your router's `to`, go to the link.

## Component tokens

Each is an optional override: set it on the page, a container or one BottomNav. The list lives in `src/components/BottomNav/bottom-nav.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from bottom-nav.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--bottom-nav-bg` | `surface` | The bar's background. |
| `--bottom-nav-border` | `border` | The hairline along its top. |
| `--bottom-nav-text` | `text-muted` | A link's icon and label (4.5:1 on bg). |
| `--bottom-nav-text-hover` | `text` | A link under the pointer. |
| `--bottom-nav-icon-bg-hover` | `secondary` | The pill behind the icon under the pointer. |
| `--bottom-nav-icon-bg-pressed` | `secondary-hover` | The pill behind an item's icon while the item is held down, one step past hover (not on the current item, which keeps its own fill). |
| `--bottom-nav-text-active` | `text` | The current page's icon and label (4.5:1 on bg). Neutral: the accent is kept for focus. |
| `--bottom-nav-icon-bg-active` | `highlight` | The pill behind the current page's icon. |
| `--bottom-nav-focus-ring` | `focus-ring` | The keyboard focus ring, inside the link. |
| `--bottom-nav-height` | `spacing-16` | The bar's height above the safe-area inset (64px); links fill it, so each is a 64px-tall target. |
| `--bottom-nav-z-index` | `z-40` | Its stacking: with a sticky Navbar, under dialogs and toasts. |
<!-- token-table:end -->
