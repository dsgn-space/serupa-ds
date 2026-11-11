---
"serupa-ds": patch
---

Textarea `autoResize`, where the browser can't size a field to its content (Firefox, older Safari): a web font that arrives after the first paint now refits the height. Before, the text rewrapped to more or fewer lines in a field that kept its width, so its height stayed as measured with the fallback font, hiding a line or leaving a spare one.
