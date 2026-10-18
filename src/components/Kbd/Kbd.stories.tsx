import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd';

const meta = {
  title: 'Components/Content/Kbd',
  component: Kbd,
  args: { keys: ['mod', 'K'], size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Single: Story = { args: { keys: undefined, children: 'Esc' } };
export const InText: Story = { render: () => <p style={{ margin: 0 }}>Press <Kbd>/</Kbd> to search, or <Kbd keys={['mod', 'shift', 'P']} size="sm" /> for commands.</p> };
export const NamedKeys: Story = {
  render: () => <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
    {['mod', 'ctrl', 'alt', 'shift', 'enter', 'backspace', 'tab', 'esc', 'space', 'up', 'down', 'left', 'right'].map((k) => <Kbd key={k} keys={[k]} />)}
  </div>,
};
