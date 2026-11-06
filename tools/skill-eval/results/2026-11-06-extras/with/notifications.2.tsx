import { useState } from 'react';
import { Badge, Button, Drawer, Icon, IconButton, List, Stack, Text } from 'serupa-ds';

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

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
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
            tone="danger"
            size="sm"
            className="absolute"
            style={{ top: 'calc(var(--spacing-1) * -1)', insetInlineEnd: 'calc(var(--spacing-1) * -1)' }}
            aria-hidden="true"
          >
            {unread > 99 ? '99+' : unread}
          </Badge>
        )}
      </span>

      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Notifications">
        <Stack gap={4}>
          <Button variant="primary" iconStart="done_all" disabled={unread === 0} onClick={markAllRead}>
            Mark all as read
          </Button>

          {items.length === 0 ? (
            <Text className="text-text-muted">No notifications yet. Comments, mentions and invites show up here.</Text>
          ) : (
            <List>
              {items.map((n) => (
                <List.Item
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  leading={
                    <span className={n.read ? 'text-text-muted' : 'text-primary'}>
                      <Icon name={KIND_ICON[n.kind]} aria-hidden="true" />
                    </span>
                  }
                  title={n.title}
                  description={`${KIND_LABEL[n.kind]} · ${n.time}${n.read ? '' : ' · Unread'}`}
                />
              ))}
            </List>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
