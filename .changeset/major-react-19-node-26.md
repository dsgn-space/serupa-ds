---
"serupa-ds": major
---

- Changed: React 19 is required. The peer dependency is `react` and `react-dom` `^19.0.0` (was `^18.0.0 || ^19.0.0`). To upgrade a project on React 18, move it to React 19 first (`npm install react@19 react-dom@19 @types/react@19 @types/react-dom@19`) and follow React's upgrade guide; the components themselves need no change.
- Changed: Node 26 or later is required (`engines.node` is `>=26`, was `>=20`). It applies to installing the package and running `serupa-purge`. Move the project's Node, its CI and its `.nvmrc` to 26.
