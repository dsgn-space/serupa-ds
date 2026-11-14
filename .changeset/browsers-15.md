---
"serupa-ds": major
---

- **Breaking.** Supported browsers are now Chrome and Edge 129, Safari 26.4 and Firefox 147 (were Chrome and Edge 123, Safari 17.5 and Firefox 128). They have CSS anchor positioning and `@scope`, which the components now use. **Migration:** nothing changes in your code. An app that must keep older browsers stays on 14.x, and a project with a `browserslist` raises it to at least `chrome >= 129, edge >= 129, firefox >= 147, safari >= 26.4, ios >= 26.4`.
