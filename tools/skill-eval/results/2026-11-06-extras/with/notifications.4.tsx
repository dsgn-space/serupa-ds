import { useState } from 'react';
import { Badge, Button, Drawer, Icon, IconButton, List, Stack, Text, toast } from 'serupa-ds';

type Kind = 'comment' | 'mention' | 'invite';

interface Notification {
  id: string;
  kind: Kind;
  text: string;
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
  { id: '1', kind: 'comment', text: 'Rina commented on "Q3 roadmap"', time: '5 minutes ago', read: false },
  { id: '2', kind: 'mention', text: 'Budi mentioned you in "Launch checklist"', time: '1 hour ago', read: false },
  { id: '3', kind: 'invite', text: 'Sari invited you to the Design team', time: 'Yesterday', read: false },
  { id: '4', kind: 'comment', text: 'Andi replied to your comment', time: '2 days ago', read: true },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);

  const unread = items.filter((n) => !n.read).length;

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
          onClick={() => setOpen(true)}
        />
        {unread > 0 && (
          <Badge
            aria-hidden="true"
            className="absolute -top-1 -right-1"
            tone="danger"
          >
            {unread > 99 ? '99+' : unread}
          </Badge>
        )}
      </span>

      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Notifications">
        <Stack gap={4}>
          <Button
            variant="primary"
            onClick={markAllRead}
            disabled={unread === 0}
          >
            Mark all as read
          </Button>

          {items.length === 0 ? (
            <Text className="text-text-muted">No notifications yet. Comments, mentions and invites show up here.</Text>
          ) : (
            <List>
              {items.map((n) => (
                <List.Item key={n.id}>
                  <Stack direction="row" gap={3} align="start">
                    <Icon name={KIND_ICON[n.kind]} aria-hidden="true" />
                    <Stack gap={1}>
                      <Text className={n.read ? 'text-text-muted' : 'font-semibold'}>
                        <span className="sr-only">{KIND_LABEL[n.kind]}: </span>
                        {n.text}
                        {!n.read && <span className="sr-only"> (unread)</span>}
                      </Text>
                      <Text size="sm" className="text-text-muted">
                        {n.time}
                      </Text>
                    </Stack>
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
