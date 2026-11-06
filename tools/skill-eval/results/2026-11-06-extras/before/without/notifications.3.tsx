import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
// ASSUMPTION: serupa-ds exports `Button` with a `variant="primary"` prop.
// I couldn't inspect the package in this session, so check the name and prop
// against its docs. Both buttons below use PRIMARY_BUTTON, so one edit fixes both.
import { Button } from "serupa-ds";

type Kind = "comment" | "mention" | "invite";

interface Notification {
  id: string;
  kind: Kind;
  title: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: "1", kind: "comment", title: "Rani commented on “Q3 roadmap”", time: "2m ago", read: false },
  { id: "2", kind: "mention", title: "Dewi mentioned you in #design", time: "1h ago", read: false },
  { id: "3", kind: "invite", title: "You were invited to “Brand refresh”", time: "3h ago", read: false },
  { id: "4", kind: "comment", title: "Adi replied to your comment", time: "Yesterday", read: true },
];

// One shared style for the header and panel buttons.
const PRIMARY_BUTTON = { variant: "primary" } as const;

const ICONS: Record<Kind, ReactNode> = {
  comment: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
  mention: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" />
    </>
  ),
  invite: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
};

const KIND_LABEL: Record<Kind, string> = {
  comment: "Comment",
  mention: "Mention",
  invite: "Invite",
};

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
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

const CSS = `
.np-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;
  border-bottom:1px solid var(--color-border,#e5e7eb);background:var(--color-surface,#fff);
  color:var(--color-text,#111827)}
.np-bell{position:relative;display:inline-flex}
.np-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 5px;
  border-radius:9px;background:var(--color-danger,#dc2626);color:#fff;font-size:11px;
  font-weight:600;line-height:18px;text-align:center;font-variant-numeric:tabular-nums;
  pointer-events:none}
.np-scrim{position:fixed;inset:0;background:rgb(0 0 0 / .35);opacity:0;visibility:hidden;
  transition:opacity .3s ease,visibility 0s linear .3s;z-index:40}
.np-scrim[data-open="true"]{opacity:1;visibility:visible;transition:opacity .3s ease}
.np-panel{position:fixed;top:0;right:0;bottom:0;width:min(380px,100vw);display:flex;
  flex-direction:column;background:var(--color-surface,#fff);color:var(--color-text,#111827);
  box-shadow:-8px 0 24px rgb(0 0 0 / .15);transform:translateX(100%);visibility:hidden;
  transition:transform .32s cubic-bezier(.32,.72,0,1),visibility 0s linear .32s;z-index:50}
.np-panel[data-open="true"]{transform:translateX(0);visibility:visible;
  transition:transform .32s cubic-bezier(.32,.72,0,1)}
.np-panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:16px;border-bottom:1px solid var(--color-border,#e5e7eb)}
.np-panel-head h2{margin:0;font-size:16px}
.np-close{border:0;background:none;color:inherit;cursor:pointer;padding:6px;border-radius:6px;
  display:inline-flex}
.np-close:hover{background:var(--color-hover,#f3f4f6)}
.np-list{list-style:none;margin:0;padding:0;overflow-y:auto;flex:1}
.np-item{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid var(--color-border,#e5e7eb)}
.np-item[data-read="false"]{background:var(--color-unread,#eff6ff)}
.np-icon{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;
  background:var(--color-hover,#f3f4f6)}
.np-title{margin:0;font-size:14px}
.np-time{margin:2px 0 0;font-size:12px;color:var(--color-text-muted,#6b7280)}
.np-empty{padding:32px 16px;text-align:center;color:var(--color-text-muted,#6b7280)}
@media (prefers-reduced-motion:reduce){
  .np-panel,.np-panel[data-open="true"],.np-scrim,.np-scrim[data-open="true"]{transition:none}
}
`;

export default function NotificationsHeader() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const bellRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const close = useCallback(() => setOpen(false), []);
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  // Escape closes; focus moves into the panel on open and back to the bell on close.
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
      wasOpen.current = true;
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) {
      bellRef.current?.querySelector("button")?.focus();
      wasOpen.current = false;
    }
  }, [open, close]);

  return (
    <>
      <style>{CSS}</style>

      <header className="np-header">
        <strong>My App</strong>

        <div className="np-bell" ref={bellRef}>
          <Button
            {...PRIMARY_BUTTON}
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={`Notifications, ${unread} unread`}
          >
            <Svg>
              <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
            </Svg>
          </Button>
          {unread > 0 && (
            <span className="np-badge" aria-hidden="true">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </header>

      <div className="np-scrim" data-open={open} onClick={close} aria-hidden="true" />

      <aside
        className="np-panel"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby="np-title"
        inert={!open}
      >
        <div className="np-panel-head">
          <h2 id="np-title">Notifications</h2>
          <Button {...PRIMARY_BUTTON} onClick={markAllRead} disabled={unread === 0}>
            Mark all as read
          </Button>
          <button ref={closeRef} className="np-close" onClick={close} aria-label="Close notifications">
            <Svg>
              <path d="M18 6 6 18M6 6l12 12" />
            </Svg>
          </button>
        </div>

        {items.length === 0 ? (
          <p className="np-empty">You're all caught up.</p>
        ) : (
          <ul className="np-list">
            {items.map((n) => (
              <li key={n.id} className="np-item" data-read={n.read}>
                <span className="np-icon" title={KIND_LABEL[n.kind]}>
                  <Svg>{ICONS[n.kind]}</Svg>
                  <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                    {KIND_LABEL[n.kind]}
                  </span>
                </span>
                <div>
                  <p className="np-title">
                    {n.title}
                    {!n.read && <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}> (unread)</span>}
                  </p>
                  <p className="np-time">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}
