import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExpenseReport } from './ExpenseReport';

/* Expense report: add expenses one at a time, a table with the total, receipts needed said in words, and Send.
   ExpenseReport.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Expense report',
  component: ExpenseReport,
  parameters: { layout: 'fullscreen' },
  args: { today: '2026-02-12', onSubmit: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof ExpenseReport>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Two expenses, one with its receipt. */
export const Default: Story = {};

/** A receipt missing: the row says so, and Send says which before sending. */
export const ReceiptMissing: Story = {
  args: {
    expenses: [
      { id: 'e1', date: '2026-02-03', category: 'travel', what: 'Train to Bandung', amount: 18 },
      { id: 'e2', date: '2026-02-04', category: 'meals', what: 'Dinner with the client', amount: 64 },
    ],
  },
};

/** While the expenses load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** A new report: no expenses yet, and the way to add the first. */
export const Empty: Story = { args: { expenses: [] } };
