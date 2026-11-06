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
  announce,
} from 'serupa-ds';

type Kind = 'comment' | 'mention' | 'invite';

interface Notification {
  id: string;
  kind: Kind;
  title: string;
  time: string;
  read: boolean;
}

const KIND_ICON: Record<Kind, string> = {
  comment: 'chat_bubble',
  mention: 'alternate_email',
  invite: 'person_add',
};

const KIND_LABEL: Record<Kind, string> = {
  comment: 'Comment',
  mention: 'Mention',
  invite: 'Invite',
};

const INITIAL: Notification[] = [
  { id: '1', kind: 'comment', title: 'Rina commented on "Q3 roadmap"', time: '5 minutes ago', read: false },
  { id: '2', kind: 'mention', title: 'Dimas mentioned you in "Launch checklist"', time: '1 hour ago', read: false },
  { id: '3', kind: 'invite', title: 'You were invited to the Design team', time: 'Yesterday', read: false },
  { id: '4', kind: 'comment', title: 'Sari replied to your comment', time: '2 days ago', read: true },
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
          <Badge
            tone="danger"
            aria-hidden="true"
            className="absolute -top-1 -right-1"
          >
            {unread}
          </Badge>
        )}
      </span>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        title="Notifications"
      >
        <Stack gap={4}>
          <Button variant="primary" onClick={markAllRead} disabled={unread === 0}>
            Mark all as read
          </Button>

          {items.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              description="Comments, mentions and invites show up here."
            />
          ) : (
            <List aria-label="Notifications">
              {items.map((n) => (
                <List.Item
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="gap-3"
                >
                  <Icon
                    name={KIND_ICON[n.kind]}
                    className={n.read ? 'text-text-muted' : 'text-primary'}
                  />
                  <Stack gap={1}>
                    <Text className={n.read ? 'text-text-muted' : 'font-semibold'}>
                      <span className="sr-only">{KIND_LABEL[n.kind]}: </span>
                      {n.title}
                    </Text>
                    <Text size="sm" className="text-text-muted">
                      {n.time}
                      {!n.read && ' · Unread'}
                    </Text>
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
