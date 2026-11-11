---
"serupa-ds": minor
---

- Added: an app's own "Reduce motion" setting. `data-motion="reduce"` on `<html>` gives every component, `base.css` and the utilities exactly the motion the system's `prefers-reduced-motion: reduce` gives them (fades only, still spinners, nothing sliding or scaling), for a switch in your app's settings. On a section, it reduces motion inside that section. It only ever reduces: when the system asks for less motion, the attribute can't bring it back.
- Added: `prefersReducedMotion(el?)`, a one-off answer for an event handler or effect, and `useReducedMotion()` now follows the attribute too. Accordion's height, TableOfContents' smooth scroll, Toast's swipe away and the stack sliding together, and theme.js's crossfade all follow it.
