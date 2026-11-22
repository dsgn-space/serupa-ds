import type { Meta, StoryObj } from '@storybook/react-vite';
import { Transactions } from './Transactions';

/* Transactions: a month's money in and out, its totals, search and a category filter. Transactions.mdx says why each
   part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Transactions',
  component: Transactions,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Transactions>;
export default meta;
type Story = StoryObj<typeof meta>;

/** This month, with one still pending. */
export const Default: Story = {};

/** In euros. */
export const InEuros: Story = { args: { currency: 'EUR', account: 'Savings' } };

/** While the transactions load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** A new account: no transactions yet. */
export const Empty: Story = { args: { transactions: [] } };
