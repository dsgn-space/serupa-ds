import type { Meta, StoryObj } from '@storybook/react-vite';
import { GiftCard } from './GiftCard';

/* Gift card: an amount, a design, who it's for and when, a preview, and an answer. GiftCard.mdx says why each part
   is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Gift card',
  component: GiftCard,
  parameters: { layout: 'fullscreen' },
  args: { today: '2026-03-10', onAdd: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof GiftCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen yet. */
export const Default: Story = {};

/** In euros, with other amounts to choose from. */
export const Euros: Story = { args: { currency: 'EUR', amounts: [20, 40, 80, 150] } };

/** Adding fails: it says so, and everything stays. */
export const AddFails: Story = { args: { onAdd: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
