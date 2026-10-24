---
"serupa-ds": patch
---

- Fixed: a word longer than the line (a German compound, a URL) pushed Alert, Card, Dialog, Drawer, Menu and Toast wider than their box, and an Alert in a narrow column made the page scroll sideways. It wraps inside them now (R31).
- Fixed: a Button with a long label grew past its container. It stops at the container's width, and the label ends in an ellipsis.
