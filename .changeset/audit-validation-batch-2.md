---
"@diki-stwn/serupa-ds": patch
---

- Fixed (Checkbox, Radio, Switch, TreeView): Keep description text and tree item labels selectable so policy text and item names can be copied.
- Fixed (FileUpload): Fall back to known file extensions when `File.type` is empty under wildcard `accept` patterns such as `image/*` (for example HEIC uploads).
- Fixed (Input): Support optional `?` slots in `mask` patterns for variable-length identifiers such as 12–19 digit card numbers and 15–34 character IBANs.
- Fixed (Table): Append a localized printed summary row ("Showing 5,000 of …") when `TableVirtualBody` prints more than 5,000 rows, and document the print cap.
- Fixed (SignaturePad): Read coalesced pointer events (`getCoalescedEvents()`), smooth multi-point strokes with midpoint quadratic curves, and batch live redraws via `requestAnimationFrame`.
- Fixed (DatePicker, DateField): Convert native Buddhist, Persian, Japanese era, and ROC dates to Gregorian in `parseDate`, and reject unparseable Latin era prefixes instead of stripping them.
- Fixed (PhoneInput): Add landline minimum lengths and major area-code formatting patterns across 11 countries so valid landlines format properly and report as complete.
- Fixed (Labels): Isolate opposite-direction caller strings with Unicode FSI/PDI in Arabic labels, and route remaining Arabic counted-noun labels through CLDR 6-form plurals.
- Fixed (Email kit): Add Outlook.com `[data-ogsc]` and `[data-ogsb]` dark-mode CSS overrides alongside `prefers-color-scheme`.
- Fixed (Brand generator): Keep `primary-subtle` at soft tint chroma for bright yellow seeds and preserve dark primary identity for near-black seeds instead of collapsing to mid-grey.
