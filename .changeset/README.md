# Changesets

Every pull request that changes what a project gets carries a changeset: a short note saying how big the
change is and what changed. Make one with `npx changeset` (it asks patch, minor or major, then for the note),
or write the file yourself:

```md
---
"serupa-ds": minor
---

- Added: Tooltip component, with 12 component tokens.
- Fixed: Select's chevron in forced-colors mode.
```

Start each line with Added, Changed, Deprecated, Removed, Fixed or Security, the sections of `CHANGELOG.md`.
A line without one goes under Added (minor), Changed (major) or Fixed (patch).

Which bump (the README's Versioning section has the rules): **major** when something that worked stops
working, **minor** for something new, **patch** for a fix. Docs-only and test-only pull requests need none.

When changesets reach `main`, the Release workflow opens a "Release" pull request that turns them into the
next version: `CHANGELOG.md` gets the notes, and every file gets the version (`tools/version.mjs`). Merging
that pull request tags the version and makes a GitHub release with the package attached (`tools/publish.mjs`).
