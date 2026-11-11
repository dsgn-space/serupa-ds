import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationCenter, useToastHistory, type NotificationCenterProps, type NotificationItem } from './NotificationCenter';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { useSerupa } from '../../internal/provider';
import { toast, Toaster } from '../Toast/Toast';

const ago = (minutes: number) => Date.now() - minutes * 60000;
const sample: NotificationItem[] = [
  { id: 'n1', title: 'Payment failed', description: 'The card ending 4242 was declined.', tone: 'danger', time: ago(2) },
  { id: 'n2', title: 'Invoice sent', tone: 'success', time: ago(15) },
  { id: 'n3', title: 'Storage almost full', description: '9.6 GB of 10 GB used.', tone: 'warning', time: ago(60), read: true },
  { id: 'n4', title: 'New comment on "Q3 plan"', tone: 'info', time: ago(180), read: true },
  { id: 'n5', title: 'Export ready', time: ago(1440), read: true },
];

const meta = {
  title: 'Components/Overlays/NotificationCenter',
  component: NotificationCenter,
  args: { items: sample },
  // Your own list, with read states kept in state.
  render: function Render(args: NotificationCenterProps) {
    const [open, setOpen] = React.useState(!!args.defaultOpen);
    const [items, setItems] = React.useState(args.items);
    const unread = items.filter((n) => !n.read).length;
    return <>
      <OpenButton variant="outline" count={unread} onClick={() => setOpen(true)} />
      <NotificationCenter {...args} items={items} open={open} onOpenChange={setOpen}
        onMarkRead={(id) => setItems((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)))}
        onMarkAllRead={() => setItems((l) => l.map((n) => ({ ...n, read: true })))}
        onClear={() => setItems([])} />
    </>;
  },
} satisfies Meta<typeof NotificationCenter>;
// The button that opens it: the count in words in its name ("Notifications, 2 unread", translated), the Badge hidden
// so it isn't read twice (GR176).
function OpenButton({ count, ...props }: { count: number; variant?: 'outline'; onClick: () => void }) {
  const { labels } = useSerupa();
  return <Button {...props} aria-label={labels.notificationsUnread(count)}>{labels.notificationCenter} {count ? <Badge count={count} aria-hidden="true" /> : null}</Button>;
}
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
// The toasts already shown, kept by useToastHistory: show a few, then open the list.
export const ToastHistory: Story = {
  render: function Render(args: NotificationCenterProps) {
    const [open, setOpen] = React.useState(false);
    const history = useToastHistory();
    return <>
      <Toaster />
      <Button variant="outline" onClick={() => toast({ title: 'Saved', tone: 'success' })}>Show a toast</Button>{' '}
      <Button variant="outline" onClick={() => toast({ title: "Couldn't sync", description: 'Check your connection.', tone: 'danger' })}>Show an error</Button>{' '}
      <OpenButton count={history.unread} onClick={() => setOpen(true)} />
      <NotificationCenter {...args} items={history.items} open={open} onOpenChange={setOpen}
        onMarkRead={history.markRead} onMarkAllRead={() => history.markRead()} onClear={history.clear} />
    </>;
  },
};
export const Empty: Story = { args: { defaultOpen: true, items: [] } };

/** With `settingsHref`: the footer starts with a link to the notification settings. */
export const WithSettings: Story = { args: { defaultOpen: true, settingsHref: '#settings/notifications', onMarkAllRead: () => {}, onClear: () => {} } };
// The stress story (G14): long titles and descriptions wrap, and the dot and button stay at the end.
export const LongText: Story = {
  args: {
    defaultOpen: true,
    title: 'Notifications for the Donaudampfschifffahrtsgesellschaft workspace',
    items: [{ id: 'l1', tone: 'warning', time: ago(5), title: 'The Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung export could not be finished', description: 'Three of the forty-two attachments were larger than the workspace allows, so they were left out of the archive.' }],
  },
};
