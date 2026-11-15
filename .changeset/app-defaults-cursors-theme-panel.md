---
"@diki-stwn/serupa-ds": minor
---

App-wide defaults and a theme panel for checking them.

- `SerupaProvider` takes `size="sm" | "md" | "lg"`: every form control inside (Input, Textarea, Select, Combobox, NumberInput, the date and time pickers, Checkbox, Radio, Switch, SegmentedControl, Slider and the rest) takes it when it doesn't set its own `size`, so a dense app sets it once.
- Four cursor tokens, `--cursor-interactive`, `--cursor-disabled`, `--cursor-grab` and `--cursor-grabbing`, which every component now reads. Set `--cursor-interactive: default` on `:root` for a desktop-app feel. The stylelint config gains `serupa/no-raw-cursor`, a warning on those keywords written out.
- The debug overlay (`dist/debug.js`) has a Theme panel that switches brand, mode, contrast, density, radius, depth, shadow and type scale on the page live and checks contrast again in each, and `Serupa.debug.theme(settings)` does the same from code.
