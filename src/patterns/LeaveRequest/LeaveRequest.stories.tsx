import type { Meta, StoryObj } from '@storybook/react-vite';
import { LeaveRequest } from './LeaveRequest';

/* Leave request: time off picked on a calendar, with the working days counted, weekends and holidays left out and
   named, and the balance that's left. LeaveRequest.mdx says why each part is there and what stays the app's job.
   Today is fixed at March 10, 2025, so the pictures don't move with the date. */
const meta = {
  title: 'Patterns/Leave request',
  component: LeaveRequest,
  parameters: { layout: 'fullscreen' },
  args: { onSubmit: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof LeaveRequest>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Choose the kind of leave and the first and last day away: the working days are counted, and the holidays inside are named. */
export const Default: Story = {};

/** Sending fails: the page says so next to the button, and what was chosen stays. */
export const SendFails: Story = { args: { onSubmit: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** Nothing asked for yet, and a Friday and Saturday weekend. */
export const NoRequests: Story = { args: { requests: [], weekend: [5, 6], balance: 21 } };

/** The balance is on its way from the server: the h1 stays, with a placeholder under it. */
export const Loading: Story = { args: { loading: true } };

/** The balance didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
