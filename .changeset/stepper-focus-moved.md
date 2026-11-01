---
"serupa-ds": patch
---

Stepper: going to a step no longer takes focus back from a field the app's `onStepClick` moved it to; it puts focus on the new current step only when focus fell to the page. Inside a shadow root, it now reads focus there instead of `document.activeElement`, which is the shadow host (GR95).
