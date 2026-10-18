---
"serupa-ds": minor
---

- Added: Text: new names for its four component tokens, so they no longer read like the shared text tokens (`--text-muted`, `--text-xs`): `--text-tone-default`, `--text-tone-muted`, `--text-tone-primary` and `--text-tone-danger` (one per `tone`). The old names (`--text-color`, `--text-color-muted`, `--text-color-primary`, `--text-color-danger`) keep working; when both are set, the new name wins. The old names will be removed in 6.0.0.
- Changed: in `text.tokens.json`, `$extensions["com.serupa"].cssVar` gives the new name and the old one is in `deprecatedCssVar`, so Style Dictionary and Figma exports use the new names.
