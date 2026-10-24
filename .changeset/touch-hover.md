---
"serupa-ds": patch
---

- Fixed: Components: hover colors no longer stick after a tap on phones and tablets. A touch screen keeps hover on the last element tapped, so a tapped secondary Button stayed tinted as if still selected. Every component's hover styles (and base.css's link hover) now apply only on devices that hover, inside `@media (hover: hover)`. Press feedback (`:active`, the ripple) is unchanged.
- Changed: Tooling: a foundation check fails if a `:hover` rule sits outside `@media (hover: hover)`, and `tools/test/touch-hover.mjs` taps Buttons on an emulated phone and checks they go back to rest. Headless Firefox in the component tests gets a hovering pointer, as the other scripts already did.
