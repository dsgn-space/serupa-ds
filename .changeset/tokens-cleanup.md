---
"@diki-stwn/serupa-ds": major
---

Tokens nothing used are removed, and a theme is its colors.

- **What breaks:**
  - `--field-action` is merged into `--primary-text`, which holds the same color in every theme. Its classes (`text-field-action` and the rest) go with it, and `serupa-brand` now picks a `primary-text` that also passes 4.5:1 on a field.
  - The `gray`, `neutral` and `stone` ramps are removed (44 tokens no component, alias or brand read). `zinc` is the neutral every alias uses, and `slate` stays as a cooler grey.
  - `--rounded` and the bare `rounded` class are removed: they were `rounded-sm` under an older name. `--motion-ripple` and `--motion-ripple-fade` are removed: no component has used them since Button and Badge dropped their ripples.
  - `serupa-brand` no longer takes `--corners` or `--motion`, and says so. Corners are their own setting (`data-radius`), for every brand at once.
  - theme.js no longer moves a theme saved by 4.x under the `diki-theme` key.
- **Why:** the deep audit of 21 Nov 2026 found these tokens unread outside their own definitions, `field-action` equal to the brand text color in all 34 themes, and two brand options against the rule that a brand sets its colors and nothing else.
- **Migration:** `serupa-migrate --from 17` (`tokens-removed`) rewrites `--field-action` and the `*-field-action` classes to `primary-text`, `--rounded` and the `rounded` class to `rounded-sm`, and the ripple tokens to `--duration-500` and `--duration-300`; it lists each `--gray-*`, `--neutral-*` or `--stone-*` to move to `zinc` or `slate`. For a brand made with `--corners sharp` or `round`, set `data-radius` on `<html>`; for `--motion`, set the `--motion-*` tokens in your CSS.
