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

export const LongKeys: Story = {
  render: () => (
    <p style={{ margin: 0, width: 200 }}>Press <Kbd keys={['mod', 'shift', 'alt', 'P']} /> to open every command, or <Kbd>Page Down</Kbd> to move on.</p>
  ),
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: `mod` for a shortcut that follows the platform: ⌘K on a Mac, Ctrl+K elsewhere. */
export const DoMod: Story = {
  name: 'Do: use mod',
  render: () => <p style={{ margin: 0 }}>Press <Kbd keys={['mod', 'K']} /> to search.</p>,
};
/** Don't: Ctrl written in for a shortcut that is ⌘ on a Mac, so Mac users press the wrong keys. */
export const DontHardcodeCtrl: Story = {
  name: "Don't: write Ctrl for everyone",
  render: () => <p style={{ margin: 0 }}>Press <Kbd keys={['ctrl', 'K']} /> to search.</p>,
};
