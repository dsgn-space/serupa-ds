---
"serupa-ds": patch
---

AvatarGroup: each avatar now overlaps the one before by less (2px at sm, 4px at md, 8px at lg, 12px at xl), and at xs they sit edge to edge. The overlap used to cover the first letter of the next avatar's initials at xs, sm and md, so "BS" read as "S". The `--avatar-group-overlap-*` tokens still override these values.
