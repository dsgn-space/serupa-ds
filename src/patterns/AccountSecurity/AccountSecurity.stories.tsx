import type { Meta, StoryObj } from '@storybook/react-vite';
import { AccountSecurity } from './AccountSecurity';

/* Account security: the password, two-step verification and the devices signed in. AccountSecurity.mdx says why each
   part is there and what stays the app's job. The links go nowhere here. */
const meta = {
  title: 'Patterns/Account security',
  component: AccountSecurity,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AccountSecurity>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Two-step verification off, and three devices signed in: this one, and two others with Sign out. */
export const Default: Story = {};

/** Two-step verification on, with Turn off, and only this device signed in. */
export const TwoStepOn: Story = {
  args: { twoStep: true, devices: [{ id: 'd1', name: 'Chrome on a Mac', place: 'Jakarta, Indonesia', lastActive: 0, current: true }] },
};

/** The devices on their way: placeholder rows, named once, while the rest of the page works. */
export const Loading: Story = { args: { loading: true } };

/** The devices failed to load: a message in their place with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true, onRetry: () => new Promise((r) => setTimeout(r, 1000)) } };

/** A delete asked for with 14 days to change one's mind, on a paid plan: the banner says the day, with Keep my account. */
export const DeletionScheduled: Story = { args: { deleteAfter: 14, deletionDate: '2026-11-28', plan: 'Pro' } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
