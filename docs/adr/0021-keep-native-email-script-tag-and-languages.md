# ADR-0021: Keep the native and email tokens, the script-tag build and all 20 language packs

**Status:** Accepted
**Deciders:** Diki, 21 November 2026 (deep audit, decision 3: declined).

## Context

The deep audit proposed shrinking what the package ships, to cut upkeep:

- `dist/native/`, the tokens for an iOS or Android app beside a web app on Serupa.
- `dist/email/`, the colors, type and spacing written out for email clients.
- `serupa.iife.js` and `serupa-icons.iife.js`, the components on `window.Serupa` for a plain page.
- 18 of the 20 language packs, keeping English and Indonesian, the two the tests treat as first-class.

None of them costs an app anything: each is a separate file an app imports only if it needs it. A language loads only when imported. The cost is upkeep: every new label is written 20 times, the builds run on every release, and CI tests components in a second language on each pull request. The 18 packs beyond English and Indonesian have not yet been read by a native speaker.

## Decision

Keep all of them. Each serves a kind of app the system means to support, and none adds weight to an app that doesn't use it.

- **The language packs stay as they are,** all 20, in the main package.
- **Native, email and the script-tag build stay** in the package and in each release's archives.

## Consequences

- A new label still lands in all 20 packs in the same pull request (`label-packs` checks it), and the script-tag and token builds keep running on every release.
- The risk to manage is quality, not size: an unchecked translation can read wrong, and no test catches that. Native review is the open item, not removal.
- Revisit if the per-label cost starts holding pull requests up, with the option the audit kept in reserve: the 18 packs in a separate package that releases on its own schedule.
