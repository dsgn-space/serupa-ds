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
- Scripts store only what's listed under [What's kept in the browser](#whats-kept-in-the-browser), and nothing at all
  unless you pass a key or load `theme.js` or `debug.js`.

## What's kept in the browser

Every place the package reads or writes `localStorage` or `sessionStorage` is listed here, with its key and what it
keeps, so an app's privacy notice can list them too. `tools/test/storage.mjs` fails when code in `src/` uses storage
this table doesn't list, or when a row no longer matches the code. Nothing here is sent anywhere.

| File | Storage | Key | What it keeps, and when it's cleared |
| --- | --- | --- | --- |
| `src/theme.js` | localStorage | `serupa-theme` | The chosen brand and mode, as JSON. `SerupaTheme.reset()` clears it. |
| `src/theme.js` | localStorage | `diki-theme` | Read once to move a theme saved under the package's old name to `serupa-theme`, then removed. |
| `src/debug.js` | sessionStorage | `serupa-debug` | `1` while the debug outlines are on, for the tab only. |
| `src/components/Splitter/Splitter.tsx` | localStorage | your `storageKey` | An uncontrolled Splitter's size, as a number. |
| `src/patterns/ConsentBanner/ConsentBanner.tsx` | localStorage | your `saveKey` | The cookie choice, `accepted` or `rejected`, so the banner doesn't ask again. |
| `src/patterns/Onboarding/Onboarding.tsx` | localStorage | your `saveKey` | Which steps are done and whether the checklist was hidden, as JSON. |
| `src/patterns/SessionTimeout/SessionTimeout.tsx` | sessionStorage | your `saveKey` | The draft's subject and message, for the tab only. Cleared by signing out, by sending the message or by closing the tab. Never a password, card number or ID number. |
