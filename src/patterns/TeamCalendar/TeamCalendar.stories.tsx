import type { Meta, StoryObj } from '@storybook/react-vite';
import { TeamCalendar } from './TeamCalendar';

/* Team calendar: a team's events, with ways to add, open, move and delete one. TeamCalendar.mdx says why each part
   is there and what stays the app's job. March 2025, fixed, so the pictures don't move with today. */
const meta = {
  title: 'Patterns/Team calendar',
  component: TeamCalendar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TeamCalendar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A month of a team's events. Press an empty day to add one there, an event to open it, or drag one to move it. */
export const Default: Story = {};

/** A move that can't be saved: move any event, and it goes back with a message that names it and when it is again. */
export const MoveFails: Story = { args: { onMove: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** An add that fails: New event, fill it in, then Add event. The dialog says so and keeps what was typed. */
export const AddFails: Story = { args: { onAdd: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** The events are on their way: one placeholder, named once. */
export const Loading: Story = { args: { loading: true } };

/** The events didn't load: the page says so, and Try again loads them again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** Nothing planned this month: the month, and the way to add an event. */
export const Empty: Story = { args: { events: [] } };
