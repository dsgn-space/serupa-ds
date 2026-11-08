---
"serupa-ds": patch
---

PhoneInput and PinInput: while an input method is composing (Japanese, Chinese, Korean; Safari sends these keydowns), Backspace and Delete next to a separator in PhoneInput, and the arrows, Home and End in PinInput, are left to the input method instead of editing the number or moving between boxes.
