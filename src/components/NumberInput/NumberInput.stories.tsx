import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberInput } from './NumberInput';
import { Field } from '../Field/Field';

const meta = {
  title: 'Components/Forms/NumberInput',
  component: NumberInput,
  args: { 'aria-label': 'Quantity', defaultValue: 1, min: 0, max: 99, step: 1, size: 'md', steppers: true, disabled: false },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-3xs)' }}><Story /></div>],
} satisfies Meta<typeof NumberInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Decimals: Story = { args: { 'aria-label': 'Price', defaultValue: 9.5, step: 0.25, max: undefined, leftIcon: 'attach_money' } };
export const Controlled: Story = {
  render: function Render() {
    const [guests, setGuests] = React.useState<number | null>(2);
    return <Field label="Guests" hint={guests == null ? 'Enter a number' : `${guests} ${guests === 1 ? 'guest' : 'guests'}`}>
      <NumberInput value={guests} onValueChange={setGuests} min={1} max={8} />
    </Field>;
  },
};
