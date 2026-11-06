import { useMemo, useState } from "react";

// Note: I couldn't inspect the serupa-ds package in this environment, so this
// uses native semantic elements instead of guessing at component names. To use
// serupa-ds components, swap the table, button and select elements for theirs.

type Order = {
  id: string;
  customer: string;
  date: string; // ISO yyyy-mm-dd
  total: number;
};

type SortKey = keyof Order;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "id", label: "Order number" },
  { key: "customer", label: "Customer" },
  { key: "date", label: "Date" },
  { key: "total", label: "Total", numeric: true },
];

const CUSTOMERS = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella Ltd",
  "Hooli",
  "Stark Industries",
  "Wayne Enterprises",
  "Wonka Foods",
];

// Sample data; replace with your own orders (pass as a prop if preferred).
const SAMPLE_ORDERS: Order[] = Array.from({ length: 47 }, (_, i) => ({
  id: `ORD-${String(1001 + i)}`,
  customer: CUSTOMERS[(i * 3) % CUSTOMERS.length],
  date: new Date(Date.UTC(2026, 0, 1 + i * 5)).toISOString().slice(0, 10),
  total: Math.round((((i * 7919) % 90000) + 1500)) / 100,
}));

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function OrdersTable({ orders = SAMPLE_ORDERS }: { orders?: Order[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...orders].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
  }, [orders, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  return (
    <section aria-label="Orders">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <caption style={{ textAlign: "left", paddingBottom: 8 }}>
          Orders ({sorted.length})
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
                    active ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                  }
                  style={{ textAlign: col.numeric ? "right" : "left" }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    style={{
                      font: "inherit",
                      fontWeight: 600,
                      background: "none",
                      border: 0,
                      padding: "8px 12px",
                      cursor: "pointer",
                      color: "inherit",
                    }}
                  >
                    {col.label}
                    <span aria-hidden="true" style={{ marginInlineStart: 6 }}>
                      {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} style={{ padding: 12 }}>
                No orders found.
              </td>
            </tr>
          ) : (
            rows.map((o) => (
              <tr key={o.id}>
                <td style={{ padding: "8px 12px" }}>{o.id}</td>
                <td style={{ padding: "8px 12px" }}>{o.customer}</td>
                <td style={{ padding: "8px 12px" }}>
                  <time dateTime={o.date}>
                    {dateFormat.format(new Date(`${o.date}T00:00:00Z`))}
                  </time>
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {currency.format(o.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <nav
        aria-label="Orders pagination"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 12,
          flexWrap: "wrap",
        }}
      >
        <span aria-live="polite">
          {sorted.length === 0
            ? "0 orders"
            : `${start + 1}–${Math.min(start + PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            «
          </button>
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => setPage(pageCount)}
            disabled={currentPage === pageCount}
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </nav>
    </section>
  );
}

export default OrdersTable;
