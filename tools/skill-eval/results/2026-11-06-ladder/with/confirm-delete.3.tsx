import { useState } from 'react';
import { Alert, Button, Dialog, Stack, Text, toast } from 'serupa-ds';

type DeleteProjectButtonProps = {
  projectName: string;
  onDelete: () => void | Promise<void>;
};

export function DeleteProjectButton({ projectName, onDelete }: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleDelete() {
    setBusy(true);
    setFailed(false);
    try {
      await onDelete();
      setOpen(false);
      toast(`"${projectName}" deleted`);
    } catch {
      setFailed(true);
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
        <Stack gap={3}>
          <Text>
            This permanently deletes the project and everything in it. You can't undo this.
          </Text>
          <ul className="pl-4">
            <li>All files, tasks and comments in the project</li>
            <li>Its settings and integrations</li>
            <li>Access for everyone who was invited to it</li>
          </ul>
          {failed && (
            <Alert variant="danger">
              Couldn't delete the project. Check your connection and try again.
            </Alert>
          )}
        </Stack>
      </Dialog>
    </>
  );
}
