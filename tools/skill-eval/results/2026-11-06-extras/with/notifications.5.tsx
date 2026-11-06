import { useState } from 'react';
import {
  announce,
  Badge,
  Button,
  Drawer,
  Icon,
  IconButton,
  Stack,
  Text,
  VisuallyHidden,
} from 'serupa-ds';

type Kind = 'comment' | 'mention' | 'invite';

type Notification = {
  id: string;
  kind: Kind;
  title: string;
  time: string;
  read: boolean;
};

const KIND: Record<Kind, { icon: string; label: string }> = {
  comment: { icon: 'chat_bubble', label: 'Comment' },
  mention: { icon: 'alternate_email', label: 'Mention' },
  invite: { icon: 'person_add', label: 'Invite' },
};

const INITIAL: Notification[] = [
  { id: '1', kind: 'comment', title: 'Sari commented on "Q3 roadmap"', time: '3 minutes ago', read: false },
  { id: '2', kind: 'mention', title: 'Budi mentioned you in "Launch checklist"', time: '1 hour ago', read: false },
  { id: '3', kind: 'invite', title: 'You were invited to the Design team', time: 'Yesterday', read: false },
  { id: '4', kind: 'comment', title: 'Dewi replied to your comment', time: '2 days ago', read: true },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);

  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    announce('All notifications marked as read');
  };

  return (
    <>
      <span className="relative inline-flex">
        <IconButton
          variant="primary"
          label={unread > 0 ? `Open notifications, ${unread} unread` : 'Open notifications'}
          onClick={() => setOpen(true)}
        >
          <Icon name="notifications" />
        </IconButton>
        {unread > 0 && (
          <Badge tone="danger" className="absolute -top-1 -right-1" aria-hidden="true">
            {unread}
          </Badge>
        )}
      </span>

      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Notifications">
        <Stack gap={4}>
          <Button variant="primary" onClick={markAllRead} disabled={unread === 0}>
            Mark all as read
          </Button>

          {items.length === 0 ? (
            <Text className="text-text-muted">
              No notifications yet. Comments, mentions and invites appear here.
            </Text>
          ) : (
            <ul className="flex flex-col gap-2 p-0 m-0 list-none">
              {items.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start gap-3 p-3 rounded-md border bg-surface"
                >
                  <Icon name={KIND[n.kind].icon} aria-hidden="true" />
                  <div className="flex-1">
                    <VisuallyHidden>{KIND[n.kind].label}: </VisuallyHidden>
                    <Text className={n.read ? 'text-text-muted' : 'font-semibold'}>{n.title}</Text>
                    <Text className="text-text-muted">{n.time}</Text>
                    {!n.read && <VisuallyHidden>Unread</VisuallyHidden>}
                  </div>
                  {!n.read && (
                    <Button size="sm" variant="primary" onClick={() => markRead(n.id)}>
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
