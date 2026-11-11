---
"serupa-ds": minor
---

AvatarGroup: the `avatarMore` label and `moreLabel` get the count formatted for the locale as a second argument, `(count, formatted)`, and the default uses it. The showMore list's "N more" line now reads "1,234 more" in English and "١٬٢٣٤ more" in ar-EG, where it said "1234 more". Labels that take only the count keep working.
