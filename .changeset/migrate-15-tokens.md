---
"serupa-ds": minor
---

`npx serupa-migrate` makes 15.0.0's last renames too, so an app can make them now on 14.x. It renames the 20 component tokens that put the state first (`--button-disabled-bg` to `--button-bg-disabled`, and the rest in `.changeset/token-names-state-last.md`) in CSS, style objects and markup, leaving a file that already names the new token as it is. It lists each Button with `icon` to make an IconButton, since that needs a label a script can't write. And from 15.0.0, when the package ships under its new name, the same command rewrites `serupa-ds` in imports, CSS imports and CDN paths to that name; run from 14.x it leaves them.
