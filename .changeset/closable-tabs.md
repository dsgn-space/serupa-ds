---
"@diki-stwn/serupa-ds": minor
---

- Added: closable Tabs. `Tab` takes `onClose`: a × at the tab's end for the pointer, and the Delete key while the tab has focus, both call it. The tab's description says "Press Delete to close." When the selected tab goes, the next one is selected and takes focus, as before; when a focused tab that isn't selected goes, focus moves to the tab beside it. `TabList` takes `onAdd` with `addLabel` for a "+ New query" button after the tabs, beside the tab list rather than in it. There are two new tokens (`--tabs-close-bg-hover`, `--tabs-close-radius`) and one new label (`tabCloseHint`) in every language pack.
