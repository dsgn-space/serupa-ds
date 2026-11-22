import type { Meta, StoryObj } from '@storybook/react-vite';
import { SendMoney } from './SendMoney';

/* Send money: who, how much, what they get, a review step, then send. SendMoney.mdx says why each part is there and
   what stays the app's job. */
const meta = {
  title: 'Patterns/Send money',
  component: SendMoney,
  parameters: { layout: 'fullscreen' },
  args: { onSend: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof SendMoney>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen yet. */
export const Default: Story = {};

/** Sending fails at the last step: it says nothing moved, and stays on the review. */
export const SendFails: Story = { args: { onSend: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
