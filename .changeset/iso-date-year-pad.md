---
'serupa-ds': patch
---

Date fields and calendars: a day before the year 1000 is given as four digits of year ("0099-01-02"), in `onValueChange` and in a form's hidden value, so it reads back as the same day. It was "99-01-02".
