import { useEffect, useId, useMemo, useRef, useState } from "react";

// NOTE: I couldn't inspect serupa-ds in this session, so I didn't guess at its
// component names or props. This uses native elements (<dialog>, input, listbox).
// To use the design system, swap them for its Dialog / Input / List components.

type Action = { id: string; label: string; run: () => void };

const ACTIONS: Action[] = [
  { id: "new-file", label: "New file", run: () => console.log("New file") },
  { id: "settings", label: "Open settings", run: () => console.log("Open settings") },
  { id: "invite", label: "Invite people", run: () => console.log("Invite people") },
  { id: "sign-out", label: "Sign out", run: () => console.log("Sign out") },
];

export default function CommandPalette({ actions = ACTIONS }: { actions?: Action[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions;
  }, [actions, query]);

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

  // Sync state with the native dialog
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

  // Keep the active index in range as the list shrinks
  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(results.length - 1, 0)));
  }, [results.length]);

  const choose = (action: Action | undefined) => {
    if (!action) return;
    setOpen(false);
    action.run();
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    }
  };

  const optionId = (id: string) => `${listId}-${id}`;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={() => setOpen(false)}
      onClick={(e) => {
        // Click on the backdrop closes the palette
        if (e.target === dialogRef.current) setOpen(false);
      }}
      style={{ padding: 0, width: "min(32rem, calc(100vw - 2rem))", marginTop: "15vh" }}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={results[active] ? optionId(results[active].id) : undefined}
        aria-autocomplete="list"
        aria-label="Search actions"
        placeholder="Type a command…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={onInputKeyDown}
        style={{ width: "100%", boxSizing: "border-box", padding: "0.75rem 1rem" }}
      />

      <ul
        id={listId}
        role="listbox"
        aria-label="Actions"
        style={{ listStyle: "none", margin: 0, padding: "0.25rem", maxHeight: "50vh", overflowY: "auto" }}
      >
        {results.map((action, i) => (
          <li
            key={action.id}
            id={optionId(action.id)}
            role="option"
            aria-selected={i === active}
            onMouseMove={() => setActive(i)}
            onClick={() => choose(action)}
            style={{
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
              borderRadius: 4,
              background: i === active ? "Highlight" : "transparent",
              color: i === active ? "HighlightText" : "inherit",
            }}
          >
            {action.label}
          </li>
        ))}
      </ul>

      <div role="status" aria-live="polite" style={{ padding: results.length ? 0 : "0.75rem 1rem" }}>
        {results.length === 0 ? "No matching actions" : ""}
      </div>
    </dialog>
  );
}
