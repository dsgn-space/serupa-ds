import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fab } from './Fab';

const meta = {
  title: 'Components/Actions/Fab',
  component: Fab,
  args: { icon: 'add', label: 'New project', position: 'static' },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    position: { control: 'inline-radio', options: ['static', 'bottom-end', 'bottom-start', 'top-end', 'top-start'] },
  },
  parameters: { docs: { description: { component: 'The examples use position="static" so they stay in the page; a real FAB is fixed to a corner (bottom-end by default).' } } },
} satisfies Meta<typeof Fab>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Kinds: Story = {
  render: () => <div className="flex gap-4 items-center">
    <Fab icon="add" label="New project" position="static" />
    <Fab icon="add" label="Add" size="sm" position="static" />
    <Fab icon="edit" label="Compose" extended position="static" />
  </div>,
};
