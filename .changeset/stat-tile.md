---
"@diki-stwn/serupa-ds": minor
---

Added: StatTile, one key number on a card for the top of a dashboard. It reads label, value, then the change in words ("Up 12%", with an arrow, green or red by whether `change.good` says it's good news) and the period, with an optional trend line named by its numbers. `loading` shows a placeholder and marks it busy. Its words are labels (`statTileUp`, `statTileDown`, `statTileFlat`, `statTileTrend`) in every language pack.

StatsRow now draws each number as a StatTile, so its change and trend words follow the provider's language pack when its own `labels` don't set them.
