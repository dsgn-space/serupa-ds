---
"serupa-ds": patch
---

- Security: The Release workflow runs `changesets/action` pinned to a commit (v1.9.0) instead of the moving `v1` tag, since it can write to the repository.
- Security: CI runs with read-only access to the repository.
- Security: Link and Button guides say to check `href` values that come from people, because React still renders `javascript:` links.
