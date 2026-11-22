import type { Meta, StoryObj } from '@storybook/react-vite';
import { WriteReview } from './WriteReview';

/* Write a review: stars, words and photos for something bought, a summary of what's missing, and a thank-you.
   WriteReview.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Write a review',
  component: WriteReview,
  parameters: { layout: 'fullscreen' },
  args: { onSend: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof WriteReview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A shirt bought two weeks ago. */
export const Default: Story = {};

/** Sending fails: it says so, and everything stays. */
export const SendFails: Story = { tags: ['!visual'], args: { onSend: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
