---
"@diki-stwn/serupa-ds": minor
---

A component's state is an attribute you can select on, and the `--state` modifier classes are deprecated (ADR-0025).

- **Added:** state attributes on the element that changes, present or absent: `data-disabled`, `data-readonly` and `data-invalid` on the fields (Input and every field built on it, Textarea, Select, Checkbox, Radio, Switch, PinInput, SegmentedControl, Slider, Rating, ColorPicker, FileUpload, SignaturePad, CascadeSelect, PeriodPicker, Field, InlineEdit and others), `data-selected` on picked items (Calendar days, List items, Table rows, TreeView items, TagGroup tags, DataGrid cells), `data-current` on the current page or link (Breadcrumb, Pagination, Navbar, Sidebar, BottomNav, PeriodPicker), `data-active` on the option the keys are on (Combobox, CommandPalette, MentionInput, TimePicker, PinInput's box), and `data-loading`, `data-checked`, `data-empty`, `data-today`, `data-outside`, `data-over`, `data-dragging`, `data-done` and `data-error` where those states were classes.
- **Changed:** the components' own stylesheets select these attributes, or `data-state` and ARIA where they already say the state, instead of the classes; a ToggleButton that is on is `[aria-pressed="true"]`. Nothing looks different.
- **Deprecated:** the `--state` modifier classes (`.srp-input--invalid`, `.srp-list__item--selected`, `.srp-navbar__link--active`, …). They are still written in 17.x and 18.x and removed in 19.0.0. Select `.srp-input[data-invalid]` and the like instead. The docs' Customizing page lists the rule, and `STATE_CLASSES` in `tools/test/state-hooks.mjs` maps each class to its attribute.
