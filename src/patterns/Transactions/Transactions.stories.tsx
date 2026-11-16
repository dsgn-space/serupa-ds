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
