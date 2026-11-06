import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
// ASSUMPTION: serupa-ds exports `Button` with a `variant="primary"` prop.
// I couldn't inspect the package here, so if the API differs, change it in
// PrimaryButton below. Both the header and the panel use that one wrapper.
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
  { id: 1, kind: "comment", text: "Sari commented on “Q3 roadmap”", time: "2m ago", read: false },
  { id: 2, kind: "mention", text: "Budi mentioned you in #design-review", time: "1h ago", read: false },
  { id: 3, kind: "invite", text: "You were invited to join Team Nusantara", time: "3h ago", read: false },
  { id: 4, kind: "comment", text: "Rina replied to your comment", time: "Yesterday", read: true },
];

const KIND_LABEL: Record<Kind, string> = {
  comment: "Comment",
  mention: "Mention",
  invite: "Invite",
};

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

function KindIcon({ kind }: { kind: Kind }) {
  switch (kind) {
    case "comment":
      return (
        <svg {...svgProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "mention":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
        </svg>
      );
    case "invite":
      return (
        <svg {...svgProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M22 11h-6" />
        </svg>
      );
  }
}

function BellIcon() {
  return (
    <svg {...svgProps}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg {...svgProps}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/** Single source of truth for the primary button look, used in header and panel. */
function PrimaryButton({
  children,
  ...rest
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button variant="primary" type="button" {...rest}>
      {children}
    </Button>
  );
}

const css = `
.nb-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; }
.nb-bell { position:relative; display:inline-flex; }
.nb-badge {
  position:absolute; top:-6px; right:-6px; min-width:18px; height:18px; padding:0 5px;
  border-radius:9px; background:var(--color-danger, #d92d20); color:#fff;
  font-size:11px; font-weight:600; line-height:18px; text-align:center;
  pointer-events:none; font-variant-numeric:tabular-nums;
}
.nb-backdrop {
  position:fixed; inset:0; background:rgba(0,0,0,.4); opacity:0; visibility:hidden;
  transition:opacity .3s ease, visibility 0s linear .3s; z-index:999;
}
.nb-backdrop[data-open="true"] { opacity:1; visibility:visible; transition-delay:0s; }
.nb-panel {
  position:fixed; top:0; right:0; bottom:0; width:min(380px,100vw);
  display:flex; flex-direction:column;
  background:var(--color-surface, #fff); color:var(--color-text, #101828);
  box-shadow:-8px 0 24px rgba(0,0,0,.15); z-index:1000;
  transform:translateX(100%); visibility:hidden;
  transition:transform .3s cubic-bezier(.32,.72,0,1), visibility 0s linear .3s;
}
.nb-panel[data-open="true"] { transform:translateX(0); visibility:visible; transition-delay:0s; }
.nb-panel-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:16px; border-bottom:1px solid rgba(128,128,128,.25); }
.nb-panel-head h2 { margin:0; font-size:1.125rem; }
.nb-list { list-style:none; margin:0; padding:0; overflow-y:auto; flex:1; }
.nb-item { display:flex; gap:12px; padding:14px 16px; border-bottom:1px solid rgba(128,128,128,.15); }
.nb-item[data-read="false"] { background:rgba(80,120,255,.08); }
.nb-icon { flex:none; width:36px; height:36px; border-radius:50%; display:grid; place-items:center; background:rgba(128,128,128,.18); }
.nb-text { margin:0; font-size:.9375rem; }
.nb-time { margin:2px 0 0; font-size:.8125rem; opacity:.65; }
.nb-empty { padding:32px 16px; text-align:center; opacity:.65; }
@media (prefers-reduced-motion: reduce) {
  .nb-panel, .nb-backdrop { transition-duration:.01ms !important; }
}
`;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const bellRef = useRef<HTMLSpanElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const unread = items.filter((n) => !n.read).length;

  // Escape closes; focus moves into the panel on open and back to the bell on close.
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      document.addEventListener("keydown", onKey);
      wasOpen.current = true;
      return () => document.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) {
      bellRef.current?.querySelector("button")?.focus();
      wasOpen.current = false;
    }
  }, [open]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <>
      <style>{css}</style>

      <header className="nb-header">
        <strong>My App</strong>
        <span className="nb-bell" ref={bellRef}>
          <PrimaryButton
            onClick={() => setOpen(true)}
            aria-label={`Notifications, ${unread} unread`}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <BellIcon />
          </PrimaryButton>
          {unread > 0 && (
            <span className="nb-badge" aria-hidden="true">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
      </header>

      <div className="nb-backdrop" data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside
        className="nb-panel"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nb-title"
        aria-hidden={!open}
      >
        <div className="nb-panel-head">
          <h2 id="nb-title">Notifications</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryButton onClick={markAllRead} disabled={unread === 0}>
              Mark all as read
            </PrimaryButton>
            <PrimaryButton ref={closeRef as never} onClick={() => setOpen(false)} aria-label="Close notifications">
              <CloseIcon />
            </PrimaryButton>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="nb-empty">You’re all caught up.</p>
        ) : (
          <ul className="nb-list">
            {items.map((n) => (
              <li key={n.id} className="nb-item" data-read={n.read}>
                <span className="nb-icon" role="img" aria-label={KIND_LABEL[n.kind]}>
                  <KindIcon kind={n.kind} />
                </span>
                <div>
                  <p className="nb-text">{n.text}</p>
                  <p className="nb-time">
                    {n.time}
                    {!n.read && <span className="sr-only"> (unread)</span>}
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
