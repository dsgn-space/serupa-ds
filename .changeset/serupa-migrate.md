---
"serupa-ds": minor
---

- Added: `npx serupa-migrate`, which makes a major's renames in a project's code: IconButton's `noTitle` and Table's `captionHidden` for 13.0.0, RadioGroup's `onChange`, Badge's `size`, `bundle.js` and `CommonIconName` for the majors before. Without `--write` it only says what it would change; `--from 12` runs the changes after 12.x; what it can't change on its own (a prop in a props object, a removed ripple token) it lists by file and line. It needs nothing installed.
- Added (Docs): an Upgrading page with every breaking change of each major and what to do instead, the next major's first, made from the changelog and the changesets. Each major starts as an RFC in `docs/rfcs/`, open for comments until the release.
