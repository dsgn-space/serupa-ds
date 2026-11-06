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

interface Notification {
  id: string;
  kind: Kind;
  title: string;
  time: string;
  read: boolean;
}

const KIND: Record<Kind, { icon: string; label: string }> = {
  comment: { icon: 'chat_bubble', label: 'Comment' },
  mention: { icon: 'alternate_email', label: 'Mention' },
  invite: { icon: 'person_add', label: 'Invite' },
};

const INITIAL: Notification[] = [
  { id: '1', kind: 'comment', title: 'Rina commented on "Q3 roadmap"', time: '5 minutes ago', read: false },
  { id: '2', kind: 'mention', title: 'Budi mentioned you in "Launch checklist"', time: '1 hour ago', read: false },
  { id: '3', kind: 'invite', title: 'Sari invited you to the Design team', time: 'Yesterday', read: false },
  { id: '4', kind: 'comment', title: 'Andi replied to your comment', time: '2 days ago', read: true },
];

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);

  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    toast('All notifications marked as read');
  };

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
          <Badge aria-hidden="true" className="absolute -top-1 -right-1">
            {unread > 99 ? '99+' : unread}
          </Badge>
        )}
      </span>

      {/* Drawer slides in from the right, handles focus trap, Esc and reduced motion */}
      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Notifications">
        <Stack gap={4}>
          <Button variant="primary" size="sm" disabled={unread === 0} onClick={markAllRead}>
            Mark all as read
          </Button>

          {items.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              description="Comments, mentions and invites show up here."
            />
          ) : (
            <Stack as="ul" gap={2} className="list-none p-0 m-0">
              {items.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start gap-3 p-3 rounded-md border bg-surface"
                >
                  <Icon name={KIND[n.kind].icon} aria-hidden="true" className="text-primary" />
                  <Stack gap={1} className="flex-1">
                    <Text>
                      <VisuallyHidden>{KIND[n.kind].label}: </VisuallyHidden>
                      {n.title}
                    </Text>
                    <Text size="sm" className="text-text-muted">
                      {n.time}
                    </Text>
                    {!n.read && (
                      <Stack direction="row" gap={2} align="center">
                        <Badge>New</Badge>
                        <Button variant="primary" size="sm" onClick={() => markRead(n.id)}>
                          Mark as read
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </li>
              ))}
            </Stack>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
