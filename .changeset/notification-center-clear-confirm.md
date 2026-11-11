---
"serupa-ds": minor
---

NotificationCenter: "Clear all" asks first, since it can't be undone. The footer shows "Clear every notification? This can’t be undone." with a destructive "Clear all" that calls `onClear` and "Keep them", which has focus. Two new labels, `clearNotificationsConfirm` and `keepNotifications`, in English, Indonesian and every language pack.
