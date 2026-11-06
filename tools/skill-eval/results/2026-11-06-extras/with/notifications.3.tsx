import { useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  EmptyState,
  Icon,
  IconButton,
  Stack,
  Text,
  VisuallyHidden,
  toast,
} from 'serupa-ds';

type Kind = 'comment' | 'mention' | 'invite';

type Notification = {
  id: string;
  kind: Kind;
  title: string;
  time: string;
  read: boolean;
};

const KINDS: Record<Kind, { icon: string; label: string }> = {
  comment: { icon: 'chat_bubble', label: 'Comment' },
  mention: { icon: 'alternate_email', label: 'Mention' },
  invite: { icon: 'person_add', label: 'Invite' },
};

const INITIAL: Notification[] = [
  { id: '1', kind: 'comment', title: 'Rina commented on "Q3 roadmap"', time: '5 minutes ago', read: false },
  { id: '2', kind: 'mention', title: 'Dimas mentioned you in "Launch checklist"', time: '1 hour ago', read: false },
  { id: '3', kind: 'invite', title: 'You were invited to join the Design team', time: 'Yesterday', read: false },
  { id: '4', kind: 'comment', title: 'Sari replied to your comment', time: '2 days ago', read: true },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast('All notifications marked as read');
  };

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <>
      <span className="relative inline-flex">
        <IconButton
          variant="primary"
          icon="notifications"
          label={unread > 0 ? `Open notifications, ${unread} unread` : 'Open notifications'}
          onClick={() => setOpen(true)}
        />
        {unread > 0 && (
          <Badge
            aria-hidden="true"
            className="absolute -top-1 -right-1"
            variant="danger"
            size="sm"
          >
            {unread > 99 ? '99+' : unread}
          </Badge>
        )}
      </span>

      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Notifications">
        <Stack gap={4}>
          <Stack direction="row" gap={2} align="center" justify="between">
            <Text className="text-text-muted">{unread} unread</Text>
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
            <ul className="list-none m-0 p-0">
              {items.map((n) => (
                <li key={n.id} className="flex items-start gap-3 py-3 border-b border-border">
                  <Icon name={KINDS[n.kind].icon} />
                  <div className="flex-1">
                    <Text className={n.read ? 'text-text-muted' : 'font-semibold'}>
                      <VisuallyHidden>{KINDS[n.kind].label}: </VisuallyHidden>
                      {n.title}
                    </Text>
                    <Text size="sm" className="text-text-muted">
                      {n.time}
                      {!n.read && <VisuallyHidden>, unread</VisuallyHidden>}
                    </Text>
                  </div>
                  {!n.read && (
                    <Button variant="primary" size="sm" onClick={() => markRead(n.id)}>
                      Mark as read
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
