import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar } from './Calendar';

const meta = {
  title: 'Components/Forms/Calendar',
  component: Calendar,
  args: { defaultValue: new Date(2025, 2, 10), defaultMonth: new Date(2025, 2, 10) },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
// The visual and Storybook checks run on a fixed clock (CLOCK in tools/test/lib.mjs), so there today is 12 March 2025.
export const Today: Story = { args: { defaultValue: undefined, defaultMonth: undefined } };
export const MinAndMax: Story = { args: { min: new Date(2025, 2, 5), max: new Date(2025, 2, 25) } };
export const NoWeekends: Story = { args: { isDateDisabled: (d: Date) => d.getDay() === 0 || d.getDay() === 6 } };
export const WeekNumbers: Story = { name: 'Week numbers', args: { weekNumbers: true } };
// The heading opens the year's months, and theirs twelve years: here, the months, as a click on "March 2025" shows them.
export const MonthsAndYears: Story = {
  name: 'Jump by month and year',
  render: function Render(args) {
    const at = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => { at.current?.querySelector<HTMLButtonElement>('.dk-calendar__heading')?.click(); }, []);
    return <Calendar {...args} ref={at} />;
  },
};
export const MonthYearPicker: Story = { name: 'Month and year menus', args: { monthYearPicker: true, min: new Date(1950, 0, 1), max: new Date(2030, 11, 31) } };
export const CalendarSystems: Story = {
  name: 'Another calendar (Persian)',
  args: { calendar: 'persian', defaultValue: new Date(2026, 10, 15), defaultMonth: new Date(2026, 10, 15) },
};
export const German: Story = { args: { locale: 'de-DE', previousLabel: 'Vorheriger Monat', nextLabel: 'Nächster Monat' } };
export const Controlled: Story = {
  render: function Render() {
    const [day, setDay] = React.useState<Date | null>(new Date(2025, 2, 10));
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      <Calendar value={day} onValueChange={setDay} />
      <span style={{ fontSize: 'var(--text-sm)' }}>Picked: {day ? day.toDateString() : 'nothing'}</span>
    </div>;
  },
};

export const LongText: Story = {
  name: 'Long month names (Portuguese), narrow',
  args: { locale: 'pt-BR', defaultValue: new Date(2025, 8, 10), defaultMonth: new Date(2025, 8, 10) },
  render: (args) => <div style={{ width: 240 }}><Calendar {...args} /></div>,
};

export const WithPresets: Story = {
  args: { defaultMonth: new Date(2025, 8, 1), defaultValue: new Date(2025, 8, 1), presets: [{ label: 'Start of term', value: '2025-09-01' }, { label: 'Mid-term break', value: '2025-10-20' }, { label: 'End of term', value: '2025-12-12' }] },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: a heading that says what the day is for, since the grid is named by its month only. */
export const DoSayWhatFor: Story = {
  name: 'Do: say what the day is for',
  // Its own id (useId), so a page that shows this example twice, or beside another, names each by its own heading.
  render: function Render(args) {
    const heading = React.useId();
    return <section aria-labelledby={heading}>
      <h3 id={heading} style={{ margin: '0 0 8px', fontSize: 16 }}>Pick a delivery day</h3>
      <Calendar {...args} />
    </section>;
  },
};
/** Don't: a calendar on its own, which only says "March 2025". */
export const DontUnexplained: Story = { name: "Don't: show it with no context" };
