import { useState } from 'react';
import { Alert, Button, Dialog, Stack, Text, toast } from 'serupa-ds';

type DeleteProjectButtonProps = {
  projectName: string;
  onDelete: () => Promise<void>;
};

export function DeleteProjectButton({ projectName, onDelete }: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (!deleting) {
      setOpen(false);
      setError(null);
    }
  };

  const confirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
      setOpen(false);
      toast(`“${projectName}” deleted`);
    } catch {
      setError('We couldn’t delete the project. Check your connection and try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>

      <Dialog
        open={open}
        onClose={close}
        title={`Delete “${projectName}”?`}
        footer={
          <Stack direction="row" gap={2} className="justify-end">
            <Button variant="secondary" onClick={close} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirm} loading={deleting}>
              Delete
            </Button>
          </Stack>
        }
      >
        <Stack gap={3}>
          <Text>This will permanently delete the project and everything in it:</Text>
          <ul className="pl-4 text-text-muted">
            <li>All files, tasks and comments</li>
            <li>Settings and integrations</li>
            <li>Access for everyone on the team</li>
          </ul>
          <Text>This can’t be undone.</Text>
          {error && <Alert variant="danger">{error}</Alert>}
        </Stack>
      </Dialog>
    </>
  );
}
