import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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

/** Read only: no onRowsChange, so cells move, select and copy, but don't edit. */
export const ReadOnly: Story = {};

// The stress story (G14): long words and more columns than fit, so the frame scrolls sideways.
export const LongText: Story = {
  args: {
    columns: [...COLUMNS, { key: 'note', header: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung note' }],
    rows: ROWS.map((r) => ({ ...r, note: 'A note long enough to need the frame to scroll sideways in a narrow column' })),
  },
};
