import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Combobox } from './Combobox';
import { Field } from '../Field/Field';

const COUNTRIES = ['Argentina', 'Australia', 'Brazil', 'Canada', 'Côte d’Ivoire', 'Denmark', 'Egypt', 'France', 'Germany', 'India', 'Japan', 'Kenya', 'Mexico', 'Norway', 'Peru'];
const PEOPLE = [
  { value: 'ada', label: 'Ada Lovelace', description: 'ada@example.com' },
  { value: 'grace', label: 'Grace Hopper', description: 'grace@example.com' },
  { value: 'linus', label: 'Linus Torvalds', description: 'linus@example.com', disabled: true },
  { value: 'margaret', label: 'Margaret Hamilton', description: 'margaret@example.com' },
];
const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  args: { 'aria-label': 'Country', placeholder: 'Pick a country', options: COUNTRIES, size: 'md', clearable: false, disabled: false },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-xs)', minHeight: 'var(--spacing-80)' }}><Story /></div>],
} satisfies Meta<typeof Combobox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const WithDescriptions: Story = {
  render: function Render() {
    const [owner, setOwner] = React.useState<string | null>('grace');
    return <Field label="Owner"><Combobox options={PEOPLE} value={owner} onValueChange={setOwner} clearable leftIcon="person" /></Field>;
  },
};
export const FromAServer: Story = {
  render: function Render() {
    const [q, setQ] = React.useState('');
    const [results, setResults] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => {
      if (!q) { setResults([]); return; }
      setLoading(true);
      const id = setTimeout(() => { setResults(COUNTRIES.filter((c) => c.toLowerCase().startsWith(q.toLowerCase()))); setLoading(false); }, 400);
      return () => clearTimeout(id);
    }, [q]);
    return <Field label="Country"><Combobox options={results} filter={false} loading={loading} onInputChange={setQ} placeholder="Start typing" emptyText={q ? 'No countries found' : 'Type to search'} /></Field>;
  },
};
