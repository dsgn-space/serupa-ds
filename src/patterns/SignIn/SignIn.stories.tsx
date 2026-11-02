import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignIn } from './SignIn';

/* Sign in (PT1): email and password, then a one-time code, as a page an app copies. SignIn.mdx says when to use it,
   why each part is there and what stays the app's job. The demo account is ada@example.com with the password
   "correct horse", and the code 123456. */
const meta = {
  title: 'Patterns/Sign in',
  component: SignIn,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SignIn>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first step: email, password, a way to reset it, and Sign in. */
export const Default: Story = {};

/** Sent with nothing filled in: the ErrorSummary lists both problems and takes focus, and each field says its own. */
export const Errors: Story = { args: { failed: 'empty' } };

/** An email and password that don't match an account: one error, on the password, that doesn't say which was wrong. */
export const WrongPassword: Story = { args: { failed: 'wrong' } };

/** The second step: a 6-digit code, which a phone can fill in from the message (autocomplete="one-time-code"). */
export const Code: Story = { args: { start: 'code' } };

/** Signed in. */
export const Done: Story = { args: { start: 'done' } };
