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
      toast('Project deleted');
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
        onOpenChange={(next: boolean) => {
          if (!busy) setOpen(next);
        }}
        title={`Delete “${projectName}”?`}
        description="This can’t be undone."
      >
        <Stack gap={4}>
          <Text>
            Deleting this project permanently removes everything in it:
          </Text>
          <ul className="pl-6">
            <li>All of its files, tasks and comments</li>
            <li>Its settings and integrations</li>
            <li>Access for every member of the project</li>
          </ul>

          <Stack direction="row" gap={2} className="justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={busy}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </Dialog>
    </>
  );
}
