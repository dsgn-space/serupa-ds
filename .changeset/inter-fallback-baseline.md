---
"serupa-ds": patch
---

Text no longer shifts 1px when Inter arrives. The fallback font's ascent landed a hair under Inter's 15.5px at 16px, so every line of body text sat 1px higher until the swap; each fallback face is now fitted to Inter's baseline at every size of the type scale. Weights 500 and 600 (buttons, labels, titles) get fallback faces of their own, so a label no longer draws 2% narrower before Inter loads.
