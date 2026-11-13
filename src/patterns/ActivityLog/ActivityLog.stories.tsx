import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActivityLog } from './ActivityLog';

/* Activity log: what people did in a workspace, newest first, with a search, a type filter, Load more and Export.
   ActivityLog.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Activity log',
  component: ActivityLog,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ActivityLog>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first eight of eleven events, each with its time, person, action and type, and Load more under them. */
export const Default: Story = { args: { onExport: () => {} } };

/** A new workspace: nothing recorded yet. */
export const Empty: Story = { args: { events: [] } };

/** The events are on their way: a busy table with placeholder rows, and the count says "Loading activity". */
export const Loading: Story = { args: { loading: true } };

/** The log didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true, onRetry: () => new Promise((r) => setTimeout(r, 1000)) } };
