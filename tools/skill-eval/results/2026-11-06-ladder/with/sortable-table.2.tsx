import { useMemo, useState } from 'react';
import {
  Button,
  FormattedNumber,
  Heading,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  announce,
} from 'serupa-ds';

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

export type OrdersTableProps = {
  orders: Order[];
  currency?: string;
  locale?: string;
};

export function OrdersTable({ orders, currency = 'USD', locale }: OrdersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...orders].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      const cmp =
        typeof x === 'number' && typeof y === 'number'
          ? x - y
          : String(x).localeCompare(String(y), locale, { numeric: true });
      return cmp * dir;
    });
  }, [orders, sortKey, sortDir, locale]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }),
    [locale],
  );

  function toggleSort(key: SortKey) {
    const dir: SortDir = key === sortKey && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
    const label = COLUMNS.find((c) => c.key === key)?.label ?? key;
    announce(`Sorted by ${label}, ${dir === 'asc' ? 'ascending' : 'descending'}`);
  }

  function changePage(next: number) {
    setPage(next);
    announce(`Page ${next} of ${pageCount}`);
  }

  return (
    <Stack gap={4}>
      <Heading level={2}>Orders</Heading>

      <Table>
        <caption className="sr-only">
          Orders, {sorted.length} in total, sorted by{' '}
          {COLUMNS.find((c) => c.key === sortKey)?.label.toLowerCase()}
        </caption>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => {
              const active = col.key === sortKey;
              return (
                <TableHeaderCell
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={col.numeric ? 'text-right' : undefined}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    <span aria-hidden="true">{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
                  </Button>
                </TableHeaderCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS.length}>
                <Text className="text-text-muted">No orders yet.</Text>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.number}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell>
                  <time dateTime={o.date}>{dateFormat.format(new Date(o.date))}</time>
                </TableCell>
                <TableCell className="text-right">
                  <FormattedNumber
                    value={o.total}
                    style="currency"
                    currency={currency}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Stack direction="row" gap={4} align="center" justify="between" wrap>
        <Text className="text-text-muted">
          {sorted.length === 0
            ? '0 orders'
            : `Showing ${start + 1}–${start + rows.length} of ${sorted.length}`}
        </Text>
        {pageCount > 1 && (
          <Pagination page={current} pageCount={pageCount} onPageChange={changePage} />
        )}
      </Stack>
    </Stack>
  );
}

export default OrdersTable;
