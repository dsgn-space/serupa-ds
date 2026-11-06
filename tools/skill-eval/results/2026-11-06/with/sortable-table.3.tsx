import { useMemo, useState } from 'react';
import { Button, Icon, Pagination, Stack, Table, Text, VisuallyHidden, announce } from 'serupa-ds';

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

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const moneyFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function compare(a: Order, b: Order, key: SortKey): number {
  switch (key) {
    case 'total':
      return a.total - b.total;
    case 'date':
      return Date.parse(a.date) - Date.parse(b.date);
    default:
      return collator.compare(a[key], b[key]);
  }
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const factor = sortDir === 'asc' ? 1 : -1;
    return [...orders].sort((a, b) => factor * compare(a, b, sortKey));
  }, [orders, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);

  function handleSort(key: SortKey, label: string) {
    const nextDir: SortDir = key === sortKey && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(nextDir);
    setPage(1);
    announce(`Sorted by ${label}, ${nextDir === 'asc' ? 'ascending' : 'descending'}`);
  }

  return (
    <Stack gap={4}>
      <Table>
        <caption>
          <VisuallyHidden>
            Orders, {sorted.length} in total. Column headers are buttons that sort the table.
          </VisuallyHidden>
        </caption>
        <thead>
          <tr>
            {COLUMNS.map(({ key, label, numeric }) => {
              const active = key === sortKey;
              return (
                <th
                  key={key}
                  scope="col"
                  className={numeric ? 'text-right' : undefined}
                  aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <Button variant="ghost" size="sm" onClick={() => handleSort(key, label)}>
                    {label}
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
                  <time dateTime={order.date}>{dateFormat.format(new Date(order.date))}</time>
                </td>
                <td className="text-right">{moneyFormat.format(order.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {sorted.length > 0 && (
        <Stack direction="row" gap={4} align="center" justify="between" wrap>
          <Text size="sm" className="text-text-muted">
            Showing {start + 1}–{start + rows.length} of {sorted.length} orders
          </Text>
          {pageCount > 1 && (
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={(next: number) => {
                setPage(next);
                announce(`Page ${next} of ${pageCount}`);
              }}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
}
