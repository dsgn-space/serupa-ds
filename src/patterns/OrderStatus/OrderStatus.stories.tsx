import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrderStatus, type OrderInfo } from './OrderStatus';

/* Order status: where an order is, what happened to it, what's in it, and a way to cancel while that's possible.
   OrderStatus.mdx says why each part is there and what stays the app's job. The links go nowhere here. */
const placed: OrderInfo = {
  number: '1043', stage: 'placed', arriving: 'Thursday, March 6',
  events: [{ id: 'e1', at: '2025-03-02T09:30:00', title: 'Order placed', detail: 'Paid by card ending 4242' }],
  items: [{ id: 'i1', name: 'Canvas tote', quantity: 1, price: 18 }],
  delivery: 4,
  address: ['Ana Lima', 'Jl. Braga No. 12', 'Bandung 40111', 'Indonesia'],
};
const meta = {
  title: 'Patterns/Order status',
  component: OrderStatus,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OrderStatus>;
export default meta;
type Story = StoryObj<typeof meta>;

/** An order on its way: the stage in words, the steps, what happened, and the courier's page. It can't be cancelled now, and says why. */
export const Default: Story = {};

/** Just placed, so it can still be cancelled: Cancel order asks first, and "Keep order" is the way out. */
export const CanCancel: Story = { args: { order: placed, onCancel: () => new Promise((ok) => setTimeout(ok, 600)) } };

/** Running late: a warning above the steps says why and when it's due now. */
export const Delayed: Story = {
  args: { order: { ...placed, number: '1040', stage: 'shipped', arriving: 'Friday, March 7', delay: 'The courier is a day behind after flooding in Jakarta. It’s now due on Friday, March 7.', carrier: { name: 'JNE', href: '#jne' } } },
};

/** Delivered: every step is done. */
export const Delivered: Story = { args: { order: { ...placed, number: '1038', stage: 'delivered', arriving: undefined } } };

/** Cancelled: the steps give way to a line that says so and what happens to the money. */
export const Cancelled: Story = {
  args: { order: { ...placed, number: '1039', cancelled: true, events: [{ id: 'e2', at: '2025-03-02T10:02:00', title: 'Order cancelled' }, ...placed.events] } },
};

/** The order is on its way from the server: its number stays, with a placeholder under it. */
export const Loading: Story = { args: { loading: true } };

/** The order didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
