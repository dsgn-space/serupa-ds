import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormattedNumber } from './FormattedNumber';

const meta = {
  title: 'Components/Content/FormattedNumber',
  component: FormattedNumber,
  args: { value: 1234567.891 },
  argTypes: { format: { control: 'inline-radio', options: ['decimal', 'compact', 'percent', 'currency', 'bytes', 'unit'] } },
} satisfies Meta<typeof FormattedNumber>;
export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-6)' } as const;
export const Playground: Story = {};
export const Formats: Story = {
  render: () => <dl style={{ display: 'grid', gap: 'var(--spacing-1)', margin: 0, maxWidth: '20rem' }}>
    {([
      ['Decimal', <FormattedNumber key="d" value={1234.5} />],
      ['Compact', <FormattedNumber key="c" value={1234567} format="compact" />],
      ['Percent', <FormattedNumber key="p" value={0.456} format="percent" />],
      ['Currency', <FormattedNumber key="m" value={150000} format="currency" currency="IDR" />],
      ['Bytes', <FormattedNumber key="b" value={1500000} format="bytes" />],
      ['Unit', <FormattedNumber key="u" value={50} format="unit" unit="kilometer-per-hour" />],
      ['Change', <FormattedNumber key="s" value={0.031} format="percent" options={{ signDisplay: 'always', maximumFractionDigits: 1 }} />],
    ] as const).map(([k, v]) => <div key={k} style={row}><dt>{k}</dt><dd style={{ margin: 0 }}>{v}</dd></div>)}
  </dl>,
};
export const Locales: Story = {
  render: () => <ul style={{ display: 'grid', gap: 'var(--spacing-1)', margin: 0, paddingInlineStart: 'var(--spacing-5)' }}>
    {['en-US', 'id-ID', 'de-DE', 'fr-FR', 'ar-EG', 'hi-IN'].map((l) => <li key={l} style={row}><span>{l}</span><FormattedNumber value={1234567.89} locale={l} /></li>)}
  </ul>,
};

/** With `animate`, only the characters that changed fade in: press the buttons and watch the total. */
export const Animated: Story = {
  render: function Animated() {
    const [total, setTotal] = React.useState(1_485_000);
    return (
      <div style={{ display: 'grid', gap: 'var(--spacing-3)', justifyItems: 'start' }}>
        <p style={{ margin: 0 }}>Total: <FormattedNumber value={total} format="currency" currency="IDR" animate /></p>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <button type="button" onClick={() => setTotal((t) => t + 15_000)}>Add Rp 15.000</button>
          <button type="button" onClick={() => setTotal((t) => t + 1_000_000)}>Add Rp 1.000.000</button>
        </div>
      </div>
    );
  },
};

export const LongValue: Story = {
  render: () => (
    <p style={{ margin: 0, width: 120 }}>
      Total: <FormattedNumber value={123456789012345.67} format="currency" currency="IDR" /> this year.
    </p>
  ),
};
