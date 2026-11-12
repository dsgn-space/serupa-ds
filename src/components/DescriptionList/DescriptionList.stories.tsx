import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '../Alert';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Loader } from '../Loader';
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

// Loading and failed: the terms stay, each detail is a skeleton line of the text's size, and a failure offers Retry.
function States(args: React.ComponentProps<typeof DescriptionList>) {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'failed'>('loading');
  const terms = ['Name', 'Owner', 'Status', 'Created'];
  return (
    <div style={{ maxWidth: 560, display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['loading', 'loaded', 'failed'] as const).map((s) => <Button key={s} size="sm" variant={s === state ? 'primary' : 'secondary'} aria-pressed={s === state} onClick={() => setState(s)}>{s[0].toUpperCase() + s.slice(1)}</Button>)}
      </div>
      {state === 'failed' ? <Alert tone="danger" actions={<Button size="sm" onClick={() => setState('loading')}>Retry</Button>}>The project didn't load. Check your connection and try again.</Alert>
        : state === 'loaded' ? <Record {...args} />
        : <DescriptionList {...args} aria-busy>
            {terms.map((t, i) => <DescriptionItem key={t} term={t}><Loader variant="skeleton" size="lg" label={i === 0 ? 'Loading project' : ''} /></DescriptionItem>)}
          </DescriptionList>}
    </div>
  );
}
export const LoadingAndErrors: Story = { name: 'Loading and failed', render: (args) => <States {...args} /> };

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
const Bill = ({ all }: { all?: boolean }) => (
  <Card style={{ maxWidth: 320 }}>
    <DescriptionList layout="split" style={{ fontSize: 'var(--text-sm)' }}>
      <DescriptionItem term="Subtotal" emphasis={all}>Rp 240.000</DescriptionItem>
      <DescriptionItem term="Delivery" emphasis={all}>Free</DescriptionItem>
      <DescriptionItem term="Total" emphasis>Rp 240.000</DescriptionItem>
    </DescriptionList>
  </Card>
);
/** Do: emphasis on the one item people look for, the total. */
export const DoEmphasizeOne: Story = { name: 'Do: emphasize the total only', render: () => <Bill /> };
/** Don't: every item emphasized, so nothing stands out. */
export const DontEmphasizeAll: Story = { name: "Don't: emphasize every item", render: () => <Bill all /> };
