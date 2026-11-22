---
"@diki-stwn/serupa-ds": major
---

The `dk` prefix is `srp`, for Serupa: every class (`dk-btn` is `srp-btn`), the internal custom properties (`--dk-*` are `--srp-*`), the data attributes (`data-dk-announcer` is `data-srp-announcer`), the generated ids and the cascade layers (`dk.tokens`, `dk.base`, `dk.components` and `dk.utilities` are `srp.*`, inside `srp`).

- **What breaks:** CSS or code that names a `dk-` class, a `--dk-*` property, a `data-dk-*` attribute or a `dk` layer (an `@layer reset, dk, app;` order, a selector in a test). The design tokens (`--color-*`, `--space-*`) and each component's own tokens (`--button-*`, `--input-*`) keep their names.
- **Why:** the prefix was the initials of the system's first name. `srp` says Serupa, as the package, the CLI and the theme key do.
- **Migration:** `serupa-migrate --from 16` rewrites each `dk-` class, `--dk-*` property, `data-dk-*` attribute and `dk` layer in your CSS, markup and code (`serupa-migrate` makes it). A `dk` that isn't followed by `-` or a layer name (a word, a country code) stays.
