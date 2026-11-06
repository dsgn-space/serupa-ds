import { useMemo, useState } from 'react';
import { Badge, Button, FormattedNumber, Pagination, Stack, Table, Text, announce } from 'serupa-ds';

type Order = {
  id: string;
  number: string;
  customer: string;
  date: string; // ISO date, e.g. "2026-10-28"
  total: number;
};

type SortKey = 'number' | 'customer' | 'date' | 'total';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'number', label: 'Order number' },
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Date' },
  { key: 'total', label: 'Total', numeric: true },
];

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function compare(a: Order, b: Order, key: SortKey): number {
  switch (key) {
    case 'total':
      return a.total - b.total;
    case 'date':
      return a.date.localeCompare(b.date);
    default:
      return collator.compare(a[key], b[key]);
  }
}

export function OrdersTable({ orders, currency = 'USD' }: { orders: Order[]; currency?: string }) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const rows = [...orders].sort((a, b) => compare(a, b, sortKey));
    return sortDir === 'asc' ? rows : rows.reverse();
  }, [orders, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);

  const dateFormat = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }), []);

  function toggleSort(key: SortKey) {
    const dir: SortDir = key === sortKey && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
    const label = COLUMNS.find((c) => c.key === key)?.label ?? key;
    announce(`Sorted by ${label}, ${dir === 'asc' ? 'ascending' : 'descending'}`);
  }

  return (
    <Stack gap={4}>
      <Table>
        <caption className="text-left text-text-muted p-2">
          Orders, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label.toLowerCase()}{' '}
          ({sortDir === 'asc' ? 'ascending' : 'descending'})
        </caption>
        <thead>
          <tr>
            {COLUMNS.map((col) => {
              const active = col.key === sortKey;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={col.numeric ? 'text-right' : undefined}
                  aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort(col.key)}
                    aria-label={`Sort by ${col.label}`}
                  >
                    {col.label}
                    <span aria-hidden="true">{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
                  </Button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length}>
                <Text className="text-text-muted">No orders yet.</Text>
              </td>
            </tr>
          ) : (
            rows.map((order) => (
              <tr key={order.id}>
                <th scope="row">{order.number}</th>
                <td>{order.customer}</td>
                <td>
                  <time dateTime={order.date}>{dateFormat.format(new Date(order.date))}</time>
                </td>
                <td className="text-right">
                  <FormattedNumber value={order.total} style="currency" currency={currency} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Stack direction="row" gap={4} align="center" justify="between" wrap>
        <Text className="text-text-muted">
          {sorted.length === 0
            ? 'Showing 0 orders'
            : `Showing ${start + 1}–${start + rows.length} of ${sorted.length} orders`}
        </Text>
        <Pagination
          page={current}
          pageCount={pageCount}
          onPageChange={(p: number) => {
            setPage(p);
            announce(`Page ${p} of ${pageCount}`);
          }}
        />
      </Stack>
    </Stack>
  );
}
