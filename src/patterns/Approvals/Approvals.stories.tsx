import type { Meta, StoryObj } from '@storybook/react-vite';
import { Approvals } from './Approvals';

/* Approvals: requests waiting on you, approved with Undo or declined with a reason. Approvals.mdx says why each part
   is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Approvals',
  component: Approvals,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Approvals>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three requests waiting: an expense, leave and a purchase. */
export const Default: Story = {};

/** Nothing waiting. */
export const CaughtUp: Story = { args: { requests: [] } };

/** While the requests load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
