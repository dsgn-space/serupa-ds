import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormattedDate } from './FormattedDate';
import { SerupaProvider } from '../../internal/provider';

const meta = {
  title: 'Components/Content/FormattedDate',
  component: FormattedDate,
  args: { value: '2026-11-20' },
  argTypes: {
    dateStyle: { control: 'inline-radio', options: ['full', 'long', 'medium', 'short'] },
    timeStyle: { control: 'inline-radio', options: ['full', 'long', 'medium', 'short'] },
  },
} satisfies Meta<typeof FormattedDate>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The same day in each dateStyle.
export const DateStyles: Story = {
  render: () => (
    <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px', margin: 0 }}>
      {(['full', 'long', 'medium', 'short'] as const).map((s) => <React.Fragment key={s}><dt>{s}</dt><dd style={{ margin: 0 }}><FormattedDate value="2026-11-20" dateStyle={s} /></dd></React.Fragment>)}
    </dl>
  ),
};

// A moment with its time, in a time zone given so the picture is the same everywhere.
export const WithTime: Story = { args: { value: '2026-11-20T02:30:00Z', dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' } };

// An event's dates: the month and year are said once.
export const Range: Story = {
  render: () => (
    <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
      <li><FormattedDate value="2026-11-20" to="2026-11-22" /></li>
      <li><FormattedDate value="2026-11-28" to="2026-12-03" /></li>
      <li><FormattedDate value="2026-12-30" to="2027-01-02" dateStyle="long" /></li>
    </ul>
  ),
};

// Only the parts asked for: a month and year, a weekday and day.
export const Parts: Story = {
  render: () => (
    <p style={{ margin: 0 }}>
      <FormattedDate value="2026-11-20" options={{ month: 'long', year: 'numeric' }} /> · <FormattedDate value="2026-11-20" options={{ weekday: 'short', month: 'short', day: 'numeric' }} />
    </p>
  ),
};

// Indonesian and Egyptian Arabic (its own digits and calendar names).
export const Locales: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <SerupaProvider locale="id"><p style={{ margin: 0 }}>Jatuh tempo <FormattedDate value="2026-11-20" dateStyle="long" /> · <FormattedDate value="2026-11-20" to="2026-11-22" /></p></SerupaProvider>
      <SerupaProvider locale="ar-EG"><p dir="rtl" style={{ margin: 0 }}><FormattedDate value="2026-11-20" dateStyle="full" /></p></SerupaProvider>
    </div>
  ),
};

// The stress story (G14): the longest style, a date and time, in a narrow column; it wraps like the sentence around it.
export const LongTextNarrow: Story = {
  args: { value: '2026-09-30T14:45:00Z', dateStyle: 'full', timeStyle: 'full', timeZone: 'America/Argentina/Buenos_Aires' },
  render: (args) => <p style={{ inlineSize: 160, margin: 0 }}>Starts <FormattedDate {...args} /></p>,
};
