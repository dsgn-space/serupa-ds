---
"serupa-ds": patch
---

- Fixed: a bundler now keeps only the components a project imports. Before, `import { Divider } from "serupa-ds"` brought every component along (about 48 KB gzipped); now it's under 1 KB, and Button with its icons and loader is about 11 KB. Components are made with a pure-marked helper instead of a separate `displayName` statement, and the icon list, contexts and the toast store no longer run code when the module loads. Display names in React DevTools are unchanged.
