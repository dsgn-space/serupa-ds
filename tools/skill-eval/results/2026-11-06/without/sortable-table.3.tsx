import { useMemo, useState } from "react";

// NOTE: I couldn't inspect serupa-ds in this session (no file access), so I did not guess
// at its component names or props. This uses semantic HTML with aria-sort and
// aria-current. To match the design system, swap the <table>, <button> and <nav>
// elements for its Table, Button and Pagination components.

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

const SAMPLE_ORDERS: Order[] = Array.from({ length: 47 }, (_, i) => ({
  orderNumber: `ORD-${String(1001 + i).padStart(5, "0")}`,
  customer: ["Acme Corp", "Globex", "Initech", "Umbrella", "Hooli", "Stark Ltd"][i % 6],
  date: new Date(2026, 0, 1 + ((i * 7) % 300)).toISOString().slice(0, 10),
  total: Math.round((50 + ((i * 137) % 950) + (i % 7) * 0.35) * 100) / 100,
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
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return cmp * dir;
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
                  style={{ textAlign: col.numeric ? "right" : "left" }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    style={{ font: "inherit", fontWeight: 600, background: "none", border: 0, cursor: "pointer" }}
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
              <td colSpan={COLUMNS.length}>No orders found.</td>
            </tr>
          ) : (
            rows.map((o) => (
              <tr key={o.orderNumber}>
                <td>{o.orderNumber}</td>
                <td>{o.customer}</td>
                <td>
                  <time dateTime={o.date}>{dateFmt.format(new Date(o.date))}</time>
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {currency.format(o.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <nav
        aria-label="Orders pagination"
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}
      >
        <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1}>
          Previous
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPage(p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
            style={{ fontWeight: p === currentPage ? 700 : 400 }}
          >
            {p}
          </button>
        ))}
        <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount}>
          Next
        </button>
        <span aria-live="polite" style={{ marginLeft: "auto" }}>
          {sorted.length === 0
            ? "0 orders"
            : `${start + 1}–${Math.min(start + PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
      </nav>
    </div>
  );
}
