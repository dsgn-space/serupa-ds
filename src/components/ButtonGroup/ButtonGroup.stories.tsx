import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  args: {
    'aria-label': 'Clipboard',
    children: [<Button key="c" variant="outline" leftIcon="content_copy">Copy</Button>, <Button key="x" variant="outline" leftIcon="content_cut">Cut</Button>, <Button key="p" variant="outline" leftIcon="content_paste">Paste</Button>],
  },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] }, children: { control: false } },
} satisfies Meta<typeof ButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Spaced: Story = { args: { attached: false, 'aria-label': undefined, children: [<Button key="c" variant="outline">Cancel</Button>, <Button key="s">Save</Button>] } };

export const Vertical: Story = {
  args: { orientation: 'vertical', 'aria-label': 'Zoom', children: [<IconButton key="i" variant="outline" icon="add" label="Zoom in" />, <IconButton key="o" variant="outline" icon="remove" label="Zoom out" />] },
};

export const SplitButton: Story = {
  args: { 'aria-label': 'Publish', children: [<Button key="p">Publish</Button>, <IconButton key="m" variant="primary" icon="expand_more" label="More publish options" />] },
};
