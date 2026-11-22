import type { Meta, StoryObj } from '@storybook/react-vite';
import { Referral } from './Referral';

/* Invite friends: the rules, your link with Copy, invites by email, and who joined.
   Referral.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Referral',
  component: Referral,
  parameters: { layout: 'fullscreen' },
  args: { onInvite: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof Referral>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three friends invited: one earned you credit, one joined, one hasn't yet. */
export const Default: Story = {};

/** Nobody invited yet. */
export const NoInvites: Story = { args: { referrals: [] } };

/** Sending fails: it says so next to the button, and the addresses stay. */
export const SendFails: Story = { args: { onInvite: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
