import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';
import { useLocale } from '../../internal/provider';
import { Field } from '../Field/Field';

const meta = {
  title: 'Components/Forms/Slider',
  component: Slider,
  args: { 'aria-label': 'Volume', defaultValue: 50, min: 0, max: 100, step: 1, size: 'md', disabled: false, invalid: false, readOnly: false },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-sm)' }}><Story /></div>],
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Range: Story = {
  render: function Render() {
    const [price, setPrice] = React.useState<[number, number]>([40, 120]);
    return <Field label={`Price: $${price[0]} to $${price[1]}`} group>
      <Slider aria-label="Price" value={price} onValueChange={setPrice} max={200} step={5} formatValue={(v) => `$${v}`} />
    </Field>;
  },
};
// A price filter: drag for a rough range, or type the exact numbers.
export const WithInputs: Story = {
  render: function Render() {
    const [price, setPrice] = React.useState<[number, number]>([40, 120]);
    return <Field label="Price, in dollars" group>
      <Slider value={price} onValueChange={setPrice} max={200} step={5} formatValue={(v) => `$${v}`} inputs />
    </Field>;
  },
};
export const SingleWithInput: Story = { args: { 'aria-label': 'Volume', defaultValue: 35, inputs: true } };
export const Small: Story = { args: { size: 'sm', defaultValue: 30 } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 70 } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 40 } };
export const Invalid: Story = {
  render: (args) => <Field label="Volume" error="Keep it under 80 for hearing safety"><Slider {...args} defaultValue={90} /></Field>,
};
export const Marks: Story = {
  args: { 'aria-label': 'Temperature', defaultValue: 21, min: 16, max: 28, marks: [{ value: 16, label: '16°' }, { value: 21, label: 'Comfort' }, { value: 28, label: '28°' }], showValue: true, formatValue: (v: number) => `${v}°` },
};
export const EveryStep: Story = { args: { 'aria-label': 'Rating', defaultValue: 3, min: 0, max: 10, marks: true } };

export const LongMarks: Story = {
  args: { marks: [{ value: 0, label: 'Completely silent' }, { value: 50, label: 'Halfway there' }, { value: 100, label: 'As loud as it goes' }] },
  decorators: [(Story) => <div style={{ width: 200, paddingBlockEnd: 32 }}><Story /></div>],
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: `formatValue` for a price, so the marks and screen readers say "$40", not "40". */
export const DoFormatValue: Story = {
  name: 'Do: format the value',
  render: function Render(args) {
    const money = new Intl.NumberFormat(useLocale(), { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    return <Slider {...args} aria-label="Highest price" min={0} max={200} step={5} defaultValue={40} formatValue={(v) => money.format(v)} marks={[0, 100, 200].map((v) => ({ value: v, label: money.format(v) }))} />;
  },
  decorators: [(Story) => <div style={{ width: '100%', maxWidth: 280, paddingBlockEnd: 32 }}><Story /></div>],
};
/** Don't: a bare number for a price, so nobody can tell its unit. */
export const DontBareNumber: Story = {
  name: "Don't: leave out the unit",
  render: function Render(args) {
    const number = new Intl.NumberFormat(useLocale());
    return <Slider {...args} aria-label="Highest price" min={0} max={200} step={5} defaultValue={40} marks={[0, 100, 200].map((v) => ({ value: v, label: number.format(v) }))} />;
  },
  decorators: [(Story) => <div style={{ width: '100%', maxWidth: 280, paddingBlockEnd: 32 }}><Story /></div>],
};
