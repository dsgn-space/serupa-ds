---
"serupa-ds": minor
---

`<SerupaProvider>` sets the locale, the built-in words and extra icons for every component inside it (ADR-0010). It's React context, so it reaches client components from a server layout, stays separate between concurrent server requests, and can change for one part of a page; nested providers change only what they set. `idLabels` has every built-in word in Indonesian, `enLabels` the English defaults, and the `SerupaLabels` type lists the keys. A component's own prop (`dismissLabel`, `locale`, …) still wins. `useSerupa()` reads the settings in your own components.

Stepper is now a client component (`"use client"`), since it reads the provider's words; it still renders on the server as before.
