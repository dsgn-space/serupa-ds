import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'Components/Forms/SearchInput',
  component: SearchInput,
  args: { 'aria-label': 'Search projects', placeholder: 'Search projects', size: 'md', loading: false, disabled: false },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-xs)' }}><Story /></div>],
} satisfies Meta<typeof SearchInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const WithText: Story = { args: { defaultValue: 'Atlas' } };
export const Loading: Story = { args: { defaultValue: 'Atl', loading: true } };
export const Invalid: Story = { args: { defaultValue: 'Atlas!!', invalid: true } };
// Disabled and read-only: the clear button hides, since the text can't change.
export const Disabled: Story = { args: { defaultValue: 'Atlas', disabled: true } };
export const ReadOnly: Story = { name: 'Read-only', args: { defaultValue: 'Atlas', readOnly: true } };
const PROJECTS = ['Atlas', 'Borealis', 'Cascade', 'Delta', 'Ember'];
export const Filtering: Story = {
  render: function Render() {
    const [q, setQ] = React.useState('');
    const shown = PROJECTS.filter((p) => p.toLowerCase().includes(q.toLowerCase()));
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <SearchInput aria-label="Filter projects" placeholder="Filter projects" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul style={{ margin: 0 }}>{shown.map((p) => <li key={p}>{p}</li>)}</ul>
    </div>;
  },
};

export const LongText: Story = {
  render: (args) => (
    <div style={{ width: 200 }}>
      <SearchInput {...args} defaultValue={'Donaudampfschifffahrtsgesellschaftskapitänskajüte'} />
    </div>
  ),
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: the placeholder says what can be searched. */
export const DoSayWhat: Story = { name: 'Do: say what it searches', args: { 'aria-label': 'Search invoices', placeholder: 'Search invoices by number or customer' } };
/** Don't: a bare "Search...", which leaves people guessing what they can find. */
export const DontBareSearch: Story = { name: "Don't: just say search", args: { 'aria-label': 'Search', placeholder: 'Search...' } };
