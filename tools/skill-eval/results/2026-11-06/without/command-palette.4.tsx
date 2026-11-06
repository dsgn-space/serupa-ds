import { useEffect, useId, useMemo, useRef, useState } from "react";

type Action = { id: string; label: string; run: () => void };

const ACTIONS: Action[] = [
  { id: "new-file", label: "New file", run: () => console.log("New file") },
  { id: "settings", label: "Open settings", run: () => console.log("Open settings") },
  { id: "invite", label: "Invite people", run: () => console.log("Invite people") },
  { id: "sign-out", label: "Sign out", run: () => console.log("Sign out") },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ACTIONS.filter((a) => a.label.toLowerCase().includes(q)) : ACTIONS;
  }, [query]);

  // Global Ctrl+K (Cmd+K on macOS) toggles the palette.
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

  // Sync state with the native modal dialog (focus trap, Esc, backdrop).
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

  const run = (action: Action) => {
    setOpen(false);
    action.run();
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const action = results[active];
      if (action) run(action);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === dialogRef.current) setOpen(false); // backdrop click
      }}
      style={{
        width: "min(32rem, calc(100vw - 2rem))",
        margin: "10vh auto auto",
        padding: 0,
        border: "1px solid var(--border, #d4d4d8)",
        borderRadius: 12,
        background: "var(--surface, Canvas)",
        color: "inherit",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
        aria-autocomplete="list"
        placeholder="Type a command…"
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
          borderBottom: "1px solid var(--border, #d4d4d8)",
          background: "transparent",
          color: "inherit",
          font: "inherit",
          outline: "none",
        }}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Actions"
        style={{ listStyle: "none", margin: 0, padding: 4, maxHeight: "20rem", overflow: "auto" }}
      >
        {results.map((action, i) => (
          <li
            key={action.id}
            id={`${listId}-${action.id}`}
            role="option"
            aria-selected={i === active}
            onMouseMove={() => setActive(i)}
            onClick={() => run(action)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              cursor: "pointer",
              background: i === active ? "var(--hover, rgba(127,127,127,0.18))" : "transparent",
            }}
          >
            {action.label}
          </li>
        ))}
        {results.length === 0 && (
          <li role="presentation" style={{ padding: "0.75rem", opacity: 0.7 }}>
            No matching actions
          </li>
        )}
      </ul>
    </dialog>
  );
}

export default CommandPalette;
