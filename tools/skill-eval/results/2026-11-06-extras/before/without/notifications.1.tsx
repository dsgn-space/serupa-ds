import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
// ASSUMPTION: serupa-ds exports a `Button` that accepts `variant="primary"`.
// I couldn't inspect the package here, so adjust the import and props if yours differ.
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
  { id: "1", kind: "comment", title: "Rina commented on “Q3 roadmap”", time: "2m ago", read: false },
  { id: "2", kind: "mention", title: "Dimas mentioned you in #design", time: "1h ago", read: false },
  { id: "3", kind: "invite", title: "You were invited to “Growth team”", time: "3h ago", read: false },
  { id: "4", kind: "comment", title: "Sari replied to your comment", time: "Yesterday", read: true },
];

/* Icons: inline SVG so there is no dependency on the DS icon API. */
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

const BellIcon = () => (
  <svg {...svgProps}>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
const CloseIcon = () => (
  <svg {...svgProps}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const CommentIcon = () => (
  <svg {...svgProps}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const MentionIcon = () => (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
);
const InviteIcon = () => (
  <svg {...svgProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M22 11h-6" />
  </svg>
);

const KIND_ICON: Record<Kind, ReactNode> = {
  comment: <CommentIcon />,
  mention: <MentionIcon />,
  invite: <InviteIcon />,
};
const KIND_LABEL: Record<Kind, string> = {
  comment: "Comment",
  mention: "Mention",
  invite: "Invite",
};

/* One primary button used everywhere, so header and panel always match. */
type PrimaryButtonProps = Omit<React.ComponentProps<typeof Button>, "variant">;
function PrimaryButton(props: PrimaryButtonProps) {
  return <Button variant="primary" {...props} />;
}

const css = `
.nt-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--border, #e5e7eb);
}
.nt-bell { position: relative; display: inline-flex; }
.nt-badge {
  position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px;
  padding: 0 5px; border-radius: 9px; box-sizing: border-box;
  background: var(--danger, #dc2626); color: #fff;
  font: 600 11px/18px system-ui, sans-serif; text-align: center;
  pointer-events: none; font-variant-numeric: tabular-nums;
}
.nt-scrim {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
  opacity: 0; visibility: hidden;
  transition: opacity 280ms ease, visibility 0s linear 280ms;
  z-index: 1000;
}
.nt-scrim[data-open="true"] {
  opacity: 1; visibility: visible; transition-delay: 0s;
}
.nt-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: min(380px, 100vw); display: flex; flex-direction: column;
  background: var(--surface, #fff); color: var(--text, #111827);
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
  transform: translateX(100%); visibility: hidden;
  transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1), visibility 0s linear 320ms;
  z-index: 1001;
}
.nt-panel[data-open="true"] {
  transform: translateX(0); visibility: visible; transition-delay: 0s;
}
.nt-panel-head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 12px 16px; border-bottom: 1px solid var(--border, #e5e7eb);
}
.nt-panel-head h2 { margin: 0; font-size: 16px; font-weight: 600; }
.nt-actions { display: flex; gap: 8px; align-items: center; }
.nt-list { list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 1; }
.nt-item {
  display: flex; gap: 12px; padding: 12px 16px;
  border-bottom: 1px solid var(--border, #e5e7eb);
}
.nt-item[data-read="false"] { background: var(--surface-muted, #f3f4f6); }
.nt-icon {
  flex: none; display: grid; place-items: center; width: 36px; height: 36px;
  border-radius: 50%; background: var(--surface-muted, #eef2ff);
  color: var(--primary, #4f46e5);
}
.nt-title { margin: 0; font-size: 14px; }
.nt-time { margin: 2px 0 0; font-size: 12px; opacity: 0.65; }
.nt-empty { padding: 32px 16px; text-align: center; opacity: 0.7; font-size: 14px; }
@media (prefers-reduced-motion: reduce) {
  .nt-panel, .nt-scrim { transition-duration: 1ms; }
}
`;

export default function NotificationsHeader() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.querySelector("button")?.focus();
  }, []);

  // Escape closes the panel; focus moves into it when it opens.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
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
      <style>{css}</style>

      <header className="nt-header">
        <strong>My App</strong>

        <span className="nt-bell" ref={triggerRef}>
          <PrimaryButton
            aria-label={`Notifications, ${unread} unread`}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <BellIcon />
          </PrimaryButton>
          {unread > 0 && (
            <span className="nt-badge" aria-hidden="true">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
      </header>

      <div className="nt-scrim" data-open={open} onClick={close} aria-hidden="true" />

      <aside
        ref={panelRef}
        className="nt-panel"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nt-title"
        aria-hidden={!open}
      >
        <div className="nt-panel-head">
          <h2 id="nt-title">Notifications</h2>
          <div className="nt-actions">
            <PrimaryButton onClick={markAllRead} disabled={unread === 0}>
              Mark all as read
            </PrimaryButton>
            <PrimaryButton aria-label="Close notifications" onClick={close}>
              <CloseIcon />
            </PrimaryButton>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="nt-empty">You're all caught up.</p>
        ) : (
          <ul className="nt-list">
            {items.map((n) => (
              <li key={n.id} className="nt-item" data-read={n.read}>
                <span className="nt-icon" role="img" aria-label={KIND_LABEL[n.kind]}>
                  {KIND_ICON[n.kind]}
                </span>
                <div>
                  <p className="nt-title">
                    {!n.read && <span className="sr-only">Unread: </span>}
                    {n.title}
                  </p>
                  <p className="nt-time">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}
