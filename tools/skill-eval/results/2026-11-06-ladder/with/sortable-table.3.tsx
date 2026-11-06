import { useMemo, useState } from 'react';
import { Button, Icon, Pagination, Stack, Table, Text } from 'serupa-ds';

type Order = {
  id: string;
  customer: string;
  date: string; // ISO date, e.g. "2026-10-28"
  total: number;
};

type SortKey = 'id' | 'customer' | 'date' | 'total';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'id', label: 'Order number' },
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Date' },
  { key: 'total', label: 'Total', numeric: true },
];

export function OrdersTable({
  orders,
  locale = 'en-US',
  currency = 'USD',
}: {
  orders: Order[];
  locale?: string;
  currency?: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...orders].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x).localeCompare(String(y), locale, { numeric: true }) * dir;
    });
  }, [orders, sortKey, sortDir, locale]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);

  const money = useMemo(
    () => new Intl.NumberFormat(locale, { style: 'currency', currency }),
    [locale, currency],
  );
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    [locale],
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  return (
    <Stack gap={4}>
      <Table>
        <caption className="sr-only">
          Orders, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label}{' '}
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
                  aria-sort={
                    active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                  className={col.numeric ? 'text-right' : undefined}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort(col.key)}
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
              <td colSpan={COLUMNS.length}>
                <Text className="text-text-muted">No orders yet.</Text>
              </td>
            </tr>
          ) : (
            rows.map((o) => (
              <tr key={o.id}>
                <th scope="row">{o.id}</th>
                <td>{o.customer}</td>
                <td>
                  <time dateTime={o.date}>{dateFmt.format(new Date(o.date))}</time>
                </td>
                <td className="text-right">{money.format(o.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Stack direction="row" gap={4} align="center" justify="between" wrap>
        <Text className="text-text-muted" aria-live="polite">
          {sorted.length === 0
            ? 'Showing 0 of 0 orders'
            : `Showing ${start + 1}–${start + rows.length} of ${sorted.length} orders`}
        </Text>
        {pageCount > 1 && (
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        )}
      </Stack>
    </Stack>
  );
}
