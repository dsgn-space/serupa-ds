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
