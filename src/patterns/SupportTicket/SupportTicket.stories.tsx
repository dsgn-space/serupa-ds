import type { Meta, StoryObj } from '@storybook/react-vite';
import { SupportTicket } from './SupportTicket';

/* Support ticket: where it's got to in words, the conversation as a list, and a reply box; or Reopen once solved.
   SupportTicket.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Support ticket',
  component: SupportTicket,
  parameters: { layout: 'fullscreen' },
  args: { onReply: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof SupportTicket>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Waiting on you: support asked for a photo. */
export const Default: Story = {};

/** Solved: Reopen instead of the reply box. */
export const Solved: Story = {
  args: {
    ticket: {
      reference: 'SR-29977', subject: 'Can’t change my email address', state: 'solved', opened: '2026-01-28T08:00:00Z', priority: 'Normal',
      messages: [
        { id: 'm1', from: 'you', body: 'The Save button stays gray when I enter a new email.', at: '2026-01-28T08:00:00Z' },
        { id: 'm2', from: 'Rina Wijaya', body: 'Fixed on our side: it works now. Sorry for the trouble.', at: '2026-01-28T10:30:00Z' },
      ],
    },
  },
};

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** Sending a reply fails: the words and files stay, and it says to try again. At rest it looks like Default, so it has no screenshot. */
export const ReplyFails: Story = { tags: ['!visual'], args: { onReply: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };
