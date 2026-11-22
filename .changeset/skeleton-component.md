---
"@diki-stwn/serupa-ds": minor
---

Skeleton is a component of its own: `<Skeleton>` takes the same `shape`, `lines`, `size`, `label`, `delay` and `loading` as `<Loader variant="skeleton">`, with its own classes (`srp-skeleton…`) and tokens (`--skeleton-*`). `tone` is `neutral` or `inverse`. The blocks, patterns and components that drew a skeleton Loader draw Skeleton now. `<Loader variant="skeleton">` keeps working and is deprecated: the next major removes it, with a codemod.
