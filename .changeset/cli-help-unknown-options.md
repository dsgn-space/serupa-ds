---
"serupa-ds": patch
---

`serupa-agents`, `serupa-create` and `serupa-usage` now print their usage and exit 0 on `--help` or `-h`, and stop on an option they don't know, naming it, as the other three commands already did. `serupa-usage --help` used to answer "Not found: --help", and `serupa-create` took a mistyped option for nothing at all.
