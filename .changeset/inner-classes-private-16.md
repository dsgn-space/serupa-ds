---
"@diki-stwn/serupa-ds": major
---

The classes of a component's inner parts (`.dk-btn__label`, `.dk-card__header`, any `dk-<block>__<part>`) are private from 16.0.0: they may change in any release, as the markup inside a component is fixed or improved. The styling API is the component tokens, `data-component`, `data-state` (and the ARIA states), and the block and modifier classes (`.dk-btn`, `.dk-btn--primary`), which keep the major-only promise. `npx serupa-migrate --from 15` lists each line of your CSS or code that selects an inner part's class; style it with a token instead, or open an issue asking for one.
