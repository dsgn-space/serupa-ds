import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { StatsRow } from './StatsRow';

/* Stats row (BL2): key numbers for the top of a dashboard, as a block an app copies. StatsRow.mdx says what each part
   is for. The stories put it on a small page (a skip link, main and an h1) so the page rules hold. */
const meta = {
  title: 'Blocks/Stats row',
  component: StatsRow,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className="min-h-screen bg-surface-muted text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 outline-none"><Heading level={1}>Dashboard</Heading><Story /></main></div>],
  args: {
    title: 'This month',
    period: 'vs last month',
    stats: [
      { label: 'Revenue', value: '€48,200', change: { amount: '12%', direction: 'up' }, trend: [31, 34, 33, 38, 41, 40, 43, 48] },
      { label: 'New customers', value: '312', change: { amount: '4%', direction: 'down' }, trend: [340, 330, 335, 325, 320, 318, 315, 312] },
      { label: 'Refunds', value: '€1,140', change: { amount: '8%', direction: 'up', good: false }, trend: [900, 950, 980, 1000, 1020, 1060, 1100, 1140] },
      { label: 'Average order', value: '€64', change: { amount: '0%', direction: 'flat' }, trend: [64, 63, 65, 64, 64, 63, 64, 64] },
    ],
  },
} satisfies Meta<typeof StatsRow>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four numbers, each with its change in words and a trend line. Refunds going up is bad news, so it's marked danger. */
export const Default: Story = {};

/** Without trend lines or a period: just the numbers and their change. */
export const Plain: Story = { args: { period: undefined, stats: meta.args.stats.slice(0, 3).map(({ trend: _trend, ...s }) => s) } };

/** While the numbers load: skeleton cards, the list marked busy, and one "Loading" for screen readers. */
export const Loading: Story = { args: { loading: true } };
