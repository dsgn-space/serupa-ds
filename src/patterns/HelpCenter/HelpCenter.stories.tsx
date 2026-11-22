import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpCenter } from './HelpCenter';

/* Help center: the topics, the common questions with a search, and a message form that says when a person will
   answer. HelpCenter.mdx says why each part is there and what stays the app's job. The links go nowhere here. */
const meta = {
  title: 'Patterns/Help center',
  component: HelpCenter,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HelpCenter>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four topics, four questions in two groups, and the message form. */
export const Default: Story = {};

/** Send was pressed with no message: it's named next to its field, and the topic chosen stays. */
export const Errors: Story = { args: { failed: 'empty', initial: { topic: 'Billing' } } };

/** The message wasn't sent (the network failed): the form says so over the fields, and every word stays. Here
    `onSend` rejects again on another try. */
export const SendFails: Story = {
  args: { failed: 'send', initial: { topic: 'Billing', message: 'I was charged twice for October.' }, onSend: () => Promise.reject(new Error('offline')) },
};

/** Sent: the form gives way to what happens next, and where the answer goes. */
export const Sent: Story = { args: { start: 'sent' } };

/** While the articles load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
