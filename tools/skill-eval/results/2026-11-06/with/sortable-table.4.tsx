import { useMemo, useState } from 'react';
import { Button, Icon, Pagination, Stack, Table, Text, VisuallyHidden } from 'serupa-ds';

export interface Order {
  id: string;
  number: string;
  customer: string;
  date: string; // ISO 8601, e.g. "2026-03-14"
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
      return a.customer.localeCompare(b.customer, undefined, { sensitivity: 'base' });
  }
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...orders].sort((a, b) => compare(a, b, sortKey) * dir);
  }, [orders, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  const sortLabel = COLUMNS.find((c) => c.key === sortKey)?.label ?? '';

  return (
    <Stack gap={4}>
      <Table>
        <caption className="text-left text-text-muted p-2">
          <VisuallyHidden>
            Orders, sorted by {sortLabel}, {sortDir === 'asc' ? 'ascending' : 'descending'}.
          </VisuallyHidden>
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
                  <Button variant="ghost" size="sm" onClick={() => toggleSort(col.key)}>
                    {col.label}
                    <Icon
                      name={
                        active
                          ? sortDir === 'asc'
                            ? 'arrow_upward'
                            : 'arrow_downward'
                          : 'unfold_more'
                      }
                      aria-hidden="true"
                    />
                  </Button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="text-center text-text-muted p-6">
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
                <td className="text-right tabular-nums">{moneyFormat.format(order.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Stack direction="row" justify="between" align="center" gap={4}>
        <Text size="sm" className="text-text-muted" role="status">
          {sorted.length === 0
            ? 'Showing 0 orders'
            : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, sorted.length)} of ${sorted.length} orders`}
        </Text>
        {pageCount > 1 && (
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        )}
      </Stack>
    </Stack>
  );
}

export default OrdersTable;
