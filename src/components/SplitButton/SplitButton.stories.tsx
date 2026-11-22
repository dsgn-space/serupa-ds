import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuItem, MenuSeparator } from '../Menu/Menu';
import { SplitButton } from './SplitButton';

const items = <>
  <MenuItem icon="schedule">Schedule</MenuItem>
  <MenuItem icon="draft">Save as draft</MenuItem>
  <MenuSeparator />
  <MenuItem icon="content_copy">Duplicate</MenuItem>
</>;

const meta = {
  title: 'Components/Actions/SplitButton',
  component: SplitButton,
  args: { children: 'Publish', menuLabel: 'More publish options', menu: items, variant: 'primary', size: 'md' },
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'secondary', 'outline'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }, menu: { control: false } },
} satisfies Meta<typeof SplitButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** The three variants, each half in the same one. */
export const Default: Story = {
  render: (args) => <div className="flex flex-wrap gap-4">
    <SplitButton {...args} />
    <SplitButton {...args} variant="secondary" menuLabel="More save options">Save</SplitButton>
    <SplitButton {...args} variant="outline" menuLabel="More share options">Share</SplitButton>
  </div>,
};
export const Sizes: Story = {
  render: (args) => <div className="flex flex-wrap items-center gap-4">
    <SplitButton {...args} size="sm" menuLabel="More save options">Save</SplitButton>
    <SplitButton {...args} />
    <SplitButton {...args} size="lg" menuLabel="More share options">Share</SplitButton>
  </div>,
};
/** The menu open, under the arrow. */
export const Open: Story = { args: { defaultOpen: true }, decorators: [(Story) => <div style={{ minHeight: 200 }}><Story /></div>] };
export const States: Story = {
  render: (args) => <div className="flex flex-wrap gap-4">
    <SplitButton {...args} loading>Publishing</SplitButton>
    <SplitButton {...args} disabled />
    <SplitButton {...args} destructive menuLabel="More delete options" menu={<MenuItem>Delete for everyone</MenuItem>}>Delete</SplitButton>
  </div>,
};
// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = { args: { children: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a label long enough to wrap twice in a narrow column' }, decorators: [(Story) => <div style={{ maxWidth: 288 }}><Story /></div>] };
/** Do: ways of doing the main action in the menu. */
export const DoVariations: Story = {
  name: 'Do: other ways to publish',
  args: { defaultOpen: true, menu: <><MenuItem icon="schedule">Schedule</MenuItem><MenuItem icon="draft">Save as draft</MenuItem></> },
  decorators: [(Story) => <div style={{ minHeight: 160 }}><Story /></div>],
};
/** Don't: unrelated actions in the menu, which nobody looks for behind Publish. */
export const DontUnrelated: Story = { tags: ['!visual'],
  name: "Don't: unrelated actions",
  args: { defaultOpen: true, menu: <><MenuItem icon="edit">Rename</MenuItem><MenuItem icon="share">Share</MenuItem><MenuItem icon="delete">Delete</MenuItem></> },
  decorators: [(Story) => <div style={{ minHeight: 190 }}><Story /></div>],
};
