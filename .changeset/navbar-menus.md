---
"serupa-ds": minor
---

- Added (Navbar): `NavbarMenu`, `NavbarMenuGroup` and `NavbarMenuLink`, dropdown panels (a mega menu). A nav item's button opens a panel of links grouped under titles, each with an optional line saying what's there. It's a disclosure (a button with `aria-expanded`, not `role="menu"`): Tab goes from the button into its links, and Escape, a press outside, focus leaving it or following a link closes it, one at a time. Wide, the panel spans the bar under it; in the small-screen menu it opens in place. Six new component tokens style it (`--navbar-menu-bg`, `-border`, `-title-text`, `-link-text`, `-desc-text` and `-shadow`).
