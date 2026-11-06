import { useState } from 'react';
import { Button, Dialog, Stack, Text, toast } from 'serupa-ds';

type DeleteProjectButtonProps = {
  projectName: string;
  onDelete: () => Promise<void> | void;
};

export function DeleteProjectButton({ projectName, onDelete }: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete();
      setOpen(false);
      toast(`"${projectName}" deleted`);
    } catch {
      toast("Couldn't delete the project. Try again.");
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
        footer={
          <Stack direction="row" gap={2} className="justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </Stack>
        }
      >
        <Stack gap={2}>
          <Text>This permanently deletes the project and everything in it:</Text>
          <ul className="pl-6">
            <li>All files, tasks and comments</li>
            <li>Settings and integrations</li>
            <li>Access for every team member</li>
          </ul>
          <Text className="text-danger-text">This can't be undone.</Text>
        </Stack>
      </Dialog>
    </>
  );
}
