import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RangeCalendar } from './RangeCalendar';
import { Text } from '../Text/Text';

// Fixed days, so the pictures don't move with today.
const nov = new Date(2026, 10, 1);
const meta = {
  title: 'Components/Forms/RangeCalendar',
  component: RangeCalendar,
  args: { defaultValue: { start: '2026-11-03', end: '2026-11-08' }, defaultMonth: nov },
} satisfies Meta<typeof RangeCalendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Two months side by side: pick one end, then the other; the days between follow the pointer until the second pick. */
export const TwoMonths: Story = { name: 'Two months', args: { months: 2, defaultValue: { start: '2026-11-27', end: '2026-12-04' } } };
/** Nothing picked yet: the line under the month says to choose the start date. */
export const Empty: Story = { args: { defaultValue: null } };
/** A booking: two months, nights counted beside it, booked nights struck through and days before the 5th closed. */
function Booking() {
  const booked = (d: Date) => d.getMonth() === 10 && d.getDate() >= 12 && d.getDate() <= 14;
  const [stay, setStay] = React.useState<{ start: Date; end: Date } | null>({ start: new Date(2026, 10, 5), end: new Date(2026, 10, 9) });
  const nights = stay ? Math.round((stay.end.getTime() - stay.start.getTime()) / 864e5) : 0;
  return (
    <div>
      <RangeCalendar aria-label="Check-in and check-out" months={2} defaultMonth={nov} min={new Date(2026, 10, 5)} isDateDisabled={booked}
        value={stay} onValueChange={setStay} />
      <Text size="sm">{nights === 1 ? '1 night' : nights + ' nights'}</Text>
    </div>
  );
}
export const BookingStay: Story = { name: 'Booking with unavailable days', render: () => <Booking /> };
/** Indonesian names, a Monday week and the words under the month. */
export const Indonesian: Story = { args: { locale: 'id-ID' } };
// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = {
  name: 'Long month names (Portuguese), narrow',
  args: { locale: 'pt-BR', months: 2, defaultValue: { start: '2026-09-10', end: '2026-10-02' }, defaultMonth: new Date(2026, 8, 1) },
  render: (args) => <div style={{ width: 280 }}><RangeCalendar {...args} /></div>,
};
