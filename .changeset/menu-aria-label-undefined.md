---
"serupa-ds": patch
---

Fixed (Menu): `aria-label` takes `undefined`, so `<Menu aria-label={name}>` with a `string | undefined` name compiles in a project with `exactOptionalPropertyTypes` on, as every other optional prop already does.
