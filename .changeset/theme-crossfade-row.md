---
"serupa-ds": patch
---

theme.js: switches in a row (`Serupa.theme.set()` called several times at once) end on the last theme, with `onChange` hearing each theme once and no "Transition was skipped" errors in the console. A switch made during the app's own View Transition is at once, so it doesn't cut the app's transition short. Foundations › Themes now says when `data-theme` changes with a crossfade (a frame after `set()`, which returns the new theme at once).
