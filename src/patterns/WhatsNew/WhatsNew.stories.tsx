import type { Meta, StoryObj } from '@storybook/react-vite';
import { WhatsNew } from './WhatsNew';

/* What's new: changes by month, what's new since your last visit marked, a filter by kind, and older months on
   request. WhatsNew.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/What’s new',
  component: WhatsNew,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WhatsNew>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Back after a week and a half: two changes since. */
export const Default: Story = {};

/** Seen everything. */
export const AllSeen: Story = { args: { lastSeen: '2026-03-31' } };

/** While the changes load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
