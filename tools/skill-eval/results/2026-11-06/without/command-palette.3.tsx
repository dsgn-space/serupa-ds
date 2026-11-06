import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

// Note: I couldn't inspect serupa-ds's exports from here, so this uses native
// elements and system colors rather than guessing component names. Swap the
// dialog, input and list for the serupa-ds equivalents if you want its look.

export interface PaletteAction {
  id: string;
  label: string;
  run: () => void;
}

const DEFAULT_ACTIONS: PaletteAction[] = [
  { id: "new-file", label: "New file", run: () => console.log("New file") },
  { id: "settings", label: "Open settings", run: () => console.log("Open settings") },
  { id: "invite", label: "Invite people", run: () => console.log("Invite people") },
  { id: "sign-out", label: "Sign out", run: () => console.log("Sign out") },
];

const styles: Record<string, CSSProperties> = {
  dialog: {
    width: "min(32rem, calc(100vw - 2rem))",
    margin: "12vh auto auto",
    padding: 0,
    border: "1px solid color-mix(in srgb, CanvasText 20%, transparent)",
    borderRadius: 12,
    background: "Canvas",
    color: "CanvasText",
    boxShadow: "0 16px 48px rgb(0 0 0 / 0.3)",
    overflow: "hidden",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.875rem 1rem",
    font: "inherit",
    color: "inherit",
    background: "transparent",
    border: 0,
    borderBottom: "1px solid color-mix(in srgb, CanvasText 15%, transparent)",
    outline: "none",
  },
  list: { listStyle: "none", margin: 0, padding: "0.375rem", maxHeight: "18rem", overflowY: "auto" },
  option: { padding: "0.625rem 0.75rem", borderRadius: 8, cursor: "pointer" },
  optionActive: {
    background: "Highlight",
    color: "HighlightText",
  },
  empty: { padding: "1rem", opacity: 0.7 },
};

export default function CommandPalette({
  actions = DEFAULT_ACTIONS,
}: {
  actions?: PaletteAction[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions;
  }, [actions, query]);

  const close = useCallback(() => setOpen(false), []);

  // Global Ctrl+K / Cmd+K toggle.
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Sync React state with the native dialog.
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

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  const choose = (action: PaletteAction | undefined) => {
    if (!action) return;
    close();
    action.run();
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
      choose(results[active]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      style={styles.dialog}
      onClose={close} // Escape key
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (e.target === dialogRef.current) close();
      }}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
        aria-label="Search actions"
        placeholder="Type a command…"
        autoComplete="off"
        spellCheck={false}
        value={query}
        style={styles.input}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={onInputKeyDown}
      />
      <ul id={listId} role="listbox" aria-label="Actions" style={styles.list}>
        {results.map((action, i) => (
          <li
            key={action.id}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            style={{ ...styles.option, ...(i === active ? styles.optionActive : null) }}
            onMouseMove={() => setActive(i)}
            onClick={() => choose(action)}
          >
            {action.label}
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <p role="status" style={styles.empty}>
          No matching actions
        </p>
      )}
    </dialog>
  );
}
