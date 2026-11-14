---
"serupa-ds": patch
---

Chart no longer draws every point again as the pointer moves across it. Each move that showed another category used to rebuild every marker or bar, with its spoken name, in every series. Now the points are drawn again only when the data or the layout change, and the shown category's markers are marked in place. A line chart of a year in three series went from about 18 ms to about 3 ms per move in development.
