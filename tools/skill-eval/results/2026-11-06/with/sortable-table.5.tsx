import { useMemo, useState } from 'react';
import { Button, Icon, Pagination, Stack, Table, Text, announce } from 'serupa-ds';

type Order = {
  id: string;
  number: string;
  customer: string;
  date: string; // ISO yyyy-mm-dd
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
const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

function compare(a: Order, b: Order, key: SortKey): number {
  if (key === 'total') return a.total - b.total;
  // Order numbers carry digits ("ORD-1002"), so compare them numerically.
  return a[key].localeCompare(b[key], undefined, { numeric: true, sensitivity: 'base' });
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...orders].sort((a, b) => dir * compare(a, b, sortKey));
  }, [orders, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);

  function sortBy(key: SortKey, label: string) {
    const nextDir: SortDir = key === sortKey && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(nextDir);
    setPage(1);
    announce(`Sorted by ${label}, ${nextDir === 'asc' ? 'ascending' : 'descending'}`);
  }

  function changePage(next: number) {
    setPage(next);
    announce(`Page ${next} of ${pageCount}`);
  }

  return (
    <Stack gap={4}>
      <Table>
        <caption className="sr-only">
          Orders, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label.toLowerCase()},{' '}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sortBy(col.key, col.label)}
                  >
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
                  <time dateTime={order.date}>{dateFmt.format(new Date(order.date))}</time>
                </td>
                <td className="text-right">{money.format(order.total)}</td>
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
        {pageCount > 1 && (
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={changePage} />
        )}
      </Stack>
    </Stack>
  );
}
