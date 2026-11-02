---
"serupa-ds": minor
---

Token roles for corners, shadows and spacing (E13, I6). `radius-inner`, `radius-control`, `radius-surface`, `radius-container` and `radius-pill` name what a corner belongs to; `elevation-rest`, `elevation-part`, `elevation-raised`, `elevation-overlay` and `elevation-modal` name a level of elevation, and follow `data-shadow` like the shadows they name; `space-inline`, `space-related`, `space-content`, `space-surface` and `space-section` name five spacing steps by what they space. Each component's own radius and shadow tokens now default to a role, at the same value as before, so setting a role on the page (`--radius-control: 0.5rem`) changes every component that uses it.
