import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sparkline } from './Sparkline';

const WEEKS = [12, 14, 11, 15, 18, 16, 21, 19, 17, 20, 22, 18];
const meta = {
  title: 'Components/Data display/Sparkline',
  component: Sparkline,
  args: { data: WEEKS, label: 'Sign-ups, last 12 weeks' },
} satisfies Meta<typeof Sparkline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = {};
export const Area: Story = { args: { area: true } };
export const Currency: Story = { args: { data: [1200, 1350, 990, 1610, 1480], label: 'Revenue, last 5 days', format: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 } } };
export const Flat: Story = { args: { data: [5, 5, 5, 5], label: 'Open incidents' } };
export const OneValue: Story = { args: { data: [7], label: 'Deploys today' } };
export const SharedScale: Story = {
  render: () => (
    <table>
      <tbody>
        <tr><th scope="row">North</th><td><Sparkline data={[3, 5, 4, 8, 9]} label="North, sales by month" min={0} max={20} /></td></tr>
        <tr><th scope="row">South</th><td><Sparkline data={[12, 15, 14, 18, 19]} label="South, sales by month" min={0} max={20} /></td></tr>
      </tbody>
    </table>
  ),
};
export const InText: Story = {
  render: (args) => <p>Sign-ups are up 50% <Sparkline {...args} /> since the spring campaign.</p>,
};
// The stress story (G14): 365 values and a long label. The line stays one stroke wide and inside its box.
export const LongText: Story = { args: { data: Array.from({ length: 365 }, (_, i) => Math.round(50 + 30 * Math.sin(i / 9) + ((i * 37) % 11))), label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung claims, every day of the year, for a label long enough to wrap twice' } };
