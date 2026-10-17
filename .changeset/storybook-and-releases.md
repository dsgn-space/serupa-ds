---
"@diki/design-system": minor
---

- Added: Releases with Changesets. Each pull request carries a short note (`npx changeset`); on `main` a Release pull request gathers them into the next version and `CHANGELOG.md`, and merging it tags the version and makes a GitHub release with the package attached.
- Added: Projects can install a released version straight from GitHub (`npm install github:diki-stwn/design-system#v4.8.0`); the package builds itself on install.
