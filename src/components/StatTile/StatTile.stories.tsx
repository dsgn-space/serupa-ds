import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatTile } from './StatTile';

const REVENUE = [38200, 40100, 39500, 42800, 41900, 44600, 46100, 48200];
const meta = {
  title: 'Components/Data display/StatTile',
  component: StatTile,
  args: { label: 'Revenue', value: '€48,200', change: { amount: '12%', direction: 'up' }, period: 'vs last month', trend: REVENUE, trendFormat: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 } },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
} satisfies Meta<typeof StatTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = {};
/** A fall that is bad news: red, and "Down" in words. */
export const Down: Story = { args: { label: 'Active users', value: '1,204', change: { amount: '4%', direction: 'down' }, trend: [1320, 1290, 1270, 1250, 1230, 1204], trendFormat: undefined } };
/** A rise that is bad news: costs going up are red, with good={false}. */
export const UpIsBad: Story = { args: { label: 'Costs', value: '€12,900', change: { amount: '8%', direction: 'up', good: false }, trend: [10900, 11200, 11800, 12100, 12900] } };
/** A fall that is good news: refunds going down are green. */
export const DownIsGood: Story = { args: { label: 'Refunds', value: '23', change: { amount: '31%', direction: 'down', good: true }, trend: [41, 38, 35, 30, 23], trendFormat: undefined } };
export const Flat: Story = { args: { label: 'Open incidents', value: '3', change: { amount: '0', direction: 'flat' }, trend: undefined } };
export const ValueOnly: Story = { args: { label: 'Customers', value: '8,312', change: undefined, period: undefined, trend: undefined } };
export const Loading: Story = { args: { loading: true, loadingLabel: 'Loading revenue' } };
/** Tiles in a list: each one an li, so a screen reader says how many numbers there are. */
export const InAList: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 'none' }}><Story /></div>],
  render: () => (
    <ul role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 16, margin: 0, padding: 0, listStyle: 'none' }}>
      <StatTile as="li" label="Revenue" value="€48,200" change={{ amount: '12%', direction: 'up' }} period="vs last month" trend={REVENUE} />
      <StatTile as="li" label="Orders" value="1,930" change={{ amount: '3%', direction: 'up' }} period="vs last month" trend={[1700, 1760, 1810, 1870, 1930]} />
      <StatTile as="li" label="Refunds" value="23" change={{ amount: '31%', direction: 'down', good: true }} period="vs last month" trend={[41, 38, 35, 30, 23]} />
    </ul>
  ),
};
// The stress story (G14): a long label and a long value in a narrow column; both wrap inside the card.
export const LongText: Story = { args: { label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung claims paid out this quarter', value: '€1,234,567,890.12', change: { amount: '1,234.5%', direction: 'up' }, period: 'compared with the same quarter of the year before' } };

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: say whether a change is good news, so a rise in costs is red. */
export const DoSayWhatIsGood: Story = { name: 'Do: say whether the change is good', args: { label: 'Costs', value: '€12,900', change: { amount: '8%', direction: 'up', good: false }, trend: undefined } };
/** Don't: leave a rise in costs green because it went up. */
export const DontRiseIsAlwaysGood: Story = { name: "Don't: show every rise as good", args: { label: 'Costs', value: '€12,900', change: { amount: '8%', direction: 'up' }, trend: undefined } };
