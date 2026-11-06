import { useEffect, useRef, useState, type ReactNode } from "react";
// Assumption: serupa-ds exports `Button` with a `variant="primary"` prop.
// I couldn't inspect the package here, so adjust the import or prop names if they differ.
import { Button } from "serupa-ds";

type Kind = "comment" | "mention" | "invite";

interface Notification {
  id: string;
  kind: Kind;
  text: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: "1", kind: "comment", text: "Rina commented on “Q4 roadmap”", time: "2m ago", read: false },
  { id: "2", kind: "mention", text: "Dewa mentioned you in #design-review", time: "18m ago", read: false },
  { id: "3", kind: "invite", text: "You were invited to join “Mobile Team”", time: "1h ago", read: false },
  { id: "4", kind: "comment", text: "Sari replied to your comment", time: "Yesterday", read: true },
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

const ICONS: Record<Kind, ReactNode> = {
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

const BellIcon = () => (
  <svg {...svgProps}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CloseIcon = () => (
  <svg {...svgProps}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const CSS = `
.np-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid rgba(128,128,128,.25); }
.np-bell-wrap { position:relative; display:inline-flex; }
.np-badge { position:absolute; top:-6px; right:-6px; min-width:18px; height:18px; padding:0 5px; border-radius:9px;
  background:#d92d20; color:#fff; font-size:11px; font-weight:600; line-height:18px; text-align:center; pointer-events:none;
  box-shadow:0 0 0 2px Canvas; font-variant-numeric:tabular-nums; }
.np-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); opacity:0; visibility:hidden;
  transition:opacity .3s ease, visibility 0s linear .3s; z-index:999; }
.np-overlay[data-open="true"] { opacity:1; visibility:visible; transition:opacity .3s ease, visibility 0s; }
.np-panel { position:fixed; top:0; right:0; bottom:0; width:min(380px,100vw); display:flex; flex-direction:column;
  background:Canvas; color:CanvasText; box-shadow:-8px 0 24px rgba(0,0,0,.18); z-index:1000;
  transform:translateX(100%); visibility:hidden;
  transition:transform .32s cubic-bezier(.22,1,.36,1), visibility 0s linear .32s; }
.np-panel[data-open="true"] { transform:translateX(0); visibility:visible; transition:transform .32s cubic-bezier(.22,1,.36,1), visibility 0s; }
.np-panel-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:16px; border-bottom:1px solid rgba(128,128,128,.25); }
.np-panel-head h2 { margin:0; font-size:16px; }
.np-close { display:inline-flex; padding:6px; border:0; border-radius:6px; background:transparent; color:inherit; cursor:pointer; }
.np-close:hover { background:rgba(128,128,128,.15); }
.np-list { list-style:none; margin:0; padding:0; overflow-y:auto; flex:1; }
.np-item { display:flex; gap:12px; padding:14px 16px; border-bottom:1px solid rgba(128,128,128,.15); }
.np-item[data-read="false"] { background:rgba(59,130,246,.08); }
.np-icon { flex:none; display:grid; place-items:center; width:36px; height:36px; border-radius:50%; background:rgba(128,128,128,.18); }
.np-text { margin:0; font-size:14px; line-height:1.4; }
.np-time { margin:2px 0 0; font-size:12px; opacity:.65; }
.np-empty { padding:32px 16px; text-align:center; opacity:.65; }
@media (prefers-reduced-motion: reduce) {
  .np-panel, .np-overlay { transition-duration:.01ms !important; }
}
`;

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const bellRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const unread = items.filter((n) => !n.read).length;

  // Escape to close, focus management
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", onKey);
      wasOpen.current = true;
      return () => document.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) {
      bellRef.current?.querySelector("button")?.focus();
      wasOpen.current = false;
    }
  }, [open]);

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <>
      <style>{CSS}</style>

      <header className="np-header">
        <strong>My App</strong>

        <div className="np-bell-wrap" ref={bellRef}>
          <Button
            variant="primary"
            onClick={() => setOpen(true)}
            aria-label={`Notifications, ${unread} unread`}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <BellIcon />
          </Button>
          {unread > 0 && (
            <span className="np-badge" aria-hidden="true">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </header>

      <div
        className="np-overlay"
        data-open={open}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className="np-panel"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby="np-title"
      >
        <div className="np-panel-head">
          <h2 id="np-title">Notifications</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button variant="primary" onClick={markAllRead} disabled={unread === 0}>
              Mark all as read
            </Button>
            <button
              ref={closeRef}
              type="button"
              className="np-close"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="np-empty">You're all caught up.</p>
        ) : (
          <ul className="np-list">
            {items.map((n) => (
              <li key={n.id} className="np-item" data-read={n.read}>
                <span className="np-icon" title={KIND_LABEL[n.kind]}>
                  {ICONS[n.kind]}
                  <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                    {KIND_LABEL[n.kind]}
                  </span>
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
