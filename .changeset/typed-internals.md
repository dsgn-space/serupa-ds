---
"serupa-ds": patch
---

- Fixed: The components' own code no longer uses `any`. Props passed through to the DOM keep their real types, so the type checker catches mistakes inside the system. Nothing changes for projects; `List`'s `linkProps` is now typed `Record<string, unknown>` (any object still works).
