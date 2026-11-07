---
"serupa-ds": patch
---

Tooltip: when its element's label is cut with an ellipsis (a long Button label in a narrow column), the tooltip shows the label in full on its own line over its content. Before, a Button in a Tooltip lost the title that shows its cut label, so the full text couldn't be read. That line is hidden from screen readers, since it is already the element's name, and it isn't added with role="label".
