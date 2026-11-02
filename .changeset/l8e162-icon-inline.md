---
"serupa-ds": patch
---

Fixed: an Icon inline in running text no longer makes the line taller. It's centred on the text (`vertical-align: middle`) instead of sitting on the baseline, so each size step stays inside its text's line height (xs with text-xs, sm with text-sm, md with text-base). Icons in a flex row are unchanged.
