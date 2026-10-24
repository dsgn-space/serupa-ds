import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorPicker } from './ColorPicker';
import { Field } from '../Field/Field';

const SWATCHES = [
  { value: '#1d4ed8', label: 'Blue' }, { value: '#7c3aed', label: 'Violet' }, { value: '#047857', label: 'Emerald' },
  { value: '#b91c1c', label: 'Red' }, { value: '#b45309', label: 'Amber' }, { value: '#fde047', label: 'Yellow' },
  { value: '#18181b', label: 'Black' }, { value: '#ffffff', label: 'White' },
];
const meta = {
  title: 'Components/Forms/ColorPicker',
  component: ColorPicker,
  args: { 'aria-label': 'Label color', swatches: SWATCHES, defaultValue: '#1d4ed8' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const ContrastCheck: Story = {
  name: 'Contrast check',
  render: function Render() {
    const [color, setColor] = React.useState<string>('#fde047');
    return <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
      <Field label="Text color" hint="Checked against the white card it goes on">
        <ColorPicker swatches={SWATCHES} value={color} onValueChange={setColor} contrastWith="#ffffff" />
      </Field>
      <p style={{ margin: 0, padding: 'var(--spacing-3)', background: '#ffffff', color, border: '1px solid var(--border)', borderRadius: 'var(--rounded-md)' }}>The quick brown fox</p>
    </div>;
  },
};
export const SwatchesOnly: Story = { name: 'Swatches only', args: { custom: false, size: 'sm' } };
