---
"serupa-ds": minor
---

Combobox: `onCreate` lets people add an option that isn't listed (185). While the typed text isn't an option's label, the list ends with 'Add “text”' (the new `createOption` label, in every language). Picking it calls `onCreate(text)`, and the value it returns is picked, or added as a tag with `multiple`.
