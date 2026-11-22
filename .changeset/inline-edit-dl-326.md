---
"@diki-stwn/serupa-ds": patch
---

Fixed (InlineEdit): as a value in a DescriptionList (not `layout="split"`), its text now starts where the plain values above and below it start, and its row is as tall as theirs. Before, its button's padding and height pushed the text 13px right and 6px down. Its hover background still shows the whole button.

Changed (Patterns): Appointment's calendar keeps its own width, as in Booking and Leave request, instead of stretching across the column with its days 96px apart.

Changed (Patterns): Event registration's total reads "Choose a ticket to see your total." until a ticket is chosen, in a filled Card as in Donation. Before, an empty line left a double gap under "How many tickets?".

Fixed (Table, List): an Avatar in a hovered, striped or selected row now steps its fill up to `secondary-hover`. In light themes its usual `secondary` fill is the same zinc-100 as the row's shade, so the circle disappeared and its initials floated on the row (as on Leaderboard's "You" row). New component tokens `--table-avatar-bg-shaded` and `--list-avatar-bg-shaded` set it.

Changed (Patterns): every form now marks both kinds of field, as the Forms guide asks: a `*` on each one that must be filled, "(optional)" on the rest, and "Fields marked * are required." once before the form. Multi-step form, Sign up, Checkout, Expense report, Support ticket, Team members and Session time-out marked only their optional fields, or nothing; 20 more marked both but never said what the `*` meant. Expense report's receipt turns from optional to required once the amount needs one. A new check draws every block and pattern story and fails on a form that marks some fields and not others.

Fixed (Field): its guide said to mark only the smaller set, or explain the `*` instead of marking optional fields, which the Forms guide changed. It now says to mark both, like the Forms guide.

Fixed (Patterns): in Sign up and Password reset, a password rule not yet met showed a solid grey dot, because the filled icon set draws `radio_button_unchecked` as a disc. It is now an empty ring (`trip_origin`) beside the met rules' check.
