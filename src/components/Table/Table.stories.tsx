import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, TableBody, TableCell, TableFoot, TableHead, TableHeaderCell, TableRow, type SortDirection } from './Table';
import { Text } from '../Text/Text';
import { Badge } from '../Badge/Badge';

const people = [
  { name: 'Ada Lovelace', role: 'Admin', status: 'Active', calls: 1204 },
  { name: 'Grace Hopper', role: 'Editor', status: 'Active', calls: 318 },
  { name: 'Linus Torvalds', role: 'Viewer', status: 'Invited', calls: 0 },
  { name: 'Margaret Hamilton', role: 'Editor', status: 'Active', calls: 87 },
];

function Rows({ selected }: { selected?: number }) {
  return (
    <>
      <TableHead>
        <TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell align="end">Calls</TableHeaderCell></TableRow>
      </TableHead>
      <TableBody>
        {people.map((p, i) => (
          <TableRow key={p.name} selected={selected === undefined ? undefined : i === selected}>
            <TableCell>{p.name}</TableCell>
            <TableCell><Text as="span" tone="muted">{p.role}</Text></TableCell>
            <TableCell><Badge tone={p.status === 'Active' ? 'success' : 'neutral'}>{p.status}</Badge></TableCell>
            <TableCell align="end">{p.calls.toLocaleString('en')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
}

const meta = {
  title: 'Components/Content/Table',
  component: Table,
  args: { caption: 'Team members' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  render: (args) => <Table {...args}><Rows /></Table>,
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Striped: Story = { args: { striped: true, size: 'sm' } };

export const Selected: Story = { render: (args) => <Table {...args}><Rows selected={1} /></Table> };

export const Sortable: Story = {
  render: function Render(args) {
    const [sort, setSort] = React.useState<SortDirection>('descending');
    const rows = [...people].sort((a, b) => (sort === 'ascending' ? 1 : -1) * (a.calls - b.calls));
    return (
      <Table {...args}>
        <TableHead><TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell align="end" sort={sort} onSort={() => setSort(sort === 'ascending' ? 'descending' : 'ascending')}>Calls</TableHeaderCell></TableRow></TableHead>
        <TableBody>{rows.map((p) => <TableRow key={p.name}><TableCell>{p.name}</TableCell><TableCell align="end">{p.calls.toLocaleString('en')}</TableCell></TableRow>)}</TableBody>
        <TableFoot><TableRow><TableCell>Total</TableCell><TableCell align="end">{people.reduce((s, p) => s + p.calls, 0).toLocaleString('en')}</TableCell></TableRow></TableFoot>
      </Table>
    );
  },
};

export const StickyHeader: Story = {
  args: { stickyHeader: true, containerProps: { style: { maxHeight: 200 } } },
  render: (args) => (
    <Table {...args}>
      <TableHead><TableRow><TableHeaderCell>Invoice</TableHeaderCell><TableHeaderCell align="end">Amount</TableHeaderCell></TableRow></TableHead>
      <TableBody>{Array.from({ length: 12 }, (_, i) => <TableRow key={i}><TableCell>INV-{1001 + i}</TableCell><TableCell align="end">${(120 + i * 37).toFixed(2)}</TableCell></TableRow>)}</TableBody>
    </Table>
  ),
};
