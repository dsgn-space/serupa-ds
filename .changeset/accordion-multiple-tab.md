---
"@diki-stwn/serupa-ds": major
---

Accordion: `type` is `"multiple"` by default, and the arrow keys, Home and End no longer move between titles.

- **What breaks:** an Accordion with no `type` lets any number of items stay open: opening one leaves the others open. Tab moves between titles, as it does between any buttons, and Up and Down scroll the page.
- **Why:** people open several items to compare them, and an accordion that closes one when another opens takes away what they were reading. The modern web guidance for accordions says to avoid exclusive ones. It also says arrow keys pressed on a disclosure's button should scroll the page, as they do on any button. The WAI-ARIA pattern marks the arrow keys optional.
- **Migration:** `serupa-migrate --from 16` adds `type="single"` to each Accordion that has no `type`, so it keeps one open at a time. Without `--from`, it lists those Accordions to check. Nothing replaces the arrow keys: Tab reaches every title.
