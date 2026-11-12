---
"serupa-ds": patch
---

withViewTransition no longer leaves an unhandled promise rejection when a transition is cut short, for example when the viewport resizes or another transition starts. ListDetail, DataImport and Stepper's steps use it.
