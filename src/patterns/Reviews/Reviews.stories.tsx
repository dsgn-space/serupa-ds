import type { Meta, StoryObj } from '@storybook/react-vite';
import { Reviews } from './Reviews';

/* Reviews: the average and the split, then the reviews, filtered, sorted and marked helpful. Reviews.mdx says why each
   part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Reviews',
  component: Reviews,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Reviews>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Five reviews of a jacket, three at a time. */
export const Default: Story = {};

/** No reviews yet. */
export const NoReviews: Story = { args: { reviews: [] } };

/** While the reviews load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
