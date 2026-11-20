---
"serupa-ds": patch
---

Things that line up, and disabled controls that sit right in dark:

- **Pricing**: each plan card's parts sit on the list's rows (subgrid), so the prices, feature lists and buttons line up across the cards when one description or price runs to two lines. A plan without a description keeps its row. "Your current plan" centers on the buttons' row.
- **Card**: a ghost button first in a footer that starts at the edge (`justify="start"` or `"between"`) pulls out by its own padding, so its label lines up with the text above. Not when the footer stacks under 20rem.
- **Checkbox and Radio**: disabled and unchecked, the box or circle takes `field-readonly` (a disabled field's fill), not `surface-muted`, which in dark sat below the card as a black hole that read like a filled dot. Light doesn't change.
