import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../Field/Field';
import { PeriodPicker } from './PeriodPicker';

// The stories' clock is 12 March 2025 (tools/test/lib.mjs), so March 2025, Q1 2025 and 2025 are the current periods.
const meta = {
  title: 'Components/Forms/PeriodPicker',
  component: PeriodPicker,
  args: { 'aria-label': 'Report month', unit: 'month', size: 'md' },
  argTypes: {
    unit: { control: 'inline-radio', options: ['month', 'quarter', 'year'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 320, minHeight: 320 }}><Story /></div>],
} satisfies Meta<typeof PeriodPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Open on months, February 2025 chosen and March 2025 (this month) in the primary color. */
export const Months: Story = { args: { defaultValue: '2025-02', defaultOpen: true } };
export const Quarters: Story = { args: { 'aria-label': 'Quarter', unit: 'quarter', defaultValue: '2025-Q1', defaultOpen: true } };
/** Years, twelve to a page: 2016 to 2027. */
export const Years: Story = { args: { 'aria-label': 'Fiscal year', unit: 'year', defaultValue: '2023', defaultOpen: true } };
/** Billing can't go further back than June 2024 or past this month: the periods outside are faded and struck through. */
export const MinAndMax: Story = { name: 'Min and max', args: { min: '2024-06', max: '2025-03', defaultValue: '2025-01', defaultOpen: true } };
export const Chosen: Story = { name: 'With a period chosen', args: { defaultValue: '2025-03' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: '2025-03' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: '2025-03' } };
export const Sizes: Story = {
  render: (args) => <div style={{ display: 'grid', gap: 8 }}>{(['sm', 'md', 'lg'] as const).map((s) => <PeriodPicker key={s} {...args} size={s} aria-label={'Month, ' + s} defaultValue="2025-03" />)}</div>,
};
export const InAField: Story = {
  name: 'In a Field',
  args: { 'aria-label': undefined },
  render: (args) => <Field label="Billing month" hint="The invoice covers the whole month." error="Choose a month." required><PeriodPicker {...args} /></Field>,
};
/** In Indonesian and German: month names and the quarter's short name follow the locale. */
export const Locales: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <PeriodPicker {...args} aria-label="Bulan laporan" locale="id-ID" defaultValue="2025-08" />
      <PeriodPicker {...args} aria-label="Berichtsmonat" locale="de-DE" defaultValue="2025-12" />
      <PeriodPicker {...args} aria-label="Kuartal" unit="quarter" locale="id-ID" defaultValue="2025-Q3" />
    </div>
  ),
};
/** Arabic (Egypt) right to left: Eastern Arabic digits, and the arrows follow the reading direction. */
export const RightToLeft: Story = {
  name: 'Right to left',
  args: { 'aria-label': 'شهر التقرير', locale: 'ar-EG', defaultValue: '2025-02', defaultOpen: true },
  render: (args) => <div dir="rtl" lang="ar"><PeriodPicker {...args} /></div>,
};
// The stress story (G14): a long placeholder in a narrow column, and a long month name.
export const LongText: Story = {
  render: (args) => (
    <div style={{ width: 160, display: 'grid', gap: 8 }}>
      <PeriodPicker {...args} placeholder="Choose the month the statement covers" />
      <PeriodPicker {...args} locale="pt-BR" defaultValue="2025-09" />
    </div>
  ),
};
