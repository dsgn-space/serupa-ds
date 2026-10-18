---
"serupa-ds": patch
---

- Docs: every icon control in Storybook (Button, Badge, Input, Select, EmptyState, Icon) is now a list of all 3,776 Material Symbols instead of a text box. Everyday icons are passed by name; the others, marked "(import)", are passed as imported icons, the same way an app uses them.
- Docs: the Foundations/Icons search also finds icons outside the everyday set, shows them, and copies their import line (`import { Category } from "serupa-ds/icons";`) when clicked.
