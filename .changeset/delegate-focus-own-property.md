---
"serupa-ds": patch
---

FileUpload, DateField, DateRangePicker, Rating, ColorPicker and SegmentedControl: focus() on the component now goes to its control without changing focus() for the rest of the page. In a Storybook with its test tools loaded, an error summary's link or a heading moved focus to the last of these controls rendered instead.
