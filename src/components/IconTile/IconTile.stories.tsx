import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconTile } from './IconTile';
import * as icons from '../../material/builtin';
import { Card } from '../Card/Card';
import { Text } from '../Text/Text';

const meta = {
  title: 'Components/Content/IconTile',
  component: IconTile,
  args: { icon: icons.CloudDone, tone: 'primary', size: 'md' },
  argTypes: {
    icon: { control: false },
    tone: { control: 'select', options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    shape: { control: 'inline-radio', options: ['square', 'circle'] },
  },
} satisfies Meta<typeof IconTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: (args) => <div className="flex gap-3">
    <IconTile {...args} tone="neutral" icon={icons.Description} />
    <IconTile {...args} tone="primary" icon={icons.CloudDone} />
    <IconTile {...args} tone="success" icon={icons.CheckCircle} />
    <IconTile {...args} tone="warning" icon={icons.Warning} />
    <IconTile {...args} tone="danger" icon={icons.Error} />
    <IconTile {...args} tone="info" icon={icons.Info} />
  </div>,
};

export const Sizes: Story = {
  render: (args) => <div className="flex items-end gap-3">
    {(['sm', 'md', 'lg', 'xl'] as const).map((s) => <IconTile key={s} {...args} size={s} />)}
    {(['sm', 'md', 'lg', 'xl'] as const).map((s) => <IconTile key={'c' + s} {...args} size={s} shape="circle" />)}
  </div>,
};

// The usual place: at the start of a card's header or a settings row, beside the title that says what it is.
export const InACard: Story = {
  name: 'In a card',
  render: (args) => <div className="flex flex-col gap-3" style={{ maxWidth: 420 }}>
    {[
      { icon: icons.CloudDone, tone: 'primary' as const, title: 'Backups', text: 'Every night at 02:00, kept for 30 days.' },
      { icon: icons.Schedule, tone: 'warning' as const, title: 'Trial ends in 3 days', text: 'Add a payment method to keep your projects.' },
      { icon: icons.Person, tone: 'neutral' as const, title: 'Members', text: '12 people in Kartini’s workspace.' },
    ].map((r) => (
      <Card key={r.title}>
        <div className="flex items-start gap-3">
          <IconTile {...args} icon={r.icon} tone={r.tone} />
          <div><Text as="p" weight="semibold">{r.title}</Text><Text as="p" tone="muted" size="sm">{r.text}</Text></div>
        </div>
      </Card>
    ))}
  </div>,
};
// Stress: a long unbroken title and text in a narrow card. The tile keeps its size and doesn't shrink as the text wraps.
export const LongText: Story = {
  render: (args) => (
    <Card style={{ maxWidth: 280 }}>
      <div className="flex items-start gap-3">
        <IconTile {...args} icon={icons.Schedule} tone="warning" size="lg" />
        <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Text as="p" weight="semibold">Donaudampfschifffahrtsgesellschaftskapitänskajüte renewal</Text>
          <Text as="p" tone="muted" size="sm">Your subscription for Kartini’s workspace, with 48 members and 312 projects, ends in 3 days unless you add a payment method.</Text>
        </div>
      </div>
    </Card>
  ),
};
