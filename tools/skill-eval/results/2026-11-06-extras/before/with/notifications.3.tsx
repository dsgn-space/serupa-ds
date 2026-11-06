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
  announce,
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
  { id: '1', kind: 'comment', title: 'Rina commented on "Q3 roadmap"', time: '5 minutes ago', read: false },
  { id: '2', kind: 'mention', title: 'Dimas mentioned you in "Launch checklist"', time: '1 hour ago', read: false },
  { id: '3', kind: 'invite', title: 'You were invited to the Design team', time: 'Yesterday', read: false },
  { id: '4', kind: 'comment', title: 'Sari replied to your comment', time: '2 days ago', read: true },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    announce('All notifications marked as read');
  };

  return (
    <>
      <span className="relative inline-flex">
        <IconButton
          variant="primary"
          icon="notifications"
          label={unread > 0 ? `Open notifications, ${unread} unread` : 'Open notifications'}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        />
        {unread > 0 && (
          <Badge
            tone="danger"
            size="sm"
            aria-hidden="true"
            className="absolute"
            style={{ top: 'calc(var(--spacing-2) * -1)', insetInlineEnd: 'calc(var(--spacing-2) * -1)' }}
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
            <Button variant="primary" size="sm" disabled={unread === 0} onClick={markAllRead}>
              Mark all as read
            </Button>
          </Stack>

          {items.length === 0 ? (
            <EmptyState
              icon="notifications"
              title="No notifications yet"
              description="Comments, mentions and invites will show up here."
            />
          ) : (
            <List aria-label="Notifications">
              {items.map((n) => {
                const kind = KIND[n.kind];
                return (
                  <List.Item
                    key={n.id}
                    leading={<Icon name={kind.icon} aria-hidden="true" />}
                    title={
                      <span className={n.read ? undefined : 'font-semibold'}>
                        <VisuallyHidden>{kind.label}: </VisuallyHidden>
                        {n.title}
                      </span>
                    }
                    description={n.time}
                    trailing={
                      n.read ? null : (
                        <>
                          <span
                            aria-hidden="true"
                            className="bg-primary rounded-full"
                            style={{ width: 'var(--spacing-2)', height: 'var(--spacing-2)', display: 'inline-block' }}
                          />
                          <VisuallyHidden>Unread</VisuallyHidden>
                        </>
                      )
                    }
                  />
                );
              })}
            </List>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
