import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { DescriptionItem, DescriptionList } from './DescriptionList';

const Record = (args: React.ComponentProps<typeof DescriptionList>) => (
  <DescriptionList {...args} style={{ maxWidth: 560 }}>
    <DescriptionItem term="Name">Northwind redesign</DescriptionItem>
    <DescriptionItem term="Owner">Ayu Lestari</DescriptionItem>
    <DescriptionItem term="Status"><Badge tone="success" dot>Active</Badge></DescriptionItem>
    <DescriptionItem term="Created"><time dateTime="2026-03-14">14 March 2026</time></DescriptionItem>
  </DescriptionList>
);

const meta = {
  title: 'Components/Content/DescriptionList',
  component: DescriptionList,
  args: { layout: 'inline', dividers: false },
  argTypes: { layout: { control: 'inline-radio', options: ['inline', 'stacked', 'split'] } },
  render: (args) => <Record {...args} />,
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** The term in a column beside its details; under 480px of list width it stacks. */
export const Default: Story = {};
export const Stacked: Story = { args: { layout: 'stacked' } };
export const Dividers: Story = { args: { dividers: true } };
/** Totals: the amount at the end of each row, the total stronger. */
export const Split: Story = {
  render: () => (
    <Card style={{ maxWidth: 320 }}>
      <DescriptionList layout="split" style={{ fontSize: 'var(--text-sm)' }}>
        <DescriptionItem term="Subtotal">Rp 240.000</DescriptionItem>
        <DescriptionItem term="Delivery">Free</DescriptionItem>
        <DescriptionItem term="Total" emphasis>Rp 240.000</DescriptionItem>
      </DescriptionList>
    </Card>
  ),
};
/** In a narrow container the inline layout stacks. */
export const Narrow: Story = { render: (args) => <div style={{ width: 300 }}><Record {...args} /></div> };
// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = {
  render: (args) => (
    <DescriptionList {...args} style={{ maxWidth: 480 }}>
      <DescriptionItem term="Donaudampfschifffahrtsgesellschaft">Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung</DescriptionItem>
      <DescriptionItem term="A label long enough to wrap twice in a narrow column">https://example.com/a/very/long/path/that/has/no/spaces/at/all/and/keeps/going</DescriptionItem>
      <DescriptionItem term="Empty">—</DescriptionItem>
    </DescriptionList>
  ),
};
// Right to left with Latin text: the layout mirrors the same way, and the picture doesn't depend on which Arabic
// font a machine has (CI's draws Arabic differently from a laptop's).
export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl" style={{ maxWidth: 560 }}>
      <DescriptionList {...args}>
        <DescriptionItem term="Name">Northwind redesign</DescriptionItem>
        <DescriptionItem term="Owner">Ayu Lestari</DescriptionItem>
      </DescriptionList>
      <DescriptionList layout="split" style={{ marginTop: 16 }}>
        <DescriptionItem term="Total">SAR 120</DescriptionItem>
      </DescriptionList>
    </div>
  ),
};
