# RFCs: proposals for a major

A major release breaks something that worked, so it starts as a short written proposal that people can comment on before it ships (93). One RFC per major, named for it (`13.0.0.md`), from the first breaking change until the release.

## How it works

1. **The first major changeset opens the RFC.** The pull request that adds the first `"serupa-ds": major` changeset since the last release also adds `docs/rfcs/<next major>.md`, from the shape below.
2. **Each breaking change adds its section** in the same pull request as its changeset: what breaks, why it's worth it, what people do instead (the migration note), and whether `serupa-migrate` makes the change.
3. **Comments go on the RFC's pull request or an issue** that links the section. A change that draws a good objection is reworked or dropped before the release, while that's still cheap.
4. **At the release** the status becomes `Released in 13.0.0 (<date>).`, and the RFC stays as the record of why. `upgrades.mjs` fails once the major is in CHANGELOG.md while its RFC still says otherwise.

`node tools/test/upgrades.mjs` checks it: every major changeset waiting for a release has its section in the next major's RFC, by file name, and a migration note.

## The shape

```md
# RFC: 13.0.0

**Status:** Open for comments

What this major is about, in two or three sentences.

## <What breaks> (`.changeset/<file>.md`)

- **What breaks:** …
- **Why:** …
- **Migration:** … (`serupa-migrate` makes it / by hand)
```

Each release's breaking entries, with their migration notes, are collected in the docs' [Upgrading](https://gitlab.com/diki-stwn-group/serupa-ds/-/blob/main/docs/Upgrading.mdx) page, made from the changelog and the changesets.
