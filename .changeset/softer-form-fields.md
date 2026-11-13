---
"serupa-ds": minor
---

Form fields have a softer look in all six themes.

- `field-border` is `zinc-300` in light and `zinc-600` in dark (it was `zinc-500` and `zinc-400`). This is under the 3:1 WCAG 1.4.11 asks of a control's edge, on purpose: the label, the hover border, the 3:1 focus ring and the invalid border still mark a field, and more contrast (`data-contrast="more"` or the system setting) brings back a 3:1+ border. To keep 3:1 without that setting, set `--field-border: var(--border-control)`.
- `field-border-hover` is the theme's accent one step softer than `primary` (`blue-500`, `violet-500`; `teal-600` and `teal-500` in emerald), in place of `zinc-600` and `zinc-300`. Themes made with `serupa-brand` get theirs from the brand color.
- In dark, `field` is `zinc-700` (it was `zinc-800`, or `zinc-900` in emerald), `field-readonly` is `zinc-800`, and `placeholder` is `zinc-300`, so it keeps 4.5:1 on the lighter fill.
- New field tokens follow the lighter dark fill: `field-hover` and `field-pressed` (the calendar, clock and country buttons, Input's icon actions, NumberInput's steppers, the clear, show-password and Combobox chevron buttons; `secondary` and `secondary-hover` in light as before, zinc-600 and zinc-500 in dark), `field-border-invalid` (`danger` in light, `red-400` in dark, for 3:1 on the field) and `field-action` (Input's text action: `primary` in light, a shade lighter in dark). DateRangePicker's dash uses `placeholder`.
- An Input's prefix, suffix and count, a Textarea's count and PasswordInput's Caps Lock hint use `placeholder` instead of `text-muted`, so they keep 4.5:1 on the dark field.
- New tokens `border-control` and `border-control-hover` carry the old colors (`zinc-500` and `zinc-600` in light, `zinc-400` and `zinc-300` in dark) for the edges of controls that aren't fields, which keep 3:1: Slider, Switch, Meter, Progress, Rating, Carousel's dots, ColorPicker's swatches, Stepper, SegmentedControl, FilterBar's chips, Kbd, Splitter, ScrollArea, Avatar's offline dot, FileUpload's drop area and SignaturePad's box. Their component tokens now default to `border-control`.
