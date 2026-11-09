---
"serupa-ds": patch
---

Chat keeps one ResizeObserver for the life of its log and adds each message to it as it arrives, instead of building a new one over every message on every render. A streamed reply in a long conversation no longer re-observes every message for each token, and the reader still stays at the bottom while a message grows.
