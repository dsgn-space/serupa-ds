import type { Meta, StoryObj } from '@storybook/react-vite';
import { Notifications } from './Notifications';

/* Notifications: a bell in the Navbar with the recent ones in a drawer, and the full inbox page with a filter and
   mark as read. Notifications.mdx says why each part is there and what stays the app's job. Times are minutes before
   the story loads. */
const meta = {
  title: 'Patterns/Notifications',
  component: Notifications,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Notifications>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three unread: the bell says so in its name, each unread one says "Unread" in words, and Mark all as read works. */
export const Default: Story = {};

/** Nothing new: the bell has no count, the status says "All caught up", and Mark all as read is off. */
export const AllRead: Story = {
  args: { items: [{ id: 'a', title: 'Your export is ready', tone: 'success', time: Date.now() - 60_000 * 30, read: true }] },
};

/** No notifications yet: an empty state saying what will show up, with a way to the notification settings. */
export const Empty: Story = { args: { items: [] } };

/** While they load: the count says "Loading notifications" over placeholder rows, and Mark all as read waits. */
export const Loading: Story = { args: { items: [], loading: true } };

/** The notifications failed to load: what happened and Try again in the list's place, and Mark all as read waits. */
export const LoadFailed: Story = { args: { loadFailed: true, onRetry: () => {} } };
