import type { Meta, StoryObj } from '@storybook/react-vite';
import { Booking } from './Booking';

/* Booking: a stay at one place on two months side by side, with the booked nights named, the price worked out and a
   way to reserve. Booking.mdx says why each part is there and what stays the app's job. Today is fixed at
   November 5, 2026, so the pictures don't move with the date. */
const meta = {
  title: 'Patterns/Booking',
  component: Booking,
  parameters: { layout: 'fullscreen' },
  args: { onReserve: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof Booking>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Pick the day you arrive, then the day you leave: the nights, the price and the total follow. Booked nights are struck through and listed. */
export const Default: Story = {};

/** The booking fails: the page says so next to Reserve, and the dates stay. */
export const ReserveFails: Story = { args: { onReserve: () => new Promise((_, no) => setTimeout(() => no(new Error('taken')), 600)) } };

/** The place is on its way from the server: its name stays, with a placeholder under it. */
export const Loading: Story = { args: { loading: true } };

/** The place didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
