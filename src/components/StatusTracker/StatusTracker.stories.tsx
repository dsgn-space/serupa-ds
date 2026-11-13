import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusTracker, type StatusDay, type StatusState } from './StatusTracker';

/** 90 days ending 6 Nov 2026, mostly up, for the stories and tests: degraded on days 20 and 61, down on day 47, no data for the first 5. */
function sampleDays(count = 90): StatusDay[] {
  const end = new Date(2026, 10, 6);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (count - 1 - i));
    const state: StatusState = i < 5 ? 'none' : i === 20 || i === 61 ? 'degraded' : i === 47 ? 'down' : 'up';
    return { date, state, note: state === 'down' ? 'Outage, 42 minutes' : state === 'degraded' ? 'Slow responses' : undefined };
  });
}

const meta = {
  title: 'Components/Data display/StatusTracker',
  component: StatusTracker,
  args: { label: 'API', days: sampleDays() },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
} satisfies Meta<typeof StatusTracker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ThirtyDays: Story = { name: '30 days', args: { days: sampleDays(30) } };

export const AllUp: Story = { name: 'No incidents', args: { days: sampleDays(90).map((d) => ({ ...d, state: 'up' as const, note: undefined })) } };

export const Bare: Story = { name: 'Without summary or legend', args: { summary: null, legend: false } };

export const OwnSummary: Story = { name: 'Its own summary', args: { summary: 'Last incident 16 days ago' } };

// The stress story (G14): many bars in a narrow box, a long note; the visual baselines show how it copes.
export const LongText: Story = {
  args: { label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung', days: sampleDays(365), summary: 'A summary long enough to wrap twice in a narrow column, with Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung' },
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
};
