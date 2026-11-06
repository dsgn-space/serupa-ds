import { useEffect, useRef, useState, type ReactNode } from "react";
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
  { id: 1, kind: "comment", text: "Rina commented on “Q3 roadmap”", time: "2m ago", read: false },
  { id: 2, kind: "mention", text: "Dewa mentioned you in #design-review", time: "18m ago", read: false },
  { id: 3, kind: "invite", text: "You were invited to join the Atlas workspace", time: "1h ago", read: false },
  { id: 4, kind: "comment", text: "Sari replied to your comment", time: "Yesterday", read: true },
];

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const ICONS: Record<Kind | "bell", ReactNode> = {
  bell: (
    <svg {...svgProps}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  comment: (
    <svg {...svgProps}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

// One shared definition so the header and panel buttons always match.
const PRIMARY = { variant: "primary" } as const;

const CSS = `
.nb-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid rgba(128,128,128,.25); }
.nb-title { margin:0; font-size:1.125rem; font-weight:600; }
.nb-bell { position:relative; display:inline-flex; }
.nb-badge { position:absolute; top:-6px; right:-6px; min-width:20px; height:20px; padding:0 5px; box-sizing:border-box;
  border-radius:10px; background:#d92d20; color:#fff; font-size:.75rem; font-weight:600; line-height:20px; text-align:center;
  pointer-events:none; font-variant-numeric:tabular-nums; }
.nb-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); opacity:0; visibility:hidden;
  transition:opacity .3s ease, visibility 0s linear .3s; z-index:999; }
.nb-overlay[data-open="true"] { opacity:1; visibility:visible; transition:opacity .3s ease; }
.nb-panel { position:fixed; top:0; right:0; bottom:0; width:min(400px,100vw); display:flex; flex-direction:column;
  background:Canvas; color:CanvasText; box-shadow:-8px 0 24px rgba(0,0,0,.2); z-index:1000;
  transform:translateX(100%); visibility:hidden;
  transition:transform .3s cubic-bezier(.32,.72,0,1), visibility 0s linear .3s; will-change:transform; }
.nb-panel[data-open="true"] { transform:translateX(0); visibility:visible;
  transition:transform .3s cubic-bezier(.32,.72,0,1); }
.nb-panel-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:16px; border-bottom:1px solid rgba(128,128,128,.25); }
.nb-panel-head h2 { margin:0; font-size:1.125rem; }
.nb-actions { display:flex; gap:8px; }
.nb-list { list-style:none; margin:0; padding:0; overflow-y:auto; flex:1; }
.nb-item { display:flex; gap:12px; padding:14px 16px; border-bottom:1px solid rgba(128,128,128,.15); }
.nb-item[data-read="false"] { background:rgba(80,120,255,.08); }
.nb-icon { flex:none; width:36px; height:36px; border-radius:50%; display:grid; place-items:center; background:rgba(128,128,128,.15); }
.nb-text { margin:0; font-size:.9375rem; }
.nb-meta { margin:2px 0 0; font-size:.8125rem; opacity:.7; }
.nb-empty { padding:32px 16px; text-align:center; opacity:.7; }
@media (prefers-reduced-motion: reduce) {
  .nb-panel, .nb-panel[data-open="true"], .nb-overlay, .nb-overlay[data-open="true"] { transition-duration:.01ms; }
}
`;

export default function NotificationsHeader() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const bellRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const unread = items.filter((n) => !n.read).length;

  // Escape closes; focus moves into the panel on open and returns to the bell on close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const bell = bellRef.current?.querySelector("button");
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      bell?.focus();
    };
  }, [open]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <>
      <style>{CSS}</style>

      <header className="nb-header">
        <h1 className="nb-title">My App</h1>
        <span className="nb-bell" ref={bellRef}>
          <Button
            {...PRIMARY}
            onClick={() => setOpen((o) => !o)}
            aria-label={`Notifications, ${unread} unread`}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            {ICONS.bell}
          </Button>
          {unread > 0 && (
            <span className="nb-badge" aria-hidden="true">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
      </header>

      <div className="nb-overlay" data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside
        ref={panelRef}
        className="nb-panel"
        data-open={open}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        tabIndex={-1}
        // `inert` keeps the off-screen panel out of the tab order and a11y tree while closed.
        {...(!open ? ({ inert: "" } as Record<string, string>) : {})}
      >
        <div className="nb-panel-head">
          <h2>Notifications</h2>
          <div className="nb-actions">
            <Button {...PRIMARY} onClick={markAllRead} disabled={unread === 0}>
              Mark all as read
            </Button>
            <Button {...PRIMARY} onClick={() => setOpen(false)} aria-label="Close notifications">
              Close
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="nb-empty">You're all caught up.</p>
        ) : (
          <ul className="nb-list">
            {items.map((n) => (
              <li key={n.id} className="nb-item" data-read={n.read}>
                <span className="nb-icon" role="img" aria-label={KIND_LABEL[n.kind]}>
                  {ICONS[n.kind]}
                </span>
                <div>
                  <p className="nb-text">
                    {!n.read && <span className="sr-only" style={{ position: "absolute", left: -9999 }}>Unread: </span>}
                    {n.text}
                  </p>
                  <p className="nb-meta">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}
