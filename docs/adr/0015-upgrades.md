# ADR-0015: Majors start as an RFC, and a script makes their renames

**Status:** Proposed
Queue items 93 (RFCs), 40 (an upgrade guide per major), 205 (codemods) and I8 (a migration command for the rename).

## Context

Serupa has had twelve majors in a month. Each breaking entry in the changelog carries a migration note, but the notes are spread through long release sections, the next major's changes sit in changesets nobody reads before the release, and every rename is made by hand in each project. The package was also going to be renamed once Diki picked the final name, which would touch every import in every project: that rename had to be one command, not a find and replace. (2 November 2026: Diki kept `serupa-ds`, so no rename is planned; the command still makes each major's renames.)

## Decision

- **An RFC per major.** The first major changeset after a release adds `docs/rfcs/<next major>.md`; each breaking change adds its section in the same pull request: what breaks, why, the migration. It's open for comments until the release. `tools/test/upgrades.mjs` fails a pull request whose major changeset has no section or no migration note.
- **The upgrade guide is made, not written.** The docs' Upgrading page (`docs/upgrades.ts`) collects each major's breaking entries from `CHANGELOG.md`, and the next major's from the changesets waiting. The migration note is written once, in the entry.
- **`serupa-migrate` ships in `bin/`, with no dependencies,** and reads text rather than parsing code. jscodeshift was the first plan (I8), but it would be the package's first dependency for every project, for a command run once per major, and its parser needs to know each project's syntax (TypeScript, JSX, MDX, Vue). The renames a major makes are narrow (a prop on one component's tag, a type, a file path), and a tag scanner that skips `{…}` and quoted values finds them in every one of those formats. What it can't decide, it lists by file and line instead of guessing.
- **Each change belongs to a major** (`bin/migrate/transforms.mjs`), so `--from 12` runs only what's after 12.x. There's no package rename to add: the name stays `serupa-ds` (2 November 2026).

## Consequences

- A major changeset takes two more things: its RFC section and, when a script can make it, a change in `transforms.mjs` with a case in `upgrades.mjs`.
- Text matching can miss a prop passed in a spread or built at runtime. Those are listed to check by hand, and TypeScript catches the rest, since a removed prop is a type error.
- Revisit: if a major needs a change that depends on types or data flow (rewriting a callback's arguments), use the TypeScript compiler API for that one change, loaded only when it runs.
