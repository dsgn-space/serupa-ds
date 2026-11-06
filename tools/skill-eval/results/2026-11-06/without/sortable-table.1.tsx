import { useMemo, useState } from "react";

// NOTE: I couldn't inspect the installed serupa-ds package in this session, so I
// didn't guess at its component names or props. This uses native, accessible
// elements. To use the design system, swap the <table>, <button> and <nav>
// elements below for its Table and Button components.

type Order = {
  number: string;
  customer: string;
  date: string; // ISO yyyy-mm-dd
  total: number;
};

type SortKey = keyof Order;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "number", label: "Order number" },
  { key: "customer", label: "Customer" },
  { key: "date", label: "Date" },
  { key: "total", label: "Total", numeric: true },
];

// Sample data. Replace with the `orders` prop or fetched data in real use.
const SAMPLE_ORDERS: Order[] = Array.from({ length: 47 }, (_, i) => ({
  number: `ORD-${String(1001 + i)}`,
  customer: ["Acme Corp", "Globex", "Initech", "Umbrella", "Hooli", "Stark Ltd"][i % 6],
  date: new Date(Date.UTC(2026, 0, 1 + i * 3)).toISOString().slice(0, 10),
  total: Math.round((50 + ((i * 937) % 1200) + (i % 7) * 13.37) * 100) / 100,
}));

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

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
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <caption className="sr-only" style={{ position: "absolute", left: -9999 }}>
          Orders, sortable by column
        </caption>
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
              <td colSpan={COLUMNS.length} style={{ padding: 12 }}>
                No orders found.
              </td>
            </tr>
          ) : (
            rows.map((o) => (
              <tr key={o.number}>
                <td style={{ padding: "8px 12px" }}>{o.number}</td>
                <td style={{ padding: "8px 12px" }}>{o.customer}</td>
                <td style={{ padding: "8px 12px" }}>
                  <time dateTime={o.date}>{dateFmt.format(new Date(o.date))}</time>
                </td>
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
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px" }}
      >
        <span aria-live="polite">
          {sorted.length === 0
            ? "0 orders"
            : `${start + 1}–${Math.min(start + PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1}>
            First
          </button>
          <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}>
            Next
          </button>
          <button type="button" onClick={() => setPage(pageCount)} disabled={currentPage === pageCount}>
            Last
          </button>
        </div>
      </nav>
    </div>
  );
}
