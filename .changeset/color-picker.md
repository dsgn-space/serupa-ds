---
"serupa-ds": minor
---

- Added: ColorPicker, a radio group of named swatches (arrow keys, Home and End move and pick), then a hex field and the browser's color picker for any other color. With `contrastWith` it shows the WCAG contrast ratio against that color, rounded down and in the locale's numbers, and warns below `minContrast` (4.5 by default) in a polite live region. The picked swatch has a ring and a white or black check, whichever stands out. It takes `swatches`, `value`/`defaultValue`/`onValueChange`, `custom`, `size`, `disabled` and `name`, with 12 `--color-picker-*` tokens.
- Added: the labels `customColor`, `hexCode`, `contrast` and `lowContrast`, in English and Indonesian.
