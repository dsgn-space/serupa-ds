import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransferList } from './TransferList';
import { Field } from '../Field/Field';

const columns = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'role', label: 'Role' },
  { value: 'created', label: 'Created' },
  { value: 'id', label: 'ID', description: 'Always shown', disabled: true },
];

const meta = {
  title: 'Components/Forms/TransferList',
  component: TransferList,
  args: { options: columns, defaultValue: ['name', 'email', 'id'], 'aria-label': 'Columns' },
} satisfies Meta<typeof TransferList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Columns for a table: three shown, the rest available. ID can't be moved. */
export const Default: Story = {};
/** In a Field: its label names the whole, and its hint and error describe it. */
export const InAField: Story = {
  render: (args) => (
    <Field label="Columns" hint="The table shows them in this order." error="Choose at least two columns.">
      <TransferList {...args} aria-label={undefined} defaultValue={['id']} />
    </Field>
  ),
};
/** Nothing chosen yet: Chosen says "None", and Add and Remove say what to do first. */
export const NothingChosen: Story = { args: { defaultValue: [] } };
/** Disabled: both lists and the buttons. */
export const Disabled: Story = { args: { disabled: true } };
// The stress story (G14): long names, a description, and more than fit, so each list scrolls.
export const LongText: Story = {
  args: {
    'aria-label': 'Permissions',
    options: Array.from({ length: 14 }, (_, i) => ({ value: 'p' + i, label: i % 3 ? 'Read and write the billing settings of every workspace ' + i : 'Delete ' + i, description: i % 4 ? undefined : 'Only owners can grant this' })),
    defaultValue: ['p1', 'p2'],
  },
};
