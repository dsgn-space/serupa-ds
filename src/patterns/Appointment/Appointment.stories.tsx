import type { Meta, StoryObj } from '@storybook/react-vite';
import { Appointment } from './Appointment';

/* Appointment: a time with someone, picked by day and then by time, with your details. Appointment.mdx says why each
   part is there and what stays the app's job. Today is fixed at March 3, 2025, so the pictures don't move. */
const meta = {
  title: 'Patterns/Appointment',
  component: Appointment,
  parameters: { layout: 'fullscreen' },
  args: { onBook: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof Appointment>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Pick a day (days with no free time are struck through), then a time; taken times stay listed, disabled. */
export const Default: Story = {};

/** The time was taken meanwhile: the page says so next to Book and keeps everything. */
export const BookFails: Story = { args: { onBook: () => new Promise((_, no) => setTimeout(() => no(new Error('taken')), 600)) } };

/** The times are on their way from the server: the h1 stays, with a placeholder under it. */
export const Loading: Story = { args: { loading: true } };

/** The times didn't load: the page says so, and Try again loads them again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** No times free: it says so, and when to look again. */
export const Empty: Story = { args: { slots: {} } };
