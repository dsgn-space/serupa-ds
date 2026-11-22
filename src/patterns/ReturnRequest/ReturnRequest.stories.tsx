import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReturnRequest } from './ReturnRequest';

/* Return request: what goes back and why, how, where the money goes, and what happens next.
   ReturnRequest.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Return request',
  component: ReturnRequest,
  parameters: { layout: 'fullscreen' },
  args: { onSend: () => new Promise((ok) => setTimeout(() => ok('R-2041'), 600)) },
} satisfies Meta<typeof ReturnRequest>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three items, one that can't go back; a reason is asked for each one chosen. */
export const Default: Story = {};

/** The return can't be made: it says so next to the button, and every choice stays. */
export const SendFails: Story = { args: { onSend: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
