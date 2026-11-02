---
"serupa-ds": patch
---

`serupa-purge` removes CSS comments with a single scan instead of a regular expression. On a stylesheet with many unclosed `/*`, the regular expression took time that grew with the square of the file's length. The output is unchanged, and an unclosed comment is still left as it is.
