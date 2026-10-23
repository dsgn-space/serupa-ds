import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';
import { Field } from '../Field/Field';

const meta = {
  title: 'Components/Forms/Slider',
  component: Slider,
  args: { 'aria-label': 'Volume', defaultValue: 50, min: 0, max: 100, step: 1, size: 'md', disabled: false },
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
export const Small: Story = { args: { size: 'sm', defaultValue: 30 } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 70 } };
