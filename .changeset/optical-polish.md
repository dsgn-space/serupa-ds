---
"serupa-ds": minor
---

Optical polish, found by three new measurements across every story:

- Toolbar: its corners are concentric with the controls inside, the controls' radius plus the padding (10px, 12px in Modern), so the corners share a centre. `--toolbar-radius` still sets them outright.
- Numbers keep their width as they change: Table's cells, Chart's key, PeriodPicker's value and AvatarGroup's "+N" use tabular figures.
- Link: the new-tab icon is centred on the capitals beside it instead of sitting low. New token `--icon-cap-align` (-0.125em) does the same for any 1em icon in running text.
- FileUpload: a failure message that wraps keeps its icon on the first line.
- TagGroup: the × fades its fill on hover like every other control.
