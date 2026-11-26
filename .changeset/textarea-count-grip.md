---
"@diki-stwn/serupa-ds": minor
---

Textarea: the count sits under the box, at its end (was inside the box). In a Field it shares a row with the hint or the error: the message at the start, the count at the end (mirrored right to left). With `actions` it still starts the actions row inside the box. The resize handle is the browser's own again, at its default size. New tokens `--textarea-count-gap` and `--field-end-gap`.

Deprecated: `--textarea-resize-grip` (added in 19.1.0) no longer has an effect, since the handle is the browser's own; it is removed in 20.0.0. Drop it from your overrides.
