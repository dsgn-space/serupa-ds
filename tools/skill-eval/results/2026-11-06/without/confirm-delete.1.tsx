import { useRef, useState } from "react";

// NOTE: I couldn't inspect serupa-ds in this session, so I haven't guessed its
// component names. This uses native elements, which need no imports and are
// accessible by default. To use serupa-ds, swap the <button>s and <dialog> for
// its Button and Dialog/Modal components. The structure and logic stay the same.

type DeleteProjectButtonProps = {
  projectName: string;
  onDelete: () => void | Promise<void>;
};

export function DeleteProjectButton({ projectName, onDelete }: DeleteProjectButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setError(null);
    dialogRef.current?.showModal();
  };

  const close = () => {
    if (!pending) dialogRef.current?.close();
  };

  const confirm = async () => {
    setPending(true);
    setError(null);
    try {
      await onDelete();
      dialogRef.current?.close();
    } catch {
      setError("Couldn't delete the project. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button type="button" onClick={open}>
        Delete project
      </button>

      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-labelledby="delete-project-title"
        aria-describedby="delete-project-desc"
        onCancel={(e) => {
          if (pending) e.preventDefault();
        }}
      >
        <h2 id="delete-project-title">Delete “{projectName}”?</h2>
        <div id="delete-project-desc">
          <p>This permanently deletes the project and everything in it:</p>
          <ul>
            <li>All files and data</li>
            <li>Settings and member access</li>
            <li>Activity history</li>
          </ul>
          <p>This can’t be undone.</p>
        </div>

        {error && <p role="alert">{error}</p>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={close} disabled={pending} autoFocus>
            Cancel
          </button>
          <button type="button" onClick={confirm} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
