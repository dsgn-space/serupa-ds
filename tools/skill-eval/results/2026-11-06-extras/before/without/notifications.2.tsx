import { useEffect, useRef, useState, type ReactNode } from "react";
// Assumption: serupa-ds exports `Button` with a `variant` prop. I couldn't inspect the package,
// so adjust the import and props to match its real API.
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
  { id: 3, kind: "invite", text: "You were invited to join Team Atlas", time: "3h ago", read: false },
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
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

// One shared primary button, so the header and the panel always look identical.
const PrimaryButton = (props: Omit<React.ComponentProps<typeof Button>, "variant">) => (
  <Button variant="primary" {...props} />
);

const css = `
.np-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e5e7eb}
.np-bell-count{margin-left:8px;display:inline-flex;min-width:20px;height:20px;padding:0 6px;border-radius:10px;
  align-items:center;justify-content:center;font-size:12px;font-weight:600;background:#fff;color:#111}
.np-bell-inner{display:inline-flex;align-items:center}
.np-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);opacity:0;visibility:hidden;
  transition:opacity .3s ease,visibility 0s linear .3s;z-index:90}
.np-overlay[data-open="true"]{opacity:1;visibility:visible;transition:opacity .3s ease}
.np-panel{position:fixed;top:0;right:0;bottom:0;width:min(380px,100vw);background:#fff;color:#111;
  box-shadow:-8px 0 24px rgba(0,0,0,.15);display:flex;flex-direction:column;z-index:100;
  transform:translateX(100%);visibility:hidden;
  transition:transform .3s cubic-bezier(.22,1,.36,1),visibility 0s linear .3s}
.np-panel[data-open="true"]{transform:translateX(0);visibility:visible;
  transition:transform .3s cubic-bezier(.22,1,.36,1)}
.np-panel-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:16px;border-bottom:1px solid #e5e7eb}
.np-panel-head h2{margin:0;font-size:18px}
.np-list{list-style:none;margin:0;padding:0;overflow-y:auto;flex:1}
.np-item{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid #f0f0f0}
.np-item[data-read="false"]{background:#f5f8ff}
.np-icon{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#e8eefc;color:#2f55d4}
.np-text{margin:0;font-size:14px}
.np-time{font-size:12px;color:#6b7280}
.np-empty{padding:32px 16px;text-align:center;color:#6b7280}
@media (prefers-reduced-motion:reduce){
  .np-overlay,.np-panel,.np-panel[data-open="true"],.np-overlay[data-open="true"]{transition:none}
}
`;

export default function NotificationsHeader() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    bellRef.current?.focus();
  };

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <>
      <style>{css}</style>

      <header className="np-header">
        <strong>My App</strong>

        <PrimaryButton
          ref={bellRef as never}
          onClick={() => setOpen(true)}
          aria-label={`Notifications, ${unread} unread`}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="np-bell-inner">
            <BellIcon />
            <span className="np-bell-count" aria-hidden="true">
              {unread}
            </span>
          </span>
        </PrimaryButton>
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
          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryButton onClick={markAllRead} disabled={unread === 0}>
              Mark all read
            </PrimaryButton>
            <PrimaryButton ref={closeRef as never} onClick={close} aria-label="Close notifications">
              ✕
            </PrimaryButton>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="np-empty">You're all caught up.</p>
        ) : (
          <ul className="np-list">
            {items.map((n) => (
              <li key={n.id} className="np-item" data-read={n.read}>
                <span className="np-icon" role="img" aria-label={KIND_LABEL[n.kind]}>
                  {ICONS[n.kind]}
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
      </aside>
    </>
  );
}
