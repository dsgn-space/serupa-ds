import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateField, type DateFieldChangeDetails } from './DateField';
import { Field } from '../Field/Field';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';

const meta = {
  title: 'Components/Forms/DateField',
  component: DateField,
  args: { 'aria-label': 'Date of birth' },
} satisfies Meta<typeof DateField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** In a Field: its label names the three boxes as a group, and the hint gives an example in the boxes' order. */
export const InField: Story = {
  render: () => (
    <Field label="Date of birth" hint="For example, 27 3 2007">
      <DateField name="dob" autoComplete="bday" />
    </Field>
  ),
};

/** With an error: only the box the problem is in is marked, as GOV.UK does. */
export const Invalid: Story = {
  render: () => (
    <Field label="Passport expiry date" hint="For example, 12 11 2031" error="The expiry date must include a year">
      <DateField name="expiry" defaultValue="" />
    </Field>
  ),
};

const MESSAGES: Record<string, string> = {
  'missing-day': 'Date of birth must include a day',
  'missing-month': 'Date of birth must include a month',
  'missing-year': 'Year must include 4 numbers',
  'not-a-date': 'Date of birth must be a real date',
  'after-max': 'Date of birth must be in the past',
  'before-min': 'Date of birth must be after 1900',
  empty: 'Enter your date of birth',
};
function CheckedDemo() {
  const [value, setValue] = React.useState('');
  const [details, setDetails] = React.useState<DateFieldChangeDetails | null>(null);
  const [shown, setShown] = React.useState(false);
  const error = shown && details && details.problem ? MESSAGES[details.problem] : undefined;
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); setShown(true); }} style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Field label="Date of birth" hint="For example, 27 3 2007" error={error}>
        <DateField name="dob" autoComplete="bday" min="1900-01-01" max="2026-11-09" value={value} onValueChange={(v, d) => { setValue(v); setDetails(d); }} />
      </Field>
      <button type="submit">Continue</button>
      <p style={{ margin: 0 }}>Value: {value || '(none yet)'}</p>
    </form>
  );
}
/** Controlled, with the error worded from onValueChange's problem once the form is sent, and only the wrong boxes marked. */
export const Checked: Story = { render: () => <CheckedDemo /> };

/** The locale sets the order: month, day, year in en-US. */
export const UnitedStates: Story = {
  render: () => (
    <SerupaProvider locale="en-US">
      <Field label="Date of birth" hint="For example, 3 27 2007"><DateField defaultValue="2007-03-27" order="mdy" /></Field>
    </SerupaProvider>
  ),
};

/** In Indonesian: Tanggal, Bulan, Tahun. */
export const Indonesian: Story = {
  render: () => (
    <SerupaProvider locale="id-ID" labels={idLabels}>
      <Field label="Tanggal lahir" hint="Contoh: 17 8 1945"><DateField name="lahir" autoComplete="bday" defaultValue="1945-08-17" order="dmy" /></Field>
    </SerupaProvider>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <DateField aria-label="Small" size="sm" defaultValue="2031-11-12" />
      <DateField aria-label="Medium" size="md" defaultValue="2031-11-12" />
      <DateField aria-label="Large" size="lg" defaultValue="2031-11-12" />
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true, defaultValue: '1990-05-01' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: '1990-05-01' } };

// The stress story (G14): a long label and hint, and a column too narrow for the three boxes in a row.
export const LongText: Story = {
  render: () => (
    <div style={{ maxWidth: 200 }}>
      <Field label="Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung start date" hint="The date on the letter from the insurance office, which is usually at the top right">
        <DateField defaultValue="2024-01-31" />
      </Field>
    </div>
  ),
};
