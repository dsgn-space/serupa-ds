# Navbar

The bar across the top of an app: the brand on the left, the main page links, and actions on the right (search, a user menu, sign in). Below 768px wide the links fold into a menu button that opens them in a panel under the bar. A NavbarMenu in the bar opens a panel of grouped links with a line about each (a mega menu).

**Also called:** header, top bar, app bar.

```jsx
const { Navbar, NavbarLink, Button, Avatar } = window.Serupa;

<Navbar
  sticky
  brand={<a href="/">Acme</a>}
  actions={<><Button variant="ghost" size="sm">Docs</Button><Avatar name="Ada Lovelace" size="sm" /></>}
>
  <NavbarLink href="/" active>Dashboard</NavbarLink>
  <NavbarLink href="/projects">Projects</NavbarLink>
  <NavbarLink as={RouterLink} to="/team">Team</NavbarLink>
</Navbar>
```

## When to use

- The top level of an app or site with a handful of main pages.
- A place for the brand and app-wide actions, such as search, a user menu or sign in.
- A few top-level sections that each hold several pages worth a line of explanation, such as Products or Resources on a marketing site: a `NavbarMenu` with `NavbarMenuGroup`s of `NavbarMenuLink`s.

## When not to use

- Many pages, or pages in groups and levels: use a [Sidebar](../Sidebar/README.md) instead.
- Switching between views of the same thing on one page: use [Tabs](../Tabs/README.md) instead.
- Showing where a page sits in a hierarchy: use a [Breadcrumb](../Breadcrumb/README.md) instead.

## Anatomy

Drawn from the `Playground` story.

1. **Brand** (`.dk-navbar__brand`): the product's name or logo, linking home.
2. **Links** (`.dk-navbar__links`): the main sections of the site.
3. **Current link** (`.dk-navbar__link--active`): the section you're in.
4. **Actions** (`.dk-navbar__actions`): search, account or other actions at the end.

## Usage

- A NavbarMenu's parts (the `Menus` story): its button (`.dk-navbar__menu-button`), with the section's name and a chevron that turns while it's open; the panel (`.dk-navbar__menu-panel`) across the bar under it; its groups (`.dk-navbar__menu-group`), each a title over a list of links; and each link (`.dk-navbar__menu-link`), its name and a muted line about it.
- Keep the links to the main pages, a few short words each; below 768px they fold into the menu button. More links than fit below the bar scroll inside the panel, and in the panel a long label wraps onto more lines.
- Mark the current page with `active` on its NavbarLink.
- Register your router's link component once with `configure({ link })`, or pass it in `as`, so links don't reload the page.
- Keep `actions` compact below 768px, such as one small button and an Avatar. If they don't fit, the brand shrinks and ends in an ellipsis so the menu button stays on screen; if they still don't, they scroll sideways within the bar (Tab scrolls each into view), and the page never does.
- Set `size` to the same width as the page's Container, so the bar lines up with the content.
- For a section with several pages, use a `NavbarMenu` with a `label` and its links, grouped in `NavbarMenuGroup`s with a `title` when there are more than a handful. Give each `NavbarMenuLink` a short `description` when the name alone doesn't say what's there. Keep a panel to what fits on one screen: it's a way in, not a site map.
- A NavbarMenu's button doesn't go anywhere itself. Give the section's own page a link in its panel, such as "All products".

### Do and don't

- **Do:** Keep the links to the main pages, a few short words each. (`DoFewLinks`)
- **Don't:** Put every page in the bar: most fold away, and the main ones get lost among them. (`DontEveryPage`)

## Accessibility

- It's a `<header>` (the banner landmark, when it's the page's top-level header) holding a `<nav>` named "Main", so people can jump to the links.
- The current page has `aria-current="page"`, a shaded background and a 2px bar in the primary color along its bottom (at the start of a link in a menu panel), not just a color change. Hover shades a link the same way but never draws the bar, and the current page darkens one step under the pointer. In forced colors (Windows High Contrast), where the shading is dropped, it has an outline.
- On small screens the menu button has `aria-expanded` and `aria-controls`. Escape closes the menu and returns focus to the button.
- With the menu open, Tab goes from the button into the links, in the order they appear, since the panel opens under the bar: the links come after the button in the DOM while it's open. Tab past the last link, any move of focus out of the bar, or a press outside it closes the menu.
- The panel fades in as it opens and unrolls down from the bar, over 150ms, and fades back out when it closes, as Popover and Menu do. While it fades out it stays after the button and can't be used. With reduced motion it only fades.
- **NavbarMenu** is a disclosure, not an ARIA menu (`role="menu"` is for app commands): a `<button>` with `aria-expanded` and `aria-controls`, and the panel after it, so Tab goes from the button into its links. Each group is a `role="group"` named by its title. A link with a `description` is named by its text and described by the line (`aria-describedby`), so a screen reader says the name first. Escape closes the panel and returns focus to its button, and in the small-screen menu it leaves that menu open. A press outside, focus leaving it, following a link or opening another NavbarMenu closes it: one is open at a time. On small screens the panel opens in place, under its button, inside the menu.
- Links keep 4.5:1 on the bar, and the current page and hovered links on their shading, in all six themes (`Navbar.test.tsx`).

### Keyboard

| Key | Does |
| --- | --- |
| Tab | Through the brand, links and actions; on small screens, the menu button, then the menu's links once it's open |
| Enter / Space | On the menu button, opens or closes the menu; on a NavbarMenu's button, opens or closes its panel |
| Escape | Closes a NavbarMenu's panel and returns focus to its button; else closes the menu and returns focus to the menu button |

## Props

### Navbar

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<header>`. |
| `brand` | node | none | The logo or product name, usually a link home |
| `children` | NavbarLinks | none | The main pages |
| `actions` | node | none | Controls on the right; they stay in the bar on small screens |
| `sticky` | boolean | `false` | Stays at the top while the page scrolls (z-40). What Tab focuses, or a #link jumps to, scrolls into view below the bar instead of under it (WCAG 2.4.11): the page's `scroll-padding-top` follows the bar's height. Once the page scrolls under it, the bar lifts: a shadow fades in over the first bar height of scroll, tied to the scroll rather than a clock (where scroll-driven animations are supported; elsewhere the line alone). |
| `size` | `'prose'` \| `'md'` \| `'lg'` \| `'xl'` \| `'2xl'` \| `'full'` | `'xl'` | The content's maximum width, the same as Container, so it lines up with the page |
| `aria-label` | string | `"Main"` | The links' nav name |
| `menuLabel` | string | `"Menu"` | The small-screen menu button's name |

`className`, `style`, `ref` and everything else go to the `<header>`, which has `data-component="navbar"` and `data-state="open"` or `"closed"` (the small-screen menu).

### NavbarLink

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `active` | boolean | `false` | The current page: shaded, with a bar in the primary color and `aria-current="page"` |
| `as` | a component | the `configure({ link })` link, else `'a'` | Your router's link component. Set it once for the app with `configure({ link })`; `as` wins for one link. Typed: the props and `ref` are those of the element `as` names, so `as={RouterLink} to="/team"` checks `to`, and without `as` they're an `<a>`'s. A link set only with `configure({ link })` is typed as an `<a>`, so pass it `href`. |

Following a link closes the small-screen menu. `href`, `className`, `ref` and everything else go to the link (an `<a>`, or what `as` names).

### NavbarMenu

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | node | | The button's text: what its links are about |
| `children` | NavbarMenuGroups or NavbarMenuLinks | none | The panel's links; links on their own are one list |
| `active` | boolean | `false` | The current page is one of its links: the button is shaded and barred as the current page's link is, with `aria-current="true"` |

`id`, `className`, `ref` and everything else go to its wrapping `<div>`, which has `data-state="open"` or `"closed"`.

### NavbarMenuGroup

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | node | | Shown above its links, and names the group |
| `children` | NavbarMenuLinks | none | Its links |

`id`, `className`, `ref` and everything else go to the group's `<div>`.

### NavbarMenuLink

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `description` | node | none | A line under the name saying what's there, read as the link's description |
| `active` | boolean | `false` | The current page: shaded, with a bar in the primary color and `aria-current="page"` |
| `as` | a component | the `configure({ link })` link, else `'a'` | Your router's link component, as on NavbarLink |

Following one closes its panel and the small-screen menu. `id`, `href`, `className`, `ref` and everything else go to the link.

## Component tokens

Each is an optional override: set it on the page, a container or one navbar. The list lives in `src/components/Navbar/navbar.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from navbar.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--navbar-bg` | `surface` | The bar's background. |
| `--navbar-bg-scrolled` | `surface-raised` | A sticky bar's background once the page has scrolled under it, faded in with its shadow. In the dark themes it's the lighter raised surface, since a shadow barely shows on a near-black page; in the light ones it's the same white. Set it with --navbar-bg when you change that. |
| `--navbar-border` | `border` | The line under the bar. |
| `--navbar-brand-text` | `text` | The brand (logo and name) at the start of the bar. |
| `--navbar-link-text` | `text-muted` | A link (4.5:1 on bg and link-bg-hover). |
| `--navbar-link-text-hover` | `text` | A link on hover. |
| `--navbar-link-text-active` | `text` | The current page's link. |
| `--navbar-link-bg-hover` | `secondary` | A link's background on hover. |
| `--navbar-link-bg-active` | `secondary` | The current page's link background. |
| `--navbar-link-bg-active-hover` | `pressed` | The current page's link background under the pointer: one step past its rest. |
| `--navbar-link-indicator` | `primary` | The 2px bar under the current page's link (at the start of a menu link), which hover never draws. |
| `--navbar-focus-ring` | `focus-ring` | The keyboard focus ring. |
| `--navbar-link-bg-pressed` | `pressed` | A link's fill while it's held down. |
| `--navbar-menu-bg` | `surface-overlay` | A dropdown panel's background (NavbarMenu). |
| `--navbar-menu-border` | `border` | A dropdown panel's border. |
| `--navbar-menu-title-text` | `text-muted` | A group's title in a dropdown panel (4.5:1 on menu-bg). |
| `--navbar-menu-link-text` | `text` | A dropdown link's text (4.5:1 on menu-bg). |
| `--navbar-menu-desc-text` | `text-muted` | A dropdown link's description (4.5:1 on menu-bg). |

**Type**

| Token | Default | Use |
| --- | --- | --- |
| `--navbar-link-size` | `text-sm` | Link text (14px). |
| `--navbar-link-weight` | `font-medium` | Link weight (500). |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--navbar-height` | `spacing-16` | The bar's height (64px). |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--navbar-gap` | `spacing-6` | Space between the brand, the links and the actions (24px). |
| `--navbar-link-gap` | `spacing-1` | Space between links (4px). |
| `--navbar-link-padding-x` | `spacing-3` | A link's side padding (12px). |
| `--navbar-link-padding-y` | `spacing-2` | A link's top and bottom padding (8px). |

**Border**

| Token | Default | Use |
| --- | --- | --- |
| `--navbar-border-width` | `border-width-1` | The line under the bar (1px). |

**Radius**

| Token | Default | Use |
| --- | --- | --- |
| `--navbar-link-radius` | `radius-control` | A link's corners (6px). |

**Layout**

| Token | Default | Use |
| --- | --- | --- |
| `--navbar-z-index` | `z-40` | Above the page when sticky. |

**Shadow**

| Token | Default | Use |
| --- | --- | --- |
| `--navbar-shadow-scrolled` | `elevation-raised` | A sticky bar's shadow once the page has scrolled under it. |
| `--navbar-menu-shadow` | `elevation-overlay` | A dropdown panel's shadow on wide screens. |
| `--navbar-menu-depth` | `depth-surface` | The narrow-screen menu's tactile layers, over its shadow: a light along the top edge and a shade along the bottom one. None in the flat brands. |
<!-- token-table:end -->
