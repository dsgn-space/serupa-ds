import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventRegistration } from './EventRegistration';

/* Event registration: when and where, places left, tickets with a total, and a waiting list once it's full.
   EventRegistration.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Event registration',
  component: EventRegistration,
  parameters: { layout: 'fullscreen' },
  args: { onRegister: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof EventRegistration>;
export default meta;
type Story = StoryObj<typeof meta>;

const event = {
  title: 'Design systems meetup', start: '2026-03-12T18:30:00+07:00', end: '2026-03-12T21:00:00+07:00', timeZone: 'Asia/Jakarta', zone: 'Jakarta time (UTC+7)',
  place: 'Acme office, 5th floor, Jl. Sudirman 21, Jakarta', capacity: 60, taken: 47,
  tickets: [
    { value: 'general', label: 'General', price: 12, who: 'Talks, dinner and drinks' },
    { value: 'student', label: 'Student', price: 5, who: 'The same, with a student card at the door' },
  ],
};

/** 13 places left: choose a ticket and how many, and the total is worked out. */
export const Default: Story = {};

/** Two places left: how many tickets goes up to 2. */
export const AlmostFull: Story = { args: { event: { ...event, taken: 58 } } };

/** Full: the form becomes the waiting list, with no tickets to choose. */
export const Full: Story = { args: { event: { ...event, taken: 60 } } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** Register fails: everything entered stays, and it says to try again. At rest it looks like Default, so it has no screenshot. */
export const RegisterFails: Story = { tags: ['!visual'], args: { onRegister: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };
