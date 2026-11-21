---
"@diki-stwn/serupa-ds": minor
---

Client components now ship compiled by the React Compiler, so rendering them again with the same props does less work: in the benchmarks, re-renders take 18% less time and mounts 5% less. Your app needs no setup for this. The package is about 28 KiB (gzipped) bigger in total, and a component imported on its own is a few hundred bytes bigger.
