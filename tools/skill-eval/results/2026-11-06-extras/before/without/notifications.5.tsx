import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from "react";

// NOTE: I couldn't inspect serupa-ds in this session, so I haven't verified its
// component or prop names. Both primary buttons share PRIMARY_BUTTON below, so
// to use the DS, swap that one object for its primary Button or class.

type Kind = "comment" | "mention" | "invite";

interface Notification {
  id: number;
  kind: Kind;
  text: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: 1, kind: "comment", text: "Maya commented on “Q3 roadmap”", time: "2m ago", read: false },
  { id: 2, kind: "mention", text: "Jon mentioned you in #design-review", time: "1h ago", read: false },
  { id: 3, kind: "invite", text: "You were invited to the Growth workspace", time: "3h ago", read: false },
  { id: 4, kind: "comment", text: "Priya replied to your thread", time: "Yesterday", read: true },
];

const ICONS: Record<Kind, { label: string; path: ReactElement }> = {
  comment: {
    label: "Comment",
    path: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
  },
  mention: {
    label: "Mention",
    path: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.6 7.2" />
      </>
    ),
  },
  invite: {
    label: "Invite",
    path: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6" />
      </>
    ),
  },
};

function Icon({ children, size = 20 }: { children: ReactElement; size?: number }) {
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

// One primary button style, used by the header bell and the panel action.
const PRIMARY_BUTTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 40,
  padding: "0 14px",
  border: "none",
  borderRadius: 8,
  background: "var(--color-primary, #4f46e5)",
  color: "var(--color-on-primary, #fff)",
  font: "inherit",
  fontWeight: 600,
  cursor: "pointer",
};

const DURATION = "320ms";
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

export default function NotificationsHeader() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const bellRef = useRef<HTMLButtonElement>(null);
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
    if (wasOpen.current) bellRef.current?.focus();
  }, [open]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ntf-panel, .ntf-scrim { transition-duration: 1ms !important; }
        }
      `}</style>

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-border, #e5e7eb)",
        }}
      >
        <strong>My App</strong>

        <button
          ref={bellRef}
          type="button"
          style={{ ...PRIMARY_BUTTON, position: "relative" }}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="notifications-panel"
          aria-label={`Notifications, ${unread} unread`}
          onClick={() => setOpen(true)}
        >
          <Icon>
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />
          </Icon>
          <span aria-hidden="true" style={{ fontVariantNumeric: "tabular-nums" }}>
            {unread}
          </span>
        </button>
      </header>

      <div
        className="ntf-scrim"
        onClick={() => setOpen(false)}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: `opacity ${DURATION} ${EASE}`,
        }}
      />

      <aside
        id="notifications-panel"
        className="ntf-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        // Keeps the closed panel out of tab order and the accessibility tree.
        {...(!open ? { inert: true } : {})}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(400px, 100vw)",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-surface, #fff)",
          color: "var(--color-text, #111827)",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.15)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          visibility: open ? "visible" : "hidden",
          transition: `transform ${DURATION} ${EASE}, visibility 0s linear ${open ? "0s" : DURATION}`,
          willChange: "transform",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderBottom: "1px solid var(--color-border, #e5e7eb)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>Notifications</h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            style={{
              width: 40,
              height: 40,
              border: "none",
              borderRadius: 8,
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <Icon>
              <path d="M6 6l12 12M18 6 6 18" />
            </Icon>
          </button>
        </div>

        <ul style={{ listStyle: "none", margin: 0, padding: 0, overflowY: "auto", flex: 1 }}>
          {items.length === 0 && (
            <li style={{ padding: 24, textAlign: "center", opacity: 0.7 }}>You're all caught up.</li>
          )}
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n.id)}
                style={{
                  display: "flex",
                  gap: 12,
                  width: "100%",
                  padding: "14px 16px",
                  border: "none",
                  borderBottom: "1px solid var(--color-border, #e5e7eb)",
                  background: n.read ? "transparent" : "var(--color-primary-subtle, #eef2ff)",
                  color: "inherit",
                  font: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span
                  role="img"
                  aria-label={ICONS[n.kind].label}
                  style={{
                    flex: "none",
                    display: "grid",
                    placeItems: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--color-surface-muted, #f3f4f6)",
                  }}
                >
                  <Icon size={18}>{ICONS[n.kind].path}</Icon>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: n.read ? 400 : 600 }}>{n.text}</span>
                  <span style={{ display: "block", fontSize: 13, opacity: 0.65 }}>
                    {n.time}
                    {!n.read && <span className="sr-only"> (unread)</span>}
                  </span>
                </span>
                {!n.read && (
                  <span
                    aria-hidden="true"
                    style={{
                      flex: "none",
                      alignSelf: "center",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--color-primary, #4f46e5)",
                    }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        <div style={{ padding: 16, borderTop: "1px solid var(--color-border, #e5e7eb)" }}>
          <button
            type="button"
            style={{
              ...PRIMARY_BUTTON,
              width: "100%",
              justifyContent: "center",
              opacity: unread === 0 ? 0.5 : 1,
              cursor: unread === 0 ? "not-allowed" : "pointer",
            }}
            disabled={unread === 0}
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        </div>
      </aside>
    </>
  );
}
