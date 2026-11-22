import type { Meta, StoryObj } from '@storybook/react-vite';
import { Donation } from './Donation';

/* Donation: once or monthly, an amount that says what it pays for, the card fee, a total and a thank-you.
   Donation.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Donation',
  component: Donation,
  parameters: { layout: 'fullscreen' },
  args: { onGive: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof Donation>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen yet. */
export const Default: Story = {};

/** In euros. */
export const Euros: Story = { args: { currency: 'EUR', amounts: [{ amount: 15, buys: 'A school bag with books' }, { amount: 40, buys: 'A term of lunches' }] } };

/** Giving fails: it says so, nothing's charged, and everything stays. */
export const GiveFails: Story = { args: { onGive: () => new Promise((_, no) => setTimeout(() => no(new Error('declined')), 600)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
