---
"serupa-ds": minor
---

Changed: every optional prop now takes `undefined` (`size?: ButtonSize | undefined`), so a project with `exactOptionalPropertyTypes` on can pass a prop through (`size={props.size}`) or switch one off (`disabled={busy || undefined}`), as it can with React's DOM props (EO1). Without that setting nothing changes: an optional prop already took undefined there.
