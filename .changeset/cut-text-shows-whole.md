---
"@diki-stwn/serupa-ds": patch
---

Text cut with an ellipsis now shows whole on hover and on keyboard focus in EventCalendar (an event's title in the month), CascadeSelect (the chosen path), PeriodPicker (the value or placeholder), Navbar (a brand passed as text) and BottomNav (a label passed as text), through TruncatedText. Inside a link or a button, a tap on TruncatedText is the control's (it follows the link or opens the picker) rather than showing the text over what opens. Tooltip draws a cut line's full text only while the line is cut, and as a `<span>`, so a button holding one keeps valid content and a single copy of its text.
