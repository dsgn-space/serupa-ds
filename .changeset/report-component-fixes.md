---
"@diki-stwn/serupa-ds": patch
---

Fixes in ten components and the shared code:

- PhoneInput keeps the first digits of an international number that start like the country's trunk prefix, such as "+7 800…", a toll-free number in Russia.
- TransferList no longer breaks when an uncontrolled list's options stop holding a chosen value; that value is left out.
- FilterBar treats a date with month 13 or month 0 as malformed, rather than rolling it into the next or the last year.
- CascadeSelect makes an option whose loaded children are none a last step, rather than opening an empty column.
- ImageCropper is ready again when its src goes back to the first image before the second one loaded.
- Chart's heatmap shows the cell under the pointer, near a cell's edge as well, rather than the next column's.
- mentionQuery finds no mention when the caret is before the trigger or inside a trigger of two characters.
- CodeBlock counts lines from 0 with startLine={0}, and line 0 can be highlighted.
- SerupaProvider keeps its settings when labels written inline leave out a key that was undefined before.
- A control drawn from spans and divs, such as Slider, is disabled in the legend of a disabled fieldset that sits in another disabled fieldset, as native controls are.
