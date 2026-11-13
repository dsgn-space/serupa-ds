---
"serupa-ds": minor
---

Form fields have a softer look in all six themes.

- `field-border` is `zinc-300` in light and `zinc-600` in dark (it was `zinc-500` and `zinc-400`). This is under the 3:1 WCAG 1.4.11 asks of a control's edge, on purpose: the label, the hover border, the 3:1 focus ring and the invalid border still mark a field, and more contrast (`data-contrast="more"` or the system setting) brings back a 3:1+ border. To keep 3:1 without that setting, set `--field-border: var(--border-control)`.
- `field-border-hover` is the theme's accent one step softer than `primary` (`blue-500`, `violet-500`; `teal-600` and `teal-500` in emerald), in place of `zinc-600` and `zinc-300`. Themes made with `serupa-brand` get theirs from the brand color.
- New field tokens, so the parts of a field can be themed apart from buttons and the page: `field-hover` and `field-pressed` (the calendar, clock and country buttons, Input's icon actions, NumberInput's steppers, the clear, show-password and Combobox chevron buttons; the same colors as `secondary` and `secondary-hover`), `field-border-invalid` (`danger`) and `field-action` (Input's text action: `primary`, or a lighter shade for a generated brand whose primary is under 4.5:1 on the field). DateRangePicker's dash uses `placeholder`. In dark, `field` is `zinc-800` in every theme (emerald's was `zinc-900`), and `field-readonly` is `zinc-900` (emerald's was `zinc-950`).
- An Input's prefix, suffix and count, a Textarea's count and PasswordInput's Caps Lock hint use `placeholder` instead of `text-muted`, so all muted text inside a field is one color.
- New tokens `border-control` and `border-control-hover` carry the old colors (`zinc-500` and `zinc-600` in light, `zinc-400` and `zinc-300` in dark) for the edges of controls that aren't fields, which keep 3:1: Slider, Switch, Meter, Progress, Rating, Carousel's dots, ColorPicker's swatches, Stepper, SegmentedControl, FilterBar's chips, TagGroup's tags, Kbd, Splitter, ScrollArea, StatusTracker's no-data outline, Avatar's offline dot, FileUpload's drop area and SignaturePad's box. Their component tokens now default to `border-control`.
