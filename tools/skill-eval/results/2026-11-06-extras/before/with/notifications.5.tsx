import { useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  EmptyState,
  Icon,
  IconButton,
  List,
  Stack,
  Text,
  VisuallyHidden,
  RelativeTime,
  toast,
} from 'serupa-ds';

type Kind = 'comment' | 'mention' | 'invite';

interface Notification {
  id: string;
  kind: Kind;
  title: string;
  time: Date;
  read: boolean;
}

const KIND: Record<Kind, { icon: string; label: string }> = {
  comment: { icon: 'chat_bubble', label: 'Comment' },
  mention: { icon: 'alternate_email', label: 'Mention' },
  invite: { icon: 'person_add', label: 'Invite' },
};

const initial: Notification[] = [
  { id: '1', kind: 'comment', title: 'Rina commented on "Q3 roadmap"', time: new Date(Date.now() - 5 * 60_000), read: false },
  { id: '2', kind: 'mention', title: 'Budi mentioned you in "Launch checklist"', time: new Date(Date.now() - 2 * 3_600_000), read: false },
  { id: '3', kind: 'invite', title: 'You were invited to the Design team', time: new Date(Date.now() - 26 * 3_600_000), read: false },
  { id: '4', kind: 'comment', title: 'Sari replied to your comment', time: new Date(Date.now() - 3 * 86_400_000), read: true },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(initial);

  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast('All notifications marked as read');
  };

  return (
    <>
      <span className="relative inline-flex">
        <IconButton
          variant="primary"
          icon="notifications"
          label={unread > 0 ? `Open notifications, ${unread} unread` : 'Open notifications'}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        />
        {unread > 0 && (
          <Badge
            tone="danger"
            className="absolute"
            style={{ top: 'calc(var(--spacing-2) * -1)', insetInlineEnd: 'calc(var(--spacing-2) * -1)' }}
            aria-hidden="true"
          >
            {unread > 99 ? '99+' : unread}
          </Badge>
        )}
      </span>

      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Notifications">
        <Stack gap={4}>
          <Stack direction="row" gap={2} align="center" justify="between">
            <Text className="text-text-muted" aria-live="polite">
              {unread > 0 ? `${unread} unread` : 'You’re all caught up'}
            </Text>
            <Button variant="primary" size="sm" onClick={markAllRead} disabled={unread === 0}>
              Mark all as read
            </Button>
          </Stack>

          {items.length === 0 ? (
            <EmptyState
              icon="notifications"
              title="No notifications yet"
              description="Comments, mentions and invites show up here."
            />
          ) : (
            <List aria-label="Notifications">
              {items.map((n) => (
                <List.Item
                  key={n.id}
                  className={n.read ? 'text-text-muted' : 'bg-surface-muted'}
                >
                  <Stack direction="row" gap={3} align="start">
                    <Icon name={KIND[n.kind].icon} aria-hidden="true" />
                    <Stack gap={1} className="flex-1">
                      <Text className={n.read ? undefined : 'font-semibold'}>
                        <VisuallyHidden>{KIND[n.kind].label}: </VisuallyHidden>
                        {n.title}
                        {!n.read && <VisuallyHidden> (unread)</VisuallyHidden>}
                      </Text>
                      <Text size="sm" className="text-text-muted">
                        <RelativeTime value={n.time} />
                      </Text>
                    </Stack>
                    {!n.read && (
                      <Button variant="primary" size="sm" onClick={() => markRead(n.id)}>
                        Mark as read
                      </Button>
                    )}
                  </Stack>
                </List.Item>
              ))}
            </List>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
