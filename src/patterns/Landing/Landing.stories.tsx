import type { Meta, StoryObj } from '@storybook/react-vite';
import { QrCode2, ReceiptLong } from '../../material/icons';
import { Landing } from './Landing';

/* Landing page: the hero, what it does, the plans, the questions and the footer. Landing.mdx says why each part is
   there and what stays the app's job. The links go nowhere here. */
const meta = {
  title: 'Patterns/Landing page',
  component: Landing,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Landing>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A product's page: header, hero, four features, three plans, three questions, a last call to action, the footer. */
export const Default: Story = {};

/** Fewer parts: two features and one plan, priced in rupiah, for a small product. */
export const Small: Story = {
  args: {
    product: 'Kasir',
    headline: 'Take payments at your stall, on your phone',
    lead: 'A till that fits in your pocket, for markets and small shops.',
    currency: 'IDR',
    features: [
      { id: 'qr', title: 'Paid by QR', description: 'Show a code; the money arrives in your account the same day.', icon: QrCode2 },
      { id: 'receipt', title: 'Receipts by message', description: 'Send the receipt to the buyer’s phone, no printer needed.', icon: ReceiptLong },
    ],
    plans: [{ id: 'one', name: 'Kasir', description: 'Everything, for one stall.', monthly: 49000, yearly: 490000, features: ['Unlimited payments', 'Receipts by message', 'Help on chat'] }],
  },
};
