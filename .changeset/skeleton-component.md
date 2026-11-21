---
"@diki-stwn/serupa-ds": major
---

Skeleton is its own component, and Loader is the spinner alone.

- **What breaks:**
  - `<Loader variant="skeleton">` is `<Skeleton>`, with the same `shape`, `lines`, `size`, `label`, `delay` and `loading`. Its classes are `srp-skeleton…` and its tokens `--skeleton-*` (`--loader-skeleton-fill` is `--skeleton-fill`, and so on). `tone` on Skeleton is `neutral` or `inverse`; `primary` and `muted` never colored it.
  - Loader's `variant="pixel"`, `pattern` and `glow` are removed, with the `--loader-pixel-*` tokens. Nothing outside Loader's own stories used them.
  - `LoaderShape` and `LoaderPattern` are gone; `SkeletonShape` is new.
- **Why:** the deep audit of 21 Nov 2026 found every call site outside Loader's own folder set `variant="skeleton"` or the default ring, and Table, List, DataGrid, Kanban and Chart already drew skeletons without Loader. A placeholder for content is a different job from a spinner.
- **Migration:** `serupa-migrate --from 16` rewrites `<Loader variant="skeleton" …>` to `<Skeleton …>` and imports Skeleton, turns a pixel Loader into `variant="dots"` without `pattern` or `glow`, and lists a `variant` worked out in code. It renames `--loader-skeleton-*` tokens to `--skeleton-*` in code and CSS, and lists the `--loader-pixel-*` ones.
