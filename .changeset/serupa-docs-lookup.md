---
"@diki-stwn/serupa-ds": minor
---

- New `serupa-docs` command: look up a component's guide from the installed release, offline. `npx serupa-docs Button` prints the whole guide, `npx serupa-docs Button props` one part of it (props, keyboard, accessibility, "when not to use"), `npx serupa-docs search date range` finds components, topics and tokens, and `npx serupa-docs` lists every component by group. `--json` gives the same answers as data. Coding agents get the version the project pinned instead of main on GitHub.
- The package ships `dist/llms.txt`, the short summary a coding agent reads first: what Serupa is, how to look things up with `serupa-docs`, where the installed skill is, and every component. The skill and the `serupa-agents` section now point to `serupa-docs` too.
