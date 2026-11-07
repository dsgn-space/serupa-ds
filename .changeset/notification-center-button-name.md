---
"serupa-ds": minor
---

NotificationCenter: new `notificationsUnread(count)` label ("Notifications, 2 unread", in all 20 languages) for the button that opens it. The README example and the stories now use it as the button's name and hide the count Badge, so a screen reader no longer hears "Notifications 2".

NotificationCenter: "Mark all as read" shows only while one is unread, and "Clear all" only while the list has any, so neither sits there doing nothing. When the one chosen goes away, focus moves to the other button or to the empty line instead of dropping to the page.
