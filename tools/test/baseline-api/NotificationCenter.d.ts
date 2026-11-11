// exports: NotificationCenter, type NotificationCenterProps, type NotificationItem, type ToastHistory, type ToastHistoryOptions, useToastHistory
interface NotificationCenterLabels {
    notificationCenter: string;
    noNotifications: string;
    unreadNotification: string;
    markRead: string;
    markAllRead: string;
    clearNotifications: string;
    clearNotificationsConfirm: string;
    keepNotifications: string;
    notificationsUnread: (count: number) => string;
}
interface NotificationItem {
    id: string;
    title: React.ReactNode;
    description?: React.ReactNode | undefined;
    tone?: ToastTone | undefined;
    time?: Date | number | undefined;
    read?: boolean | undefined;
}
interface NotificationCenterProps extends DrawerProps {
    title?: React.ReactNode | undefined;
    description?: never | undefined;
    footer?: never | undefined;
    children?: never | undefined;
    unsaved?: never | undefined;
    items: NotificationItem[];
    onMarkRead?: ((id: string) => void) | undefined;
    onMarkAllRead?: (() => void) | undefined;
    onClear?: (() => void) | undefined;
    empty?: React.ReactNode | undefined;
}
interface ToastHistoryOptions {
    limit?: number | undefined;
}
interface ToastHistory {
    items: NotificationItem[];
    unread: number;
    markRead: (id?: string) => void;
    clear: () => void;
}
declare function useToastHistory(options?: ToastHistoryOptions): ToastHistory;
declare const NotificationCenter: React.ForwardRefExoticComponent<NotificationCenterProps & React.RefAttributes<HTMLDialogElement>>;
