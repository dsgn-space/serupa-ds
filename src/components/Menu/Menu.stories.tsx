import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menu, MenuGroup, MenuItem, MenuSeparator } from './Menu';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';

const meta = {
  title: 'Components/Menu',
  component: Menu,
  args: { placement: 'bottom-start', open: true, trigger: <Button variant="secondary" rightIcon="expand_more">Actions</Button>, children: null },
  argTypes: { placement: { control: 'select', options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] } },
  decorators: [(Story) => <div style={{ minHeight: 300 }}><Story /></div>],
  render: (args) => (
    <Menu {...args}>
      <MenuItem icon="edit" shortcut="⌘E">Edit</MenuItem>
      <MenuItem icon="content_copy">Duplicate</MenuItem>
      <MenuItem icon="archive" disabled>Archive</MenuItem>
      <MenuSeparator />
      <MenuGroup label="Danger zone">
        <MenuItem icon="delete" destructive>Delete</MenuItem>
      </MenuGroup>
    </Menu>
  ),
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const IconTrigger: Story = {
  name: 'From an icon button',
  args: { open: undefined, placement: 'bottom-end', trigger: <IconButton icon="more_vert" label="Row actions" /> },
  decorators: [(Story) => <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 400 }}><Story /></div>],
};
