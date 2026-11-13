import type { Meta, StoryObj } from '@storybook/react-vite';
import { Billing } from './Billing';

/* Billing: the plan with its price and renewal date, usage in words, the card, invoices, and a cancel that takes one
   dialog. Billing.mdx says why each part is there and what stays the app's job. The links go nowhere here. */
const meta = {
  title: 'Patterns/Billing',
  component: Billing,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Billing>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A Team plan that renews monthly, its usage, the card it's paid with, and three paid invoices. */
export const Default: Story = {};

/** The last payment failed: the page says so at the top, with the way to fix it, and the invoice says so too. */
export const PaymentFailed: Story = {
  args: { invoices: [
    { id: 'in4', date: '2026-11-01', amount: 24, status: 'failed', href: '#invoice-in4' },
    { id: 'in3', date: '2026-10-01', amount: 24, status: 'paid', href: '#invoice-in3' },
  ] },
};

/** A cancelled plan: it says when it stops and that nothing is deleted, with Resume plan. */
export const Cancelled: Story = { args: { plan: { name: 'Team', price: 24, currency: 'USD', interval: 'month', renews: '2026-12-01', cancelled: true } } };

/** Billing is on its way: each part's heading with a placeholder, named once ("Loading billing"). */
export const Loading: Story = { args: { loading: true } };

/** Billing didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true, onRetry: () => new Promise((r) => setTimeout(r, 1000)) } };
