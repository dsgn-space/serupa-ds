---
'@diki-stwn/serupa-ds': patch
---

Thirteen components no longer write refs or pass a ref through `Object.assign` while rendering, so the React Compiler can memoize them: BottomNav, Breadcrumb, Countdown, DataGrid, Link, MaskedValue, Progress, SearchInput, Sidebar, StatusTracker, TabNav, Table and TruncatedText. Nothing changes in how they behave.
