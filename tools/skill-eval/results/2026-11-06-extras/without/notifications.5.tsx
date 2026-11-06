// NOTE: I couldn't inspect serupa-ds in this session, so `Button` with
// `variant="primary"` is an assumed API. Check it against the package's exports.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Button } from "serupa-ds";

type Kind = "comment" | "mention" | "invite";

interface Notification {
  id: number;
  kind: Kind;
  text: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: 1, kind: "comment", text: "Rina commented on “Q4 roadmap”", time: "2m ago", read: false },
  { id: 2, kind: "mention", text: "Dewa mentioned you in #design-review", time: "1h ago", read: false },
  { id: 3, kind: "invite", text: "You were invited to the “Atlas” workspace", time: "3h ago", read: false },
  { id: 4, kind: "comment", text: "Sari replied to your comment", time: "Yesterday", read: true },
];

const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const ICONS: Record<Kind, ReactElement> = {
  comment: (
    <svg {...svgProps}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  mention: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  ),
  invite: (
    <svg {...svgProps}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  ),
};

const KIND_LABEL: Record<Kind, string> = {
  comment: "Comment",
  mention: "Mention",
  invite: "Invite",
};

const CSS = `
.np-header { display:flex; align-items:center; justify-content:space-between;
  padding:12px 20px; border-bottom:1px solid var(--np-border, #e5e7eb); }
.np-bell { position:relative; display:inline-flex; align-items:center; gap:8px; }
.np-badge { min-width:18px; height:18px; padding:0 5px; border-radius:9px;
  background:#dc2626; color:#fff; font-size:11px; font-weight:600; line-height:18px;
  text-align:center; font-variant-numeric:tabular-nums; }
.np-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.35); opacity:0;
  visibility:hidden; transition:opacity .25s ease, visibility 0s linear .25s; z-index:40; }
.np-backdrop[data-open="true"] { opacity:1; visibility:visible;
  transition:opacity .25s ease, visibility 0s; }
.np-panel { position:fixed; top:0; right:0; bottom:0; width:min(400px,100vw);
  display:flex; flex-direction:column; background:var(--np-bg, #fff);
  color:var(--np-fg, #111827); box-shadow:-8px 0 24px rgba(0,0,0,.15); z-index:50;
  transform:translateX(100%); visibility:hidden;
  transition:transform .3s cubic-bezier(.32,.72,0,1), visibility 0s linear .3s; }
.np-panel[data-open="true"] { transform:translateX(0); visibility:visible;
  transition:transform .3s cubic-bezier(.32,.72,0,1), visibility 0s; }
.np-panel-head { display:flex; align-items:center; justify-content:space-between;
  gap:12px; padding:16px 20px; border-bottom:1px solid var(--np-border, #e5e7eb); }
.np-panel-head h2 { margin:0; font-size:16px; }
.np-list { list-style:none; margin:0; padding:0; overflow-y:auto; flex:1; }
.np-item { display:flex; gap:12px; padding:14px 20px;
  border-bottom:1px solid var(--np-border, #e5e7eb); }
.np-item[data-read="false"] { background:rgba(37,99,235,.06); }
.np-icon { flex:none; width:34px; height:34px; border-radius:50%; display:grid;
  place-items:center; background:rgba(37,99,235,.12); color:#2563eb; }
.np-text { margin:0; font-size:14px; line-height:1.4; }
.np-time { margin:2px 0 0; font-size:12px; opacity:.65; }
.np-empty { padding:32px 20px; text-align:center; opacity:.65; }
@media (prefers-reduced-motion: reduce) {
  .np-panel, .np-panel[data-open="true"], .np-backdrop,
  .np-backdrop[data-open="true"] { transition-duration:.01ms; }
}
`;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const unread = items.filter((n) => !n.read).length;

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <>
      <style>{CSS}</style>

      <header className="np-header">
        <strong>My App</strong>
        <Button
          variant="primary"
          className="np-bell"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications, none unread"
          }
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            triggerRef.current = e.currentTarget;
            setOpen(true);
          }}
        >
          <svg {...svgProps}>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          {unread > 0 && (
            <span className="np-badge" aria-hidden="true">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </header>

      <div className="np-backdrop" data-open={open} onClick={close} aria-hidden="true" />

      <aside
        ref={panelRef}
        className="np-panel"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        tabIndex={-1}
      >
        <div className="np-panel-head">
          <h2 id={titleId}>Notifications</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary" onClick={markAllRead} disabled={unread === 0}>
              Mark all read
            </Button>
            <Button variant="primary" onClick={close} aria-label="Close notifications">
              ✕
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="np-empty">You’re all caught up.</p>
        ) : (
          <ul className="np-list">
            {items.map((n) => (
              <li key={n.id} className="np-item" data-read={n.read}>
                <span className="np-icon" role="img" aria-label={KIND_LABEL[n.kind]}>
                  {ICONS[n.kind]}
                </span>
                <div>
                  <p className="np-text">{n.text}</p>
                  <p className="np-time">
                    {n.time}
                    {!n.read && " · Unread"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}
