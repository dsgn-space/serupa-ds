import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasswordReset } from './PasswordReset';

/* Password reset: asking for a link by email, then choosing a new password from it.
   PasswordReset.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Password reset',
  component: PasswordReset,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PasswordReset>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first step: the email to send the link to. */
export const Default: Story = {};

/** The link went: what to look for, sending it again, and using another email. */
export const Sent: Story = { args: { start: 'sent', email: 'ana@example.com' } };

/** Opened from the email's link: the new password, its rules listed from the start. */
export const ChoosePassword: Story = { args: { start: 'choose', email: 'ana@example.com' } };

/** The link is too old or was used: why, and a way to get a new one. */
export const Expired: Story = { args: { start: 'expired', email: 'ana@example.com' } };

/** The password is changed: what that did, and Sign in. */
export const Done: Story = { args: { start: 'done' } };
