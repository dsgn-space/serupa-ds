import { useEffect, useId, useMemo, useRef, useState } from "react";

// NOTE: I couldn't inspect serupa-ds in this session, so I didn't guess at its
// component names. This uses native elements (<dialog>, input, ul/li, button),
// which inherit the design system's base CSS. Swap in serupa-ds components if you like.

type Action = {
  id: string;
  label: string;
  run: () => void;
};

const ACTIONS: Action[] = [
  { id: "new-file", label: "New file", run: () => console.log("New file") },
  { id: "open-settings", label: "Open settings", run: () => console.log("Open settings") },
  { id: "invite-people", label: "Invite people", run: () => console.log("Invite people") },
  { id: "sign-out", label: "Sign out", run: () => console.log("Sign out") },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const optionId = (id: string) => `${listId}-${id}`;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ACTIONS.filter((a) => a.label.toLowerCase().includes(q)) : ACTIONS;
  }, [query]);

  // Global Ctrl+K / Cmd+K toggle
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Sync state with the native dialog (focus trap, Esc, focus restore come for free)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery("");
      setActive(0);
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Keep the highlighted option in range and in view
  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(results.length - 1, 0)));
  }, [results.length]);

  useEffect(() => {
    const current = results[active];
    if (open && current) {
      document.getElementById(optionId(current.id))?.scrollIntoView({ block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open, results]);

  const pick = (action: Action | undefined) => {
    if (!action) return;
    setOpen(false);
    action.run();
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length) setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length) setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(results.length - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(results[active]);
    }
  };

  const activeId = results[active] ? optionId(results[active].id) : undefined;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={() => setOpen(false)} // Esc
      onClick={(e) => {
        // Click on the backdrop closes
        if (e.target === dialogRef.current) setOpen(false);
      }}
      style={{
        width: "min(32rem, calc(100vw - 2rem))",
        padding: 0,
        marginTop: "15vh",
        border: "1px solid color-mix(in srgb, currentColor 20%, transparent)",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-label="Search actions"
          placeholder="Type a command or search…"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKeyDown}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "0.875rem 1rem",
            border: 0,
            borderBottom: "1px solid color-mix(in srgb, currentColor 15%, transparent)",
            outline: "none",
            background: "transparent",
            color: "inherit",
            font: "inherit",
          }}
        />

        <ul
          id={listId}
          role="listbox"
          aria-label="Actions"
          style={{
            listStyle: "none",
            margin: 0,
            padding: "0.375rem",
            maxHeight: "18rem",
            overflowY: "auto",
          }}
        >
          {results.map((action, i) => (
            <li
              key={action.id}
              id={optionId(action.id)}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => pick(action)}
              style={{
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                background:
                  i === active
                    ? "color-mix(in srgb, currentColor 12%, transparent)"
                    : "transparent",
              }}
            >
              {action.label}
            </li>
          ))}
        </ul>

        {results.length === 0 && (
          <p role="status" style={{ margin: 0, padding: "1rem", opacity: 0.7 }}>
            No matching actions
          </p>
        )}
      </div>
    </dialog>
  );
}
