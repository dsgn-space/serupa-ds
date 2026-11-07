// src/components/NotificationCenter/labels.ts
var en = {
  notificationCenter: "Notifications",
  noNotifications: "No notifications yet",
  unreadNotification: "Unread",
  markRead: "Mark as read",
  markAllRead: "Mark all as read",
  clearNotifications: "Clear all",
  notificationsUnread: (count) => count ? "Notifications, " + count.toLocaleString("en") + " unread" : "Notifications"
};
var id = {
  notificationCenter: "Notifikasi",
  noNotifications: "Belum ada notifikasi",
  unreadNotification: "Belum dibaca",
  markRead: "Tandai sudah dibaca",
  markAllRead: "Tandai semua sudah dibaca",
  clearNotifications: "Hapus semua",
  notificationsUnread: (count) => count ? "Notifikasi, " + count.toLocaleString("id") + " belum dibaca" : "Notifikasi"
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
