import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, TableActionBar, TableBody, TableVirtualBody, TableCell, TableColumnsMenu, TableDetailRow, TableExpandCell, TableFoot, TableHead, TableHeaderCell, TableLoadingRows, TableMessageRow, TableRow, TableSelectCell, type SortDirection } from './Table';
import { Text } from '../Text/Text';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Alert } from '../Alert/Alert';
import { EmptyState } from '../EmptyState/EmptyState';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import { FormattedNumber } from '../FormattedNumber/FormattedNumber';
import { usePeople } from '../../../.storybook/content';

// The rows follow the toolbar's Content menu: demo, the worst case, none or one (.storybook/content.ts).
function Rows({ selected }: { selected?: number }) {
  const people = usePeople();
  return (
    <>
      <TableHead>
        <TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell align="end">Calls</TableHeaderCell></TableRow>
      </TableHead>
      <TableBody>
        {people.length ? null : <TableRow><TableCell colSpan={4}><Text as="span" tone="muted">No team members yet</Text></TableCell></TableRow>}
        {people.map((p, i) => (
          <TableRow key={p.name} selected={selected === undefined ? undefined : i === selected}>
            <TableCell>{p.name}</TableCell>
            <TableCell><Text as="span" tone="muted">{p.role || 'No role'}</Text></TableCell>
            <TableCell><Badge tone={p.status === 'Active' ? 'success' : 'neutral'}>{p.status}</Badge></TableCell>
            <TableCell align="end"><FormattedNumber value={p.calls} /></TableCell>
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

/** Each row links to the person's page through one real link in its name cell, stretched over the row: click anywhere
 *  on a row, Ctrl/Cmd-click for a new tab, or Tab to the name. The checkboxes and Edit buttons sit above the link and work on their own. */
function LinkedRows(args: React.ComponentProps<typeof Table>) {
  const people = usePeople();
  return (
      <Table {...args}>
        <TableHead>
          <TableRow><TableHeaderCell><VisuallyHidden>Select</VisuallyHidden></TableHeaderCell><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell><TableHeaderCell><VisuallyHidden>Actions</VisuallyHidden></TableHeaderCell></TableRow>
        </TableHead>
        <TableBody>
          {people.map((p) => (
            <TableRow key={p.name} href={'#' + encodeURIComponent(p.name)}>
              <TableSelectCell label={'Select ' + p.name} />
              <TableCell>{p.name}</TableCell>
              <TableCell><Text as="span" tone="muted">{p.role || 'No role'}</Text></TableCell>
              <TableCell align="end"><Button size="sm" variant="ghost" aria-label={'Edit ' + p.name}>Edit</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  );
}
export const RowLinks: Story = { render: (args) => <LinkedRows {...args} /> };

/** layout="fixed": the columns keep the widths the header gives them (Name 40%, Calls 6rem, the rest share), so they
 *  don't jump when the rows change; long text wraps in its cell. */
export const FixedLayout: Story = {
  args: { layout: 'fixed' },
  render: (args) => <FixedRows {...args} />,
};
function FixedRows(args: React.ComponentProps<typeof Table>) {
  const people = usePeople();
  return (
    <Table {...args}>
      <TableHead>
        <TableRow><TableHeaderCell width="40%">Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell><TableHeaderCell width="6rem" align="end">Calls</TableHeaderCell></TableRow>
      </TableHead>
      <TableBody>
        {people.map((p) => (
          <TableRow key={p.name}><TableCell>{p.name}</TableCell><TableCell><Text as="span" tone="muted">{p.role || 'No role'}</Text></TableCell><TableCell align="end"><FormattedNumber value={p.calls} /></TableCell></TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const SelectableRows: Story = {
  render: function Render(args) {
    const people = usePeople();
    const [picked, setPicked] = React.useState<string[]>(people.slice(1, 2).map((p) => p.name));
    const all = people.length > 0 && picked.length === people.length;
    const toggle = (n: string) => setPicked(picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n]);
    return <Table {...args}>
      <TableHead><TableRow>
        <TableSelectCell header label="Select all rows" checked={all} indeterminate={!all && picked.length > 0} onChange={() => setPicked(all ? [] : people.map((p) => p.name))} />
        <TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell><TableHeaderCell align="end">Calls</TableHeaderCell>
      </TableRow></TableHead>
      <TableBody>{people.map((p) => <TableRow key={p.name} selected={picked.includes(p.name)}>
        <TableSelectCell label={'Select ' + p.name} checked={picked.includes(p.name)} onChange={() => toggle(p.name)} />
        <TableCell>{p.name}</TableCell><TableCell><Text as="span" tone="muted">{p.role || 'No role'}</Text></TableCell><TableCell align="end"><FormattedNumber value={p.calls} /></TableCell>
      </TableRow>)}</TableBody>
    </Table>;
  },
};

// With rows selected, the bar above the table shows the count, actions for them, and Clear selection.
export const ActionBar: Story = {
  render: function Render(args) {
    const people = usePeople();
    const [picked, setPicked] = React.useState<string[]>([people[0], people[2]].filter(Boolean).map((p) => p.name));
    const all = people.length > 0 && picked.length === people.length;
    const toggle = (n: string) => setPicked(picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n]);
    return <>
      <TableActionBar count={picked.length} onClear={() => setPicked([])}>
        <Button size="sm" variant="outline">Export</Button>
        <Button size="sm" variant="outline" onClick={() => setPicked([])}>Remove</Button>
      </TableActionBar>
      <Table {...args}>
        <TableHead><TableRow>
          <TableSelectCell header label="Select all rows" checked={all} indeterminate={!all && picked.length > 0} onChange={() => setPicked(all ? [] : people.map((p) => p.name))} />
          <TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell>
        </TableRow></TableHead>
        <TableBody>{people.map((p) => <TableRow key={p.name} selected={picked.includes(p.name)}>
          <TableSelectCell label={'Select ' + p.name} checked={picked.includes(p.name)} onChange={() => toggle(p.name)} />
          <TableCell>{p.name}</TableCell><TableCell><Text as="span" tone="muted">{p.role || 'No role'}</Text></TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </>;
  },
};

export const Sortable: Story = {
  render: function Render(args) {
    const people = usePeople();
    const [sort, setSort] = React.useState<SortDirection>('descending');
    const rows = [...people].sort((a, b) => (sort === 'ascending' ? 1 : -1) * (a.calls - b.calls));
    return (
      <Table {...args}>
        <TableHead><TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell align="end" sort={sort} onSort={() => setSort(sort === 'ascending' ? 'descending' : 'ascending')}>Calls</TableHeaderCell></TableRow></TableHead>
        <TableBody>{rows.map((p) => <TableRow key={p.name}><TableCell>{p.name}</TableCell><TableCell align="end"><FormattedNumber value={p.calls} /></TableCell></TableRow>)}</TableBody>
        <TableFoot><TableRow><TableCell>Total</TableCell><TableCell align="end"><FormattedNumber value={people.reduce((s, p) => s + p.calls, 0)} /></TableCell></TableRow></TableFoot>
      </Table>
    );
  },
};

export const StickyHeader: Story = {
  args: { stickyHeader: true, containerProps: { style: { maxHeight: 200 } } },
  render: (args) => (
    <Table {...args}>
      <TableHead><TableRow><TableHeaderCell>Invoice</TableHeaderCell><TableHeaderCell align="end">Amount</TableHeaderCell></TableRow></TableHead>
      <TableBody>{Array.from({ length: 12 }, (_, i) => <TableRow key={i}><TableCell>INV-{1001 + i}</TableCell><TableCell align="end"><FormattedNumber value={120 + i * 37} format="currency" currency="USD" /></TableCell></TableRow>)}</TableBody>
    </Table>
  ),
};

export const Virtual: Story = {
  args: { stickyHeader: true, containerProps: { style: { maxHeight: 320 } } },
  render: (args) => (
    <Table {...args} caption="Ten thousand invoices, drawn a window at a time">
      <TableHead><TableRow><TableHeaderCell>Invoice</TableHeaderCell><TableHeaderCell align="end">Amount</TableHeaderCell></TableRow></TableHead>
      <TableVirtualBody count={10000} renderRow={(i) => <TableRow><TableCell>INV-{1001 + i}</TableCell><TableCell align="end"><FormattedNumber value={120 + (i % 97) * 37} format="currency" currency="USD" /></TableCell></TableRow>} />
    </Table>
  ),
};

export const Overflow: Story = {
  render: (args) => (
    <div style={{ width: 280 }}>
      <Table {...args} caption="Team members, with every role and how many calls each made this quarter">
        <TableHead>
          <TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Role and permissions</TableHeaderCell><TableHeaderCell align="end">Calls this quarter</TableHeaderCell></TableRow>
        </TableHead>
        <TableBody>
          <TableRow><TableCell>Maria Magdalena von Hohenzollern-Sigmaringen</TableCell><TableCell>Administrator</TableCell><TableCell align="end">1,234,567</TableCell></TableRow>
          <TableRow><TableCell>Donaudampfschifffahrtsgesellschaftskapitänskajüte</TableCell><TableCell>Editor</TableCell><TableCell align="end">0</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const Align: Story = {
  render: (args) => <Table {...args}>
    <TableHead><TableRow><TableHeaderCell align="start">Start</TableHeaderCell><TableHeaderCell align="center">Center</TableHeaderCell><TableHeaderCell align="end">End</TableHeaderCell></TableRow></TableHead>
    <TableBody><TableRow><TableCell align="start">Ada</TableCell><TableCell align="center">Active</TableCell><TableCell align="end">1,204</TableCell></TableRow></TableBody>
  </Table>,
};

// Column tools: resize a column by its header's edge, keep the name and actions in view while scrolling sideways,
// choose the columns, and open a row's details.
const ORDERS = [
  { id: '1001', customer: 'Ada Lovelace', city: 'London', items: 3, total: 1240000, status: 'Paid', note: 'Gift wrap, deliver after 5pm.' },
  { id: '1002', customer: 'Grace Hopper', city: 'Arlington', items: 1, total: 85000, status: 'Pending', note: 'Leave with the building\u2019s front desk.' },
  { id: '1003', customer: 'Raden Ajeng Kartini', city: 'Jepara', items: 12, total: 4520000, status: 'Paid', note: 'Split into two boxes.' },
];
const COLS = [
  { id: 'city', label: 'City' }, { id: 'items', label: 'Items' }, { id: 'total', label: 'Total' }, { id: 'status', label: 'Status' },
];
function ColumnTools(args: React.ComponentProps<typeof Table>) {
  const [shown, setShown] = React.useState<Record<string, boolean>>({ city: true, items: true, total: true, status: true });
  const [open, setOpen] = React.useState<Record<string, boolean>>({ '1003': true });
  const cols = COLS.filter((c) => shown[c.id]);
  return (
    <div className="flex flex-col items-end gap-2" style={{ maxWidth: 560 }}>
      <TableColumnsMenu columns={[{ id: 'customer', label: 'Customer', visible: true, required: true }, ...COLS.map((c) => ({ ...c, visible: shown[c.id] }))]}
        onColumnsChange={(_cols, d) => setShown({ ...shown, [d.id]: d.visible })} />
      <Table {...args} caption="Orders" hideCaption layout="fixed" pinEnd containerProps={{ style: { width: '100%' } }}>
        <TableHead>
          <TableRow>
            <TableExpandCell header />
            <TableHeaderCell resizable width={180}>Customer</TableHeaderCell>
            {cols.map((c) => <TableHeaderCell key={c.id} resizable width={c.id === 'status' ? 120 : 140} align={c.id === 'items' || c.id === 'total' ? 'end' : 'start'}>{c.label}</TableHeaderCell>)}
            <TableHeaderCell width={96}><VisuallyHidden>Actions</VisuallyHidden></TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ORDERS.map((o) => (
            <React.Fragment key={o.id}>
              <TableRow>
                <TableExpandCell label={'Order ' + o.id} expanded={!!open[o.id]} controls={'order-' + o.id} onExpandedChange={(v) => setOpen({ ...open, [o.id]: v })} />
                <TableCell>{o.customer}</TableCell>
                {cols.map((c) => c.id === 'city' ? <TableCell key={c.id}>{o.city}</TableCell>
                  : c.id === 'items' ? <TableCell key={c.id} align="end">{o.items}</TableCell>
                  : c.id === 'total' ? <TableCell key={c.id} align="end"><FormattedNumber value={o.total} format="currency" currency="IDR" options={{ maximumFractionDigits: 0 }} /></TableCell>
                  : <TableCell key={c.id}><Badge tone={o.status === 'Paid' ? 'success' : 'neutral'}>{o.status}</Badge></TableCell>)}
                <TableCell><Button variant="ghost" size="sm" aria-label={'Edit order ' + o.id}>Edit</Button></TableCell>
              </TableRow>
              <TableDetailRow id={'order-' + o.id} open={!!open[o.id]} colSpan={cols.length + 3}><Text as="span" tone="muted">{o.note}</Text></TableDetailRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
export const ColumnToolsStory: Story = { name: 'Column tools', render: (args) => <ColumnTools {...args} /> };
export const StripedDetails: Story = { name: 'Striped, with details', args: { striped: true }, render: (args) => <ColumnTools {...args} /> };
// pinStart and pinEnd: the name and the actions stay put while the columns between them scroll.
function Pinned(args: React.ComponentProps<typeof Table>) {
  const frame = React.useRef<HTMLTableElement>(null);
  React.useEffect(() => { const f = frame.current && frame.current.parentElement; if (f) f.scrollLeft = 160; }, []);
  return (
    <div style={{ maxWidth: 480 }}>
      <Table {...args} ref={frame} caption="Orders" hideCaption layout="fixed" pinStart pinEnd>
        <TableHead><TableRow><TableHeaderCell width={180}>Customer</TableHeaderCell><TableHeaderCell width={140}>City</TableHeaderCell><TableHeaderCell width={100} align="end">Items</TableHeaderCell><TableHeaderCell width={160} align="end">Total</TableHeaderCell><TableHeaderCell width={80}><VisuallyHidden>Actions</VisuallyHidden></TableHeaderCell></TableRow></TableHead>
        <TableBody>
          {ORDERS.map((o, i) => (
            <TableRow key={o.id} selected={i === 1}>
              <TableCell>{o.customer}</TableCell><TableCell>{o.city}</TableCell><TableCell align="end">{o.items}</TableCell>
              <TableCell align="end"><FormattedNumber value={o.total} format="currency" currency="IDR" options={{ maximumFractionDigits: 0 }} /></TableCell>
              <TableCell><Button variant="ghost" size="sm" aria-label={'Edit order ' + o.id}>Edit</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
export const PinnedColumns: Story = { name: 'Pinned columns', render: (args) => <Pinned {...args} /> };

// Loading, empty and failed: the header stays, the placeholder rows are as tall as real ones, and a failure offers Retry.
function States(args: React.ComponentProps<typeof Table>) {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'empty' | 'failed'>('loading');
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['loading', 'loaded', 'empty', 'failed'] as const).map((s) => <Button key={s} size="sm" variant={s === state ? 'primary' : 'secondary'} aria-pressed={s === state} onClick={() => setState(s)}>{s[0].toUpperCase() + s.slice(1)}</Button>)}
      </div>
      <Table {...args} caption="Team members" busy={state === 'loading'}>
        {state === 'loaded' ? <Rows /> : <>
          <TableHead><TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell align="end">Calls</TableHeaderCell></TableRow></TableHead>
          {state === 'loading' ? <TableLoadingRows columns={4} rows={4} label="Loading team members" /> : (
            <TableBody>
              <TableMessageRow colSpan={4}>
                {state === 'failed'
                  ? <Alert tone="danger" actions={<Button size="sm" onClick={() => setState('loading')}>Retry</Button>}>Team members didn't load. Check your connection and try again.</Alert>
                  : <EmptyState size="sm" title="No team members yet" description="Invite people to work on this project with you." />}
              </TableMessageRow>
            </TableBody>
          )}
        </>}
      </Table>
    </div>
  );
}
export const LoadingAndErrors: Story = { name: 'Loading, empty and failed', render: (args) => <States {...args} /> };
