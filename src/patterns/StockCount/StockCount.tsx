'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Button } from '../../components/Button/Button';
import { DataGrid, type DataGridCellChange, type DataGridColumn } from '../../components/DataGrid/DataGrid';
import { Dialog } from '../../components/Dialog/Dialog';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Link } from '../../components/Link/Link';
import { ToggleButton } from '../../components/ToggleButton/ToggleButton';
import { ToggleGroup } from '../../components/ToggleGroup/ToggleGroup';
import { Toolbar } from '../../components/Toolbar/Toolbar';
import { TransferList } from '../../components/TransferList/TransferList';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* StockCount: a shop's stock counted shelf by shelf, typed into a grid like a spreadsheet, with what differs from
   the record said as it goes. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the products are a grid (role="grid") whose column headers name every cell; arrows move, Enter or F2
     edits a count, and a block pasted from a spreadsheet fills many at once.
   - 4.1.3: how many are counted, and how many differ from the record, is a status line that updates as counts go in.
   - 1.4.1: a difference is a signed number in its own column, never a color alone.
   - 2.1.1: the view's controls are one toolbar (one tab stop, arrows between them): the row size, and Columns, a
     dialog that moves columns between hidden and shown with buttons as well as a list.
   - 3.3.1: a save that fails says so where Save is, and every count stays.
   Fetching the products and saving the counts are the app's job: pass them, and onSave. */

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  /** Where it's kept: an aisle, a shelf, a bin. */
  location: string;
  /** How many the record says there are. */
  expected: number;
  /** How many were counted; null until someone counts it. */
  counted: number | null;
}

type Density = 'sm' | 'md' | 'lg';
type Optional = 'sku' | 'location' | 'expected' | 'difference';

export interface StockCountProps {
  items?: StockItem[] | undefined;
  /** The place being counted, in the title. */
  place?: string | undefined;
  /** Saves the counts. Return a promise: Save shows it's working until it settles, and a rejection says it failed. */
  onSave?: ((items: StockItem[]) => void | Promise<unknown>) | undefined;
  /** Still loading: placeholder rows show in the grid. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load the stock" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const I = (id: string, sku: string, name: string, location: string, expected: number, counted: number | null): StockItem => ({ id, sku, name, location, expected, counted });
const demo: StockItem[] = [
  I('a', 'KP-001', 'Toraja coffee, 250 g', 'Aisle 1, shelf A', 42, 42),
  I('b', 'KP-002', 'Gayo coffee, 250 g', 'Aisle 1, shelf A', 18, 16),
  I('c', 'TH-010', 'Jasmine tea, 100 g', 'Aisle 1, shelf B', 120, 120),
  I('d', 'GL-005', 'Palm sugar, 500 g', 'Aisle 2, shelf A', 30, null),
  I('e', 'MD-020', 'Forest honey, 350 ml', 'Aisle 2, shelf B', 9, null),
  I('f', 'CK-014', 'Ginger cookies, 200 g', 'Aisle 3, shelf A', 55, null),
];

const OPTIONAL: { value: Optional; label: string }[] = [
  { value: 'sku', label: 'SKU' },
  { value: 'location', label: 'Location' },
  { value: 'expected', label: 'On record' },
  { value: 'difference', label: 'Difference' },
];

/** A count from what was typed or pasted: a whole number of 0 or more, or null for blank or anything else. */
export function parseCount(text: string): number | null {
  const t = text.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

/** The counts after a grid change: each Counted cell typed, pasted or cleared. */
export function applyCounts(items: StockItem[], changes: DataGridCellChange[]): StockItem[] {
  return items.map((it) => {
    const c = changes.filter((x) => x.rowId === it.id && x.column === 'counted').pop();
    return c ? { ...it, counted: parseCount(c.value) } : it;
  });
}

/** How many are counted, and how many of those differ from the record. */
export function countProgress(items: StockItem[]) {
  const counted = items.filter((it) => it.counted != null);
  return { counted: counted.length, differ: counted.filter((it) => it.counted !== it.expected).length };
}

/** The page: a skip link, a header, then main with the h1, the count's progress, the view toolbar, the grid and Save. */
export function StockCount({ items: initial = demo, place = 'Main Street shop', onSave, loading = false, loadFailed = false, onRetry, online }: StockCountProps) {
  const locale = useLocale();
  const num = (n: number) => formatNumber(n, locale);
  const [items, setItems] = React.useState(initial);
  const [density, setDensity] = React.useState<Density>('md');
  const [shown, setShown] = React.useState<string[]>(['location', 'expected', 'difference']);
  const [choosing, setChoosing] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<'saved' | 'failed' | null>(null);
  const has = (k: Optional) => shown.includes(k);
  const progress = countProgress(items);

  const columns: DataGridColumn<StockItem>[] = [
    ...(has('sku') ? [{ key: 'sku', header: 'SKU' } as const] : []),
    { key: 'name', header: 'Product' },
    ...(has('location') ? [{ key: 'location', header: 'Location' } as const] : []),
    ...(has('expected') ? [{ key: 'expected', header: 'On record', align: 'end', format: (r: StockItem) => num(r.expected) } as const] : []),
    { key: 'counted', header: 'Counted', align: 'end', editable: true, width: '8rem', format: (r) => (r.counted == null ? '' : String(r.counted)) },
    // The difference is a signed number in words' place: "+2", "−2", or blank until counted (1.4.1).
    ...(has('difference') ? [{ key: 'id', header: 'Difference', align: 'end', format: (r: StockItem) => {
      if (r.counted == null) return '';
      const d = r.counted - r.expected;
      return d === 0 ? '0' : `${d > 0 ? '+' : '−'}${num(Math.abs(d))}`;
    } } as const] : []),
  ];

  const save = () => {
    setResult(null);
    setBusy(true);
    void Promise.resolve().then(() => onSave?.(items)).then(() => setResult('saved'), () => setResult('failed')).finally(() => setBusy(false));
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Stock</p>
        <Link underline="hover" href="#counts">All counts</Link>
      </header>
      <Container as="main" size="xl" className="py-8 outline-none" id="main">
        <Stack gap={6}>
          <OfflineBanner online={online} placement="inline">Keep counting: every count stays here. Saving them needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'All counts', href: '#counts' }, { label: place }]} title={`Stock count: ${place}`}
            description="Type each count in Counted. Arrows move between cells, Enter edits one, and you can paste a column from a spreadsheet." />
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load the stock" onRetry={() => onRetry?.()} headingLevel={2} /> : (<>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p role="status" id="sc-progress" className="m-0">
                {loading ? 'Loading the stock…'
                  : `Counted ${num(progress.counted)} of ${num(items.length)} products. ${progress.differ === 1 ? '1 differs' : `${num(progress.differ)} differ`} from the record.`}
              </p>
              <Toolbar aria-label="Count view" size="sm">
                <ToggleGroup aria-label="Row size" selectionMode="single" required size="sm" value={[density]} onValueChange={(v) => { if (v[0]) setDensity(v[0] as Density); }}>
                  <ToggleButton value="sm">Compact</ToggleButton>
                  <ToggleButton value="md">Standard</ToggleButton>
                  <ToggleButton value="lg">Touch</ToggleButton>
                </ToggleGroup>
                <Button variant="outline" size="sm" startIcon="view_column" onClick={() => setChoosing(true)}>Columns</Button>
              </Toolbar>
            </div>
            <DataGrid<StockItem> aria-label={`Stock at ${place}`} aria-describedby="sc-progress" columns={columns} rows={items} size={density}
              onRowsChange={(_, { changes }) => { setItems((now) => applyCounts(now, changes)); setResult(null); }}
              loading={loading} loadingRows={6} loadingLabel="Loading the stock"
              message={<EmptyState size="sm" icon="inventory_2" title="Nothing to count here" headingLevel={2}
                description="Products show here once they’re stocked at this place." />} />
            {items.length && !loading ? (
              <div className="flex flex-col items-start gap-3">
                {result === 'failed' ? <Alert tone="danger">Couldn’t save the counts. Try again; every count is still here.</Alert>
                  : result === 'saved' ? <Alert tone="success">Counts saved.</Alert> : null}
                <Button onClick={save} loading={busy}>Save counts</Button>
              </div>
            ) : null}
          </>)}
        </Stack>
      </Container>
      <Dialog open={choosing} onOpenChange={setChoosing} title="Columns" description="Product and Counted always show."
        footer={<Button onClick={() => setChoosing(false)}>Done</Button>}>
        <TransferList aria-label="Columns" options={OPTIONAL} value={shown} onValueChange={setShown} availableLabel="Hidden" chosenLabel="Shown" />
      </Dialog>
    </div>
  );
}
