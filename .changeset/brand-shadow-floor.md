---
'serupa-ds': patch
---

`data-shadow="brand"`: the tinted shadows show in older supported browsers too. In Chrome 129, inside a `data-brand` section, they were dropped, because it can't work out a color relative to a `light-dark()` brand color. They're now mixed with `color-mix()`, which gives the same color.
