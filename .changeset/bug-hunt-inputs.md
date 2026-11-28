---
"@diki-stwn/serupa-ds": patch
---

Fixes in number, date and text entry, from a bug hunt:

- **NumberInput** with `formatOptions={{ notation: 'compact' }}` reads its own text back: 1500 shows "1.5K" and stays 1500, where it turned into 1.5. A controlled NumberInput tells the app the rounded value when the field is left (10.004 typed as dollars is reported as 10, as shown).
- **Typed numbers**: a currency prefix that ends in a dot ("Rs. 100", "Rp. 1.500") is no longer read as the decimal mark, which made 100 into 0.1.
- **Typed dates**: a Chinese month written in words ("2025年十一月15日") reads as that month, not January.
- **Input `mask`**: plain digits or letters inside the pattern ("0" in `99-0-99`) and an emoji at its start are no longer taken as typed characters.
- **PeriodPicker**: changing `unit` turns the chosen period into the new unit (November 2026 becomes Q4 2026, then 2026).
- **PhoneInput** with `countries` that leave out the locale's country and the US starts on the first listed country, not a US the menu doesn't offer.
- **MentionInput**: after picking a mention, typing on doesn't reopen the list or call `onSearch` again; `mentionsIn` with an empty trigger returns no mentions instead of never returning.
- **SegmentedControl**, **Form** and **FormErrors**: a value or field named like an object method ("toString") no longer crashes or shows as invalid.
- **Form**: a restored draft keeps Date and File values, and a list saved shorter stays shorter.
- **Input** with `type="email"` and `maxLength`: a paste past the limit is cut, counted and reported, where it threw.
