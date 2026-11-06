import { useMemo, useState } from "react";

// NOTE: I couldn't inspect serupa-ds in this session (no shell access), so I did
// not guess at its component names or props. This uses semantic HTML only and
// runs as-is. To use the design system, swap <table>, <button> and <nav> for its
// Table and Button components and keep the state logic unchanged.

type Order = {
  orderNumber: string;
  customer: string;
  date: string; // ISO yyyy-mm-dd
  total: number;
};

type SortKey = keyof Order;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "orderNumber", label: "Order number" },
  { key: "customer", label: "Customer" },
  { key: "date", label: "Date" },
  { key: "total", label: "Total", numeric: true },
];

const CUSTOMERS = ["Ayu Lestari", "Budi Santoso", "Citra Dewi", "Dimas Pratama", "Eka Wijaya", "Fitri Handayani"];

// Sample data; replace with your own orders (props or fetched data).
const SAMPLE_ORDERS: Order[] = Array.from({ length: 47 }, (_, i) => ({
  orderNumber: `ORD-${String(1001 + i)}`,
  customer: CUSTOMERS[(i * 7) % CUSTOMERS.length],
  date: new Date(Date.UTC(2026, 0, 1 + ((i * 5) % 300))).toISOString().slice(0, 10),
  total: Math.round((20 + ((i * 37) % 480) + (i % 10) / 10) * 100) / 100,
}));

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export default function OrdersTable({ orders = SAMPLE_ORDERS }: { orders?: Order[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...orders].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
  }, [orders, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
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
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <caption style={{ position: "absolute", left: -9999 }}>Orders</caption>
        <thead>
          <tr>
            {COLUMNS.map((col) => {
              const active = col.key === sortKey;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  style={{ textAlign: col.numeric ? "right" : "left", padding: "8px 12px" }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    style={{ all: "unset", cursor: "pointer", fontWeight: 600 }}
                  >
                    {col.label}
                    <span aria-hidden="true">{active ? (sortDir === "asc" ? " ▲" : " ▼") : " ↕"}</span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} style={{ padding: 16, textAlign: "center" }}>
                No orders yet.
              </td>
            </tr>
          ) : (
            rows.map((o) => (
              <tr key={o.orderNumber}>
                <td style={{ padding: "8px 12px" }}>{o.orderNumber}</td>
                <td style={{ padding: "8px 12px" }}>{o.customer}</td>
                <td style={{ padding: "8px 12px" }}>{dateFormat.format(new Date(o.date))}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {currency.format(o.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <nav
        aria-label="Orders pagination"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12 }}
      >
        <span aria-live="polite">
          {sorted.length === 0
            ? "0 orders"
            : `${start + 1}–${Math.min(start + PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={() => setPage(1)} disabled={current === 1}>
            First
          </button>
          <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1}>
            Previous
          </button>
          <span>
            Page {current} of {pageCount}
          </span>
          <button type="button" onClick={() => setPage(current + 1)} disabled={current === pageCount}>
            Next
          </button>
          <button type="button" onClick={() => setPage(pageCount)} disabled={current === pageCount}>
            Last
          </button>
        </div>
      </nav>
    </div>
  );
}
