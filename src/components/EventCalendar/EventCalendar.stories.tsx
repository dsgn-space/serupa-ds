import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventCalendar, type CalendarEvent } from './EventCalendar';

// March 2025, fixed, so the pictures don't move with today.
const EVENTS: CalendarEvent[] = [
  { id: 'standup-3', title: 'Team standup', start: '2025-03-03T09:30', end: '2025-03-03T09:45', repeating: true },
  { id: 'standup-10', title: 'Team standup', start: '2025-03-10T09:30', end: '2025-03-10T09:45', repeating: true },
  { id: 'review', title: 'Design review', start: '2025-03-04T14:00', end: '2025-03-04T15:00', tone: 'info' },
  { id: 'launch', title: 'Launch day', start: '2025-03-12', allDay: true, tone: 'success' },
  { id: 'offsite', title: 'Team offsite', start: '2025-03-18', end: '2025-03-20', allDay: true, tone: 'warning' },
  { id: 'lunch', title: 'Lunch with Sari', start: '2025-03-18T12:00', end: '2025-03-18T13:00' },
  { id: 'demo', title: 'Customer demo', start: '2025-03-18T15:00', end: '2025-03-18T16:00', tone: 'info' },
  { id: 'retro', title: 'Sprint retro', start: '2025-03-18T16:30', end: '2025-03-18T17:00' },
  { id: 'deadline', title: 'Tax filing deadline', start: '2025-03-31', allDay: true, tone: 'danger' },
];

const meta = {
  title: 'Components/Data display/EventCalendar',
  component: EventCalendar,
  args: { events: EVENTS, defaultMonth: new Date(2025, 2, 1), locale: 'en-US', weekStartsOn: 0, maxPerDay: 3 },
  argTypes: { defaultView: { control: 'inline-radio', options: ['month', 'agenda'] } },
} satisfies Meta<typeof EventCalendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Month: Story = {};
export const Agenda: Story = { args: { defaultView: 'agenda' } };
export const Empty: Story = { args: { events: [] , defaultView: 'agenda' } };
export const Indonesian: Story = { args: { locale: 'id-ID', weekStartsOn: 1 } };
// The stress story (G14): a long title, a long word, and more events than a day holds.
export const LongText: Story = {
  args: {
    events: [
      ...EVENTS,
      { id: 'long', title: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung annual general meeting', start: '2025-03-06T10:00', end: '2025-03-06T12:00' },
      ...Array.from({ length: 6 }, (_, i): CalendarEvent => ({ id: 'busy' + i, title: 'Interview ' + (i + 1), start: `2025-03-25T${String(9 + i).padStart(2, '0')}:00` })),
    ],
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: say what a color means in the title too. */
export const DoSayWhatToneMeans: Story = {
  name: 'Do: say what the color means',
  args: { events: [
    { id: 'tax', title: 'Due: tax filing', start: '2025-03-31', allDay: true, tone: 'danger' },
    { id: 'holiday', title: 'Office closed', start: '2025-03-14', allDay: true, tone: 'warning' },
    { id: 'launch', title: 'Launch day', start: '2025-03-12', allDay: true, tone: 'success' },
  ] },
};
/** Don't: color alone, which doesn't reach everyone. */
export const DontToneAlone: Story = {
  name: "Don't: rely on color alone",
  args: { events: [
    { id: 'tax', title: 'Tax filing', start: '2025-03-31', allDay: true, tone: 'danger' },
    { id: 'holiday', title: 'Office', start: '2025-03-14', allDay: true, tone: 'warning' },
    { id: 'launch', title: 'Launch', start: '2025-03-12', allDay: true, tone: 'success' },
  ] },
};
