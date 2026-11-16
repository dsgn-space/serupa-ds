---
"@diki-stwn/serupa-ds": patch
---

Infinity, which a division by zero gives, now counts as no number, as NaN does:
- NumberInput shows an empty field.
- Progress's `max` falls back to 100.
- Slider's `step` falls back to 1. Its value no longer reads NaN.
- Rating's `max` falls back to 5. It no longer throws "Invalid array length".
- Textarea's `rows` falls back to 3, and an infinite `maxRows` means no limit.
- CodeBlock's `startLine` falls back to 1.
- VirtualList shows an empty list. It no longer throws "Invalid typed array length".
- PinInput falls back to 6 boxes. It no longer hangs the page.
