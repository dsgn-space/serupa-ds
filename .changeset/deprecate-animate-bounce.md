---
"serupa-ds": minor
---

`animate-bounce` (the utility class and the `--animate-bounce` token) is deprecated and will be removed in 15.0.0. It bounces without end, which the motion rules turn down: WCAG 2.2.2 asks for a way to pause anything that moves for more than five seconds. To hint that there's more below, use a still chevron icon, or let the content arrive once with `animate-enter`. A deprecated token now carries the Design Tokens format's own `$deprecated` in `tokens/serupa.tokens.json` and `tokens.json`, so tools that read the tokens see it too.
