import { useState } from 'react';
import { Button, Dialog, Stack, Text, toast } from 'serupa-ds';

type DeleteProjectButtonProps = {
  projectName: string;
  onDelete: () => void | Promise<void>;
};

export function DeleteProjectButton({ projectName, onDelete }: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onDelete();
      setOpen(false);
      toast(`"${projectName}" deleted`);
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
        onClose={() => setOpen(false)}
        title={`Delete "${projectName}"?`}
      >
        <Stack gap={4}>
          <Text>
            This permanently deletes the project, along with all of its files, tasks and
            comments. Team members will lose access immediately. This can't be undone.
          </Text>
          <Stack direction="row" gap={2} className="justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirm} loading={busy}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </Dialog>
    </>
  );
}
