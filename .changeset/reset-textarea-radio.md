---
"serupa-ds": patch
---

- Fixed: after a form reset, Textarea's count still showed the old length, and a RadioGroup still held the old choice, so the next click on that radio did nothing. Both follow the reset now, and controlled ones show their value again (P2, Q2).
