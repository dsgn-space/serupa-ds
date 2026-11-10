import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, CheckboxGroup } from './Checkbox';
import { Field } from '../Field/Field';

const meta = {
  title: 'Components/Forms/Checkbox',
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
    <Checkbox readOnly defaultChecked>Read-only and checked</Checkbox>
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

export const Group: Story = {
  name: 'CheckboxGroup',
  render: function GroupDemo() {
    const [teams, setTeams] = React.useState<string[]>(['design']);
    return <Field group label="Teams to notify" hint={`${teams.length} picked`}>
      <CheckboxGroup name="teams" value={teams} onValueChange={setTeams}>
        <Checkbox selectAll>All teams</Checkbox>
        <Checkbox value="design">Design</Checkbox>
        <Checkbox value="engineering">Engineering</Checkbox>
        <Checkbox value="legal" disabled>Legal (always notified)</Checkbox>
      </CheckboxGroup>
    </Field>;
  },
};

export const LongLabel: Story = {
  render: (args) => (
    <div style={{ width: 240 }}>
      <Checkbox {...args} description="We send about one email a month, and you can unsubscribe from any of them with one click.">
        Email me about product updates, security notices and {'Donaudampfschifffahrtsgesellschaft'} news
      </Checkbox>
    </div>
  ),
};

export const GroupHorizontal: Story = {
  name: 'CheckboxGroup in a row',
  render: () => <Field group label="Days">
    <CheckboxGroup name="days" orientation="horizontal" defaultValue={['mon']}>
      <Checkbox value="mon">Monday</Checkbox>
      <Checkbox value="tue">Tuesday</Checkbox>
      <Checkbox value="wed">Wednesday</Checkbox>
    </CheckboxGroup>
  </Field>,
};

/** Cards: each box a bordered card, for a few choices that each need a sentence or a price. */
export const Cards: Story = {
  render: () => <Field group label="Add-ons">
    <CheckboxGroup name="addons" variant="card" orientation="horizontal" defaultValue={['wrap']}>
      <Checkbox value="wrap" description="Rp 15.000">Gift wrap</Checkbox>
      <Checkbox value="card" description="A printed note, free">Greeting card</Checkbox>
      <Checkbox value="insure" description="Not for this shipping method" disabled>Insurance</Checkbox>
    </CheckboxGroup>
  </Field>,
};
export const CardsInvalid: Story = {
  render: () => <Field group label="Interests" error="Choose at least one.">
    <CheckboxGroup name="interests" variant="card">
      <Checkbox value="design" description="Components, tokens and patterns">Design</Checkbox>
      <Checkbox value="code">Engineering</Checkbox>
    </CheckboxGroup>
  </Field>,
};
