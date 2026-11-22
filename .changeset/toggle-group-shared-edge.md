---
"@diki-stwn/serupa-ds": patch
---

ToggleGroup and attached ButtonGroup: choosing another toggle no longer hides the shared line for a moment. Neighbours share one border line, drawn by the button on top; the order switched at once while the border colors faded, so the newly on button covered the other's line in its old gray for 150ms. The border color now switches at once in an attached group, and the fill still fades.
