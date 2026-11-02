# Security

## Supported versions

Fixes go into the next release of the latest major (see [CHANGELOG.md](CHANGELOG.md) and the Releases page). To get
one, update to that tag.

## Reporting a vulnerability

Please report it privately, not in a public issue or pull request: open
<https://github.com/diki-stwn/serupa-ds/security/advisories/new> (the repository's **Security** tab, **Report a
vulnerability**). Say what is affected (a component, `theme.js`, the CLI, the build), the version, and how to
reproduce it.

What happens next:

- You get a reply within 7 days saying whether it is confirmed.
- A confirmed vulnerability is fixed in a release within 30 days, or sooner when it is being exploited. If it takes
  longer, you hear why and when.
- Once the fix is released, the advisory is disclosed with credit to you, unless you'd rather not be named. Please
  keep it private until then.

## What the package does

Knowing this helps tell a real issue from expected behaviour:

- Nothing runs on install. Release tags are prebuilt, so npm only copies files.
- Nothing loads from another server. The shipped CSS and JavaScript contain no remote URLs or `@import` (checked by
  `tools/test/foundation.mjs`).
- The components work under a strict Content Security Policy and with Trusted Types enforced (checked on every story
  by `src/internal/strictCsp.test.tsx` and `trustedTypes.test.tsx`). `theme.js` can run inline with a nonce.
- Text you pass to a component is rendered as text, never as HTML.
- Scripts store only two things, both in `localStorage`: `theme.js` keeps the chosen theme under `serupa-theme`, and
  a Splitter given a `storageKey` keeps its size under that key.
