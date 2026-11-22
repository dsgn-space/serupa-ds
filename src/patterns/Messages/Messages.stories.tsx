import type { Meta, StoryObj } from '@storybook/react-vite';
import { Messages } from './Messages';

/* Messages: one-to-one conversations, the list beside the open one, with a field to write in. Messages.mdx says why
   each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Messages',
  component: Messages,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Messages>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three conversations, one with unread messages. Write a message and press Enter to send it. */
export const Default: Story = {};

/** A message that can't be sent: it says "Not sent", keeps its text, and Try again sends it again. */
export const SendFails: Story = {
  args: {
    defaultOpen: 'budi',
    conversations: [
      { id: 'budi', name: 'Budi Santoso', messages: [
        { id: 'b1', text: 'The October invoice is in your inbox.', at: '2025-03-03T16:02:00' },
        { id: 'b2', own: true, text: 'Thanks, I’ll pay it this week.', at: '2025-03-03T16:30:00', status: 'failed' },
      ] },
      { id: 'chen', name: 'Chen Wei', messages: [{ id: 'c1', text: 'Twelve photos from the shoot are in the shared folder.', at: '2025-03-01T11:45:00' }] },
    ],
    onSend: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)),
  },
};

/** Nobody has written yet. */
export const Empty: Story = { args: { conversations: [] } };

/** The conversations are on their way: one placeholder, named once. */
export const Loading: Story = { args: { loading: true } };

/** The conversations didn't load: the page says so, and Try again loads them again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
