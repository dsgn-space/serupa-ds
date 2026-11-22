import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FabMenu, type FabMenuAction } from './FabMenu';

const ACTIONS: FabMenuAction[] = [
  { label: 'New document', icon: 'description', onSelect: () => {} },
  { label: 'New folder', icon: 'create_new_folder', onSelect: () => {} },
  { label: 'Upload a file', icon: 'upload', onSelect: () => {} },
];

const meta = {
  title: 'Components/Actions/FabMenu',
  component: FabMenu,
  args: { icon: 'add', label: 'Create', placement: 'static', actions: ACTIONS, onOpenChange: () => {} },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    placement: { control: 'inline-radio', options: ['static', 'bottom-end', 'bottom-start', 'top-end', 'top-start'] },
  },
  parameters: { docs: { description: { component: 'The examples use placement="static" so they stay in the page, with room above for the menu; a real FabMenu is fixed to a corner (bottom-end by default), and its menu opens toward the middle of the screen.' } } },
  decorators: [(Story) => <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', minHeight: 240, padding: 16 }}><Story /></div>],
} satisfies Meta<typeof FabMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Closed: the Fab alone, its name in a Tooltip on hover and keyboard focus. */
export const Default: Story = {};
/** Open: the actions above it, each with its words, lined up with its end. */
export const Open: Story = { args: { open: true } };
/** Extended: the Fab shows its label too. */
export const Extended: Story = { args: { extended: true, open: true } };
/** Sizes: md (56px) by default, sm (40px) where a full Fab would cover too much of a small screen. */
export const Sizes: Story = {
  render: (args) => <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
    {(['md', 'sm'] as const).map((z) => <FabMenu key={z} {...args} size={z} label={'Create, ' + z} />)}
  </div>,
};
/** Loading: the Fab shows its spinner and can't open until it's done, as a Fab does. */
export const Loading: Story = { args: { loading: true } };
/** With an action that can't be picked now, and one that deletes. */
export const States: Story = {
  args: { open: true, actions: [...ACTIONS.slice(0, 2), { label: 'Paste', icon: 'content_paste', onSelect: () => {}, disabled: true }, { label: 'Empty the trash', icon: 'delete', onSelect: () => {}, destructive: true }] },
};
// The stress story (G14): long words and long labels; the visual baselines show how it copes.
export const LongText: Story = {
  args: { open: true, actions: [{ label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung', icon: 'description', onSelect: () => {} }, { label: 'A label long enough to wrap twice in a narrow column of a phone screen', icon: 'upload', onSelect: () => {} }, ...ACTIONS.slice(1)] },
};
