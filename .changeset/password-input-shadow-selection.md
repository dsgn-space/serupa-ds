---
"serupa-ds": patch
---

PasswordInput inside a shadow root: showing or hiding the password keeps the selection the person made, also in Safari, which collapses it to the end on the way to the click. It read focus from the page, which inside a shadow root is the host, not the field.
