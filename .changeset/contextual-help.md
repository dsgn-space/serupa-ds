---
"serupa-ds": minor
---

Added: ContextualHelp, a toggletip. A 24px "?" (or "i" with `variant="info"`) button, named "Help" or "Information" or by `label`, opens a sentence or two in a non-modal popover beside it, with `aria-expanded` and `aria-controls`; Escape closes it and returns focus. Unlike a Tooltip it opens on press, so it works on touch and can hold a link. New labels `contextualHelp` and `contextualInfo` in every language pack. Choose a component now lists it, and HoverCard, beside Tooltip and Popover.
