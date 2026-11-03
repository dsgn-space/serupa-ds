---
"serupa-ds": patch
---

PhoneInput and parsePhone: a pasted `tel:` link reads as its number (`tel:+4930123456` is +49 30 123456, not +49 4930123456), and an extension at the end ("ext. 12", "x12", "#12", "Durchwahl 12", ";ext=12") is left off instead of being joined onto the number and marking it complete.
