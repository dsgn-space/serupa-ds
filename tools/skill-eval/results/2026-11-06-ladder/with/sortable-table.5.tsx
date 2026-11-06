import { useMemo, useState } from 'react';
import { Button, Icon, Pagination, Stack, Table, Text, announce } from 'serupa-ds';

export interface Order {
  id: string;
  number: string;
  customer: string;
  date: string; // ISO date, e.g. "2026-11-03"
  total: number;
}

type SortKey = 'number' | 'customer' | 'date' | 'total';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'number', label: 'Order number' },
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Date' },
  { key: 'total', label: 'Total', numeric: true },
];

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const moneyFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

function compare(a: Order, b: Order, key: SortKey): number {
  switch (key) {
    case 'total':
      return a.total - b.total;
    case 'date':
      return Date.parse(a.date) - Date.parse(b.date);
    case 'number':
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    default:
      return a.customer.localeCompare(b.customer);
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
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
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
      <Table>
        <caption className="text-left p-3 text-text-muted">
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
                  aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={col.numeric ? 'text-right' : 'text-left'}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sortBy(col.key, col.label)}
                    iconEnd={
                      <Icon
                        name={
                          active
                            ? sortDir === 'asc'
                              ? 'arrow_upward'
                              : 'arrow_downward'
                            : 'unfold_more'
                        }
                      />
                    }
                  >
                    {col.label}
                  </Button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="p-4 text-text-muted">
                No orders yet.
              </td>
            </tr>
          ) : (
            rows.map((order) => (
              <tr key={order.id}>
                <th scope="row" className="text-left">
                  {order.number}
                </th>
                <td>{order.customer}</td>
                <td>
                  <time dateTime={order.date}>{dateFormat.format(new Date(order.date))}</time>
                </td>
                <td className="text-right">{moneyFormat.format(order.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Stack direction="row" justify="between" align="center" gap={4}>
        <Text className="text-text-muted">
          {sorted.length === 0
            ? 'Showing 0 orders'
            : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, sorted.length)} of ${sorted.length}`}
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
