---
"serupa-ds": minor
---

Navbar: a new `condense` prop for a sticky bar. As the page scrolls under it, the bar goes up with the page to 48px (`--navbar-height-condensed`), then stays, with what's in it kept centered. It's tied to the scroll, moves rather than resizes so the page doesn't reflow, and keeps its height where scroll-driven animations aren't supported.
