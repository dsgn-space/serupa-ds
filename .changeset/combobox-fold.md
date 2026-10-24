---
"serupa-ds": patch
---

- Fixed: Combobox: matching "ignoring case and accents" missed letters that don't split into a letter and an accent: "lodz" didn't find Łódź, "da nang" didn't find Đà Nẵng, and "orsted", "aeon", "strasse" and "hal far" didn't find Ørsted, Æon, Straße and Ħal Far. Full-width text typed with Japanese input ("ｔｏｋｙｏ") and half-width kana didn't match either. Labels and typed text are now folded the same way: compatibility decomposition, accents removed, and a short table for ł, đ, ø, æ, œ, ß, ħ, ı, þ and similar letters.
