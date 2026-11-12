---
"serupa-ds": patch
---

Checkbox and Radio show their focus ring for keyboard focus in Firefox and Safari too. Firefox's `:focus-visible` stays off for Space on a checkbox that was clicked, and Safari's for an arrow between radios, which left keyboard users there with no ring; the control the keyboard has is now also marked `data-key-focus`, which the ring follows.
