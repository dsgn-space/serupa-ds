---
"serupa-ds": minor
---

- Fixed: Stepper: a horizontal Stepper too narrow for its titles side by side (below about 560px for four steps, on a phone or at 400% zoom) no longer overlaps itself or scrolls the page sideways. It keeps the circles and lines and shows one line under them, "Step 2 of 4: Profile". Screen readers still read every step. The words come from the new `stepOf` label (`labels.stepOf` on Stepper or SerupaProvider).
