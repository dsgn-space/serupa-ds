import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
  args: { shape: 'text', lines: 3, size: 'md', tone: 'neutral', delay: 0 },
  argTypes: {
    shape: { control: 'inline-radio', options: ['text', 'circle', 'rect'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['neutral', 'inverse'] },
  },
  render: (args) => <div style={{ maxWidth: 360 }}><Skeleton {...args} /></div>,
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** A profile loading: an avatar beside its name, then a paragraph and a picture. */
export const Profile: Story = {
  render: () => <div className="flex items-start gap-4" style={{ maxWidth: 420 }}>
    <Skeleton shape="circle" size="lg" delay={0} label="" />
    <div className="flex flex-col gap-3 grow">
      <Skeleton lines={3} delay={0} label="Loading profile" />
      <Skeleton shape="rect" delay={0} label="" />
    </div>
  </div>,
};

export const Shapes: Story = {
  render: () => <div className="flex flex-col gap-4" style={{ maxWidth: 360 }}>
    {(['sm', 'md', 'lg'] as const).map((s) => <div key={s} className="flex items-center gap-3"><Skeleton shape="circle" size={s} delay={0} label="" /><Skeleton size={s} lines={2} delay={0} label="" /></div>)}
    <Skeleton shape="rect" className="aspect-video h-auto" delay={0} label="" />
  </div>,
};

export const Inverse: Story = {
  render: () => <div className="p-4 rounded-md" style={{ background: 'var(--surface-inverse)', maxWidth: 360 }}><Skeleton tone="inverse" lines={2} delay={0} label="" /></div>,
};

// The stress story (G14): many lines in a narrow column.
export const Overflow: Story = { args: { lines: 20 }, render: (args) => <div style={{ width: 120 }}><Skeleton {...args} /></div> };
