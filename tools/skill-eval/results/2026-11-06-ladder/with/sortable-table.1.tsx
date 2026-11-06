import { useMemo, useState } from 'react';
import { Button, Heading, Pagination, Stack, Table, Text, announce } from 'serupa-ds';

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

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

function compare(a: Order, b: Order, key: SortKey): number {
  switch (key) {
    case 'total':
      return a.total - b.total;
    case 'date':
      return a.date.localeCompare(b.date);
    case 'number':
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    default:
      return a.customer.localeCompare(b.customer, undefined, { sensitivity: 'base' });
  }
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const rows = [...orders].sort((a, b) => compare(a, b, sortKey));
    return sortDir === 'asc' ? rows : rows.reverse();
  }, [orders, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);

  function sortBy(key: SortKey, label: string) {
    const dir: SortDir = key === sortKey && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
    announce(`Sorted by ${label}, ${dir === 'asc' ? 'ascending' : 'descending'}`);
  }

  return (
    <Stack gap={4}>
      <Heading level={2}>Orders</Heading>

      <Table>
        <caption className="sr-only">
          Orders, sorted by{' '}
          {COLUMNS.find((c) => c.key === sortKey)?.label.toLowerCase()},{' '}
          {sortDir === 'asc' ? 'ascending' : 'descending'}
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
                  <Button size="sm" variant="ghost" onClick={() => sortBy(col.key, col.label)}>
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
              <td colSpan={COLUMNS.length}>No orders yet.</td>
            </tr>
          ) : (
            rows.map((order) => (
              <tr key={order.id}>
                <th scope="row">{order.number}</th>
                <td>{order.customer}</td>
                <td>
                  <time dateTime={order.date}>{dateFormat.format(new Date(order.date))}</time>
                </td>
                <td className="text-right">{money.format(order.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {sorted.length > 0 && (
        <Stack direction="row" justify="between" align="center" gap={4}>
          <Text className="text-text-muted">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, sorted.length)} of {sorted.length}
          </Text>
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={(next: number) => {
              setPage(next);
              announce(`Page ${next} of ${pageCount}`);
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}
