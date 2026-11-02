---
'serupa-ds': minor
---

- **theme.js crossfades a theme switch (30).** After the first paint, `Serupa.theme.set()`, `reset()` and a change of the system's light or dark setting crossfade the whole page to the new theme in one View Transition (type `serupa-theme`), where the browser has them, instead of every color snapping at once. The first paint, reduced motion and browsers without View Transitions switch at once as before. With a transition, the new `data-theme` is set, and `onChange` called, when the transition takes its "after" picture, a frame later.
