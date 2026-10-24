---
"serupa-ds": patch
---

- Changed: an invalid Switch keeps its grey (off) or brand (on) track and gets a 2px danger edge, like Checkbox and Radio's danger border. Before, an off invalid Switch filled its track red, so it looked switched on. The focus ring stays danger. `--switch-invalid` now colors the edge.
