import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { content: 'Download as PDF', placement: 'top', open: true, children: <IconButton icon="download" label="Download" variant="secondary" noTitle /> },
  argTypes: { placement: { control: 'select', options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] } },
  decorators: [(Story) => <div style={{ padding: '56px 120px' }}><Story /></div>],
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const OnHover: Story = {
  name: 'On hover and focus',
  args: { open: undefined },
  render: () => <div className="flex gap-3">
    <Tooltip content="Download as PDF"><IconButton icon="download" label="Download" variant="secondary" noTitle /></Tooltip>
    <Tooltip content="Ctrl + S" placement="bottom"><Button variant="secondary">Save</Button></Tooltip>
    <Tooltip content="Only owners can delete a project" placement="right"><Button variant="outline" destructive aria-disabled="true">Delete</Button></Tooltip>
  </div>,
};
