---
"serupa-ds": minor
---

Field now wires up its control at any depth, including one inside a Tooltip, your own wrapper component or a form library's component. The control gets the id the label points to, the hint and error in `aria-describedby`, `aria-required`, `invalid` and `disabled`. Before this change only a direct child was wired, and a wrapped control lost its label silently. A Combobox's list of options is now named by the Field label too.
