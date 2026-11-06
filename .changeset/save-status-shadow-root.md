---
"serupa-ds": patch
---

SaveStatus reads focus in its own shadow root, so Try again pressed from the keyboard keeps focus in the status inside a web component too, also in browsers that leave focus on the retry button for a moment as it goes inert.
