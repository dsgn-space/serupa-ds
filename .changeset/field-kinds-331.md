---
"@diki-stwn/serupa-ds": patch
---

Input: card number, expiry, security code and postcode fields (by `autoComplete`), and masked fields such as an IBAN, now get `autoCapitalize="off"`, `autoCorrect="off"` and `spellCheck={false}` like email fields, so a phone doesn't capitalize, "correct" or underline a code. Any of the three you pass still wins. The Input, Field and Popover stories now give each field the type and autofill its label asks for.
