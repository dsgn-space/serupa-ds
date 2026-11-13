import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../Field/Field';
import { CascadeSelect, type CascadeOption } from './CascadeSelect';

/** A few of Indonesia's provinces, regencies and districts, for the stories and tests. */
const regions: CascadeOption[] = [
  { value: 'jabar', label: 'Jawa Barat', children: [
    { value: 'bandung', label: 'Kota Bandung', children: [
      { value: 'coblong', label: 'Coblong' }, { value: 'sukajadi', label: 'Sukajadi' }, { value: 'cicendo', label: 'Cicendo' }, { value: 'lengkong', label: 'Lengkong', disabled: true }] },
    { value: 'bogor', label: 'Kabupaten Bogor', children: [{ value: 'cibinong', label: 'Cibinong' }, { value: 'citeureup', label: 'Citeureup' }] },
    { value: 'bekasi', label: 'Kota Bekasi', children: [{ value: 'bekasi-barat', label: 'Bekasi Barat' }, { value: 'bekasi-timur', label: 'Bekasi Timur' }] }] },
  { value: 'jateng', label: 'Jawa Tengah', children: [
    { value: 'semarang', label: 'Kota Semarang', children: [{ value: 'tembalang', label: 'Tembalang' }, { value: 'banyumanik', label: 'Banyumanik' }] },
    { value: 'solo', label: 'Kota Surakarta', children: [{ value: 'laweyan', label: 'Laweyan' }] }] },
  { value: 'jatim', label: 'Jawa Timur', children: [
    { value: 'surabaya', label: 'Kota Surabaya', children: [{ value: 'gubeng', label: 'Gubeng' }, { value: 'wonokromo', label: 'Wonokromo' }] }] },
  { value: 'bali', label: 'Bali', children: [{ value: 'denpasar', label: 'Kota Denpasar', children: [{ value: 'denpasar-selatan', label: 'Denpasar Selatan' }] }] },
  { value: 'papua', label: 'Papua', disabled: true, children: [] },
];

const levels = ['Provinsi', 'Kabupaten/Kota', 'Kecamatan'];
const meta = {
  title: 'Components/Forms/CascadeSelect',
  component: CascadeSelect,
  args: { 'aria-label': 'Wilayah', options: regions, levels, placeholder: 'Pilih wilayah', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ maxWidth: 360, minHeight: 360 }}><Story /></div>],
} satisfies Meta<typeof CascadeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Chosen: Story = { name: 'With a path chosen', args: { defaultValue: ['jabar', 'bandung', 'coblong'] } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: ['jabar', 'bandung', 'coblong'] } };

/** Open, three columns deep, the chosen district checked. */
export const Open: Story = { args: { defaultValue: ['jabar', 'bandung', 'coblong'], defaultOpen: true } };

export const InAField: Story = {
  name: 'In a Field',
  args: { 'aria-label': undefined },
  render: (args) => <Field label="Alamat" hint="Provinsi, kabupaten atau kota, lalu kecamatan." error="Pilih kecamatan." required><CascadeSelect {...args} /></Field>,
};

export const ParentsToo: Story = { name: 'Choosing a parent', args: { selectParents: true, defaultValue: ['jateng'] } };

function fakeLoad(path: CascadeOption[]): Promise<CascadeOption[]> {
  const last = path[path.length - 1]!;
  return new Promise((done) => setTimeout(() => done(path.length < 3
    ? [1, 2, 3].map((n) => ({ value: last.value + '-' + n, label: last.label + ' ' + n, isLeaf: path.length === 2 }))
    : []), 600));
}
/** Children load when a choice is opened (loadOptions), with "Loading…" meanwhile. */
export const Loading: Story = {
  name: 'Loading children',
  args: { options: [{ value: 'a', label: 'Wilayah A' }, { value: 'b', label: 'Wilayah B' }], loadOptions: fakeLoad },
};

export const States: Story = {
  render: () => <div className="flex flex-col gap-3">
    <CascadeSelect aria-label="Size small" size="sm" options={regions} defaultValue={['bali', 'denpasar', 'denpasar-selatan']} />
    <CascadeSelect aria-label="Size large" size="lg" options={regions} placeholder="Large" />
    <CascadeSelect aria-label="Invalid" invalid options={regions} placeholder="Required" />
    <CascadeSelect aria-label="Disabled" disabled options={regions} defaultValue={['jatim', 'surabaya', 'gubeng']} />
  </div>,
};

function Controlled() {
  const [v, setV] = React.useState<string[]>(['jatim', 'surabaya', 'gubeng']);
  return <div className="flex flex-col gap-2"><CascadeSelect aria-label="Wilayah" options={regions} levels={levels} value={v} onValueChange={setV} /><output>{v.join(' / ') || '—'}</output></div>;
}
export const ControlledValue: Story = { name: 'Controlled', render: () => <Controlled /> };

// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
const long: CascadeOption[] = [
  { value: 'x', label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung', children: Array.from({ length: 14 }, (_, i) => ({ value: 'x' + i, label: 'A label long enough to wrap twice in a narrow column, number ' + (i + 1) })) },
  ...Array.from({ length: 12 }, (_, i) => ({ value: 'y' + i, label: 'Provinsi ' + (i + 1) })),
];
export const LongText: Story = {
  args: { options: long, defaultValue: ['x', 'x3'], defaultOpen: true },
  decorators: [(Story) => <div style={{ width: 220 }}><Story /></div>],
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: \`levels\` that name each column, so people learn the order. */
export const DoNameLevels: Story = { name: 'Do: name each level', args: { defaultValue: ['jabar', 'bandung', 'coblong'], defaultOpen: true } };
/** Don't: the same word on every column, which leaves people guessing what each one holds. */
export const DontGenericLevels: Story = { name: "Don't: give every level the same name", args: { defaultValue: ['jabar', 'bandung', 'coblong'], defaultOpen: true, levels: ['Pilih', 'Pilih', 'Pilih'] } };
