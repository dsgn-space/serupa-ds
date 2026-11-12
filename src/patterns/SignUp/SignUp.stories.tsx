import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignUp } from './SignUp';

/* Sign-up: name, email, an optional phone, a password with its rules shown up front, the terms, then a code sent by
   email. SignUp.mdx says why each part is there and what stays the app's job. The demo code is 123456. */
const meta = {
  title: 'Patterns/Sign-up',
  component: SignUp,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SignUp>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The empty form: the password's rules are listed before anything is typed. */
export const Default: Story = {};

/** Part way: one rule met, one not, each said in words as well as by its mark. */
export const PasswordRules: Story = { args: { initial: { name: 'Ana Lima', email: 'ana@example.com', password: 'ana-and-the-sea' } } };

/** The second step: the code from the email, with a way back that keeps every answer. */
export const Code: Story = { args: { start: 'code', initial: { name: 'Ana Lima', email: 'ana@example.com' } } };

/** The account wasn't created (the server refused, or the network failed): the form stays with every answer, and
    says what happened over the button. Here `onSubmit` rejects again on another try. */
export const SubmitFails: Story = {
  args: { failed: true, initial: { name: 'Ana Lima', email: 'ana@example.com', password: 'tide-pool-lantern', terms: true }, onSubmit: () => Promise.reject(new Error('offline')) },
};

/** Done: the account is ready, with the way in. */
export const Done: Story = { args: { start: 'done', initial: { name: 'Ana Lima', email: 'ana@example.com' } } };
