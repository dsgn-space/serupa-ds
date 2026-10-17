import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { children: 'Email me about updates', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

const Col = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col gap-3">{children}</div>;

export const Playground: Story = {};
export const WithDescription: Story = { name: 'With a description', args: { description: 'About once a month. Unsubscribe any time.' } };

export const Sizes: Story = {
  render: () => <Col><Checkbox size="sm">Small</Checkbox><Checkbox>Medium</Checkbox><Checkbox size="lg">Large</Checkbox></Col>,
};

export const States: Story = {
  render: () => <Col>
    <Checkbox defaultChecked>Checked</Checkbox>
    <Checkbox indeterminate>Some selected</Checkbox>
    <Checkbox invalid>Accept the terms</Checkbox>
    <Checkbox disabled>Disabled</Checkbox>
    <Checkbox disabled defaultChecked>Disabled and checked</Checkbox>
  </Col>,
};

export const SelectAll: Story = {
  name: 'Select all',
  render: function SelectAllDemo() {
    const [picked, setPicked] = React.useState<string[]>(['Design']);
    const all = ['Design', 'Engineering', 'Marketing'];
    return <Col>
      <Checkbox checked={picked.length === all.length} indeterminate={picked.length > 0 && picked.length < all.length}
        onChange={(e) => setPicked(e.target.checked ? all : [])}>All teams</Checkbox>
      <div className="flex flex-col gap-2 pl-6">{all.map((t) => <Checkbox key={t} checked={picked.includes(t)}
        onChange={(e) => setPicked(e.target.checked ? [...picked, t] : picked.filter((x) => x !== t))}>{t}</Checkbox>)}</div>
    </Col>;
  },
};
