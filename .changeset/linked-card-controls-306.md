---
"serupa-ds": patch
---

Card: a linked Card no longer moves a control that places its own parts. It lifted every control inside above the link with `position: relative`, which outweighed a PinInput's own input laid over its boxes, so the input took a row's room and pushed two of the six boxes onto a second line. The lift now has no weight of its own: a control's own position wins, and the rest still rise above the link.
