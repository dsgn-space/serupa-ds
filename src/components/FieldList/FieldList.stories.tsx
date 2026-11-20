import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldList } from './FieldList';
import { Field } from '../Field/Field';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';

type Phone = { kind: string; number: string };
const KINDS = [{ value: 'mobile', label: 'Mobile' }, { value: 'work', label: 'Work' }, { value: 'home', label: 'Home' }];
const blank = (): Phone => ({ kind: 'mobile', number: '' });
const phone = (i: number) => 'Phone ' + (i + 1);
// The fields of one phone row: what kind, and the number, named for a plain form submit.
const fields = (row: Phone, s: { name: (f?: string) => string | undefined; update: (next: Phone | ((r: Phone) => Phone)) => void; error: React.ReactNode }) => [
  <Field key="kind" label="Kind"><Select name={s.name('kind')} options={KINDS} value={row.kind} onChange={(e) => s.update((r) => ({ ...r, kind: e.target.value }))} /></Field>,
  <Field key="number" label="Number"><Input name={s.name('number')} type="tel" autoComplete="tel" value={row.number} invalid={!!s.error} onChange={(e) => s.update((r) => ({ ...r, number: e.target.value }))} /></Field>,
];

const meta = {
  title: 'Components/Forms/FieldList',
  component: FieldList,
  args: { label: 'Phone numbers', itemLabel: phone, addLabel: 'Add phone', newItem: blank, name: 'phones', min: 1, max: 4, defaultValue: [{ kind: 'mobile', number: '0812 3456 7890' }, { kind: 'work', number: '021 555 0199' }], children: fields as never },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
} satisfies Meta<typeof FieldList<Phone>>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Two phones: Remove on each, Add at the end. Focus moves to the new row's first field, and adding or removing a row is announced. */
export const Playground: Story = {};

/** One row at min: its Remove is gone, so the list never has fewer rows than it needs. */
export const AtMin: Story = { name: 'At min', args: { defaultValue: [blank()] } };

/** At max: Add stays in the Tab order and says why it does nothing, and the limit shows beside it. */
export const AtMax: Story = { name: 'At max', args: { max: 2 } };

/** Errors: one under the row it belongs to, and one for the whole list. */
export const Errors: Story = { args: { errors: [undefined, 'Enter a number with its area code'], error: 'Add a mobile number we can text' } };

/** With a hint under the legend, and no rows yet (min 0). */
export const Empty: Story = { args: { min: 0, defaultValue: [], hint: 'We call the first one first.' } };

/** reorderable: a handle on each row puts the rows in people's own order. */
export const Reorderable: Story = { args: { reorderable: true, defaultValue: [{ kind: 'mobile', number: '0812 3456 7890' }, { kind: 'work', number: '021 555 0199' }, { kind: 'home', number: '022 420 1188' }] } };

/** disabled: every field, Remove and Add. */
export const Disabled: Story = { args: { disabled: true } };

// The stress story (G14): a long legend and long values, in a narrow column, where the fields wrap.
export const LongText: Story = {
  args: { label: 'Telefonnummern für Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung und alle Rückfragen', defaultValue: [{ kind: 'work', number: '+49 30 1234 5678 9012 3456 7890 1234' }] },
  decorators: [(Story) => <div style={{ maxWidth: 280 }}><Story /></div>],
};
