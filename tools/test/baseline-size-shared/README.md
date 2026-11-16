# Shared size raises

A pull request that takes a shared size line over its budget (a total in `TOTALS`, the label text in `LABELS`, or the starter page in `STARTER`, all in `tools/test/size.mjs`) adds its own file here, named after its branch:

```sh
node tools/test/size.mjs --raise-shared "what grew"
```

Each file holds `{ "<line>": [KiB added, "what grew, dated"] }`. The raises add up, one file for each pull request's growth, so pull requests that grow shared code don't conflict on the same line.
