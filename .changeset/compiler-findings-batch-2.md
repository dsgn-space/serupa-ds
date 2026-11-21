---
'@diki-stwn/serupa-ds': patch
---

Badge, Card and Field are now compiled by the React Compiler, so they re-render less: they build their element in JSX rather than through `React.createElement` with a ref, and pass children without spreading them. Chart and List lose two of their compiler findings on the way. Nothing changes in how they look or behave.
