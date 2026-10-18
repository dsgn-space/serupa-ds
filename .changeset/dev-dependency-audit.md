---
"serupa-ds": patch
---

- Security: Cleared 4 of the 22 `npm audit` warnings (the `sprintf-js` denial-of-service advisory, reached through Changesets' YAML reader) by pointing that old YAML library at a newer `argparse`. These were all in release tooling; nothing in the installed package changed.
- Changed: `package.json` lists esbuild and fsevents under `allowScripts` as not needing their install scripts, so npm 11's "install scripts not yet covered by allowScripts" warning goes away. Both already worked without them.
