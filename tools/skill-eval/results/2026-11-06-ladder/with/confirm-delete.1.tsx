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
      toast(`Deleted “${projectName}”`);
    } catch {
      toast('Couldn’t delete the project. Try again.');
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
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Delete “${projectName}”?`}
      >
        <Stack gap={4}>
          <Text>
            This permanently deletes the project and everything in it: its files, tasks, comments
            and settings. Members will lose access. This can’t be undone.
          </Text>
          <Stack direction="row" gap={2} className="justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={busy}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </Dialog>
    </>
  );
}
