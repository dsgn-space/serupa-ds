import { useState } from "react";
// NOTE: I couldn't inspect serupa-ds in this session, so these export names and
// props (Button variant, Dialog open/onOpenChange/title/description/footer) are assumed.
// Check them against the package's types before using this.
import { Button, Dialog } from "serupa-ds";

type DeleteProjectButtonProps = {
  projectName: string;
  onDelete: () => void | Promise<void>;
};

export function DeleteProjectButton({ projectName, onDelete }: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete();
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next: boolean) => {
          if (!deleting) setOpen(next);
        }}
        title={`Delete "${projectName}"?`}
        description="This permanently deletes the project and everything in it. This can't be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <p>You will lose:</p>
        <ul>
          <li>All files and content in this project</li>
          <li>Settings and integrations</li>
          <li>Access for everyone who collaborates on it</li>
        </ul>
      </Dialog>
    </>
  );
}
