---
"serupa-ds": patch
---

- Fixed: Slider: inside a disabled `<fieldset>` it is disabled too, as native inputs are. Before, its thumbs stayed in the Tab order, weren't announced as disabled, and the arrow keys still changed the value and called onValueChange. It follows the fieldset as it is enabled and disabled.
