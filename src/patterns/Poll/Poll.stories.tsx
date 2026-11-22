import type { Meta, StoryObj } from '@storybook/react-vite';
import { Poll, recount } from './Poll';

/* Poll: one question, a vote, then the results so far with yours marked. Poll.mdx says why each part is there and
   what stays the app's job. */
const meta = {
  title: 'Patterns/Poll',
  component: Poll,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Poll>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Not voted yet. */
export const Default: Story = {};

/** Voted: the results so far, yours marked. */
export const Voted: Story = { args: { defaultVote: 'boat' } };

/** Closed: the results only. */
export const Closed: Story = { args: { closed: true, counts: { beach: 12, boat: 19, garden: 6, escape: 3 } } };

/** Sending fails: it says so, and the answer stays chosen. */
export const VoteFails: Story = { args: { onVote: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** A slow count: Vote shows it's busy. */
export const SlowVote: Story = {
  args: { onVote: (id, previous) => new Promise((ok) => setTimeout(() => ok(recount({ beach: 9, boat: 14, garden: 5, escape: 2 }, id, previous)), 1200)) },
};

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
