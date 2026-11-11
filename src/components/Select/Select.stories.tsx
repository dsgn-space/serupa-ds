import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';
import { Field } from '../Field/Field';
import { Radio, RadioGroup } from '../Radio/Radio';
import { iconArg } from '../../../.storybook/icon-arg';

const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  args: { 'aria-label': 'Country', placeholder: 'Choose a country', options: ['Indonesia', 'Malaysia', 'Singapore', 'Thailand'], size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }, leftIcon: iconArg },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Groups: Story = {
  args: {
    placeholder: 'Choose a plan',
    options: [{ label: 'Monthly', options: [{ value: 'm-basic', label: 'Basic' }, { value: 'm-pro', label: 'Pro' }] },
      { label: 'Yearly', options: [{ value: 'y-basic', label: 'Basic' }, { value: 'y-pro', label: 'Pro', disabled: true }] }],
  },
};

export const WithIcon: Story = { name: 'With an icon', args: { leftIcon: 'public' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'Indonesia' } };

export const States: Story = {
  render: () => <div className="flex flex-col gap-3">
    <Select aria-label="Size small" size="sm" options={['Small']} />
    <Select aria-label="Size large" size="lg" options={['Large']} />
    <Select aria-label="Invalid" invalid placeholder="Required" options={['One']} />
    <Select aria-label="Disabled" disabled options={['Disabled']} />
  </div>,
};

export const LongOptions: Story = {
  args: { options: ['The Democratic Republic of São Tomé and Príncipe', 'Saint Vincent and the Grenadines', 'Donaudampfschifffahrtsgesellschaftskapitänskajüte'], defaultValue: 'The Democratic Republic of São Tomé and Príncipe' },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
const COUNTRIES = ['Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Vietnam'];
/** Do: a label above the field, which stays in view once a value is chosen. */
export const DoLabelAbove: Story = {
  name: 'Do: a label above',
  render: () => <Field label="Country"><Select placeholder="Choose a country" options={COUNTRIES} /></Field>,
};
/** Don't: the placeholder as the only label, gone once a value is chosen. */
export const DontPlaceholderLabel: Story = {
  name: "Don't: the placeholder as label",
  render: () => <Select aria-label="Country" placeholder="Country" options={COUNTRIES} />,
};
/** Do: three choices as radios, all in view. */
export const DoRadiosForFew: Story = {
  name: 'Do: radios for a few',
  render: () => <Field group label="Delivery"><RadioGroup defaultValue="standard"><Radio value="standard">Standard</Radio><Radio value="express">Express</Radio><Radio value="pickup">Pick up</Radio></RadioGroup></Field>,
};
/** Don't: three choices hidden in a Select, one more click to see them. */
export const DontSelectForFew: Story = {
  name: "Don't: a Select for a few",
  render: () => <Field label="Delivery"><Select defaultValue="Standard" options={['Standard', 'Express', 'Pick up']} /></Field>,
};
