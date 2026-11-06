import { useRef, useState } from "react";

// NOTE: I couldn't inspect serupa-ds in this environment, so I haven't
// confirmed its component or class names. This uses native <button> and
// <dialog>, which are accessible by default. To use the design system,
// swap them for its Button and Dialog components and keep the same props
// and handlers.

type DeleteProjectButtonProps = {
  projectName: string;
  onDelete: () => void | Promise<void>;
};

export function DeleteProjectButton({ projectName, onDelete }: DeleteProjectButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  const confirm = async () => {
    setBusy(true);
    try {
      await onDelete();
      close();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={open}>
        Delete project
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-project-title"
        aria-describedby="delete-project-desc"
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
      >
        <h2 id="delete-project-title">Delete “{projectName}”?</h2>
        <div id="delete-project-desc">
          <p>This will permanently delete the project and everything in it:</p>
          <ul>
            <li>All files, data and settings</li>
            <li>Access for every collaborator</li>
            <li>Its history and any shared links</li>
          </ul>
          <p>This can’t be undone.</p>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={close} disabled={busy} autoFocus>
            Cancel
          </button>
          <button type="button" onClick={confirm} disabled={busy}>
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
