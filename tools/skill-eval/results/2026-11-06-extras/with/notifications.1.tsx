import { useState } from 'react';
import { Badge, Button, Drawer, Icon, IconButton, List, Stack, Text, VisuallyHidden } from 'serupa-ds';

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
  { id: '1', kind: 'comment', title: 'Dewi commented on "Q4 roadmap"', time: '5 minutes ago', read: false },
  { id: '2', kind: 'mention', title: 'Arif mentioned you in "Launch checklist"', time: '1 hour ago', read: false },
  { id: '3', kind: 'invite', title: 'Sari invited you to the Design team', time: 'Yesterday', read: false },
  { id: '4', kind: 'comment', title: 'Budi replied to your comment', time: '2 days ago', read: true },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((list) => list.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

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
            <Text className="text-text-muted">No notifications yet. Comments, mentions and invites appear here.</Text>
          ) : (
            <List aria-label="Notifications">
              {items.map((n) => (
                <li key={n.id} className="flex items-start gap-3 p-3 border-b border-border">
                  <Icon name={KIND[n.kind].icon} aria-hidden="true" className={n.read ? 'text-text-muted' : 'text-primary'} />
                  <div className="flex-1">
                    <VisuallyHidden>
                      {KIND[n.kind].label}
                      {n.read ? '' : ', unread'}:{' '}
                    </VisuallyHidden>
                    <Text className={n.read ? 'text-text-muted' : 'font-semibold'}>{n.title}</Text>
                    <Text size="sm" className="text-text-muted">
                      {n.time}
                    </Text>
                  </div>
                  {!n.read && (
                    <Button size="sm" onClick={() => markRead(n.id)}>
                      Mark as read
                    </Button>
                  )}
                </li>
              ))}
            </List>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
