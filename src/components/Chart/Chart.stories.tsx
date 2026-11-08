import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chart } from './Chart';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const meta = {
  title: 'Components/Data display/Chart',
  component: Chart,
  args: {
    title: 'Visitors and sign-ups',
    categories: MONTHS,
    series: [
      { name: 'Visitors', values: [120, 132, 101, 134, 190, 230, 210, 182, 191, 234, 290, 330] },
      { name: 'Sign-ups', values: [20, 42, 31, 54, 60, 73, 80, 64, 71, 94, 110, 142] },
    ],
  },
  argTypes: { type: { control: 'inline-radio', options: ['line', 'bar', 'area', 'donut'] } },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-md)' }}><Story /></div>],
} satisfies Meta<typeof Chart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Line: Story = {};
export const Bar: Story = {
  args: {
    type: 'bar', title: 'Orders by region', categories: ['North', 'South', 'East', 'West'],
    series: [{ name: '2025', values: [420, 380, 510, 290] }, { name: '2026', values: [460, 350, 580, 340] }, { name: '2027 target', values: [500, 400, 600, 380] }],
  },
};
export const Area: Story = { args: { type: 'area' } };
export const AreaStacked: Story = {
  name: 'Area, stacked',
  args: {
    type: 'area', stacked: true, title: 'Orders by channel',
    series: [
      { name: 'Shop', values: [40, 42, 45, 50, 52, 60, 58, 62, 66, 70, 82, 95] },
      { name: 'App', values: [20, 24, 30, 34, 40, 46, 50, 56, 60, 66, 74, 88] },
      { name: 'Partners', values: [10, 12, 11, 14, 16, 18, 17, 20, 22, 24, 28, 30] },
    ],
  },
};
export const Donut: Story = {
  args: { type: 'donut', title: 'Traffic by source', categories: ['Search', 'Direct', 'Social', 'Email', 'Referral'], series: [{ name: 'Visits', values: [4200, 2600, 1800, 900, 500] }] },
};
export const DonutOther: Story = {
  name: 'Donut, more than eight categories',
  args: {
    type: 'donut', title: 'Orders by province',
    categories: ['Jawa Barat', 'Jawa Timur', 'Jawa Tengah', 'DKI Jakarta', 'Banten', 'Sumatera Utara', 'Sulawesi Selatan', 'Bali', 'Riau', 'Lampung'],
    series: [{ name: 'Orders', values: [920, 780, 640, 610, 330, 280, 210, 180, 120, 90] }],
  },
};
export const OneSeries: Story = {
  name: 'One series, no legend',
  args: { title: 'Daily active users', hideLegend: true, series: [{ name: 'Users', values: [12, 18, 15, 22, 30, 28, 35, 41, 39, 44, 52, 60] }] },
};
export const Gaps: Story = {
  name: 'Missing values',
  args: { title: 'Readings', series: [{ name: 'Sensor A', values: [3, 4, null, null, 6, 7, 5, null, 8, 9, 9, 10] }, { name: 'Sensor B', values: [2, 3, 3, 4, null, 5, 6, 6, 7, null, 8, 8] }] },
};
export const Negative: Story = {
  name: 'Negative values',
  args: { type: 'bar', title: 'Profit and loss', categories: ['Q1', 'Q2', 'Q3', 'Q4'], series: [{ name: 'Profit', values: [12, -8, 4, 18] }], hideLegend: true, formatValue: (v: number) => `${v < 0 ? '−' : ''}$${Math.abs(v)}k` },
};
export const EightSeries: Story = {
  name: 'Eight series',
  args: {
    title: 'Every chart color, with its marker',
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    series: Array.from({ length: 8 }, (_, s) => ({ name: `Series ${s + 1}`, values: [10, 20, 15, 25, 20].map((v, i) => v + s * 6 + ((i * s) % 5)) })),
  },
};
export const EightBars: Story = {
  name: 'Eight series of bars',
  args: { ...EightSeries.args, type: 'bar', title: 'Every chart color, with its pattern', categories: ['Mon', 'Tue', 'Wed'] },
};
export const AsTable: Story = { name: 'As a table', args: { defaultView: 'table' } };
export const Formatted: Story = {
  name: 'Formatted values',
  args: { type: 'bar', title: 'Revenue', categories: ['Jan', 'Feb', 'Mar'], hideLegend: true, series: [{ name: 'Revenue', values: [1250000, 1830000, 1610000] }], formatValue: (v: number) => new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', notation: 'compact' }).format(v) },
};
// The stress story (G14): long words, long labels, more categories than fit; the visual baselines show how it copes.
export const LongText: Story = {
  args: {
    title: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a title long enough to wrap twice in a narrow column',
    categories: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    series: [{ name: 'Donaudampfschifffahrtsgesellschaft', values: Array.from({ length: 30 }, (_, i) => 1000 + ((i * 377) % 900)) }, { name: 'A second series with a long name', values: Array.from({ length: 30 }, (_, i) => 600 + ((i * 211) % 700)) }],
  },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};
