---
"serupa-ds": major
---

`border-raised` is removed. An elevated Card and SkipLink take `border`, the same edge as an outline card, so a raised card has a `zinc-200` edge in light (it had none, white on white) and the `zinc-800` of `border` in dark, where its lighter fill and shadow carry the lift. The `--card-border-elevated` and `--skip-link-border` defaults follow.

**Migration:** run `serupa-migrate`. It renames `--border-raised`, `color.border-raised` and each `*-border-raised` utility class (`border-border-raised`, `bg-border-raised`, `ring-border-raised`…) to `border`.
