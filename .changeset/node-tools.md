---
"serupa-ds": minor
---

- Added: `npx serupa-purge src -o public/bundle.min.css` trims `bundle.css` to the classes your code uses, straight from the installed package. It replaces `tools/purge.py`, which only ran from a clone with Python, and gives the same output.
- Changed: the custom icon build is `node tools/icons/build.mjs` (it was `python3 tools/icons/build.py`), with the same rules and output; `node tools/icons/builtin.mjs` keeps the built-in icons in step. Building, testing and releasing no longer need Python.
