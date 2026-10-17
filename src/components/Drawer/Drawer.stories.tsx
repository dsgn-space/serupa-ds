import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer, type DrawerProps } from './Drawer';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Field } from '../Field/Field';
import { Checkbox } from '../Checkbox/Checkbox';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  args: { open: false, title: 'Filters', description: 'Narrow the list of projects.', side: 'right', size: 'md' },
  argTypes: { side: { control: 'inline-radio', options: ['right', 'left', 'top', 'bottom'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  render: function Render(args: DrawerProps) {
    const [open, setOpen] = React.useState(false);
    return <>
      <Button onClick={() => setOpen(true)}>Open filters</Button>
      <Drawer {...args} open={open} onOpenChange={setOpen}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Reset</Button><Button onClick={() => setOpen(false)}>Apply</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <Field label="Name"><Input placeholder="Search projects" /></Field>
          <Checkbox>Only mine</Checkbox>
          <Checkbox>Include archived</Checkbox>
        </div>
      </Drawer>
    </>;
  },
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Left: Story = { args: { side: 'left', size: 'sm', title: 'Menu', description: undefined } };
export const Bottom: Story = { args: { side: 'bottom', title: 'Share', description: 'Anyone with the link can view.' } };
