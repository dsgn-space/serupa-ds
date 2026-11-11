import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '../Alert/Alert';
import { Button } from '../Button/Button';
import { EmptyState } from '../EmptyState/EmptyState';
import { DataGrid, type DataGridCellChange, type DataGridColumn, type DataGridRow } from './DataGrid';

const COLUMNS: DataGridColumn[] = [
  { key: 'sku', header: 'SKU' },
  { key: 'name', header: 'Product', editable: true },
  { key: 'stock', header: 'In stock', editable: true, align: 'end' },
  { key: 'price', header: 'Price (Rp)', editable: true, align: 'end', format: (r) => Number(r.price).toLocaleString('id-ID') },
];
const ROWS: DataGridRow[] = [
  { id: 'a', sku: 'KP-001', name: 'Kopi Toraja 250 g', stock: 42, price: 85000 },
  { id: 'b', sku: 'KP-002', name: 'Kopi Gayo 250 g', stock: 18, price: 92000 },
  { id: 'c', sku: 'TH-010', name: 'Teh Melati 100 g', stock: 120, price: 24000 },
  { id: 'd', sku: 'GL-005', name: 'Gula Aren 500 g', stock: 0, price: 38000 },
  { id: 'e', sku: 'MD-020', name: 'Madu Hutan 350 ml', stock: 9, price: 110000 },
];
const apply = (rows: DataGridRow[], changes: DataGridCellChange[]) => rows.map((r) => {
  const mine = changes.filter((c) => c.rowId === r.id);
  if (!mine.length) return r;
  const next = { ...r };
  for (const c of mine) next[c.column] = c.column === 'name' ? c.value : Number(c.value.replace(/[^\d]/g, '')) || 0;
  return next;
});

function Editable(props: { size?: 'sm' | 'md' }) {
  const [rows, setRows] = React.useState(ROWS);
  return <DataGrid aria-label="Stock" columns={COLUMNS} rows={rows} onRowsChange={(_, { changes }) => setRows((r) => apply(r, changes))} size={props.size} />;
}

const meta = {
  title: 'Components/Content/DataGrid',
  component: DataGrid,
  args: { 'aria-label': 'Stock', columns: COLUMNS, rows: ROWS },
} satisfies Meta<typeof DataGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Editable: Enter, F2 or typing edits Product, In stock and Price; paste a block copied from a spreadsheet. */
export const Edit: Story = { render: () => <Editable /> };

export const Small: Story = { render: () => <Editable size="sm" /> };

/** Large: 16px text and rows at least 44px tall, for touch screens and a grid that is the page's main task. */
export const Large: Story = { render: () => <Editable size="lg" /> };

/** Read only: no onRowsChange, so cells move, select and copy, but don't edit. */
export const ReadOnly: Story = {};

function States() {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'empty' | 'failed'>('loading');
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['loading', 'loaded', 'empty', 'failed'] as const).map((s) => <Button key={s} size="sm" variant={s === state ? 'primary' : 'secondary'} aria-pressed={s === state} onClick={() => setState(s)}>{s[0].toUpperCase() + s.slice(1)}</Button>)}
      </div>
      <DataGrid aria-label="Stock" columns={COLUMNS} rows={state === 'loaded' ? ROWS : []} busy={state === 'loading'} loadingRows={5} loadingLabel="Loading stock"
        message={state === 'failed'
          ? <Alert tone="danger" actions={<Button size="sm" onClick={() => setState('loading')}>Retry</Button>}>Stock didn't load. Check your connection and try again.</Alert>
          : <EmptyState size="sm" title="No products yet" description="Add a product to start tracking its stock." />} />
    </div>
  );
}
/** Loading, empty and failed: placeholder rows while busy, then a message across every column. */
export const LoadingAndErrors: Story = { name: 'Loading, empty and failed', render: () => <States /> };

// The stress story (G14): long words and more columns than fit, so the frame scrolls sideways.
export const LongText: Story = {
  args: {
    columns: [...COLUMNS, { key: 'note', header: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung note' }],
    rows: ROWS.map((r) => ({ ...r, note: 'A note long enough to need the frame to scroll sideways in a narrow column' })),
  },
};
