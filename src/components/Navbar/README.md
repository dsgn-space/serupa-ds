# Navbar

The bar across the top of an app: the brand on the left, the main page links, and actions on the right (search, a user menu, sign in). Below 768px wide the links fold into a menu button that opens them in a panel under the bar.

## Usage

```jsx
const { Navbar, NavbarLink, Button, Avatar } = window.Diki;

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

## Props

### Navbar

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `brand` | node | none | The logo or product name, usually a link home |
| `children` | NavbarLinks | none | The main pages |
| `actions` | node | none | Controls on the right; they stay in the bar on small screens |
| `sticky` | boolean | `false` | Stays at the top while the page scrolls (z-40) |
| `size` | `'md'` \| `'lg'` \| `'xl'` \| `'2xl'` \| `'full'` | `'xl'` | The content's maximum width, the same as Container, so it lines up with the page |
| `aria-label` | string | `"Main"` | The links' nav name |
| `menuLabel` | string | `"Menu"` | The small-screen menu button's name |

`className`, `style`, `ref` and everything else go to the `<header>`, which has `data-component="navbar"` and `data-state="open"` or `"closed"` (the small-screen menu).

### NavbarLink

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `href` | string | none | Where it goes |
| `active` | boolean | `false` | The current page: shaded, with `aria-current="page"` |
| `as` | a component | `'a'` | Your router's link component |

Following a link closes the small-screen menu. `className`, `ref` and everything else go to the link.

## Accessibility

- It's a `<header>` (the banner landmark, when it's the page's top-level header) holding a `<nav>` named "Main", so people can jump to the links.
- The current page has `aria-current="page"` and a shaded background, not just a color change.
- On small screens the menu button has `aria-expanded` and `aria-controls`. Escape closes the menu and returns focus to the button.
- Links keep 4.5:1 on the bar, and the current page and hovered links on their shading, in all six themes (`tools/test/navbar.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one navbar. The list lives in `src/components/Navbar/navbar.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--navbar-bg` | `surface` | The bar's background. |
| `--navbar-border` | `border` | The line under the bar. |
| `--navbar-link-text` | `text-muted` | A link (4.5:1 on bg and link-bg-hover). |
| `--navbar-link-text-hover` | `text` | A link on hover. |
| `--navbar-link-text-active` | `text` | The current page's link. |
| `--navbar-link-bg-hover` | `secondary` | A link's background on hover. |
| `--navbar-link-bg-active` | `secondary` | The current page's link background. |
| `--navbar-focus-ring` | `focus-ring` | The keyboard focus ring. |
| `--navbar-link-size` | `text-sm` | Link text (14px). |
| `--navbar-link-weight` | `font-medium` | Link weight (500). |
| `--navbar-height` | `spacing-16` | The bar's height (64px). |
| `--navbar-gap` | `spacing-6` | Space between the brand, the links and the actions (24px). |
| `--navbar-link-gap` | `spacing-1` | Space between links (4px). |
| `--navbar-link-padding-x` | `spacing-3` | A link's side padding (12px). |
| `--navbar-link-padding-y` | `spacing-2` | A link's top and bottom padding (8px). |
| `--navbar-border-width` | `border-width-1` | The line under the bar (1px). |
| `--navbar-link-radius` | `rounded-md` | A link's corners (6px). |
| `--navbar-z-index` | `z-40` | Above the page when sticky. |
