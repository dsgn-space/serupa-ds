---
"serupa-ds": minor
---

Component tokens put the state last, after the property, as most already did. The old names still work: each is read when its new name isn't set, and they are removed in 15.0.0.

- Button: `--button-bg-disabled`, `--button-text-disabled`, `--button-border-disabled` (were `--button-disabled-bg`, `-text`, `-border`)
- AvatarGroup: `--avatar-group-more-bg-hover` (was `--avatar-group-more-hover-bg`)
- Calendar: `--calendar-bg-selected`, `--calendar-color-selected`, `--calendar-depth-selected` (were `--calendar-selected-bg`, `-color`, `-depth`)
- Carousel: `--carousel-dot-width-active` (was `--carousel-dot-active-width`)
- DataGrid: `--data-grid-bg-selected` (was `--data-grid-selected-bg`)
- Pagination: `--pagination-bg-current`, `--pagination-text-current`, `--pagination-depth-current` (were `--pagination-current-bg`, `-text`, `-depth`)
- PeriodPicker: `--period-picker-bg-selected`, `--period-picker-text-selected`, `--period-picker-depth-selected` (were `--period-picker-selected-bg`, `-text`, `-depth`)
- Stepper: `--stepper-bg-active`, `--stepper-text-active`, `--stepper-depth-active`, `--stepper-bg-error`, `--stepper-text-error` (were `--stepper-active-bg`, `-text`, `-depth`, `--stepper-error-bg`, `-text`)
