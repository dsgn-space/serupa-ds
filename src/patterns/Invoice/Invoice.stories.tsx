import type { Meta, StoryObj } from '@storybook/react-vite';
import { Invoice, type InvoiceInfo } from './Invoice';

/* Invoice: one bill as the person paying it reads it. Invoice.mdx says why each part is there and what stays the
   app's job. Today is fixed at March 20, 2025, so the pictures don't move. The links go nowhere here. */
const meta = {
  title: 'Patterns/Invoice',
  component: Invoice,
  parameters: { layout: 'fullscreen' },
  args: { onPay: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof Invoice>;
export default meta;
type Story = StoryObj<typeof meta>;

const small: InvoiceInfo = {
  number: 'INV-2038', issued: '2025-02-01', due: '2025-03-03', paid: '', from: ['Acme Studio', 'Bandung, Indonesia'], to: ['Budi Santoso', 'Surabaya, Indonesia'],
  lines: [{ id: 'l1', description: 'Logo refresh', quantity: 1, price: 650 }], taxRate: 0.11, pdf: '#inv-2038.pdf',
};

/** Due in 11 days: the amount to pay, "Due" in a badge and the day in a sentence, the lines as a table, Pay and Download. */
export const Default: Story = {};

/** Overdue: the badge says so, and the sentence says by how long and when it was due. */
export const Overdue: Story = { args: { invoice: small } };

/** Paid: the badge and the sentence say so, the amount due is nothing, and there is no Pay button. */
export const Paid: Story = { args: { invoice: { ...small, number: 'INV-2030', paid: '2025-03-01' } } };

/** The payment fails: the page says so next to Pay, and the invoice stays due. */
export const PayFails: Story = { args: { onPay: () => new Promise((_, no) => setTimeout(() => no(new Error('declined')), 600)) } };

/** The invoice is on its way from the server: placeholders, named once. */
export const Loading: Story = { args: { loading: true } };

/** The invoice didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
