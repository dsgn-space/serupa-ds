import { useState } from 'react';
import { Button, Dialog, Stack, Text, toast } from 'serupa-ds';

type DeleteProjectButtonProps = {
  projectName: string;
  onDelete: () => Promise<void> | void;
};

export function DeleteProjectButton({ projectName, onDelete }: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      await onDelete();
      setOpen(false);
      toast(`Deleted "${projectName}"`);
    } catch {
      toast("Couldn't delete the project. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>

      <Dialog
        open={open}
        onClose={() => !busy && setOpen(false)}
        title={`Delete "${projectName}"?`}
        footer={
          <Stack direction="row" gap={2} className="justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={busy}>
              Delete
            </Button>
          </Stack>
        }
      >
        <Stack gap={2}>
          <Text>This permanently deletes the project and everything in it:</Text>
          <ul className="pl-6 text-text-muted">
            <li>All files, tasks and comments</li>
            <li>Settings and integrations</li>
            <li>Access for every member</li>
          </ul>
          <Text>You can't undo this.</Text>
        </Stack>
      </Dialog>
    </>
  );
}
