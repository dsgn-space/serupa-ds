---
"serupa-ds": patch
---

- Fixed: Accordion, AvatarGroup, Breadcrumb, Carousel, Navbar, Sidebar: items wrapped in a Fragment (`<>…</>`, or a list returned from a map inside one) are items of their own, so they get their own separator, slide, list item or count. Before, the Fragment counted as one item.
