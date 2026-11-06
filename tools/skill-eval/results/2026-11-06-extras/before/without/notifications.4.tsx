import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
// NOTE: I couldn't inspect serupa-ds in this session, so `Button` with
// `variant="primary"` is an assumption. If the API differs, change PRIMARY_PROPS only.
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
  { id: 3, kind: "invite", text: "You were invited to the “Mobile” workspace", time: "1h ago", read: false },
  { id: 4, kind: "comment", text: "Sari replied to your comment", time: "Yesterday", read: true },
];

const ICONS: Record<Kind, { label: string; svg: ReactNode }> = {
  comment: {
    label: "Comment",
    svg: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
  },
  mention: {
    label: "Mention",
    svg: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" />
      </>
    ),
  },
  invite: {
    label: "Invite",
    svg: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6" />
      </>
    ),
  },
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

// One definition so the header and the panel always use the same primary button style.
const PRIMARY_PROPS = { variant: "primary" } as const;

const CSS = `
.np-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid rgba(128,128,128,.25); }
.np-title { font-weight:600; margin:0; font-size:1.125rem; }
.np-bell { position:relative; display:inline-flex; align-items:center; gap:6px; }
.np-badge { min-width:18px; height:18px; padding:0 5px; border-radius:9px; background:#d92d20; color:#fff; font-size:11px; font-weight:700; line-height:18px; text-align:center; font-variant-numeric:tabular-nums; }
.np-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); opacity:0; visibility:hidden; transition:opacity .3s ease, visibility 0s linear .3s; z-index:40; }
.np-overlay[data-open="true"] { opacity:1; visibility:visible; transition:opacity .3s ease; }
.np-panel { position:fixed; top:0; right:0; bottom:0; width:min(400px,100vw); display:flex; flex-direction:column; background:var(--serupa-color-surface, Canvas); color:var(--serupa-color-text, CanvasText); box-shadow:-8px 0 24px rgba(0,0,0,.2); transform:translateX(100%); visibility:hidden; transition:transform .32s cubic-bezier(.22,1,.36,1), visibility 0s linear .32s; z-index:50; }
.np-panel[data-open="true"] { transform:translateX(0); visibility:visible; transition:transform .32s cubic-bezier(.22,1,.36,1); }
.np-panel-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px; border-bottom:1px solid rgba(128,128,128,.25); }
.np-list { list-style:none; margin:0; padding:0; overflow-y:auto; flex:1; }
.np-item { display:flex; gap:12px; padding:14px 16px; border-bottom:1px solid rgba(128,128,128,.15); }
.np-item[data-read="false"] { background:rgba(80,120,255,.08); }
.np-icon { flex:none; display:grid; place-items:center; width:36px; height:36px; border-radius:50%; background:rgba(128,128,128,.18); }
.np-text { margin:0; font-size:.9375rem; }
.np-time { margin:2px 0 0; font-size:.8125rem; opacity:.65; }
.np-empty { padding:32px 16px; text-align:center; opacity:.7; }
.np-close { background:none; border:0; color:inherit; font-size:1.5rem; line-height:1; cursor:pointer; padding:4px 8px; border-radius:6px; }
.np-close:focus-visible { outline:2px solid currentColor; outline-offset:2px; }
@media (prefers-reduced-motion: reduce) {
  .np-panel, .np-panel[data-open="true"], .np-overlay, .np-overlay[data-open="true"] { transition-duration:0s; transition-delay:0s; }
}
`;

export default function NotificationsHeader() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const bellWrapRef = useRef<HTMLSpanElement>(null);

  const unread = items.filter((n) => !n.read).length;

  const close = useCallback(() => {
    setOpen(false);
    bellWrapRef.current?.querySelector("button")?.focus();
  }, []);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  // Escape closes; move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // `inert` keeps the offscreen panel out of the tab order and accessibility tree.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (open) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [open]);

  return (
    <>
      <style>{CSS}</style>

      <header className="np-header">
        <h1 className="np-title">My App</h1>

        <span ref={bellWrapRef}>
          <Button
            {...PRIMARY_PROPS}
            className="np-bell"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={`Notifications, ${unread} unread`}
          >
            <Icon>
              <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
            </Icon>
            {unread > 0 && (
              <span className="np-badge" aria-hidden="true">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Button>
        </span>
      </header>

      <div className="np-overlay" data-open={open} onClick={close} aria-hidden="true" />

      <aside
        ref={panelRef}
        className="np-panel"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="np-panel-head">
          <h2 id={titleId} className="np-title">
            Notifications
          </h2>
          <Button {...PRIMARY_PROPS} onClick={markAllRead} disabled={unread === 0}>
            Mark all as read
          </Button>
          <button type="button" className="np-close" onClick={close} aria-label="Close notifications">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="np-empty">You're all caught up.</p>
        ) : (
          <ul className="np-list">
            {items.map((n) => (
              <li key={n.id} className="np-item" data-read={n.read}>
                <span className="np-icon" role="img" aria-label={ICONS[n.kind].label}>
                  <Icon>{ICONS[n.kind].svg}</Icon>
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
