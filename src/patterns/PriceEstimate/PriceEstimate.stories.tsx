import type { Meta, StoryObj } from '@storybook/react-vite';
import { PriceEstimate } from './PriceEstimate';

/* Price estimate: a plan, how many people and extras, and the cost line by line as you go. PriceEstimate.mdx says why
   each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Price estimate',
  component: PriceEstimate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PriceEstimate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Team, 12 people, paid yearly. */
export const Default: Story = {};

/** In euros, with 10% off a yearly bill. */
export const Euros: Story = { args: { currency: 'EUR', yearlyOff: 0.1 } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
