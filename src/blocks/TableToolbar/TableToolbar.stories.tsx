import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Table, TableBody, TableCell, TableColumnsMenu, TableHead, TableHeaderCell, TableRow, TableSelectCell, type TableColumnOption } from '../../components/Table/Table';
import { FilterBar, type FilterValues } from '../../components/FilterBar/FilterBar';
import { TableToolbar } from './TableToolbar';

/* Table toolbar (BL3): search, filters, a results count and bulk actions above a table, as a block an app copies.
   TableToolbar.mdx says what each part is for. The stories put it on a small page (a skip link, main and an h1) so
   the page rules hold, and filter a real list so the count and Clear filters work. */
const PROJECTS = [
  { name: 'Website redesign', status: 'Active', owner: 'Ana' },
  { name: 'Mobile app', status: 'Active', owner: 'Budi' },
  { name: 'Billing migration', status: 'Paused', owner: 'Ana' },
  { name: 'Help center', status: 'Done', owner: 'Chen' },
  { name: 'Onboarding emails', status: 'Active', owner: 'Chen' },
  { name: 'Data export', status: 'Done', owner: 'Budi' },
  { name: 'Status page', status: 'Paused', owner: 'Dewi' },
  { name: 'Search ranking', status: 'Active', owner: 'Dewi' },
];

function Projects({ initialQuery = '', initialStatus = '', initialPicked = [] as string[] }) {
  const [query, setQuery] = React.useState(initialQuery);
  const [status, setStatus] = React.useState(initialStatus);
  const [owner, setOwner] = React.useState('');
  const [picked, setPicked] = React.useState<string[]>(initialPicked);
  const q = query.trim().toLowerCase();
  const rows = PROJECTS.filter((p) => (!q || p.name.toLowerCase().includes(q)) && (!status || p.status === status) && (!owner || p.owner === owner));
  const all = rows.length > 0 && rows.every((p) => picked.includes(p.name));
  const toggle = (n: string) => setPicked(picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n]);
  return (
    <TableToolbar
      noun="projects"
      query={query}
      onQueryChange={setQuery}
      filters={[
        { label: 'Status', value: status, onChange: setStatus, options: [{ value: '', label: 'All' }, 'Active', 'Paused', 'Done'] },
        { label: 'Owner', value: owner, onChange: setOwner, options: [{ value: '', label: 'Anyone' }, 'Ana', 'Budi', 'Chen', 'Dewi'] },
      ]}
      results={rows.length === PROJECTS.length ? `${rows.length} projects` : `${rows.length} of ${PROJECTS.length} projects`}
      onClearFilters={() => { setQuery(''); setStatus(''); setOwner(''); }}
      selectedCount={picked.length}
      onClearSelection={() => setPicked([])}
      bulkActions={<><Button size="sm" variant="outline">Export</Button><Button size="sm" variant="outline" onClick={() => setPicked([])}>Archive</Button></>}
    >
      <Table caption="Projects" hideCaption>
        <TableHead><TableRow>
          <TableSelectCell header label="Select all projects" checked={all} indeterminate={!all && rows.some((p) => picked.includes(p.name))} onChange={() => setPicked(all ? [] : rows.map((p) => p.name))} />
          <TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Owner</TableHeaderCell>
        </TableRow></TableHead>
        <TableBody>{rows.map((p) => (
          <TableRow key={p.name} selected={picked.includes(p.name)}>
            <TableSelectCell label={'Select ' + p.name} checked={picked.includes(p.name)} onChange={() => toggle(p.name)} />
            <TableCell>{p.name}</TableCell><TableCell>{p.status}</TableCell><TableCell>{p.owner}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </TableToolbar>
  );
}

const meta = {
  title: 'Blocks/Table toolbar',
  component: Projects,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className="min-h-screen bg-surface text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 outline-none"><Heading level={1}>Projects</Heading><Story /></main></div>],
} satisfies Meta<typeof Projects>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Search, two filters and the count. Type or pick a filter: the count is read out, and Clear filters appears. */
export const Default: Story = {};

/** With a search and a filter set: "3 of 8 projects", and Clear filters to undo both. */
export const Filtered: Story = { args: { initialQuery: 'a', initialStatus: 'Active' } };

/** With rows selected: "2 selected", the bulk actions, and Clear selection, between the count and the table. */
export const Selected: Story = { args: { initialPicked: ['Mobile app', 'Help center'] } };

/** A data table's toolbar: the filters as chips (a FilterBar) under the search, and a column picker beside the count. */
export const ChipsAndColumns: Story = {
  name: 'Chips and columns',
  render: () => <DataTable />,
};

function DataTable() {
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<FilterValues>({ status: ['Active', 'Paused'] });
  const [cols, setCols] = React.useState<TableColumnOption[]>([
    { id: 'name', label: 'Name', visible: true, required: true }, { id: 'status', label: 'Status', visible: true }, { id: 'owner', label: 'Owner', visible: true },
  ]);
  const q = query.trim().toLowerCase(), pick = (id: string) => { const v = filters[id]; return Array.isArray(v) ? v : []; };
  const rows = PROJECTS.filter((p) => (!q || p.name.toLowerCase().includes(q)) && (!pick('status').length || pick('status').includes(p.status)) && (!pick('owner').length || pick('owner').includes(p.owner)));
  const show = (id: string) => cols.some((c) => c.id === id && c.visible);
  return (
    <TableToolbar noun="projects" query={query} onQueryChange={setQuery} onClearFilters={() => setQuery('')}
      results={rows.length === PROJECTS.length ? `${rows.length} projects` : `${rows.length} of ${PROJECTS.length} projects`}
      filterBar={<FilterBar value={filters} onValueChange={setFilters} fields={[
        { id: 'status', label: 'Status', type: 'select', multiple: true, options: ['Active', 'Paused', 'Done'] },
        { id: 'owner', label: 'Owner', type: 'select', multiple: true, options: ['Ana', 'Budi', 'Chen', 'Dewi'] },
      ]} />}
      columns={<TableColumnsMenu columns={cols} onColumnsChange={setCols} />}>
      <Table caption="Projects" hideCaption>
        <TableHead><TableRow>
          <TableHeaderCell>Name</TableHeaderCell>{show('status') ? <TableHeaderCell>Status</TableHeaderCell> : null}{show('owner') ? <TableHeaderCell>Owner</TableHeaderCell> : null}
        </TableRow></TableHead>
        <TableBody>{rows.map((p) => (
          <TableRow key={p.name}>
            <TableCell>{p.name}</TableCell>{show('status') ? <TableCell>{p.status}</TableCell> : null}{show('owner') ? <TableCell>{p.owner}</TableCell> : null}
          </TableRow>
        ))}</TableBody>
      </Table>
    </TableToolbar>
  );
}
