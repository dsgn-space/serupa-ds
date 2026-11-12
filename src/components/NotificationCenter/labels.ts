// NotificationCenter's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface NotificationCenterLabels {
  /** NotificationCenter: the drawer's title. */
  notificationCenter: string;
  /** NotificationCenter: what shows when there are none. */
  noNotifications: string;
  /** NotificationCenter: read before an unread one's title. */
  unreadNotification: string;
  /** NotificationCenter: the button on an unread one. */
  markRead: string;
  /** NotificationCenter: the footer button that marks every one read. */
  markAllRead: string;
  /** NotificationCenter: the footer button that empties the list, and the one that confirms it. */
  clearNotifications: string;
  /** NotificationCenter: the question "Clear all" asks before it empties the list, and the button that keeps them. */
  clearNotificationsConfirm: string;
  keepNotifications: string;
  /** NotificationCenter: the footer link to where people choose which notifications they get (settingsHref). */
  notificationSettings: string;
  /** NotificationCenter: a name for the button that opens it, with the unread count in words. Hide the count Badge. */
  notificationsUnread: (count: number) => string;
}
export const en: NotificationCenterLabels = {
  notificationCenter: 'Notifications',
  noNotifications: 'No notifications yet',
  unreadNotification: 'Unread',
  markRead: 'Mark as read',
  markAllRead: 'Mark all as read',
  clearNotifications: 'Clear all',
  clearNotificationsConfirm: 'Clear every notification? This can’t be undone.',
  keepNotifications: 'Keep them',
  notificationSettings: 'Notification settings',
  notificationsUnread: (count) => (count ? 'Notifications, ' + count.toLocaleString('en') + ' unread' : 'Notifications'),
};
export const id: NotificationCenterLabels = {
  notificationCenter: 'Notifikasi',
  noNotifications: 'Belum ada notifikasi',
  unreadNotification: 'Belum dibaca',
  markRead: 'Tandai sudah dibaca',
  markAllRead: 'Tandai semua sudah dibaca',
  clearNotifications: 'Hapus semua',
  clearNotificationsConfirm: 'Hapus semua notifikasi? Ini tidak bisa dibatalkan.',
  keepNotifications: 'Simpan saja',
  notificationSettings: 'Pengaturan notifikasi',
  notificationsUnread: (count) => (count ? 'Notifikasi, ' + count.toLocaleString('id') + ' belum dibaca' : 'Notifikasi'),
};
