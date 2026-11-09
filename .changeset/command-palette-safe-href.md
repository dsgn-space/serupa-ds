---
"serupa-ds": patch
---

CommandPalette: a command's `href` now goes only to a web page (a path on your site, `http` or `https`), `mailto:` or `tel:`. A `javascript:`, `data:` or other URL does nothing and warns in development. Before, choosing such a command ran its script, because `location.assign` isn't covered by React's block on `javascript:` URLs.
