import { useMemo, useState } from 'react';
import { Button, Card, Heading, Icon, Pagination, Stack, Text, VisuallyHidden } from 'serupa-ds';
import { Table } from 'serupa-ds';

type Order = {
  id: string;
  number: string;
  customer: string;
  date: string; // ISO date
  total: number;
};

type SortKey = 'number' | 'customer' | 'date' | 'total';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const NAMES = ['Ayu Lestari', 'Budi Santoso', 'Citra Dewi', 'Dimas Pratama', 'Eka Putri', 'Fajar Nugroho', 'Gita Maharani'];

const ORDERS: Order[] = Array.from({ length: 57 }, (_, i) => ({
  id: `o${i + 1}`,
  number: `ORD-${String(1001 + i)}`,
  customer: NAMES[i % NAMES.length],
  date: new Date(Date.UTC(2026, 0, 1 + i * 3)).toISOString().slice(0, 10),
  total: Math.round((20 + ((i * 37) % 480) + (i % 7) * 0.99) * 100) / 100,
}));

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'number', label: 'Order number' },
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Date' },
  { key: 'total', label: 'Total', numeric: true },
];

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' });

export function OrdersTable({ orders = ORDERS }: { orders?: Order[] }) {
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
          : String(x).localeCompare(String(y), undefined, { numeric: true });
      return cmp * dir;
    });
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

  return (
    <Card>
      <Stack gap={4}>
        <Heading level={2}>Orders</Heading>

        <Table>
          <caption className="dk-visually-hidden">
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
                    aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={col.numeric ? 'text-right' : undefined}
                  >
                    <Button variant="ghost" size="sm" onClick={() => toggleSort(col.key)}>
                      {col.label}
                      <Icon
                        name={active ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                        aria-hidden="true"
                      />
                      <VisuallyHidden>
                        {active
                          ? `, sorted ${sortDir === 'asc' ? 'ascending' : 'descending'}. Activate to reverse.`
                          : ', not sorted. Activate to sort.'}
                      </VisuallyHidden>
                    </Button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <th scope="row">{o.number}</th>
                <td>{o.customer}</td>
                <td>
                  <time dateTime={o.date}>{dateFmt.format(new Date(o.date))}</time>
                </td>
                <td className="text-right">{money.format(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Stack direction="row" gap={4} align="center" justify="between" wrap>
          <Text className="text-text-muted" role="status" aria-live="polite">
            Showing {sorted.length === 0 ? 0 : start + 1}–{start + rows.length} of {sorted.length} orders
          </Text>
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        </Stack>
      </Stack>
    </Card>
  );
}

export default OrdersTable;
