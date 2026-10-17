---
"serupa-ds": major
---

- Changed: The system is now **Serupa**, by Diki. The package is `serupa-ds` and the repository is `diki-stwn/serupa-ds`. To update a project:

  | Before (4.x) | Now (5.0) |
  | --- | --- |
  | `npm install github:diki-stwn/design-system#v4.8.0` | `npm install github:diki-stwn/serupa-ds#v5.0.0` |
  | `import { Button } from '@diki/design-system'` and `'@diki/design-system/tokens.css'` | `import { Button } from 'serupa-ds'` and `'serupa-ds/tokens.css'` |
  | `dist/diki.iife.js`, `window.Diki` (`Diki.configure`, `Diki.theme`) | `dist/serupa.iife.js`, `window.Serupa` (`Serupa.configure`, `Serupa.theme`) |
  | `DikiConfig`, `DikiTheme` types | `SerupaConfig`, `SerupaTheme` |
  | `design-tokens/diki.tokens.json`, `$extensions["com.diki"]` | `design-tokens/serupa.tokens.json`, `$extensions["com.serupa"]` |

  Class names (`dk-*`), CSS variables, tokens and the `dk.*` cascade layers keep their names. The saved theme choice moves from `diki-theme` to `serupa-theme` in localStorage, and the old value is read once so visitors keep their theme.
