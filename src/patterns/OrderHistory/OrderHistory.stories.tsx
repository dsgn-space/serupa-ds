import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrderHistory } from './OrderHistory';

/* Order history: every order, newest first, found by what was in it or where it's got to, with View and Buy again.
   OrderHistory.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Order history',
  component: OrderHistory,
  parameters: { layout: 'fullscreen' },
  args: { onBuyAgain: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof OrderHistory>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Twelve orders, five at a time; search by number or item, or show one state. */
export const Default: Story = {};

/** Nothing ordered yet. */
export const NoOrders: Story = { args: { orders: [] } };

/** Buy again fails: a toast says so. */
export const BuyAgainFails: Story = { tags: ['!visual'], args: { onBuyAgain: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** On their way from the server. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
