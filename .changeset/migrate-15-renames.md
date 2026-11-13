---
"serupa-ds": minor
---

`npx serupa-migrate` makes the rest of the renames 15.0.0 will need, so an app can make them now on 14.x: Drawer and NotificationCenter `side` to `placement`, Table, DataGrid and List `busy` to `loading`, Button and Badge `loadingText` to `loadingLabel`, and `variant="default"` to `variant="plain"` on Checkbox, CheckboxGroup, Radio and RadioGroup. A tag that already has the new name keeps both, instead of ending up with it twice.
