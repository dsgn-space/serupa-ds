---
"serupa-ds": patch
---

- Changed (tooling): CI runs the visual snapshots as three parallel shards, so they no longer set how long a run takes. `SERUPA_SHARD=2/3 node tools/test/visual.mjs` checks one shard locally.
