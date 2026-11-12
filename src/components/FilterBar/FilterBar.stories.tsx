import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '../Select/Select';
import { FilterBar, type FilterField, type FilterValues } from './FilterBar';

const fields: FilterField[] = [
  { id: 'status', label: 'Status', type: 'select', multiple: true, options: [{ value: 'open', label: 'Open' }, { value: 'pending', label: 'Pending' }, { value: 'closed', label: 'Closed' }] },
  { id: 'owner', label: 'Owner', type: 'select', options: ['Ana', 'Budi', 'Citra', 'Dewi'] },
  { id: 'due', label: 'Due', type: 'date-range' },
  { id: 'archived', label: 'Archived', type: 'boolean' },
  { id: 'q', label: 'Title', type: 'text', placeholder: 'Words in the title' },
];

const meta = {
  title: 'Components/Forms/FilterBar',
  component: FilterBar,
  args: { fields, defaultValue: { status: ['open', 'pending'], due: { start: '2026-11-02', end: '2026-11-08' } }, resultsCount: 24 },
} satisfies Meta<typeof FilterBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = { name: 'No filters yet', args: { defaultValue: {}, resultsCount: 132 } };

export const Every: Story = {
  name: 'Every kind of filter',
  args: { defaultValue: { status: ['closed'], owner: 'Citra', due: { start: '2026-11-02', end: null }, archived: true, q: 'login' }, resultsCount: 1 },
};

export const WithActions: Story = {
  name: 'With a sort',
  args: { actions: <Select aria-label="Sort" size="sm" options={['Newest', 'Oldest', 'Due date']} style={{ width: 140 }} /> },
};

function Live() {
  const [value, setValue] = React.useState<FilterValues>({ status: ['open'] });
  const rows = 132 - Object.keys(value).length * 37;
  return <div className="flex flex-col gap-2"><FilterBar fields={fields} value={value} onValueChange={setValue} resultsCount={Math.max(0, rows)} /><code>{JSON.stringify(value)}</code></div>;
}
export const Controlled: Story = { render: () => <Live /> };

// The stress story (G14): long words, long labels, more chips than fit; the visual baselines show how it copes.
export const LongText: Story = {
  args: {
    fields: [...fields, { id: 'long', label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung', type: 'select', multiple: true, options: ['A label long enough to wrap twice in a narrow column', 'Another one'] }],
    defaultValue: { long: ['A label long enough to wrap twice in a narrow column', 'Another one'], status: ['open', 'pending', 'closed'], owner: 'Dewi', archived: true },
    resultsCount: 12345,
  },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: \`resultsCount\`, so people see what their filters did. */
export const DoShowCount: Story = { name: 'Do: show the results count' };
/** Don't: no count, so people can't tell whether a filter narrowed anything. */
export const DontHideCount: Story = { name: "Don't: leave out the count", args: { resultsCount: undefined } };
