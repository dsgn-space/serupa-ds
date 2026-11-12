---
"serupa-ds": patch
---

PhoneInput: the number field's `autocomplete` is now `tel`, not `tel-national`. Browser autofill brings the saved number with its country code, and the field moves the country menu to match, where before a saved +44 number went in under the default country.
