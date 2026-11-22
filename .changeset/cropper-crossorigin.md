---
"@diki-stwn/serupa-ds": patch
---

cropImage sets an empty crossOrigin as "anonymous", which HTML reads it as, so the package type-checks with TypeScript's next DOM types too.
