---
"serupa-ds": patch
---

MentionInput searches the people once for each letter typed, not on every render. It used to match every name again, about four times over while ordering them, on each keystroke and on each arrow key that only moved the highlight. With 1,000 people, a letter now takes about a third of the time, and an arrow key doesn't search at all. What's found and its order are unchanged: names that start with the text come first.
