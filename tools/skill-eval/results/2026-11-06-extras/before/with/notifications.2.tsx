import { useState } from 'react';
import { Badge, Button, Drawer, EmptyState, Icon, IconButton, List, RelativeTime, Stack, Text } from 'serupa-ds';

type Kind = 'comment' | 'mention' | 'invite';

interface Notification {
  id: string;
  kind: Kind;
  title: string;
  at: Date;
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

const initial: Notification[] = [
  { id: '1', kind: 'comment', title: 'Rina commented on "Q3 roadmap"', at: new Date(Date.now() - 5 * 60_000), read: false },
  { id: '2', kind: 'mention', title: 'Dimas mentioned you in "Launch checklist"', at: new Date(Date.now() - 2 * 3_600_000), read: false },
  { id: '3', kind: 'invite', title: 'You were invited to the Design team', at: new Date(Date.now() - 26 * 3_600_000), read: true },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(initial);

  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <>
      <span className="relative inline-flex">
        <IconButton
          label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          variant="primary"
          onClick={() => setOpen(true)}
        >
          <Icon name="notifications" />
        </IconButton>
        {unread > 0 && (
          <Badge
            aria-hidden="true"
            tone="danger"
            className="absolute -top-1 -right-1"
          >
            {unread > 99 ? '99+' : unread}
          </Badge>
        )}
      </span>

      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Notifications">
        <Stack gap={4}>
          <Stack direction="row" gap={2} className="justify-between items-center">
            <Text className="text-text-muted">{unread} unread</Text>
            <Button variant="primary" size="sm" onClick={markAllRead} disabled={unread === 0}>
              Mark all as read
            </Button>
          </Stack>

          {items.length === 0 ? (
            <EmptyState
              icon={<Icon name="notifications" />}
              title="No notifications yet"
              description="Comments, mentions and invites will show up here."
            />
          ) : (
            <List aria-label="Notifications">
              {items.map((n) => (
                <li key={n.id} className="flex items-start gap-3 p-3 border-b border-border">
                  <span className="text-primary" title={KIND_LABEL[n.kind]}>
                    <Icon name={KIND_ICON[n.kind]} />
                  </span>
                  <Stack gap={1} className="flex-1">
                    <Text className={n.read ? 'text-text-muted' : 'font-semibold'}>
                      <span className="sr-only">{KIND_LABEL[n.kind]}: </span>
                      {n.title}
                    </Text>
                    <Text size="sm" className="text-text-muted">
                      <RelativeTime value={n.at} />
                    </Text>
                  </Stack>
                  {!n.read && (
                    <Button variant="primary" size="sm" onClick={() => markRead(n.id)}>
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
