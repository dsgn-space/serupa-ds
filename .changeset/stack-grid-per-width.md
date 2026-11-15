---
"@diki-stwn/serupa-ds": minor
---

Stack and Grid take one value per screen width. Stack's `direction`, `gap` and `align` and Grid's `columns` and `gap` accept `{ base, sm, md, lg }` (from 640, 768 and 1024px up), as Carousel's `perView` does: `<Stack direction={{ base: 'column', md: 'row' }}>` stacks on a phone and sits side by side from 768px. Media queries draw it, so server HTML is laid out before any script runs. New type: `GridColumns`.
