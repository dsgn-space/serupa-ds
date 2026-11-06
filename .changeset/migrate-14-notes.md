---
"serupa-ds": patch
---

`serupa-migrate` no longer says only "Nothing to change." to a 13.x project that 14.0.0 breaks. With `--from 13` it now lists, as file:line to check by hand, the files that use the mask and gradient classes that moved to `utilities-extra.css` (skipping a file that already imports it), and any `moreResults` label or `.dk-combobox__more` rule, which 14.0.0 removed. `--list --from 13` shows both. Every run ends by pointing at the Upgrading page and the changelog's Breaking entries for what a script can't find.
