import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';
import { Field } from '../Field/Field';
import { Button } from '../Button/Button';
import { TimePicker } from '../TimePicker/TimePicker';
import { TimeZonePicker } from '../TimeZonePicker/TimeZonePicker';

const meta = {
  title: 'Components/Forms/DatePicker',
  component: DatePicker,
  args: { 'aria-label': 'Date', size: 'md', invalid: false, disabled: false },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  // One field's width, except for the story that sets out three side by side.
  decorators: [(Story, ctx) => (ctx.parameters.wide ? <Story /> : <div style={{ width: 'var(--spacing-64)' }}><Story /></div>)],
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const WithValue: Story = { args: { defaultValue: new Date(2025, 10, 22) } };
export const InField: Story = {
  render: function Render() {
    const [due, setDue] = React.useState<Date | null>(null);
    return <Field label="Due date" hint="mm/dd/yyyy, from today on"><DatePicker value={due} onValueChange={setDue} min={new Date()} /></Field>;
  },
};
export const Sizes: Story = {
  render: () => <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
    {(['sm', 'md', 'lg'] as const).map((s) => <DatePicker key={s} size={s} aria-label={s} defaultValue={new Date(2025, 10, 22)} />)}
  </div>,
};
export const German: Story = { args: { locale: 'de-DE', defaultValue: new Date(2025, 10, 22), buttonLabel: 'Datum wählen' } };
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: new Date(2025, 10, 22) } };
export const ReadOnly: Story = { name: 'Read-only', args: { readOnly: true, defaultValue: new Date(2025, 10, 22) } };

export const OverflowNarrow: Story = {
  args: { defaultValue: '2026-12-31' },
  decorators: [(Story) => <div style={{ width: 140 }}><Story /></div>],
};

/** Date and time: DatePicker, TimePicker and TimeZonePicker in one Field group, checked together, with one error. */
export const DateAndTime: Story = {
  name: 'Date and time',
  parameters: { wide: true },
  render: function Render() {
    const [day, setDay] = React.useState<string | null>(null);
    const [time, setTime] = React.useState<string | null>('09:00');
    const [zone, setZone] = React.useState<string | null>('Asia/Jakarta');
    const [error, setError] = React.useState<string | undefined>();
    const form = React.useRef<HTMLFormElement>(null);
    const [tries, setTries] = React.useState(0);
    const check = () => { setError(!day ? 'Choose a date.' : !time ? 'Choose a time.' : !zone ? 'Choose a time zone.' : undefined); setTries((n) => n + 1); };
    // After a failed check, focus moves to the part at fault, where the group's error is read with the legend.
    React.useEffect(() => { if (tries) form.current?.querySelector<HTMLElement>('input[aria-invalid="true"]')?.focus(); }, [tries]);
    return (
      <form ref={form} noValidate onSubmit={(e) => { e.preventDefault(); check(); }} style={{ display: 'grid', gap: 'var(--spacing-4)', justifyItems: 'start' }}>
        <Field group label="Meeting starts" hint="In the time zone you choose" error={error}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
            <div style={{ width: 'var(--spacing-48)' }}><Field label="Date"><DatePicker value={day} onValueChange={(_, iso) => setDay(iso)} invalid={!!error && !day} /></Field></div>
            <div style={{ width: 'var(--spacing-32)' }}><Field label="Time"><TimePicker value={time} onValueChange={setTime} step={900} invalid={!!error && !time} /></Field></div>
            <div style={{ width: 'var(--spacing-60)' }}><Field label="Time zone"><TimeZonePicker value={zone} onValueChange={setZone} invalid={!!error && !zone} /></Field></div>
          </div>
        </Field>
        <Button type="submit">Schedule</Button>
      </form>
    );
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: a Field label, with the format in the hint for people who type. */
export const DoLabelAndFormat: Story = {
  name: 'Do: label it and give the format',
  render: () => <Field label="Due date" hint="mm/dd/yyyy"><DatePicker /></Field>,
};
/** Don't: no label or format; people can't tell what the date is for or how to type it. */
export const DontBareField: Story = { name: "Don't: leave it unlabelled", args: { 'aria-label': 'Date' } };
