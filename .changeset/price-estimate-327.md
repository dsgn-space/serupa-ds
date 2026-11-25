---
"@diki-stwn/serupa-ds": patch
---

Fixed (Patterns): in Price estimate, "Talk to sales" sat 6.5px above the middle of the "Start a 14-day trial" button beside it, because the row stretched the link to the button's height with its text at the top. The two now share a middle line, as in Data import.

Fixed (AppShell): the footer's sides now follow main's padding (16, 24 or 32px by width), so its text starts where main's content does. It was a fixed 24px, 8px off on phones and wide screens. `--app-shell-footer-padding`, when set, still pads every side.

Changed (Patterns): Page shell's "Recent" heading is the 18px section heading the other patterns use, and its list says "Help center".

Changed (Patterns): Email preferences' "You won't get these emails any more" heading is 24px, like the confirmation every other pattern shows after a send ("Message sent", "You're booked"). It was 20px.
