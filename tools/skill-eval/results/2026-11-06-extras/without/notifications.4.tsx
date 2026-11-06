import { useCallback, useEffect, useRef, useState } from "react";
// NOTE: I could not inspect serupa-ds in this session, so `Button` and its
// `variant="primary"` prop are assumed. Adjust the import and props if they differ.
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

// One shared definition so the header and panel buttons always match.
const PRIMARY = { variant: "primary" } as const;

const ICONS: Record<Kind, JSX.Element> = {
  comment: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  mention: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </>
  ),
  invite: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </>
  ),
};

const KIND_LABEL: Record<Kind, string> = {
  comment: "Comment",
  mention: "Mention",
  invite: "Invite",
};

function Icon({ children, size = 20 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const css = `
.np-header { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-bottom:1px solid rgba(128,128,128,.25); }
.np-bell { position:relative; display:inline-flex; align-items:center; gap:8px; }
.np-badge { min-width:20px; height:20px; padding:0 6px; border-radius:10px; background:#fff; color:#111; font-size:12px; font-weight:600; line-height:20px; text-align:center; }
.np-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); opacity:0; visibility:hidden; transition:opacity .3s ease, visibility 0s linear .3s; z-index:999; }
.np-overlay[data-open="true"] { opacity:1; visibility:visible; transition:opacity .3s ease; }
.np-panel { position:fixed; top:0; right:0; bottom:0; width:min(380px,100vw); display:flex; flex-direction:column; background:var(--background, #fff); color:var(--foreground, #111); box-shadow:-8px 0 24px rgba(0,0,0,.18); transform:translateX(100%); visibility:hidden; transition:transform .35s cubic-bezier(.22,1,.36,1), visibility 0s linear .35s; z-index:1000; }
.np-panel[data-open="true"] { transform:translateX(0); visibility:visible; transition:transform .35s cubic-bezier(.22,1,.36,1); }
.np-panel-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid rgba(128,128,128,.25); }
.np-panel-head h2 { margin:0; font-size:18px; }
.np-list { list-style:none; margin:0; padding:0; flex:1; overflow-y:auto; }
.np-item { display:flex; gap:12px; padding:14px 20px; border-bottom:1px solid rgba(128,128,128,.15); }
.np-item[data-read="false"] { background:rgba(99,102,241,.08); }
.np-icon { flex:none; width:36px; height:36px; border-radius:50%; display:grid; place-items:center; background:rgba(128,128,128,.18); }
.np-text { margin:0; font-size:14px; line-height:1.4; }
.np-time { font-size:12px; opacity:.65; }
.np-foot { padding:16px 20px; border-top:1px solid rgba(128,128,128,.25); }
.np-empty { padding:32px 20px; text-align:center; opacity:.7; }
@media (prefers-reduced-motion: reduce) {
  .np-overlay, .np-panel { transition-duration:.01ms !important; }
}
`;

export default function NotificationsHeader() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const unread = items.filter((n) => !n.read).length;

  const close = useCallback(() => {
    setOpen(false);
    bellRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <>
      <style>{css}</style>

      <header className="np-header">
        <strong>My App</strong>
        <Button
          {...PRIMARY}
          ref={bellRef}
          className="np-bell"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Notifications, ${unread} unread`}
        >
          <Icon>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </Icon>
          {unread > 0 && (
            <span className="np-badge" aria-hidden="true">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </header>

      <div className="np-overlay" data-open={open} onClick={close} aria-hidden="true" />

      <aside
        className="np-panel"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby="np-title"
        aria-hidden={!open}
      >
        <div className="np-panel-head">
          <h2 id="np-title">Notifications</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close notifications"
            style={{ background: "none", border: 0, cursor: "pointer", color: "inherit", padding: 4 }}
          >
            <Icon>
              <path d="M18 6 6 18M6 6l12 12" />
            </Icon>
          </button>
        </div>

        {items.length === 0 ? (
          <p className="np-empty">You’re all caught up.</p>
        ) : (
          <ul className="np-list">
            {items.map((n) => (
              <li key={n.id} className="np-item" data-read={n.read}>
                <span className="np-icon" role="img" aria-label={KIND_LABEL[n.kind]}>
                  <Icon size={18}>{ICONS[n.kind]}</Icon>
                </span>
                <div>
                  <p className="np-text">{n.text}</p>
                  <span className="np-time">
                    {n.time}
                    {!n.read && " · Unread"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="np-foot">
          <Button {...PRIMARY} onClick={markAllRead} disabled={unread === 0} style={{ width: "100%" }}>
            Mark all as read
          </Button>
        </div>
      </aside>
    </>
  );
}
