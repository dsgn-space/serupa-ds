---
"serupa-ds": major
---

- Changed: plain pages get React 19.3.1 instead of 18.3.1. `dist/lib/react.production.min.js` and `dist/lib/react-dom.production.min.js` keep their names and still set `window.React` and `window.ReactDOM`, so a page set up as the README shows needs no change. A page whose own code calls APIs React 19 removed, such as `ReactDOM.render` or `ReactDOM.hydrate`, should switch to `ReactDOM.createRoot(el).render(…)` and `ReactDOM.hydrateRoot(el, …)`. Projects with a bundler are not affected: they use their own React, 18 or 19.
