import { useEffect, useId, useMemo, useRef, useState } from "react";

// Note: I couldn't inspect serupa-ds's exports in this environment, so this uses
// native elements and neutral inline styles instead of guessing component names.
// Swap the dialog, input and list markup for serupa-ds components if you like.

type Action = {
  id: string;
  label: string;
  run: () => void;
};

type CommandPaletteProps = {
  onNewFile?: () => void;
  onOpenSettings?: () => void;
  onInvitePeople?: () => void;
  onSignOut?: () => void;
};

export default function CommandPalette({
  onNewFile = () => console.log("New file"),
  onOpenSettings = () => console.log("Open settings"),
  onInvitePeople = () => console.log("Invite people"),
  onSignOut = () => console.log("Sign out"),
}: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const actions: Action[] = useMemo(
    () => [
      { id: "new-file", label: "New file", run: onNewFile },
      { id: "open-settings", label: "Open settings", run: onOpenSettings },
      { id: "invite-people", label: "Invite people", run: onInvitePeople },
      { id: "sign-out", label: "Sign out", run: onSignOut },
    ],
    [onNewFile, onOpenSettings, onInvitePeople, onSignOut]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions;
  }, [actions, query]);

  // Global Ctrl+K (and Cmd+K on macOS) toggles the palette.
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

  // Sync React state with the native <dialog>.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery("");
      setActiveIndex(0);
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered]);

  const choose = (action: Action | undefined) => {
    if (!action) return;
    setOpen(false);
    action.run();
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0 && e.key !== "Escape") return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(filtered.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        choose(filtered[activeIndex]);
        break;
    }
  };

  const activeId = filtered[activeIndex]
    ? `${baseId}-opt-${filtered[activeIndex].id}`
    : undefined;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (e.target === dialogRef.current) setOpen(false);
      }}
      style={{
        width: "min(32rem, calc(100vw - 2rem))",
        margin: "15vh auto auto",
        padding: 0,
        border: "1px solid rgba(128,128,128,0.35)",
        borderRadius: 12,
        boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        aria-label="Search actions"
        placeholder="Type a command…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={onInputKeyDown}
        autoComplete="off"
        spellCheck={false}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "0.875rem 1rem",
          fontSize: "1rem",
          border: 0,
          borderBottom: "1px solid rgba(128,128,128,0.35)",
          outline: "none",
          background: "transparent",
          color: "inherit",
        }}
      />

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Actions"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 4,
          maxHeight: "20rem",
          overflowY: "auto",
        }}
      >
        {filtered.map((action, i) => {
          const selected = i === activeIndex;
          return (
            <li
              key={action.id}
              id={`${baseId}-opt-${action.id}`}
              role="option"
              aria-selected={selected}
              onMouseMove={() => setActiveIndex(i)}
              onClick={() => choose(action)}
              style={{
                padding: "0.625rem 0.75rem",
                borderRadius: 8,
                cursor: "pointer",
                background: selected ? "rgba(128,128,128,0.18)" : "transparent",
              }}
            >
              {action.label}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p role="status" style={{ margin: 0, padding: "1rem", opacity: 0.7 }}>
          No matching actions
        </p>
      )}
    </dialog>
  );
}
