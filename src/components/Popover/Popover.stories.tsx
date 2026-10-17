import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Field } from '../Field/Field';
import { Input } from '../Input/Input';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    title: 'Share',
    trigger: <Button variant="outline" leftIcon="share">Share</Button>,
    children: (close: () => void) => (
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); close(); }}>
        <Field label="Email"><Input type="email" placeholder="name@example.com" /></Field>
        <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={close}>Cancel</Button><Button size="sm" type="submit">Invite</Button></div>
      </form>
    ),
  },
  argTypes: { placement: { control: 'select', options: ['bottom', 'bottom-start', 'bottom-end', 'top', 'right', 'right-start', 'left'] }, trigger: { control: false }, children: { control: false } },
  render: (args) => <div style={{ padding: '24px 120px', minHeight: 260 }}><Popover {...args} /></div>,
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Info: Story = {
  render: () => (
    <div style={{ padding: 24, minHeight: 160 }}>
      <Popover aria-label="About billing" placement="right-start" initialFocus="panel" trigger={<IconButton icon="info" label="About billing" />}>
        You're billed on the 1st of each month. Changes apply from the next bill.
      </Popover>
    </div>
  ),
};
