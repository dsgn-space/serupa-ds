---
"serupa-ds": minor
---

Outlined icons: `serupa-ds/icons/outlined` has every Material Symbol under the same export names, drawn outlined (I10). Use one for an unselected state beside the filled one (`icon={current ? HomeFilled : Home}`). An outlined icon is named `"<name>:outlined"`, so registering it doesn't replace the filled one; an icon with no outlined drawing is the filled one. Names and the components' own icons stay filled, so nothing a project already ships changes.
