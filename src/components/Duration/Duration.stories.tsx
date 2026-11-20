import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Duration } from './Duration';
import { SerupaProvider } from '../../internal/provider';

const meta = {
  title: 'Components/Content/Duration',
  component: Duration,
  args: { value: 5400 },
  argTypes: { unit: { control: 'inline-radio', options: ['millisecond', 'second', 'minute', 'hour', 'day'] } },
} satisfies Meta<typeof Duration>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The same 75 minutes in each display.
export const Displays: Story = {
  render: () => (
    <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px', margin: 0 }}>
      <dt>short</dt><dd style={{ margin: 0 }}><Duration value={75} unit="minute" /></dd>
      <dt>long</dt><dd style={{ margin: 0 }}><Duration value={75} unit="minute" display="long" /></dd>
      <dt>narrow</dt><dd style={{ margin: 0 }}><Duration value={75} unit="minute" display="narrow" /></dd>
      <dt>digital</dt><dd style={{ margin: 0 }}><Duration value={75} unit="minute" display="digital" /></dd>
    </dl>
  ),
};

// Media lengths as a clock, in a column: tabular digits keep them lined up.
export const Digital: Story = {
  render: () => (
    <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4, justifyItems: 'end', inlineSize: 'max-content' }}>
      {[45, 724, 3725, 11.4].map((s) => <li key={s}><Duration value={s} display="digital" /></li>)}
    </ul>
  ),
};

// A timesheet's week: hours keep counting past a day.
export const LargestHour: Story = { args: { value: 2310, unit: 'minute', largest: 'hour', display: 'long' } };
export const Milliseconds: Story = { args: { value: 93_500, unit: 'millisecond' } };
export const Zero: Story = { args: { value: 0, unit: 'minute' } };

// Each display in Indonesian and Egyptian Arabic (its own digits).
export const Locales: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <SerupaProvider locale="id"><p style={{ margin: 0 }}>Persiapan <Duration value={75} unit="minute" /> · <Duration value={75} unit="minute" display="long" /></p></SerupaProvider>
      <SerupaProvider locale="ar-EG"><p dir="rtl" style={{ margin: 0 }}><Duration value={75} unit="minute" /> · <Duration value={4530} display="digital" /></p></SerupaProvider>
    </div>
  ),
};

// The stress story (G14): days to seconds in long words in a narrow column; it wraps only between units.
export const LongWordsNarrow: Story = { args: { value: 2 * 86400 + 3 * 3600 + 4 * 60 + 5, display: 'long' }, render: (args) => <p style={{ inlineSize: 140, margin: 0 }}>Ran for <Duration {...args} /></p> };
