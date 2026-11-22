import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactForm } from './ContactForm';

/* Contact form: a message with what's needed to answer it, a summary of what's missing, and an answer once sent.
   ContactForm.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Contact form',
  component: ContactForm,
  parameters: { layout: 'fullscreen' },
  args: { onSend: () => new Promise((ok) => setTimeout(() => ok('CF-2041'), 600)) },
} satisfies Meta<typeof ContactForm>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Choosing "An order" as the topic asks for the order number. */
export const Default: Story = {};

/** Sending fails: it says so next to Send, and every field stays. */
export const SendFails: Story = { args: { onSend: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
