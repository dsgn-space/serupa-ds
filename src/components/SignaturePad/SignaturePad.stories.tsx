import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignaturePad, type SignatureValue } from './SignaturePad';
import { Field } from '../Field/Field';

const meta = {
  title: 'Components/Forms/SignaturePad',
  component: SignaturePad,
  args: { 'aria-label': 'Signature' },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
} satisfies Meta<typeof SignaturePad>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** In a Field: its label names the group, and its hint and error describe it. */
export const InField: Story = {
  render: () => (
    <Field label="Sign to accept the terms" hint="Draw or type your name." error="Please sign before you continue." required>
      <SignaturePad name="signature" />
    </Field>
  ),
};

/** Starting on Type: the typed full name is the signature. */
export const Typed: Story = { args: { defaultMethod: 'type' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: { method: 'type', name: 'Dewi Lestari', svg: '' } } };

export const Disabled: Story = { args: { disabled: true } };

function WithValueDemo() {
  const [value, setValue] = React.useState<SignatureValue | null>(null);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SignaturePad aria-label="Courier signature" onValueChange={(v) => setValue(v)} />
      <p style={{ margin: 0 }}>{value ? (value.method === 'type' ? 'Typed: ' + value.name : 'Drawn, ' + value.svg.length + ' characters of SVG') : 'Not signed yet'}</p>
    </div>
  );
}
/** onValueChange gives the method, the SVG and the typed name; signatureToPng makes a PNG of the SVG. */
export const WithValue: Story = { render: () => <WithValueDemo /> };

// The stress story (G14): a long name in the typing field, and a narrow column.
export const LongText: Story = {
  args: { defaultMethod: 'type', 'aria-label': 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung signature' },
  decorators: [(Story) => <div style={{ maxWidth: 280 }}><Story /></div>],
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: a Field label that says what signing means. */
export const DoSayWhatItMeans: Story = { name: 'Do: say what signing means', render: () => <Field label="Sign to accept the terms"><SignaturePad /></Field> };
/** Don't: a bare pad, so people don't know what they're agreeing to. */
export const DontBarePad: Story = { name: "Don't: show a bare pad" };
