import { useId, useRef, useState } from "react";

// NOTE: I couldn't inspect serupa-ds in this session (no file access), so I
// haven't guessed at its component names or class names. This uses native
// elements. To restyle it, swap the <button>s and <dialog> for the matching
// serupa-ds Button and Dialog/Modal components. The structure and behavior
// carry over unchanged.

type DeleteProjectButtonProps = {
  projectName: string;
  onDelete: () => void | Promise<void>;
};

export function DeleteProjectButton({ projectName, onDelete }: DeleteProjectButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
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
        aria-labelledby={titleId}
        aria-describedby={descId}
        onCancel={(e) => {
          // Block Esc while a delete is in flight.
          if (pending) e.preventDefault();
        }}
        onClick={(e) => {
          // Backdrop click closes the dialog.
          if (e.target === e.currentTarget) close();
        }}
      >
        <h2 id={titleId}>Delete “{projectName}”?</h2>

        <div id={descId}>
          <p>This permanently deletes the project and can't be undone. You will lose:</p>
          <ul>
            <li>All files and content in the project</li>
            <li>Settings, members and shared links</li>
            <li>Activity history and comments</li>
          </ul>
        </div>

        {error && <p role="alert">{error}</p>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {/* Cancel is the safe default, so it gets initial focus. */}
          <button type="button" autoFocus onClick={close} disabled={pending}>
            Cancel
          </button>
          <button type="button" onClick={confirm} disabled={pending} aria-busy={pending}>
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
